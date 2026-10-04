import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { Crown, RotateCcw, Share2, ShieldAlert, Skull, Sparkles, Swords } from 'lucide-react'
import { deckLabel } from '../data/decks'
import { useGameStore } from '../store/gameStore'
import type { Intensity, Player } from '../types'

interface Award {
  title: string
  blurb: string
  icon: typeof Crown
  accent: string
  winner?: Player
  value: string
  runnersUp: { player: Player; value: string }[]
}

const INTENSITY_WORD: Record<Intensity, string> = {
  1: 'surface-level',
  2: 'got spicy',
  3: 'went nuclear',
}

const number = (p: Player, key: 'brave' | 'coward' | 'daresCompleted' | 'callOutsMade') =>
  p[key]

/**
 * Burn Book awards.
 *
 * Ties are extremely common in small groups, so every award falls back through
 * progressively weaker criteria rather than picking an arbitrary winner, and
 * a genuine tie gets labelled as one instead of a coin-flip.
 */
function buildAwards(players: Player[]): Award[] {
  // Runs before the empty-state branch below, so it must survive an empty list.
  if (players.length === 0) return []
  const byCoward = [...players].sort((a, b) => b.coward - a.coward || b.brave - a.brave)
  const mostExposed = [...players].sort(
    (a, b) => b.deepestAnswered - a.deepestAnswered || b.brave - a.brave,
  )
  const menace = [...players].sort(
    (a, b) => b.worstDare - a.worstDare || b.daresCompleted - a.daresCompleted,
  )
  const answered = [...players].sort((a, b) => b.brave - a.brave)

  const noCowards = byCoward[0].coward === 0
  const noMenace = menace[0].worstDare === 1 && menace[0].daresCompleted === 0

  return [
    {
      title: 'Biggest Coward',
      blurb: 'Swiped left the most times',
      icon: ShieldAlert,
      accent: 'text-neon-red',
      winner: noCowards ? undefined : byCoward[0],
      value: noCowards ? 'Nobody flinched' : `${number(byCoward[0], 'coward')}× skipped`,
      runnersUp: noCowards
        ? []
        : byCoward
            .slice(1, 3)
            .filter((p) => p.coward > 0)
            .map((p) => ({ player: p, value: `${p.coward}×` })),
    },
    {
      title: 'Most Exposed',
      blurb: 'Answered the deepest questions',
      icon: Sparkles,
      accent: 'text-neon-green',
      winner: mostExposed[0],
      value: `${INTENSITY_WORD[mostExposed[0].deepestAnswered]} · ${number(mostExposed[0], 'brave')} brave`,
      runnersUp: mostExposed
        .slice(1, 3)
        .filter((p) => p.deepestAnswered === mostExposed[0].deepestAnswered)
        .map((p) => ({ player: p, value: INTENSITY_WORD[p.deepestAnswered] })),
    },
    {
      title: 'Menace to Society',
      blurb: 'Did the hardest dares',
      icon: Skull,
      accent: 'text-neon-amber',
      winner: noMenace ? undefined : menace[0],
      value: noMenace
        ? 'Nobody volunteered'
        : `${INTENSITY_WORD[menace[0].worstDare]} · ${number(menace[0], 'daresCompleted')} dares`,
      runnersUp: noMenace
        ? []
        : menace
            .slice(1, 3)
            .filter((p) => p.worstDare === menace[0].worstDare)
            .map((p) => ({ player: p, value: INTENSITY_WORD[p.worstDare] })),
    },
    {
      title: 'Straightest Shooter',
      blurb: 'Answered the most, ducked nothing',
      icon: Swords,
      accent: 'text-neon-purple',
      winner: answered[0],
      value:
        answered[0].coward === 0
          ? `${answered[0].brave} brave · 0 skips`
          : `${answered[0].brave} brave · ${answered[0].coward} skips`,
      runnersUp: answered
        .slice(1, 3)
        .filter((p) => p.brave === answered[0].brave)
        .map((p) => ({ player: p, value: `${p.brave} brave` })),
    },
  ]
}

