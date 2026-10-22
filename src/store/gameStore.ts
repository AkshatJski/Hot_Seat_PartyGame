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
 *  dareVerdict     → dare reported done, group rules Nailed it / Fudged it
 *  dareOffer       → the holder chickened out, the dare is up for grabs
 *  callout         → Call Out dare in progress (the accused keeps the turn)
 *  calloutVerdict  → Call Out dare done, group decides if it was deserved
 */
export type TurnStage =
  | 'question'
  | 'answered'
  | 'dare'
  | 'dareVerdict'
  | 'dareOffer'
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
  /** Shuffled question queue. Reshuffles instead of ending, so it never runs dry. */
  pool: Question[]
  poolIndex: number
  /**
   * How many times the question queue has been dealt through. Starts at 1.
   * Surfaced on the card as `· ×2` so the player can tell a reshuffle from a bug.
   */
  deckPass: number

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
  /** Credited dare: the group said Nailed it (or the 4s window elapsed). */
  confirmDare: () => void
  /** Uncredited dare: nobody believed it. Coward + escalation, no apex credit. */
  fudgeDare: () => void
  /** Someone else adopts a chickened-out dare, and takes the credit. */
  takeOverDare: (playerId: string) => void
  /** Nobody takes it. The coward keeps the point they already banked. */
  declineDareOffer: () => void
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
  /** Absent in saves written before the reshuffle existed; defaults to 1. */
  deckPass: number
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

/**
 * Rebuild live state from a save.
 *
 * Exported (rather than inlined in the `persist` config) purely so `smoke.ts` can
 * unit-test it. That matters: `poolIndex` was once written by `partialize` and
 * then silently dropped here, so refreshing mid-game kept the scores but rewound
 * the queue to card 1. Nothing in the UI could catch that — only a test of this
 * function can.
 */
