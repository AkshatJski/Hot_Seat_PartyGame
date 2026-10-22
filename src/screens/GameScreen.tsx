import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { SwipeCard, type SwipeSignal } from '../components/SwipeCard'
import { Commentator } from '../components/Commentator'
import { reactionFor, type GameEvent } from '../data/commentary'
import { dareTier } from '../data/decks'
import { playerPalette } from '../data/playerColors'
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
 * Seat rail: a coloured avatar and two scores per player, the active one lifted
 * onto a white card with a coral ring.
 *
 * The colour is assigned by seat index, never by name, so it is stable for the
 * whole game and the same person is "the grape one" in the rail, on the card and
 * in the Burn Book.
 */
function PlayerRail({ players, turnIndex }: { players: Player[]; turnIndex: number }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {players.map((p, i) => {
        const active = i === turnIndex
        const palette = playerPalette(i)
        return (
          <div
            key={p.id}
            className={`flex min-w-[86px] flex-1 items-center gap-2 rounded-2xl px-2.5 py-2 ${
              active ? 'bg-panel shadow-soft ring-2 ring-coral/70' : 'bg-white/45'
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-[12px] font-bold ${palette.bg} ${palette.text}`}
            >
              {p.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span
                className={`block truncate font-display text-[12px] leading-tight font-semibold ${
                  active ? 'text-ink' : 'text-muted'
                }`}
              >
                {p.name}
              </span>
              <span className="flex gap-1.5 font-display text-[10.5px] leading-tight font-semibold">
                <span className="text-mint-deep">+{p.brave}</span>
                <span className="text-berry-deep">-{p.coward}</span>
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

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
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-4 pt-5 pb-7">
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="chip mb-1.5">
            Round {round} &middot; {cardsLeft} left
          </span>
          <p className="truncate font-display text-[22px] leading-tight font-semibold text-ink">
            {player.name}
            <span className="text-muted">&rsquo;s turn</span>
          </p>
        </div>
        <button
          type="button"
          onClick={quitToBurnBook}
          className="btn btn-quiet h-9 shrink-0 px-3 text-[12.5px]"
        >
          End
        </button>
      </header>

      <div className="mb-4">
        <PlayerRail players={players} turnIndex={turnIndex} />
      </div>

      {gameMode === 'classic' && wildcard && (
        <div className="mb-3 flex items-start gap-2 rounded-2xl bg-sun/20 px-3 py-2">
          <span className="chip shrink-0 bg-sun text-[#4a3200]">Wildcard</span>
          <span className="text-[12px] leading-snug font-medium text-muted">{wildcard}</span>
        </div>
      )}

      <div className="relative flex flex-1 items-center justify-center">
        {showVerdict ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="panel flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col justify-between p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="chip bg-berry/15 text-berry-deep">Call out</span>
              <span className="font-display text-[12.5px] font-semibold text-muted">
                {player.name}
              </span>
            </div>

            <div>
              <p className="font-display text-[26px] leading-[1.15] font-semibold tracking-[-0.01em] text-balance text-ink">
                Did {player.name} deserve that?
              </p>
              <p className="mt-3 text-[12.5px] leading-snug font-medium text-muted">
                Wrong call? Pick whoever called it out — they take the point instead.
              </p>
            </div>

            <div className="space-y-2.5">
              <button type="button" onClick={acceptCallOut} className="btn btn-coral h-12 w-full text-[14px]">
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
                      className="btn btn-berry h-9 rounded-xl px-3 text-[12px]"
                    >
                      {p.name} &minus;1
                    </button>
                  ))}
              </div>
              <p className="text-center text-[11.5px] font-medium text-dim">
                {player.name} gets the brave point back.
              </p>
            </div>
          </motion.div>
        ) : stage === 'answered' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col justify-between rounded-[26px] bg-mint/15 p-5 ring-2 ring-mint/40"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="chip bg-mint text-[#083a26]">Answered</span>
              <span className="font-display text-[12.5px] font-semibold text-muted">
                {player.name}
              </span>
            </div>

            <div>
              <p className="font-display text-[26px] leading-[1.15] font-semibold tracking-[-0.01em] text-balance text-ink">
                {player.name} answered.
              </p>
              <p className="mt-3 text-[12.5px] leading-snug font-medium text-muted">
                Group decides: was it honest? Passing over to the next player.
              </p>
            </div>
          </motion.div>
        ) : (
          // The wrapper is sized to the CARD, not to the flex container. The two
          // sheets that sell the "deck" illusion are offset from this box, so
          // they stay tucked under the card's bottom edge on every screen height;
          // anchored to the container they drifted free on tall phones.
          <div className="relative w-[min(88vw,380px)]">
            <div className="absolute inset-x-4 -bottom-2 h-10 rounded-[26px] bg-white/55" />
            <div className="absolute inset-x-2 -bottom-1 h-10 rounded-[26px] bg-white/80" />
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
          </div>
        )}
      </div>

      {/* The host's running commentary replaces the old static banner. Derived
          from the stage, so it appears with the moment and clears itself. */}
      {hostLine && (
        <div className="mt-3">
          <Commentator quip={hostLine} variant="toast" />
        </div>
      )}

      {/* Call Out countdown — a visible fuse for the 4s group-reaction window. */}
      {canCallOut &&
        (reduce ? (
          <div className="mx-auto mt-3 h-2 w-44 rounded-full bg-berry" />
        ) : (
          <motion.div
            key={`callout-${turnIndex}-${round}`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: CALL_OUT_MS / 1000, ease: 'linear' }}
            className="mx-auto mt-3 h-2 w-44 origin-left rounded-full bg-berry"
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
      <div className="mt-4 flex gap-2">
        {showVerdict ? (
          <p className="w-full py-3 text-center text-[11.5px] font-medium text-dim">
            verdict decides the turn
          </p>
        ) : awaitingCallOutDare ? (
          <button
            type="button"
            onClick={completeDare}
            title="A Call Out dare cannot be rerolled or refused"
            className="btn btn-mint h-12 w-full text-[14.5px]"
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
              className="btn btn-quiet h-12 shrink-0 rounded-2xl px-3.5 text-[13px]"
            >
              Reroll
            </button>
            <button
              type="button"
              onClick={chickenOut}
              title="Refuse the dare — costs a point and ends the turn"
              className="btn btn-berry h-12 shrink-0 rounded-2xl px-3.5 text-[13px]"
            >
              Chicken out
            </button>
            <button
              type="button"
              onClick={completeDare}
              className="btn btn-mint h-12 flex-1 rounded-2xl text-[15px]"
            >
              Done
            </button>
          </>
        ) : stage === 'answered' ? (
          <>
            <button
              type="button"
              onClick={acceptCallOut}
              className="btn btn-quiet h-12 flex-1 rounded-2xl text-[14.5px]"
            >
              Next player
            </button>
            <button
              type="button"
              onClick={callOut}
              className="btn btn-berry h-12 flex-1 rounded-2xl text-[14.5px]"
            >
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
              className="btn btn-quiet h-12 shrink-0 rounded-2xl px-3.5 text-[13px]"
            >
              Reroll
            </button>
            <button
              type="button"
              onClick={chickenOut}
              className="btn btn-berry h-12 flex-1 rounded-2xl text-[14px]"
            >
              Chicken out &middot; &minus;1
            </button>
          </>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
        <span className="chip bg-tint">Tier {dareTier(player.flinchCount ?? 0)}</span>
        {(player.flinchCount ?? 0) >= 4 && (
          <span className="chip bg-berry/15 text-berry-deep">On thin ice</span>
        )}
        <span className="text-[11px] font-medium text-dim">cards run out = game over</span>
      </div>
    </div>
  )
}
