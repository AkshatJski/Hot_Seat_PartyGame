import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { SwipeCard, type SwipeSignal } from '../components/SwipeCard'
import { Commentator } from '../components/Commentator'
import { reactionFor, type GameEvent } from '../data/commentary'
import { dareTier } from '../data/decks'
import {
  selectAwaitingCallOutDare,
  selectAwaitingDare,
  selectCanCallOut,
  selectCardsLeft,
  selectCurrentPlayer,
  selectShowVerdict,
  useGameStore,
} from '../store/gameStore'
import type { Player } from '../types'

/** How long the group has to Call Out an answer before the turn moves on. */
const CALL_OUT_MS = 4000

/**
 * Seat rail.
 *
 * This used to be six pastel identity hues, which is the single fastest way to
 * make an app look machine-assembled: colour that carries no meaning. A printed
 * scorecard does not colour its rows — it numbers them and inverts the one you
 * are on. So: mono numerals, cream block for the active seat, everything else
 * dim. Identity comes from the name.
 */
function PlayerRail({ players, turnIndex }: { players: Player[]; turnIndex: number }) {
  return (
    <div className="flex w-full gap-px overflow-x-auto">
      {players.map((p, i) => {
        const active = i === turnIndex
        return (
          <div
            key={p.id}
            className={`flex min-w-[68px] flex-1 flex-col gap-1 px-2 py-1.5 ${
              active ? 'bg-ink text-stage' : 'text-dim'
            }`}
          >
            <span className="flex items-baseline gap-1 font-mono text-[10px] leading-none">
              <span className={active ? 'opacity-55' : 'opacity-45'}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="truncate">{p.name}</span>
            </span>
            <span className="flex items-baseline gap-1.5 font-mono text-[10px] leading-none">
              <span className={active ? 'opacity-90' : 'text-sage'}>+{p.brave}</span>
              <span className={active ? 'opacity-55' : 'text-accent'}>-{p.coward}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* Shared button shapes. Three, not thirty: a primary, a refusal, a quiet one.
   No borders-and-shadow-on-everything — that uniform treatment was the tell. */
const BTN_PRIMARY =
  'flex h-12 items-center justify-center bg-ink text-[14px] font-semibold text-stage transition-transform active:translate-y-[1px]'
const BTN_REFUSE =
  'flex h-12 items-center justify-center border border-accent text-[14px] font-semibold text-accent transition-colors active:bg-accent active:text-stage'
const BTN_QUIET =
  'flex h-12 items-center justify-center px-3 font-mono text-[11px] text-muted transition-colors active:text-ink'

export function GameScreen() {
  const phase = useGameStore((s) => s.phase)
  const players = useGameStore((s) => s.players)
  const turnIndex = useGameStore((s) => s.turnIndex)
  const round = useGameStore((s) => s.round)
  const gameMode = useGameStore((s) => s.gameMode)
  const wildcard = useGameStore((s) => s.wildcard)
  const currentQuestion = useGameStore((s) => s.currentQuestion)
  const pendingDare = useGameStore((s) => s.pendingDare)
  const flipped = useGameStore((s) => s.flipped)
  const stage = useGameStore((s) => s.stage)
  const pool = useGameStore((s) => s.pool)
  const poolIndex = useGameStore((s) => s.poolIndex)

  const answer = useGameStore((s) => s.answer)
  const skip = useGameStore((s) => s.skip)
  const reroll = useGameStore((s) => s.reroll)
  const chickenOut = useGameStore((s) => s.chickenOut)
  const rerollUsed = useGameStore((s) => s.rerollUsed)
  const completeDare = useGameStore((s) => s.completeDare)
  const callOut = useGameStore((s) => s.callOut)
  const acceptCallOut = useGameStore((s) => s.acceptCallOut)
  const penalizeCaller = useGameStore((s) => s.penalizeCaller)
  const dismissBanner = useGameStore((s) => s.dismissBanner)
  const drawQuestion = useGameStore((s) => s.drawQuestion)
  const quitToBurnBook = useGameStore((s) => s.quitToBurnBook)

  const player = useGameStore(selectCurrentPlayer)
  const cardsLeft = useGameStore(selectCardsLeft)
  const canCallOut = useGameStore(selectCanCallOut)
  const awaitingDare = useGameStore(selectAwaitingDare)
  const awaitingCallOutDare = useGameStore(selectAwaitingCallOutDare)
  const showVerdict = useGameStore(selectShowVerdict)
  const reduce = useReducedMotion()

  /**
   * A pending swipe signal is scoped to exactly one card in exactly one stage.
   *
   * This is deliberately DERIVED rather than cleared in an effect. `SwipeCard`
   * is remounted per question with a fresh dedupe counter, so a signal left in
   * state after its card unmounted got consumed by the NEXT card on mount,
   * auto-swiping a fresh question. Because each auto-answer restarts the 4s Call
   * Out window, that cascaded hands-free until the deck ran dry — reported as
   * "starts auto-skipping and then gets stuck".
   *
   * Clearing it in a useEffect does NOT work: child effects run before parent
   * effects, so the incoming card would consume the stale signal before the
   * parent could null it. Comparing tokens during render cannot have that
   * ordering problem, so a mismatched signal is simply never handed down.
   *
   * Since the Answer/Dare buttons were removed (swipe-only, by request) the
   * keyboard is the only producer of a signal — but the guard stays: it is what
   * makes ANY programmatic swipe safe.
   */
  const cardToken = `${currentQuestion?.id ?? 'callout'}:${stage}:${turnIndex}`
  const [raised, setRaised] = useState<{ token: string; signal: SwipeSignal } | null>(null)
  const signalSeq = useRef(0)
  const signal = raised?.token === cardToken ? raised.signal : null

  /**
   * Rehydrate safety net: after a page refresh mid-game the scores come back
   * but the in-flight card deliberately does not. Deal a fresh one.
   */
  useEffect(() => {
    if (phase === 'playing' && !currentQuestion && stage === 'question' && cardsLeft > 0) {
      drawQuestion()
    }
  }, [phase, currentQuestion, stage, cardsLeft, drawQuestion])

  // A monotonic counter, not Date.now(): two presses inside the same millisecond
  // would produce identical ids and SwipeCard's dedupe would swallow the second.
  const fire = (direction: 'left' | 'right') => {
    signalSeq.current += 1
    setRaised({ token: cardToken, signal: { direction, id: signalSeq.current } })
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (stage === 'question') {
        if (e.key === 'ArrowRight') fire('right')
        if (e.key === 'ArrowLeft') fire('left')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // Re-subscribe per card TOKEN, not just per stage. `fire` closes over the
    // token that scopes a signal to exactly one card, so a listener that only
    // re-bound on `stage` would keep raising signals stamped with an old card
    // id — which the guard then (correctly) drops, leaving the arrow dead.
    // That is reachable for real: rehydrating or re-dealing a card does not
    // always change `stage`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, cardToken])

  // The Call Out window is deliberately short — it is a group reaction, not a
  // menu. Four seconds, then the turn moves on by itself.
  useEffect(() => {
    if (!canCallOut) return
    const t = setTimeout(() => acceptCallOut(), CALL_OUT_MS)
    return () => clearTimeout(t)
  }, [canCallOut, acceptCallOut])

  if (!player) return null

  /**
   * The host barks once per moment, not per card: an answer, a dare, a Call Out
   * or the verdict. Seeded by the turn so the line is stable for that beat but
   * rotates between turns. `null` during the quiet question stage.
   */
  const hostEvent: GameEvent | null = showVerdict
    ? 'verdict'
    : stage === 'answered'
      ? 'answer'
      : stage === 'dare'
        ? 'dare'
        : stage === 'callout'
          ? 'callOut'
          : null
  const hostLine = hostEvent ? reactionFor(hostEvent, `${turnIndex}:${round}`) : null

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-6 pb-8">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="meta text-dim">
            round {round} &middot; {cardsLeft} left
          </p>
          <p className="mt-1.5 truncate text-xl font-semibold tracking-[-0.01em] text-ink">
            {player.name}
            <span className="text-muted">&rsquo;s turn</span>
          </p>
        </div>
        <button
          type="button"
          onClick={quitToBurnBook}
          className="meta shrink-0 border border-hairline px-2.5 py-1.5 text-muted active:bg-sheet"
        >
          end
        </button>
      </header>

      <div className="mb-5">
        <PlayerRail players={players} turnIndex={turnIndex} />
      </div>

      {gameMode === 'classic' && wildcard && (
        <div className="mb-4 border-l-2 border-ochre pl-3">
          <p className="meta text-ochre">wildcard</p>
          <p className="mt-1 text-[12px] leading-snug text-muted">{wildcard}</p>
        </div>
      )}

      <div className="relative flex flex-1 items-center justify-center">
        {showVerdict ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col justify-between border border-hairline bg-panel p-6 shadow-pop-lg"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="meta text-accent">call out</span>
              <span className="meta text-dim">{player.name}</span>
            </div>

            <div>
              <p className="text-[25px] leading-[1.2] font-semibold tracking-[-0.01em] text-balance text-ink">
                Did {player.name} deserve that?
              </p>
              <p className="mt-3 border-l border-hairline pl-3 text-[12.5px] leading-snug text-muted">
                Wrong call? Pick whoever called it out — they take the point instead.
              </p>
            </div>

            <div className="space-y-3">
              <button type="button" onClick={acceptCallOut} className={`${BTN_PRIMARY} w-full`}>
                Deserved it
              </button>
              <div className="flex flex-wrap gap-1.5">
                {players
                  .filter((p) => p.id !== player.id)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => penalizeCaller(p.id)}
                      className="border border-accent px-2.5 py-1.5 font-mono text-[11px] text-accent active:bg-accent active:text-stage"
                    >
                      {p.name} &minus;1
                    </button>
                  ))}
              </div>
              <p className="meta text-dim">{player.name} gets the brave point back.</p>
            </div>
          </motion.div>
        ) : stage === 'answered' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col justify-between border border-sage/50 bg-panel p-6 shadow-pop-lg"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="meta text-sage">answered</span>
              <span className="meta text-dim">{player.name}</span>
            </div>

            <div>
              <p className="text-[25px] leading-[1.2] font-semibold tracking-[-0.01em] text-balance text-ink">
                {player.name} answered.
              </p>
              <p className="mt-3 border-l border-hairline pl-3 text-[12.5px] leading-snug text-muted">
                Group decides: was it honest? Passing over to the next player.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* two thin sheets behind, to sell the stack without a second shadow */}
            <div className="absolute inset-x-6 bottom-2 h-5 border border-hairline bg-coal" />
            <div className="absolute inset-x-3 bottom-1 h-5 border border-hairline bg-coal" />
            <SwipeCard
              // No `stage` in the key: a skip must keep the SAME card instance
              // so the 3D flip animates instead of remounting mid-reveal.
              key={`${currentQuestion?.id ?? 'callout'}-${turnIndex}`}
              question={currentQuestion}
              playerName={player.name}
              dare={pendingDare}
              flipped={flipped}
              signal={signal}
              cardNumber={currentQuestion ? { n: poolIndex, total: pool.length } : null}
              onSwipe={(direction) => (direction === 'right' ? answer() : skip())}
              onFlipComplete={dismissBanner}
            />
          </>
        )}
      </div>

      {/* The host's running commentary replaces the old static banner. Derived
          from the stage, so it appears with the moment and clears itself. */}
      {hostLine && (
        <div className="mt-4 flex justify-center">
          <Commentator quip={hostLine} variant="toast" />
        </div>
      )}

      {/* Call Out countdown — a visible fuse for the 4s group-reaction window. */}
      {canCallOut &&
        (reduce ? (
          <div className="mx-auto mt-3 h-px w-44 bg-accent" />
        ) : (
          <motion.div
            key={`callout-${turnIndex}-${round}`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: CALL_OUT_MS / 1000, ease: 'linear' }}
            className="mx-auto mt-3 h-px w-44 origin-left bg-accent"
          />
        ))}

      {/* ---- Actions --------------------------------------------------------
          There is still deliberately NO Answer / Dare button pair. The card IS
          the control: drag it right to answer, left to dare. The keyboard arrows
          remain as the non-drag path (same `fire()` signal). What lives here is
          only what a swipe cannot express:

            - Reroll       — swap the card once per turn (question OR dare side)
            - Chicken out  — refuse both, take a Coward point, end the turn
            - Done         — confirm a dare
            - Call Out     — the group's vote, and its verdict

          A Call Out punishment gets its OWN branch with only Done. It is not a
          dare you may refuse: chickening out there would `advanceTurn()` past
          `calloutVerdict`, so the group could never rule on the call and
          `penalizeCaller` was unreachable. Reroll would not work either — it only
          handles the question and dare stages. "No passing" means no passing.

          `showVerdict` must be checked explicitly. If it were allowed to fall
          through to the default branch, a queued `signal` would be consumed by
          the next card on mount — silently auto-swiping a fresh question. */}
      <div className="mt-5 flex gap-2">
        {showVerdict ? (
          <p className="meta w-full py-3 text-center text-dim">verdict decides the turn</p>
        ) : awaitingCallOutDare ? (
          <button
            type="button"
            onClick={completeDare}
            title="A Call Out dare cannot be rerolled or refused"
            className={`${BTN_PRIMARY} w-full`}
          >
            Done &middot; no passing
          </button>
        ) : awaitingDare ? (
          <>
            <button
              type="button"
              onClick={reroll}
              disabled={rerollUsed}
              title={rerollUsed ? 'Reroll already used this turn' : 'Swap this dare once'}
              className={`${BTN_QUIET} disabled:cursor-not-allowed disabled:text-dim disabled:opacity-50`}
            >
              Reroll
            </button>
            <button
              type="button"
              onClick={chickenOut}
              title="Refuse the dare — costs a point and ends the turn"
              className={`${BTN_REFUSE} shrink-0 px-3`}
            >
              Chicken out
            </button>
            <button type="button" onClick={completeDare} className={`${BTN_PRIMARY} flex-1`}>
              Done
            </button>
          </>
        ) : stage === 'answered' ? (
          <>
            <button type="button" onClick={acceptCallOut} className={`${BTN_QUIET} flex-1`}>
              Next player
            </button>
            <button type="button" onClick={callOut} className={`${BTN_REFUSE} flex-1`}>
              Call Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={reroll}
              disabled={rerollUsed}
              title={rerollUsed ? 'Reroll already used this turn' : 'Swap this question once'}
              className={`${BTN_QUIET} disabled:cursor-not-allowed disabled:text-dim disabled:opacity-50`}
            >
              Reroll
            </button>
            <button type="button" onClick={chickenOut} className={`${BTN_REFUSE} flex-1`}>
              Chicken out &middot; &minus;1
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] leading-none text-dim">
        <span>tier {dareTier(player.flinchCount ?? 0)}</span>
        {(player.flinchCount ?? 0) >= 4 && <span className="text-accent">on thin ice</span>}
        <span>cards run out = game over</span>
      </div>
    </div>
  )
}
