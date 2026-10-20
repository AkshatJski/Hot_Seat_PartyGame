import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Check,
  Flame,
  Gavel,
  Minus,
  RefreshCw,
  ShieldAlert,
  SkipForward,
} from 'lucide-react'
import { SwipeCard, type SwipeSignal } from '../components/SwipeCard'
import { Commentator } from '../components/Commentator'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { reactionFor, type GameEvent } from '../data/commentary'
import { playerPalette } from '../data/playerColors'
import { dareTier } from '../data/decks'
import {
  selectAwaitingDare,
  selectCanCallOut,
  selectCardsLeft,
  selectCurrentPlayer,
  selectShowVerdict,
  useGameStore,
} from '../store/gameStore'
import type { Intensity, Player } from '../types'

/** How long the group has to Call Out an answer before the turn moves on. */
const CALL_OUT_MS = 4000

function Pips({ level }: { level: Intensity }) {
  return (
    <span className="flex items-center gap-1">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-sm ${
            n <= level ? 'bg-neon-amber' : 'bg-hairline'
          }`}
        />
      ))}
    </span>
  )
}

function PlayerRail({ players, turnIndex }: { players: Player[]; turnIndex: number }) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-1">
      {players.map((p, i) => {
        const active = i === turnIndex
        const palette = playerPalette(i)
        return (
          <div
            key={p.id}
            className={`flex min-w-[104px] flex-1 flex-col gap-1.5 rounded-xl border-2 p-2.5 ${
              active ? `${palette.border} ${palette.soft} shadow-pop-sm` : 'border-hairline bg-coal'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${
                  active ? `border border-ink text-ink ${palette.bg}` : `${palette.soft} ${palette.text}`
                }`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate text-[11px] font-bold">{p.name}</span>
            </div>
            <div className="flex gap-1.5 text-[10px] font-black">
              <span className="text-neon-green">+{p.brave}</span>
              <span className="text-neon-red">-{p.coward}</span>
            </div>
            <Pips level={p.deepestAnswered} />
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

  const palette = playerPalette(turnIndex)

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
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-dim uppercase">
            Round {round} &middot; {cardsLeft} cards left
          </p>
          <p className="mt-0.5 text-lg font-black">
            {player.name}
            <span className={palette.text}>'s turn</span>
          </p>
        </div>
        <button
          type="button"
          onClick={quitToBurnBook}
          className="rounded-xl border-2 border-ink bg-coal px-3 py-1.5 text-[10px] font-black tracking-widest text-muted uppercase shadow-pop-sm active:translate-y-[3px] active:shadow-none"
        >
          End
        </button>
      </header>

      <div className="mb-5">
        <PlayerRail players={players} turnIndex={turnIndex} />
      </div>

      {gameMode === 'classic' && wildcard && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border-2 border-neon-amber bg-panel px-3 py-2 shadow-pop-sm">
          <span className="text-[9px] font-black tracking-widest text-neon-amber uppercase">
            Wildcard
          </span>
          <span className="text-[11px] leading-snug text-bone">{wildcard}</span>
        </div>
      )}

      <div className="relative flex flex-1 items-center justify-center">
        {showVerdict ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col items-center justify-center gap-3 rounded-[28px] border-[3px] border-ink bg-panel px-3 text-center shadow-pop-lg"
          >
            <Gavel size={32} className="text-neon-red" />
            <p className="px-5 text-sm font-black">Did {player.name} deserve that?</p>
            <button
              type="button"
              onClick={acceptCallOut}
              className="rounded-xl border-2 border-ink bg-neon-green px-5 py-2.5 text-xs font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
            >
              Deserved it
            </button>
            <p className="text-[10px] font-bold tracking-widest text-dim uppercase">
              Wrong call? Pick who called it out
            </p>
            <div className="flex flex-wrap justify-center gap-1.5 px-4">
              {players
                .filter((p) => p.id !== player.id)
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => penalizeCaller(p.id)}
                    className="rounded-lg border-2 border-ink bg-neon-red px-3 py-1.5 text-[11px] font-black text-ink shadow-pop-sm active:translate-y-[3px] active:shadow-none"
                  >
                    {p.name} &minus;1
                  </button>
                ))}
            </div>
            <p className="px-5 text-[10px] font-bold text-dim">
              {player.name} gets the Brave point back.
            </p>
          </motion.div>
        ) : stage === 'answered' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col items-center justify-center gap-3 rounded-[28px] border-[3px] border-neon-green bg-panel px-6 text-center shadow-pop-lg"
          >
            <ConfettiBurst />
            <Check size={32} className="text-neon-green" />
            <p className="text-sm font-black">{player.name} answered</p>
            <p className="text-[11px] font-bold leading-relaxed text-muted">
              Group decides: was it honest?
            </p>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-dim uppercase">
              passing over to the next player
            </p>
          </motion.div>
        ) : (
          <>
            {/* two static cards behind, to sell the stack */}
            <div className="absolute inset-x-6 bottom-2 h-6 rounded-[28px] border-2 border-ink bg-coal" />
            <div className="absolute inset-x-3 bottom-1 h-6 rounded-[28px] border-2 border-ink bg-coal" />
            <SwipeCard
              // No `stage` in the key: a skip must keep the SAME card instance
              // so the 3D flip animates instead of remounting mid-reveal.
              key={`${currentQuestion?.id ?? 'callout'}-${turnIndex}`}
              question={currentQuestion}
              playerName={player.name}
              accent={palette}
              dare={pendingDare}
              flipped={flipped}
              signal={signal}
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
          <div className="mx-auto mt-3 h-1.5 w-44 rounded-full bg-neon-red" />
        ) : (
          <motion.div
            key={`callout-${turnIndex}-${round}`}
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: CALL_OUT_MS / 1000, ease: 'linear' }}
            className="mx-auto mt-3 h-1.5 w-44 origin-left rounded-full bg-neon-red"
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

          `showVerdict` must be checked explicitly. If it were allowed to fall
          through to the default branch, a queued `signal` would be consumed by
          the next card on mount — silently auto-swiping a fresh question. */}
      <div className="mt-4 flex gap-3">
        {showVerdict ? (
          <p className="w-full py-3 text-center text-[10px] font-bold tracking-widest text-dim uppercase">
            verdict decides the turn
          </p>
        ) : awaitingDare ? (
          <>
            <button
              type="button"
              onClick={reroll}
              disabled={rerollUsed}
              title={rerollUsed ? 'Reroll already used this turn' : 'Swap this dare once'}
              className={`flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink px-3 text-sm font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-pop-sm ${
                rerollUsed ? 'bg-coal' : 'bg-neon-amber'
              }`}
            >
              <RefreshCw size={17} /> Reroll
            </button>
            <button
              type="button"
              onClick={chickenOut}
              title="Refuse the dare — costs a point and ends the turn"
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-neon-red px-3 text-sm font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
            >
              <Minus size={17} /> Chicken out
            </button>
            <button
              type="button"
              onClick={completeDare}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-neon-green text-base font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
            >
              <Check size={19} /> Done
            </button>
          </>
        ) : stage === 'answered' ? (
          <>
            <button
              type="button"
              onClick={acceptCallOut}
              className="h-14 flex-1 rounded-2xl border-2 border-ink bg-coal text-sm font-black text-muted shadow-pop-sm active:translate-y-[3px] active:shadow-none"
            >
              Next player
            </button>
            <button
              type="button"
              onClick={callOut}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-neon-red text-base font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
            >
              <Gavel size={19} /> Call Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={reroll}
              disabled={rerollUsed}
              title={rerollUsed ? 'Reroll already used this turn' : 'Swap this question once'}
              className={`flex h-14 items-center justify-center gap-2 rounded-2xl border-2 border-ink px-4 text-sm font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-40 disabled:shadow-pop-sm ${
                rerollUsed ? 'bg-coal' : 'bg-neon-amber'
              }`}
            >
              <RefreshCw size={17} /> Reroll
            </button>
            <button
              type="button"
              onClick={chickenOut}
              title="Refuse both the question and the dare — costs a point"
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-neon-red text-sm font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
            >
              <Minus size={17} /> Chicken out &middot; &minus;1
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-bold tracking-widest text-dim uppercase">
        <span className="flex items-center gap-1">
          <Flame size={10} /> tier {dareTier(player.flinchCount ?? 0)}
        </span>
        {(player.flinchCount ?? 0) >= 4 && (
          <span className="flex items-center gap-1 text-neon-red">
            <ShieldAlert size={10} /> on thin ice
          </span>
        )}
        <span className="flex items-center gap-1">
          <SkipForward size={10} /> cards run out = game over
        </span>
      </div>
    </div>
  )
}
