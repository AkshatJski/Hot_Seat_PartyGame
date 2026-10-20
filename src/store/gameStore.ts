import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ALL_CALL_OUT_DARES,
  ALL_DARES,
  ALL_QUESTIONS,
  buildQuestionQueue,
  dareTier,
  pickDare,
} from '../data/decks'
import type { Dare, GamePhase, Intensity, Player, Question } from '../types'
import { pickWildcard } from '../data/wildcards'

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
  turnIndex: number
  round: number
  /** Shuffled question queue. Ends the game when it runs dry. */
  pool: Question[]
  poolIndex: number

  // ---- Classic Circle mode --------------------------------------------------
  gameMode: 'free' | 'classic'
  turnOrder: string[]
  turnsTaken: Record<string, number>
  roundsPerPlayer: number | null
  classicStage: 'intro' | 'choice' | 'playing' | 'nextup' | null
  /** Classic Circle only. The modifier drawn for the current round. */
  wildcard: string | null
  currentQuestion: Question | null
  pendingDare: Dare | null
  pendingIsCallOut: boolean
  flipped: boolean
  stage: TurnStage
  lastAnsweredText: string | null
  recentDareIds: string[]
  banner: string | null
  /**
   * One reroll per turn, covering BOTH sides of the card: on the question side
   * it re-deals a fresh question, on the dare side it re-picks a dare. Reset by
   * `blankTurn()`, so every new turn gets its single reroll back.
   */
  rerollUsed: boolean

  // ---- actions --------------------------------------------------------------
  startGame: (names: NewPlayer[], options?: { gameMode?: 'free' | 'classic'; roundsPerPlayer?: number | null }) => void
  drawQuestion: () => void
  answer: () => void
  skip: () => void
  reroll: () => void
  chickenOut: () => void
  completeDare: () => void
  callOut: () => void
  acceptCallOut: () => void
  penalizeCaller: (playerId: string) => void
  dismissBanner: () => void
  restart: () => void
  quitToBurnBook: () => void
  // Classic Circle
  beginClassicTurn: () => void
  classicChooseTruth: () => void
  classicChooseDare: () => void
  classicNextUp: () => void
}

interface PersistedSlice {
  phase: GamePhase
  players: Player[]
  turnIndex: number
  round: number
  /** Only ids — the questions themselves are rehydrated from the content library. */
  poolIds: string[]
  poolIndex: number
  gameMode: 'free' | 'classic'
  turnOrder: string[]
  turnsTaken: Record<string, number>
  roundsPerPlayer: number | null
  wildcard: string | null
}

const uid = () => Math.random().toString(36).slice(2, 10)

const RECENT_LIMIT = 6

/**
 * Classic Circle: truths taken in a row before a dare is forced. Picking DARE
 * is always free — this counter is what keeps the mode from becoming an endless
 * truth-only loop, instead of taxing the (perfectly valid) dare choice.
 */
export const TRUTH_STREAK_LIMIT = 3

