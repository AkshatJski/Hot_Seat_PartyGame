import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildQuestionQueue,
  callOutDaresFor,
  dareTier,
  daresFor,
  pickDare,
  questionsFor,
} from '../data/decks'
import type { Dare, DeckId, GamePhase, Intensity, Player, Question } from '../types'

/**
 * Where a turn currently is.
 *  question        → card front, waiting on a swipe
 *  answered        → swiped right, group may Call Out during this window
 *  dare            → swiped left, card is flipped to a dare
 *  callout         → Call Out dare in progress (the accused keeps the turn)
 *  calloutVerdict  → Call Out dare done, group decides if it was deserved
 */
export type TurnStage =
  | 'question'
  | 'answered'
  | 'dare'
  | 'callout'
  | 'calloutVerdict'

export interface NewPlayer {
  name: string
}

export interface GameStore {
  phase: GamePhase
  players: Player[]
  deckIds: DeckId[]
  turnIndex: number
  round: number
  /** Shuffled question queue for the chosen decks. Ends the game when it runs dry. */
  pool: Question[]
  poolIndex: number

  // ---- transient: deliberately NOT persisted --------------------------------
  currentQuestion: Question | null
  pendingDare: Dare | null
  pendingIsCallOut: boolean
  flipped: boolean
  stage: TurnStage
  lastAnsweredText: string | null
  recentDareIds: string[]
  banner: string | null

  // ---- actions --------------------------------------------------------------
  startGame: (names: NewPlayer[], deckIds: DeckId[]) => void
  drawQuestion: () => void
  answer: () => void
  skip: () => void
  completeDare: () => void
  callOut: () => void
  acceptCallOut: () => void
  penalizeCaller: (playerId: string) => void
  dismissBanner: () => void
  restart: () => void
  quitToBurnBook: () => void
}

interface PersistedSlice {
  phase: GamePhase
  players: Player[]
  deckIds: DeckId[]
  turnIndex: number
  round: number
  /** Only ids — the questions themselves are rehydrated from the content library. */
  poolIds: string[]
  poolIndex: number
}

const uid = () => Math.random().toString(36).slice(2, 10)

const RECENT_LIMIT = 6

function makePlayer(name: string): Player {
  return {
    id: uid(),
    name: name.trim().slice(0, 18),
    brave: 0,
    coward: 0,
    daresCompleted: 0,
    callOutsMade: 0,
    /** Highest intensity question this player actually answered. */
    deepestAnswered: 1,
    /** Highest intensity dare this player actually performed. */
    worstDare: 1,
  }
}

function editPlayers(
  players: Player[],
  edits: { id: string; fn: (p: Player) => void }[],
): Player[] {
  const byId = new Map(edits.map((e) => [e.id, e.fn]))
  return players.map((p) => {
    const fn = byId.get(p.id)
    if (!fn) return p
    const next = { ...p }
    fn(next)
    return next
  })
}

const higher = (a: Intensity, b: Intensity): Intensity =>
  (b > a ? b : a) as Intensity

