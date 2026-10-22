import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { verdictFor } from '../data/verdicts'
import { reactionFor } from '../data/commentary'
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
   * EASTER EGG #2 — hold the title for the colophon.
   *
   * A real printed thing has a page at the back that tells you who set the type.
   * Nobody needs it, so it lives behind a long-press on the title: unreachable
   * by accident, unmissable to anyone who pokes at things. Fires on
   * pointerdown and must be cancelled on up/leave/cancel, or a scroll that
   * starts on the title would open it.
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
      <div className="flex min-h-full flex-col items-center justify-center gap-5 px-6 text-center">
        <p className="text-[13px] text-muted">No game played yet.</p>
        <button
          type="button"
          onClick={restart}
          className="flex h-12 items-center justify-center bg-ink px-6 text-[14px] font-semibold text-stage active:translate-y-[1px]"
        >
          Start a game
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-8 pb-8">
      <header className="mb-7">
        <div className="flex items-baseline justify-between">
          <span className="meta text-dim">Round {round}</span>
          <span className="meta text-dim">complete</span>
        </div>

        <h1
          onPointerDown={beginHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          onContextMenu={(e) => e.preventDefault()}
          className="mt-3 touch-manipulation text-[36px] leading-[1.02] font-semibold tracking-[-0.03em] text-ink select-none"
        >
          The Burn Book
        </h1>

        <div className="mt-4 h-px w-full bg-hairline" />

        {colophon ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 border border-hairline bg-sheet px-4 py-3"
          >
            <p className="meta text-dim">colophon</p>
            <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-muted">
              HOT SEAT — first printing, 2026.
              <br />
              Set in system-ui and ui-monospace.
              <br />
              Printed by hand, in a dim room.
              <br />
              No images, no webfonts, no analytics.
            </p>
            <button
              type="button"
              onClick={() => setColophon(false)}
              className="meta mt-2.5 text-dim active:text-ink"
            >
              close
            </button>
          </motion.div>
        ) : (
          <div className="mt-4">
            <Commentator quip={reactionFor('finish', String(round))} />
          </div>
        )}
      </header>

      {/* Totals as a ruled ledger row, not four coloured tiles. */}
      <div className="mb-7 grid grid-cols-4 border-y border-hairline">
        {[
          { label: 'brave', value: totals.brave, colour: 'text-sage' },
          { label: 'coward', value: totals.coward, colour: 'text-accent' },
          { label: 'dares', value: totals.dares, colour: 'text-ochre' },
          { label: 'called out', value: totals.calls, colour: 'text-ink' },
        ].map((stat, i) => (
          <div key={stat.label} className={`py-3 ${i > 0 ? 'border-l border-hairline pl-3' : ''}`}>
            <p className={`text-[20px] leading-none font-semibold ${stat.colour}`}>
              <CountUp value={stat.value} />
            </p>
            <p className="meta mt-1.5 text-dim">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="meta mb-3 text-dim">The verdicts</p>
      <div className="mb-7 border-t border-hairline">
        {roster.map(({ player, verdict }, i) => (
          <motion.div
            key={player.id}
            data-verdict={verdict.kind}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className="border-b border-hairline py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="meta text-dim">{verdict.title}</p>
              <span className="meta text-dim">{String(i + 1).padStart(2, '0')}</span>
            </div>

            <p className="mt-1 text-[19px] leading-tight font-semibold tracking-[-0.01em] text-ink">
              {player.name}
            </p>
            <p className="mt-1 text-[12.5px] leading-snug text-muted">{verdict.blurb}</p>

            <p className="mt-2 font-mono text-[10px] leading-none text-dim">
              <CountUp value={player.brave} className="text-sage" /> brave &middot;{' '}
              <CountUp value={player.coward} className="text-accent" /> chickened out &middot;{' '}
              <CountUp value={player.daresCompleted} className="text-ochre" /> dares
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={share}
          className="flex h-12 flex-1 items-center justify-center bg-ink text-[14px] font-semibold text-stage active:translate-y-[1px]"
        >
          {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          type="button"
          onClick={restart}
          className="flex h-12 flex-1 items-center justify-center border border-hairline text-[14px] font-semibold text-muted active:bg-sheet"
        >
          Rematch
        </button>
      </div>
    </div>
  )
}
