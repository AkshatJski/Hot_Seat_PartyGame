import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Gavel,
  ShieldAlert,
  SkipForward,
} from 'lucide-react'
import { SwipeCard, type SwipeSignal } from '../components/SwipeCard'
import {
  selectAwaitingDare,
  selectCanCallOut,
  selectCardsLeft,
  selectCurrentPlayer,
  selectShowVerdict,
  useGameStore,
} from '../store/gameStore'
import type { Intensity, Player } from '../types'

function Pips({ level }: { level: Intensity }) {
  return (
    <span className="flex items-center gap-[3px]">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${
            n <= level ? 'bg-neon-amber' : 'bg-white/20'
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
        return (
          <div
            key={p.id}
            className={`flex min-w-[104px] flex-1 flex-col gap-1.5 rounded-2xl border p-2.5 transition ${
              active
                ? 'border-neon-purple/60 bg-neon-purple/10'
                : 'border-white/8 bg-coal/50'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black ${
                  active ? 'bg-neon-purple text-void' : 'bg-white/15 text-bone'
                }`}
              >
                {p.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="truncate text-[11px] font-bold">{p.name}</span>
            </div>
            <div className="flex gap-1.5 text-[10px] font-bold">
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
  const currentQuestion = useGameStore((s) => s.currentQuestion)
  const pendingDare = useGameStore((s) => s.pendingDare)
  const flipped = useGameStore((s) => s.flipped)
  const stage = useGameStore((s) => s.stage)
  const banner = useGameStore((s) => s.banner)

  const answer = useGameStore((s) => s.answer)
  const skip = useGameStore((s) => s.skip)
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

  // A monotonic counter, not Date.now(): two taps inside the same millisecond
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
  }, [stage])

  // The Call Out window is deliberately short — it is a group reaction, not a
  // menu. Four seconds, then the turn moves on by itself.
  useEffect(() => {
    if (!canCallOut) return
    const t = setTimeout(() => acceptCallOut(), 4000)
    return () => clearTimeout(t)
  }, [canCallOut, acceptCallOut])

  if (!player) return null

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-6 pb-8">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] tracking-widest text-white/30 uppercase">
            Round {round} &middot; {cardsLeft} cards left
          </p>
          <p className="mt-0.5 text-lg font-black">
            {player.name}
            <span className="text-neon-purple">'s turn</span>
          </p>
        </div>
        <button
          type="button"
          onClick={quitToBurnBook}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest text-white/40 uppercase active:scale-95"
        >
          End
        </button>
      </header>

      <div className="mb-5">
        <PlayerRail players={players} turnIndex={turnIndex} />
      </div>

      <div className="relative flex flex-1 items-center justify-center">
        {showVerdict ? (
          <div className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col items-center justify-center gap-3 rounded-[28px] border border-white/10 bg-coal/60 px-2 text-center">
            <Gavel size={30} className="text-neon-red" />
            <p className="px-5 text-sm font-bold">Did {player.name} deserve that?</p>
            <button
              type="button"
              onClick={acceptCallOut}
              className="rounded-xl bg-neon-green px-5 py-2.5 text-xs font-black tracking-wide text-void active:scale-95"
            >
              Deserved it
            </button>
            <p className="text-[10px] tracking-widest text-white/35 uppercase">
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
                    className="rounded-full border border-neon-red/40 bg-neon-red/10 px-3 py-1.5 text-[11px] font-bold text-neon-red active:scale-95"
                  >
                    {p.name} &minus;1
                  </button>
                ))}
            </div>
            <p className="px-5 text-[10px] text-white/25">
              {player.name} gets the Brave point back.
            </p>
          </div>
        ) : stage === 'answered' ? (
          <div className="flex h-[min(62vh,520px)] w-[min(88vw,380px)] flex-col items-center justify-center gap-3 rounded-[28px] border border-neon-green/25 bg-linear-to-b from-neon-green/10 to-coal px-6 text-center">
            <Check size={30} className="text-neon-green" />
            <p className="text-sm font-bold">{player.name} answered</p>
            <p className="text-[11px] leading-relaxed text-white/40">
              Group decides: was it honest?
            </p>
            <p className="mt-1 text-[10px] tracking-widest text-white/25 uppercase">
              passing over to the next player
            </p>
          </div>
        ) : (
          <>
            {/* two static cards behind, to sell the stack */}
            <div className="absolute inset-x-6 bottom-2 h-6 rounded-[28px] border border-white/5 bg-coal/60" />
            <div className="absolute inset-x-3 bottom-1 h-6 rounded-[28px] border border-white/8 bg-coal/80" />
            <SwipeCard
              // No `stage` in the key: a skip must keep the SAME card instance
              // so the 3D flip animates instead of remounting mid-reveal.
              key={`${currentQuestion?.id ?? 'callout'}-${turnIndex}`}
              question={currentQuestion}
              playerName={player.name}
              dare={pendingDare}
              flipped={flipped}
              signal={signal}
              onSwipe={(direction) => (direction === 'right' ? answer() : skip())}
              onFlipComplete={dismissBanner}
            />
          </>
        )}
      </div>

      <AnimatePresence>
        {banner && !showVerdict && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={dismissBanner}
            className="mx-auto mt-4 max-w-[90%] rounded-full bg-white/8 px-4 py-2 text-center text-[11px] font-bold tracking-wide text-white/70"
          >
            {banner}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ---- Actions --------------------------------------------------------
          `showVerdict` must be checked explicitly. If it were allowed to fall
          through to the default branch, the Dare/Answer buttons would be live
          during the verdict, and a queued `signal` would be consumed by the
          next card on mount — silently auto-swiping a fresh question. */}
      <div className="mt-4 flex gap-3">
        {showVerdict ? (
          <p className="py-3 text-center text-[10px] tracking-widest text-white/25 uppercase">
            verdict decides the turn
          </p>
        ) : awaitingDare ? (
          <button
            type="button"
            onClick={completeDare}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-neon-green text-base font-black tracking-wide text-void active:scale-95"
          >
            <Check size={19} /> Done
          </button>
        ) : stage === 'answered' ? (
          <>
            <button
              type="button"
              onClick={acceptCallOut}
              className="h-14 flex-1 rounded-2xl border border-white/12 text-sm font-bold text-white/40 active:scale-95"
            >
              Next player
            </button>
            <button
              type="button"
              onClick={callOut}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-neon-red text-base font-black tracking-wide text-void active:scale-95"
            >
              <Gavel size={19} /> Call Out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fire('left')}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-neon-red/50 bg-neon-red/10 font-bold text-neon-red active:scale-95"
            >
              <ArrowLeft size={18} /> Dare
            </button>
            <button
              type="button"
              onClick={() => fire('right')}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-neon-green font-bold text-void active:scale-95"
            >
              Answer <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] tracking-widest text-white/20 uppercase">
        <span className="flex items-center gap-1">
          <Flame size={10} /> tier {Math.min(3, 1 + Math.floor(player.coward / 2))}
        </span>
        {player.coward >= 4 && (
          <span className="flex items-center gap-1 text-neon-red/70">
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