export function mergePersisted(persisted: unknown, current: GameStore): GameStore {
  const p = persisted as PersistedSlice | undefined
  if (!p || p.phase !== 'playing' || !Array.isArray(p.poolIds)) return current
  const byId = new Map(ALL_QUESTIONS.map((q) => [q.id, q]))
  const pool = p.poolIds.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q))
  return {
    ...current,
    phase: 'playing' as GamePhase,
    players: (p.players ?? []).map((pl) => {
      // Backfill stats added after this save was written. `callOutsMade` was the
      // pre-2026-10-19 name for `timesCalledOut` (same behaviour).
      const legacy = pl as Player & { callOutsMade?: number }
      return {
        ...pl,
        timesCalledOut: legacy.timesCalledOut ?? legacy.callOutsMade ?? 0,
        falseAccusations: legacy.falseAccusations ?? 0,
        bestStreak: legacy.bestStreak ?? 0,
        answerStreak: legacy.answerStreak ?? 0,
        truthStreak: legacy.truthStreak ?? 0,
        // Games saved before this field existed: seed the hidden escalator from
        // the old visible counter, which is what used to drive it.
        flinchCount: legacy.flinchCount ?? pl.coward ?? 0,
      }
    }),
    turnIndex: p.turnIndex ?? 0,
    round: p.round ?? 1,
    pool,
    // Clamped because `pool` is rebuilt from ids: a save written before a content
    // change can reference cards that no longer exist, which shortens the queue
    // and would otherwise leave the cursor past the end (and `cardsLeft` negative).
    poolIndex: Math.min(Math.max(0, p.poolIndex ?? 0), pool.length),
    deckPass: Math.max(1, p.deckPass ?? 1),
    gameMode: p.gameMode ?? 'free',
    turnOrder: p.turnOrder ?? [],
    turnsTaken: p.turnsTaken ?? {},
    roundsPerPlayer: p.roundsPerPlayer ?? null,
    wildcard: p.wildcard ?? null,
  }
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      /**
       * Rotate to the next player, then deal the next card.
       *
       * Two endings live here, checked in this order:
       *
       *  1. The per-player turn limit, if one was chosen. Checked for BOTH modes
       *     and before anything mode-specific — it used to sit inside the Classic
       *     branch, which is why free play could only end by exhausting 135 cards
       *     or pressing End.
       *  2. Nothing else. The queue reshuffles instead of ending the game (see
       *     `drawQuestion`), so "Endless" genuinely means endless.
       *
       * Turns are recorded in free mode now too. `turnsTaken` only ever fed the
       * round limit, so not recording them made the limit unreachable there: a
       * limit of 3 would have been checking a table of zeroes.
       */
      const advanceTurn = () => {
        const { players, turnIndex, round, gameMode, turnsTaken, roundsPerPlayer } = get()
        if (players.length === 0) return
        const next = (turnIndex + 1) % players.length
        const wrapped = next === 0

        const currentId = players[turnIndex]?.id
        const nextTurnsTaken = currentId
          ? { ...turnsTaken, [currentId]: (turnsTaken[currentId] ?? 0) + 1 }
          : turnsTaken

        // "5 turns each" with six players ends once everyone has taken five, so
        // at 30 turns — not at 5. `every` is what encodes "each".
        const limitReached =
          roundsPerPlayer != null &&
          players.every((p) => (nextTurnsTaken[p.id] ?? 0) >= roundsPerPlayer)
        if (limitReached) {
          set({
            turnsTaken: nextTurnsTaken,
            phase: 'burnbook',
            classicStage: null,
            ...blankTurn(),
          })
          return
        }

        // Classic Circle routes through the "Next up" screen rather than dealing
        // straight away, and re-draws a wildcard at the top of each round.
        if (gameMode === 'classic') {
          set({
            turnIndex: next,
            turnsTaken: nextTurnsTaken,
            ...(wrapped ? { round: round + 1, wildcard: pickWildcard(get().wildcard) } : {}),
            classicStage: 'nextup',
            ...blankTurn(),
          })
          return
        }

        set({
          turnIndex: next,
          turnsTaken: nextTurnsTaken,
          ...(wrapped ? { round: round + 1, banner: `Round ${round + 1}` } : {}),
          ...blankTurn(),
        })
        get().drawQuestion()
      }

      /**
       * Award a completed dare to a specific player.
       *
       * Takes a player id rather than reading `turnIndex`, because a dare can be
       * adopted by somebody else when the holder chickens out. The credit has to
       * follow the person who actually did it.
       */
      const creditDare = (playerId: string, dare: Dare) => {
        set({
          players: editPlayers(get().players, [
            {
              id: playerId,
              fn: (p) => {
                p.daresCompleted += 1
                p.worstDare = higher(p.worstDare, dare.intensity)
              },
            },
          ]),
        })
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
        deckPass: 1,

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
            deckPass: 1,
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

        /**
         * Deal the next card, reshuffling when the queue is dry.
         *
         * The queue looping here (rather than the game ending) is deliberate: 135
         * cards is roughly 40 minutes with six players, so "cards run out = game
         * over" was really "the game quietly stops in the middle of the night".
         * Endless should mean endless, and the turn limit is the honest way to
         * stop.
         *
         * Re-shuffled on each pass, not replayed in order, so a repeat is not
         * obvious — the second pass is exactly when the jokes have worn off.
         *
         * This is the single place the queue is consumed, which is why the
         * reshuffle lives here: a reroll, a Classic truth and a normal turn all
         * funnel through it, and all three need the same "there is always a card"
         * guarantee.
         */
        drawQuestion: () => {
          let { pool, poolIndex, deckPass } = get()
          if (poolIndex >= pool.length) {
            pool = buildQuestionQueue()
            poolIndex = 0
            deckPass += 1
          }
          const next = pool[poolIndex]
          if (!next) return
          set({
            ...blankTurn(),
            pool,
            poolIndex: poolIndex + 1,
            deckPass,
            currentQuestion: next,
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
         * On a Call Out punishment it does NOT end the turn: it still routes to
         * `calloutVerdict`, because the verdict is about whether the call was
         * deserved, which is a separate question from whether the dare was done.
         *
         * It increments `flinchCount` as well as `coward`. `coward` is the visible
         * score; `flinchCount` is the hidden difficulty driver, so dodging
         * repeatedly still escalates future dares even though the score shape
         * changed when taking a dare became free.
         */
        chickenOut: () => {
          const { players, turnIndex, gameMode, stage } = get()
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
                  // Classic only: refusing everything is not a truth, so the
                  // truth streak breaks here exactly as it does in skip().
                  if (gameMode === 'classic') p.truthStreak = 0
                },
              },
            ]),
          })
          // A Call Out punishment always resolves through the verdict. Bailing
          // straight to `advanceTurn()` here would mean the group never rules on
          // the call, so `penalizeCaller` could never be reached. The UI no longer
          // offers this button during a call out, but the invariant belongs in the
          // machine, not in one render branch.
          if (stage === 'callout') {
            set({ stage: 'calloutVerdict', banner: 'Did they deserve that?' })
            return
          }
          // A dare already on screen does not die with the refusal: it goes up for
          // grabs. The Coward point was banked above and is NOT refunded if
          // somebody else takes it — refusing in public has to keep costing
          // something, or "chicken out and hope" becomes the optimal play.
          if (stage === 'dare' && get().pendingDare) {
            set({ stage: 'dareOffer', banner: 'Chickened out. Who takes it?' })
            return
          }
          advanceTurn()
        },

        /**
         * "I did it." Deliberately credits NOTHING yet.
         *
         * The group rules first (`dareVerdict`): Done is a claim, and a claim is
         * the one thing half the table cannot verify. Crediting on the tap would
         * force `fudgeDare` to subtract afterwards, and a subtract-after-add
         * cannot undo the `worstDare` high-water mark correctly.
         *
         * Call Out dares are the exception. They already resolve through
         * `calloutVerdict`, and stacking a second verdict on a punishment would
         * make the table rule twice on one act.
         */
        completeDare: () => {
          const { players, turnIndex, pendingDare, pendingIsCallOut } = get()
          const player = players[turnIndex]
          if (!player || !pendingDare) return
          if (pendingIsCallOut) {
            creditDare(player.id, pendingDare)
            set({ stage: 'calloutVerdict', banner: 'Did they deserve that?' })
            return
          }
          set({ stage: 'dareVerdict', banner: 'Nailed it, or fudged it?' })
        },

        /** The group believed it: credit the dare and move on. */
        confirmDare: () => {
          const { players, turnIndex, pendingDare } = get()
          const player = players[turnIndex]
          // Belt and braces: if the dare has somehow gone, end the turn rather
          // than leaving the table on a panel whose buttons do nothing.
          if (!player || !pendingDare) {
            advanceTurn()
            return
          }
          creditDare(player.id, pendingDare)
          advanceTurn()
        },

        /**
         * Nobody believed it. Same visible punishment as a chicken-out (`coward`)
         * and the same hidden escalation (`flinchCount`), but the turn ends
         * normally and the dare earns no credit.
         *
         * `brave` is untouched: the player may well have answered a question
         * earlier in the turn, and that point was honest.
         */
        fudgeDare: () => {
          const { players, turnIndex, gameMode } = get()
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
                  if (gameMode === 'classic') p.truthStreak = 0
                },
              },
            ]),
          })
          advanceTurn()
        },

        /**
         * Somebody else adopts a chickened-out dare. The credit follows whoever
         * actually does it, and the turn still advances from the coward, so the
         * next player in order keeps their normal turn.
         */
        takeOverDare: (playerId) => {
          const { pendingDare, players } = get()
          // Same guarantee as `confirmDare`: never strand the table on the offer
          // panel. A missing dare means there is nothing to adopt.
          if (!pendingDare) {
            advanceTurn()
            return
          }
          if (!players.some((p) => p.id === playerId)) return
          creditDare(playerId, pendingDare)
          advanceTurn()
        },

        /** Nobody took it. The coward keeps the point they already banked. */
        declineDareOffer: () => advanceTurn(),

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
                // Deliberately does NOT touch `coward`. That counter now means
                // one thing only — chicken-outs — because the Burn Book reads it
                // as "skipped" and `verdictFor` treats it as skips. An overruled
                // call is already recorded by `falseAccusations`, which has its
                // own verdict ("Cry Wolf").
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
            deckPass: 1,
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
        deckPass: s.deckPass,
        gameMode: s.gameMode,
        turnOrder: s.turnOrder,
        turnsTaken: s.turnsTaken,
        roundsPerPlayer: s.roundsPerPlayer,
        wildcard: s.wildcard,
      }),
      merge: mergePersisted,
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

