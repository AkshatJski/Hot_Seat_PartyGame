import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  AlertTriangle,
  ArrowLeft,
  Bird,
  BookOpen,
  Dice5,
  Eye,
  Flame,
  Ghost,
  RotateCcw,
  Share2,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { deckLabel } from '../data/decks'
import { verdictFor, type VerdictKind } from '../data/verdicts'
import { reactionFor } from '../data/commentary'
import { playerPalette } from '../data/playerColors'
import { Commentator } from '../components/Commentator'
import { CountUp } from '../components/CountUp'
import { useGameStore } from '../store/gameStore'

/** One icon per archetype — kept here so `src/data/verdicts.ts` stays pure. */
const VERDICT_ICON: Record<VerdictKind, typeof Ghost> = {
  ghost: Ghost,
  flincher: Bird,
  reckless: Flame,
  nuclear: Zap,
  noRegrets: ThumbsUp,
  onATear: TrendingUp,
  openBook: BookOpen,
  cryWolf: Eye,
  publicEnemy: AlertTriangle,
  yesMachine: Star,
  dodger: ArrowLeft,
  sus: Target,
  allRounder: Dice5,
}

export function BurnBookScreen() {
  const players = useGameStore((s) => s.players)
  const deckIds = useGameStore((s) => s.deckIds)
  const round = useGameStore((s) => s.round)
  const restart = useGameStore((s) => s.restart)
  const [copied, setCopied] = useState(false)

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
      `Round ${round} · ${deckIds.map(deckLabel).join(' + ')}`,
      '',
      ...roster.map(({ player, verdict }) => `${player.name} — ${verdict.title}: ${verdict.blurb}`),
      '',
      `${totals.brave} answered · ${totals.coward} skipped · ${totals.dares} dares · ${totals.calls} called out`,
    ]
    return lines.join('\n')
  }, [roster, round, deckIds, totals])

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
        <p className="text-sm text-white/40">No game played yet.</p>
        <button
          type="button"
          onClick={restart}
          className="rounded-2xl bg-neon-green px-6 py-3 font-black text-void active:scale-95"
        >
          Start a game
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 pt-8 pb-8">
      <header className="mb-6 text-center">
        <p className="text-[10px] tracking-widest text-neon-red uppercase">
          Round {round} &middot; complete
        </p>
        <h1 className="mt-1 text-4xl font-black tracking-tight">The Burn Book</h1>
        <p className="mt-2 text-[11px] text-white/35">
          {deckIds.map(deckLabel).join(' + ')}
        </p>
        <div className="mt-4 flex justify-center">
          <Commentator quip={reactionFor('finish', String(round))} variant="toast" />
        </div>
      </header>

      <div className="mb-6 grid grid-cols-4 gap-2">
        {[
          { label: 'Brave', value: totals.brave, colour: 'text-neon-green' },
          { label: 'Coward', value: totals.coward, colour: 'text-neon-red' },
          { label: 'Dares', value: totals.dares, colour: 'text-neon-amber' },
          { label: 'Called out', value: totals.calls, colour: 'text-neon-purple' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/8 bg-coal/60 py-3 text-center"
          >
            <p className={`text-xl font-black ${stat.colour}`}>
              <CountUp value={stat.value} />
            </p>
            <p className="mt-0.5 text-[9px] tracking-widest text-white/30 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <p className="mb-2.5 text-[10px] tracking-widest text-white/30 uppercase">
        The verdicts
      </p>
      <div className="mb-6 space-y-2.5">
        {roster.map(({ player, verdict }, i) => {
          const Icon = VERDICT_ICON[verdict.kind]
          return (
            <motion.div
              key={player.id}
              data-verdict={verdict.kind}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-panel to-coal p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-white/8 ${playerPalette(i).border} ${verdict.accent}`}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] tracking-widest text-white/35 uppercase">
                    {verdict.title}
                  </p>
                  <p className={`mt-0.5 truncate text-lg font-black ${verdict.accent}`}>
                    {player.name}
                  </p>
                  <p className="text-[11px] text-white/45">{verdict.blurb}</p>
                  <p className="mt-1.5 text-[10px] font-bold text-white/30">
                    <CountUp value={player.brave} className="text-neon-green" /> brave &middot;{' '}
                    <CountUp value={player.coward} className="text-neon-red" /> skipped &middot;{' '}
                    <CountUp value={player.daresCompleted} className="text-neon-amber" /> dares
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={share}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-neon-purple font-black tracking-wide text-void active:scale-95"
        >
          <Share2 size={17} /> {copied ? 'Copied!' : 'Share'}
        </button>
        <button
          type="button"
          onClick={restart}
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 font-bold text-white/60 active:scale-95"
        >
          <RotateCcw size={16} /> Rematch
        </button>
      </div>
    </div>
  )
}
