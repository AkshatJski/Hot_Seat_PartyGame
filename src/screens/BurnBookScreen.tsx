import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { verdictFor } from '../data/verdicts'
import { reactionFor } from '../data/commentary'
import { playerPalette } from '../data/playerColors'
import { Commentator } from '../components/Commentator'
import { CountUp } from '../components/CountUp'
import { useGameStore } from '../store/gameStore'

/** How long the title must be held before the colophon appears. */
const HOLD_MS = 550

export function BurnBookScreen() {
  const players = useGameStore((s) => s.players)
  const round = useGameStore((s) => s.round)
  const restart = useGameStore((s) => s.restart)
  const [copied, setCopied] = useState(false)
  const [colophon, setColophon] = useState(false)
  const holdTimer = useRef<number | null>(null)

  /**
   * EASTER EGG — hold the title for the colophon.
   *
   * A real printed thing has a page at the back that tells you who set the type.
   * Nobody needs it, so it lives behind a long-press on the title: unreachable by
   * accident, unmissable to anyone who pokes at things. Fires on pointerdown and
   * must be cancelled on up/leave/cancel, or a scroll that starts on the title
   * would open it.
   */
  function beginHold() {
    cancelHold()
    holdTimer.current = window.setTimeout(() => setColophon(true), HOLD_MS)
  }

  function cancelHold() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
  }

  const roster = useMemo(
    () =>
      [...players]
        .sort((a, b) => b.brave + b.daresCompleted - (a.brave + a.daresCompleted))
        .map((player) => ({ player, verdict: verdictFor(player) })),
    [players],
  )

  const totals = players.reduce(
    (acc, p) => ({
      brave: acc.brave + p.brave,
      coward: acc.coward + p.coward,
      dares: acc.dares + p.daresCompleted,
      calls: acc.calls + p.timesCalledOut,
    }),
    { brave: 0, coward: 0, dares: 0, calls: 0 },
  )

  const summary = useMemo(() => {
    const lines = [
      'TRUTH OR SWIPE — THE BURN BOOK',
      `Round ${round}`,
      '',
      ...roster.map(({ player, verdict }) => `${player.name} — ${verdict.title}: ${verdict.blurb}`),
      '',
      `${totals.brave} answered · ${totals.coward} chickened out · ${totals.dares} dares · ${totals.calls} called out`,
    ]
    return lines.join('\n')
  }, [roster, round, totals])

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Truth or Swipe', text: summary })
        return
      } catch {
        // user dismissed the share sheet — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (players.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-[13px] font-medium text-muted">No game played yet.</p>
        <button type="button" onClick={restart} className="btn btn-coral h-12 px-6 text-[15px]">
          Start a game
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-7 pb-7">
      <header className="mb-4 text-center">
        <span className="chip">Round {round} &middot; complete</span>

        <h1
          onPointerDown={beginHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className="mt-2 touch-manipulation font-display text-[36px] leading-[1.02] font-bold tracking-[-0.02em] text-ink select-none"
        >
          The Burn Book
        </h1>

        {colophon ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel mt-3 p-3.5 text-left"
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="chip bg-grape/20 text-grape-deep">Colophon</span>
              <button
                type="button"
                onClick={() => setColophon(false)}
                className="text-[11.5px] font-semibold text-dim active:text-ink"
              >
                close
              </button>
            </div>
            <p className="text-[12px] leading-relaxed font-medium text-muted">
              HOT SEAT — first printing, 2026.
              <br />
              Set in Fredoka, by hand in a dim room.
              <br />
              No images, no analytics, no servers holding your answers.
            </p>
          </motion.div>
        ) : (
          <div className="mt-3">
            <Commentator quip={reactionFor('finish', String(round))} variant="toast" />
          </div>
        )}
      </header>

      {/* Totals as four tiles, each in its role colour. */}
      <div className="panel mb-4 grid grid-cols-4 gap-1 p-2">
        {[
          { label: 'brave', value: totals.brave, colour: 'text-mint-deep' },
          { label: 'coward', value: totals.coward, colour: 'text-berry-deep' },
          { label: 'dares', value: totals.dares, colour: 'text-sun-deep' },
          { label: 'called out', value: totals.calls, colour: 'text-grape-deep' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl bg-tint/60 py-2 text-center">
            <p className={`font-display text-[21px] leading-none font-bold ${stat.colour}`}>
              <CountUp value={stat.value} />
            </p>
            <p className="mt-1 text-[10px] leading-none font-semibold text-dim">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="mb-2 pl-1 font-display text-[13px] font-semibold text-ink">The verdicts</p>

      <div className="mb-5 space-y-2">
        {roster.map(({ player, verdict }, i) => {
          const palette = playerPalette(players.findIndex((p) => p.id === player.id))
          return (
            <motion.div
              key={player.id}
              data-verdict={verdict.kind}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 26 }}
              className="panel flex items-start gap-3 p-3.5"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-bold ${palette.bg} ${palette.text}`}
              >
                {player.name.slice(0, 1).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <span className="chip bg-tint text-ink">{verdict.title}</span>
                <p className="mt-1 truncate font-display text-[17px] leading-tight font-bold text-ink">
                  {player.name}
                </p>
                <p className="text-[12px] leading-snug font-medium text-muted">{verdict.blurb}</p>
                <p className="mt-1.5 font-display text-[11px] font-semibold">
                  <CountUp value={player.brave} className="text-mint-deep" /> brave &middot;{' '}
                  <CountUp value={player.coward} className="text-berry-deep" /> chickened out &middot;{' '}
                  <CountUp value={player.daresCompleted} className="text-sun-deep" /> dares
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={share} className="btn btn-coral h-12 flex-1 text-[15px]">
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button type="button" onClick={restart} className="btn btn-quiet h-12 flex-1 text-[15px]">
          Rematch
        </button>
      </div>
    </div>
  )
}