export const selectAwaitingDare = (s: GameStore): boolean => s.stage === 'dare'

/** "I did it" has been claimed; the table has not ruled yet. */
export const selectShowDareVerdict = (s: GameStore): boolean => s.stage === 'dareVerdict'

/** The holder refused; the dare is up for adoption. */
export const selectDareOffer = (s: GameStore): boolean => s.stage === 'dareOffer'

/** Turns the current player has already taken, for the "3 / 5 turns" HUD. */
export const selectTurnsTakenByCurrent = (s: GameStore): number => {
  const player = s.players[s.turnIndex]
  return player ? (s.turnsTaken[player.id] ?? 0) : 0
}

/**
 * A Call Out punishment is NOT an ordinary dare. It is deliberately not in
 * `selectAwaitingDare`: that would put Reroll and Chicken out on screen, and
 * chickening out of a punishment calls `advanceTurn()` directly — skipping
 * `calloutVerdict` entirely, so the group could never rule on the call and
 * `penalizeCaller` would be unreachable. Call Out is "no passing": only Done.
 */
export const selectAwaitingCallOutDare = (s: GameStore): boolean => s.stage === 'callout'

export const selectShowVerdict = (s: GameStore): boolean =>
  s.stage === 'calloutVerdict'

/** Classic Circle: truths left before a dare is forced (0 → must dare now). */
export const selectTruthsLeft = (s: GameStore): number =>
  Math.max(0, TRUTH_STREAK_LIMIT - (s.players[s.turnIndex]?.truthStreak ?? 0))