export function BurnBookScreen() {
  const players = useGameStore((s) => s.players)
  const deckIds = useGameStore((s) => s.deckIds)
  const round = useGameStore((s) => s.round)
  const restart = useGameStore((s) => s.restart)
  const [copied, setCopied] = useState(false)

  const awards = useMemo(() => buildAwards(players), [players])

  const totals = players.reduce(
    (acc, p) => ({
      brave: acc.brave + p.brave,
      coward: acc.coward + p.coward,
      dares: acc.dares + p.daresCompleted,
      calls: acc.calls + p.callOutsMade,
    }),
    { brave: 0, coward: 0, dares: 0, calls: 0 },
  )

  const summary = useMemo(() => {
    const lines = [
      'TRUTH OR SWIPE — THE BURN BOOK',
      `Round ${round} · ${deckIds.map(deckLabel).join(' + ')}`,
      '',
      ...awards.map((a) => {
        const who = a.winner ? `${a.winner.name} — ${a.value}` : a.value
        return `${a.title.toUpperCase()}: ${who}`
      }),
      '',
      ...[...players]
        .sort((a, b) => b.brave + b.daresCompleted - (a.brave + a.daresCompleted))
        .map((p) => `${p.name}: ${p.brave} brave, ${p.coward} coward, ${p.daresCompleted} dares`),
      '',
      `${totals.brave} answered · ${totals.coward} skipped · ${totals.dares} dares · ${totals.calls} call-outs`,
    ]
    return lines.join('\n')
  }, [awards, players, round, deckIds, totals])

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
      </header>

      <div className="mb-6 grid grid-cols-4 gap-2">
        {[
          { label: 'Brave', value: totals.brave, colour: 'text-neon-green' },
          { label: 'Coward', value: totals.coward, colour: 'text-neon-red' },
          { label: 'Dares', value: totals.dares, colour: 'text-neon-amber' },
          { label: 'Call outs', value: totals.calls, colour: 'text-neon-purple' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/8 bg-coal/60 py-3 text-center"
          >
            <p className={`text-xl font-black ${stat.colour}`}>{stat.value}</p>
            <p className="mt-0.5 text-[9px] tracking-widest text-white/30 uppercase">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 space-y-2.5">
        {awards.map((award, i) => {
          const Icon = award.icon
          return (
            <motion.div
              key={award.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-panel to-coal p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 ${award.accent}`}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] tracking-widest text-white/35 uppercase">
                    {award.title}
                  </p>
                  <p className={`mt-0.5 truncate text-lg font-black ${award.accent}`}>
                    {award.winner?.name ?? '—'}
                  </p>
                  <p className="text-[11px] text-white/45">{award.value}</p>
                  {award.runnersUp.length > 0 && (
                    <p className="mt-1 text-[10px] text-white/25">
                      joint with{' '}
                      {award.runnersUp
                        .map((r) => `${r.player.name} (${r.value})`)
                        .join(', ')}
                    </p>
                  )}
                </div>
                {award.winner && (
                  <Crown size={16} className="mt-1 shrink-0 text-neon-amber" />
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mb-6 rounded-3xl border border-white/8 bg-coal/60 p-3">
        <p className="mb-2 text-[10px] tracking-widest text-white/30 uppercase">
          Full scores
        </p>
        {[...players]
          .sort((a, b) => b.brave + b.daresCompleted - (a.brave + a.daresCompleted))
          .map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-white/5 py-2 last:border-0"
            >
              <span className="w-4 text-[11px] font-black text-white/25">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name}</span>
              <span className="text-[11px] font-bold text-neon-green">{p.brave}</span>
              <span className="text-[11px] font-bold text-neon-red">{p.coward}</span>
              <span className="text-[11px] font-bold text-neon-amber">
                {p.daresCompleted}
              </span>
            </div>
          ))}
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