function makePlayer(name: string): Player {
  return {
    id: uid(),
    name: name.trim().slice(0, 18),
    brave: 0,
    coward: 0,
    flinchCount: 0,
    daresCompleted: 0,
    timesCalledOut: 0,
    falseAccusations: 0,
    bestStreak: 0,
    answerStreak: 0,
    truthStreak: 0,
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
    rerollUsed: false,
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      /** Rotate to the next player, then deal. Ends the game when the queue is dry. */
      const advanceTurn = () => {
        const { players, turnIndex, poolIndex, pool, round, gameMode, turnsTaken, roundsPerPlayer } = get()
        if (players.length === 0) return
        const next = (turnIndex + 1) % players.length
        const wrapped = next === 0

        // Classic Circle: record the completed turn, honour the round limit, and
        // route to the "Next up" screen instead of auto-dealing the next card.
        if (gameMode === 'classic') {
          const currentId = players[turnIndex]?.id
          const nextTurnsTaken = currentId
            ? { ...turnsTaken, [currentId]: (turnsTaken[currentId] ?? 0) + 1 }
            : turnsTaken
          const exhausted = poolIndex >= pool.length
          const limitReached =
            roundsPerPlayer != null && players.every((p) => (nextTurnsTaken[p.id] ?? 0) >= roundsPerPlayer)
          if (exhausted || limitReached) {
            set({ turnsTaken: nextTurnsTaken, phase: 'burnbook', classicStage: null, ...blankTurn() })
            return
          }
          set({
            turnIndex: next,
            turnsTaken: nextTurnsTaken,
            ...(wrapped ? { round: round + 1, wildcard: pickWildcard(get().wildcard) } : {}),
            classicStage: 'nextup',
            ...blankTurn(),
          })
          return
        }

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
        const { players, turnIndex, recentDareIds } = get()
        const player = players[turnIndex]
        if (!player) return false
        // Reads the *current* flinch count, so a chicken-out already counted
        // above escalates this dare's difficulty tier immediately. Dares are
        // free to take now, so the visible `coward` score no longer drives this.
        const tier = dareTier(player.flinchCount)
        const pool = isCallOut ? ALL_CALL_OUT_DARES : ALL_DARES
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
turnIndex: 0,
        round: 1,
        pool: [],
        poolIndex: 0,

        gameMode: 'free',
        turnOrder: [],
        turnsTaken: {},
        roundsPerPlayer: null,
        classicStage: null,
        wildcard: null,

        currentQuestion: null,
        beginClassicTurn: () => set({ classicStage: 'choice' }),
        classicChooseTruth: () => {
          const { gameMode, players, turnIndex } = get()
          if (gameMode !== 'classic' || !players[turnIndex]) return
          const player = players[turnIndex]
          // Guard the streak here too, not just in the UI: three truths in a row
          // makes a dare mandatory until a dare resets the counter.
          if ((player.truthStreak ?? 0) >= TRUTH_STREAK_LIMIT) return
          set({
            players: editPlayers(players, [
              { id: player.id, fn: (p) => void (p.truthStreak = (p.truthStreak ?? 0) + 1) },
            ]),
            classicStage: 'playing',
          })
          get().drawQuestion()
        },
        classicChooseDare: () => {
          const { gameMode, players, turnIndex } = get()
          if (gameMode !== 'classic' || !players[turnIndex]) return
          const player = players[turnIndex]
          // Choosing a dare is FREE — no Coward penalty. Taking a dare resets
          // the truth streak.
          set({
            players: editPlayers(players, [{ id: player.id, fn: (p) => void (p.truthStreak = 0) }]),
            classicStage: 'playing',
          })
          if (!drawDare(false)) {
            // No dares in the chosen decks — deal a question instead so the turn
            // still resolves rather than dead-ending.
            get().drawQuestion()
            return
          }
          set({ stage: 'dare', banner: 'Dare revealed — hit Done when finished.' })
        },
        classicNextUp: () => {
          const { gameMode } = get()
          if (gameMode !== 'classic') return
          // advanceTurn() already ran when the turn completed (it advanced
          // turnIndex and set classicStage to 'nextup'). All that is left is to
          // show the next player's turn intro.
          set({ classicStage: 'intro' })
        },
        pendingDare: null,
        pendingIsCallOut: false,
        flipped: false,
        stage: 'question',
        lastAnsweredText: null,
        recentDareIds: [],
        banner: null,
        rerollUsed: false,

        startGame: (names, options) => {
          const gameMode = options?.gameMode ?? 'free'
          const roundsPerPlayer = options?.roundsPerPlayer ?? null
          const players = names.map((n) => makePlayer(n.name))
          const turnOrder = gameMode === 'classic' ? players.map((p) => p.id) : []
          set({
            phase: 'playing',
            players,
            turnIndex: 0,
            round: 1,
            pool: buildQuestionQueue(),
            poolIndex: 0,
            recentDareIds: [],
            lastAnsweredText: null,
            gameMode,
            turnOrder,
            turnsTaken: {},
            roundsPerPlayer,
            classicStage: gameMode === 'classic' ? 'intro' : null,
            wildcard: gameMode === 'classic' ? pickWildcard() : null,
            ...blankTurn(),
          })
          if (gameMode === 'classic') {
            // Classic deals the question only after the player picks Truth, so
            // skip the pre-draw here (avoids burning an extra card per turn).
            set({ stage: 'question', currentQuestion: null, pendingDare: null, flipped: false })
            return
          }
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
                  // Unbroken run of answers — a skip zeroes it, see skip().
                  p.answerStreak += 1
                  p.bestStreak = Math.max(p.bestStreak, p.answerStreak)
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
          const { players, turnIndex, gameMode } = get()
          const player = players[turnIndex]
          if (!player) return
          // Taking a dare is now FREE in both modes — it is the *incentive*. The
          // harsher chicken-out is what costs a point, so the app rewards doing
          // something over refusing everything. Classic still just resets the
          // truth streak, same as before.
          const classic = gameMode === 'classic'
          set({
            players: editPlayers(players, [
              {
                id: player.id,
                fn: (p) => {
                  if (classic) p.truthStreak = 0
                  p.answerStreak = 0
                },
              },
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

        /**
         * One reroll per turn, on either side of the card.
         *
         * Question side: swap in the next card from the shuffled queue WITHOUT
         * counting as an answer or a skip, and without re-advancing the turn. The
         * consumed card is genuinely discarded (the queue is the "cards run out =
         * game over" mechanism) so rerolling shortens the game slightly.
         *
         * Dare side: re-pick from the dare pool, skipping the dare currently shown
         * and the recent ones, so a reroll never lands on the same card. Dares are
         * not consumed from the queue, so this one is free.
         */
        reroll: () => {
          const { rerollUsed, stage, pool, poolIndex } = get()
          if (rerollUsed) return

          if (stage === 'dare') {
            const { players, turnIndex, recentDareIds, pendingDare, pendingIsCallOut } = get()
            const player = players[turnIndex]
            if (!player || !pendingDare) return
            const tier = dareTier(player.flinchCount)
            const source = pendingIsCallOut ? ALL_CALL_OUT_DARES : ALL_DARES
            // Exclude the dare on screen as well as the recent list, so the reroll
            // visibly changes the card instead of silently re-dealing it.
            const dare = pickDare(source, tier, [pendingDare.id, ...recentDareIds])
            if (!dare) return
            set({
              pendingDare: dare,
              recentDareIds: [dare.id, ...recentDareIds].slice(0, RECENT_LIMIT),
              rerollUsed: true,
              banner: 'Rerolled — last one for this turn.',
            })
            return
          }

          if (stage !== 'question') return
          if (poolIndex >= pool.length) return
          const next = pool[poolIndex]
          if (!next) return
          set({
            currentQuestion: next,
            poolIndex: poolIndex + 1,
            flipped: false,
            pendingDare: null,
            rerollUsed: true,
            banner: 'Rerolled — last one for this turn.',
          })
        },

        /**
         * Chicken out: refuse BOTH the question and the dare. This is the harsher
         * exit than a swipe-left (which is now free) — it costs a Coward point and
         * ends the turn immediately, with no dare drawn.
         *
         * Works on the question AND dare stage (Option A): abandoning a dare you
         * refuse to do simply ends the turn; it earns no dare-completion credit.
         *
         * It increments `flinchCount` as well as `coward`. `coward` is the visible
         * score; `flinchCount` is the hidden difficulty driver, so dodging
         * repeatedly still escalates future dares even though the score shape
         * changed when taking a dare became free.
         */
        chickenOut: () => {
          const { players, turnIndex } = get()
          const player = players[turnIndex]
          if (!player) return
          set({
            players: editPlayers(players, [
              {
                id: player.id,
                fn: (p) => {
                  p.coward += 1
                  p.flinchCount += 1
                  p.answerStreak = 0
                },
              },
            ]),
          })
          advanceTurn()
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
                  p.timesCalledOut += 1
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
              fn: (p: Player) => {
                p.coward += 1
                // The caller was overruled — a false accusation for the record.
                p.falseAccusations += 1
              },
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
        turnIndex: 0,
            round: 1,
            pool: [],
            poolIndex: 0,
            banner: null,
            lastAnsweredText: null,
            gameMode: 'free',
            turnOrder: [],
            turnsTaken: {},
            roundsPerPlayer: null,
            classicStage: null,
            wildcard: null,
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
        turnIndex: s.turnIndex,
        round: s.round,
        poolIds: s.pool.map((q) => q.id),
        poolIndex: s.poolIndex,
        gameMode: s.gameMode,
        turnOrder: s.turnOrder,
        turnsTaken: s.turnsTaken,
        roundsPerPlayer: s.roundsPerPlayer,
        wildcard: s.wildcard,
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedSlice | undefined
        if (!p || p.phase !== 'playing' || !Array.isArray(p.poolIds)) return current
        const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))
        const pool = p.poolIds
          .map((id) => byId.get(id))
          .filter((q): q is Question => Boolean(q))
        return {
          ...current,
          phase: 'playing' as GamePhase,
          players: (p.players ?? []).map((pl) => {
            // Backfill stats added after this save was written. `callOutsMade`
            // was the pre-2026-10-19 name for `timesCalledOut` (same behaviour).
            const legacy = pl as Player & { callOutsMade?: number }
            return {
              ...pl,
              timesCalledOut: legacy.timesCalledOut ?? legacy.callOutsMade ?? 0,
              falseAccusations: legacy.falseAccusations ?? 0,
              bestStreak: legacy.bestStreak ?? 0,
              answerStreak: legacy.answerStreak ?? 0,
              truthStreak: legacy.truthStreak ?? 0,
              // Games saved before this field existed: seed the hidden escalator
              // from the old visible counter, which is what used to drive it.
              flinchCount: legacy.flinchCount ?? pl.coward ?? 0,
            }
          }),
          turnIndex: p.turnIndex ?? 0,
          round: p.round ?? 1,
          pool,
          gameMode: p.gameMode ?? 'free',
          turnOrder: p.turnOrder ?? [],
          turnsTaken: p.turnsTaken ?? {},
          roundsPerPlayer: p.roundsPerPlayer ?? null,
          wildcard: p.wildcard ?? null,
        }
      },
    },
  ),
)

/** Derived selectors ------------------------------------------------------- */

export const selectCurrentPlayer = (s: GameStore): Player | undefined =>
  s.players[s.turnIndex]

export const selectCurrentDareTier = (s: GameStore): Intensity =>
  dareTier(s.players[s.turnIndex]?.flinchCount ?? 0)

export const selectCardsLeft = (s: GameStore): number =>
  Math.max(0, s.pool.length - s.poolIndex)

export const selectCanCallOut = (s: GameStore): boolean => s.stage === 'answered'

export const selectAwaitingDare = (s: GameStore): boolean =>
  s.stage === 'dare' || s.stage === 'callout'

export const selectShowVerdict = (s: GameStore): boolean =>
  s.stage === 'calloutVerdict'

/** Classic Circle: truths left before a dare is forced (0 → must dare now). */
export const selectTruthsLeft = (s: GameStore): number =>
  Math.max(0, TRUTH_STREAK_LIMIT - (s.players[s.turnIndex]?.truthStreak ?? 0))