function blankTurn() {
  return {
    currentQuestion: null,
    pendingDare: null,
    pendingIsCallOut: false,
    flipped: false,
    stage: 'question' as TurnStage,
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      /** Rotate to the next player, then deal. Ends the game when the queue is dry. */
      const advanceTurn = () => {
        const { players, turnIndex, poolIndex, pool, round } = get()
        if (players.length === 0) return
        const next = (turnIndex + 1) % players.length
        const wrapped = next === 0
        if (poolIndex >= pool.length) {
          set({ turnIndex: next, phase: 'burnbook', ...blankTurn() })
          return
        }
        set({
          turnIndex: next,
          ...(wrapped ? { round: round + 1, banner: `Round ${round + 1}` } : {}),
          ...blankTurn(),
        })
        get().drawQuestion()
      }

      const drawDare = (isCallOut: boolean) => {
        const { players, turnIndex, deckIds, recentDareIds } = get()
        const player = players[turnIndex]
        if (!player) return false
        // Reads the *current* coward count, so a skip already counted above
        // escalates this dare's difficulty tier immediately.
        const tier = dareTier(player.coward)
        const pool = isCallOut ? callOutDaresFor(deckIds) : daresFor(deckIds)
        const dare = pickDare(pool, tier, recentDareIds)
        if (!dare) return false
        set({
          pendingDare: dare,
          pendingIsCallOut: isCallOut,
          recentDareIds: [dare.id, ...recentDareIds].slice(0, RECENT_LIMIT),
          flipped: true,
        })
        return true
      }

      return {
        phase: 'setup',
        players: [],
        deckIds: [],
        turnIndex: 0,
        round: 1,
        pool: [],
        poolIndex: 0,

        currentQuestion: null,
        pendingDare: null,
        pendingIsCallOut: false,
        flipped: false,
        stage: 'question',
        lastAnsweredText: null,
        recentDareIds: [],
        banner: null,

        startGame: (names, deckIds) => {
          set({
            phase: 'playing',
            players: names.map((n) => makePlayer(n.name)),
            deckIds,
            turnIndex: 0,
            round: 1,
            pool: buildQuestionQueue(deckIds),
            poolIndex: 0,
            recentDareIds: [],
            lastAnsweredText: null,
            ...blankTurn(),
          })
          get().drawQuestion()
        },

        drawQuestion: () => {
          const { pool, poolIndex } = get()
          if (poolIndex >= pool.length) {
            set({ phase: 'burnbook', ...blankTurn() })
            return
          }
          set({
            ...blankTurn(),
            currentQuestion: pool[poolIndex],
            poolIndex: poolIndex + 1,
            stage: 'question',
          })
        },

        answer: () => {
          const { players, turnIndex, currentQuestion } = get()
          const player = players[turnIndex]
          if (!player || !currentQuestion) return
          const text = currentQuestion.text
          set({
            players: editPlayers(players, [
              {
                id: player.id,
                fn: (p) => {
                  p.brave += 1
                  p.deepestAnswered = higher(p.deepestAnswered, currentQuestion.intensity)
                },
              },
            ]),
            lastAnsweredText: text,
            currentQuestion: null,
            stage: 'answered',
            banner: 'Answered. Group can Call Out…',
          })
        },

        skip: () => {
          const { players, turnIndex } = get()
          const player = players[turnIndex]
          if (!player) return
          // Count the chicken-out first: the tier reflects the skip just made.
          set({
            players: editPlayers(players, [
              { id: player.id, fn: (p) => void (p.coward += 1) },
            ]),
          })
          if (!drawDare(false)) {
            // No dares in the chosen decks. Fall back to a normal answer so the
            // turn still advances instead of dead-ending.
            get().answer()
            return
          }
          set({ stage: 'dare', banner: 'Skipped! Dare revealed — hit Done when finished.' })
        },

        completeDare: () => {
          const { players, turnIndex, pendingDare, pendingIsCallOut } = get()
          const player = players[turnIndex]
          if (!player || !pendingDare) return
          set({
            players: editPlayers(players, [
              {
                id: player.id,
                fn: (p) => {
                  p.daresCompleted += 1
                  p.worstDare = higher(p.worstDare, pendingDare.intensity)
                },
              },
            ]),
          })
          if (pendingIsCallOut) {
            set({ stage: 'calloutVerdict', banner: 'Did they deserve that?' })
            return
          }
          advanceTurn()
        },

        callOut: () => {
          const { players, turnIndex } = get()
          const player = players[turnIndex]
          if (!player) return
          // Brave is docked, floored at 0. "What's brave without honesty."
          set({
            players: editPlayers(players, [
              {
                id: player.id,
                fn: (p) => {
                  p.brave = Math.max(0, p.brave - 1)
                  p.callOutsMade += 1
                },
              },
            ]),
          })
          if (!drawDare(true)) {
            advanceTurn()
            return
          }
          set({ stage: 'callout', banner: 'CALLED OUT. No passing.' })
        },

        acceptCallOut: () => advanceTurn(),

        penalizeCaller: (playerId) => {
          const { players, turnIndex } = get()
          const accused = players[turnIndex]
          const edits = [
            {
              id: playerId,
              fn: (p: Player) => void (p.coward += 1),
            },
          ]
          if (accused && accused.id !== playerId) {
            // Call is overturned, so the Brave point comes back.
            edits.push({
              id: accused.id,
              fn: (p: Player) => void (p.brave += 1),
            })
          }
          set({
            players: editPlayers(players, edits),
            banner: 'Call out overturned. Brave restored.',
          })
          advanceTurn()
        },

        dismissBanner: () => set({ banner: null }),

        restart: () =>
          set({
            phase: 'setup',
            players: [],
            deckIds: [],
            turnIndex: 0,
            round: 1,
            pool: [],
            poolIndex: 0,
            banner: null,
            lastAnsweredText: null,
            ...blankTurn(),
          }),

        quitToBurnBook: () => set({ phase: 'burnbook', ...blankTurn() }),
      }
    },
    {
      name: 'truth-or-swipe',
      version: 1,
      /**
       * Scores and the remaining queue survive a refresh. The in-flight card
       * does NOT — restoring a half-finished dare the player walked away from
       * is worse than dealing a fresh card on reload.
       */
      partialize: (s): PersistedSlice => ({
        phase: s.phase,
        players: s.players,
        deckIds: s.deckIds,
        turnIndex: s.turnIndex,
        round: s.round,
        poolIds: s.pool.map((q) => q.id),
        poolIndex: s.poolIndex,
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedSlice | undefined
        if (!p || p.phase !== 'playing' || !Array.isArray(p.poolIds)) return current
        const byId = new Map(questionsFor(p.deckIds).map((q) => [q.id, q]))
        const pool = p.poolIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => Boolean(q))
        return {
          ...current,
          phase: 'playing' as GamePhase,
          players: p.players ?? [],
          deckIds: p.deckIds ?? [],
          turnIndex: p.turnIndex ?? 0,
          round: p.round ?? 1,
          pool,
          poolIndex: p.poolIndex ?? 0,
        }
      },
    },
  ),
)

/** Derived selectors ------------------------------------------------------- */

export const selectCurrentPlayer = (s: GameStore): Player | undefined =>
  s.players[s.turnIndex]

export const selectCurrentDareTier = (s: GameStore): Intensity =>
  dareTier(s.players[s.turnIndex]?.coward ?? 0)

export const selectCardsLeft = (s: GameStore): number =>
  Math.max(0, s.pool.length - s.poolIndex)

export const selectCanCallOut = (s: GameStore): boolean => s.stage === 'answered'

export const selectAwaitingDare = (s: GameStore): boolean =>
  s.stage === 'dare' || s.stage === 'callout'

export const selectShowVerdict = (s: GameStore): boolean =>
  s.stage === 'calloutVerdict'