import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Flame, Plus, X } from 'lucide-react'
import { playerPalette } from '../data/playerColors'
import { useGameStore } from '../store/gameStore'

const MAX_PLAYERS = 10

export function SetupScreen() {
  const startGame = useGameStore((s) => s.startGame)

  const [names, setNames] = useState<string[]>(['', ''])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<'free' | 'classic'>('free')
  const roundsPerPlayer = null

  const cleaned = names.map((n) => n.trim()).filter(Boolean)

  function addName() {
    const value = draft.trim()
    if (!value) return
    if (names.length >= MAX_PLAYERS) return
    if (cleaned.some((n) => n.toLowerCase() === value.toLowerCase())) {
      setError('Someone with that name is already in.')
      return
    }
    setNames([...names, value])
    setDraft('')
    setError(null)
  }

  function begin() {
    if (cleaned.length < 2) {
      setError('Add at least two players.')
      return
    }
    startGame(cleaned.map((name) => ({ name })), { gameMode, roundsPerPlayer })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-10 pb-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Truth or <span className="text-neon-red">Swipe</span>
        </h1>
        <p className="mt-2 text-[11px] font-black tracking-widest text-dim uppercase">
          Pass the phone. Swipe right to answer.
        </p>
        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          A trash-talking host will be watching. Do not embarrass yourself.
        </p>
      </header>

      {/* Game Mode ----------------------------------------------------------- */}
      <section className="mb-6">
        <h2 className="mb-3 text-[11px] font-black tracking-widest text-muted uppercase">
          Game Mode
        </h2>
        <div className="flex gap-2 rounded-2xl border-2 border-ink bg-panel p-1.5 shadow-pop-sm">
          <button
            type="button"
            onClick={() => setGameMode('free')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-black transition ${gameMode === 'free' ? 'bg-neon-cyan text-ink' : 'text-dim'}`}
          >
            Free Play (Legacy)
          </button>
          <button
            type="button"
            onClick={() => setGameMode('classic')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-black transition ${gameMode === 'classic' ? 'bg-neon-purple text-ink' : 'text-dim'}`}
          >
            Classic Circle
          </button>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {gameMode === 'free' ? 'Pass & swipe as usual.' : 'Fixed turn order. Truth or Dare each turn.'}
        </p>
      </section>

      {/* Players ------------------------------------------------------------ */}
      <section className="mb-7">
        <h2 className="mb-3 text-[11px] font-black tracking-widest text-muted uppercase">
          Players
        </h2>

        <div className="mb-3 space-y-2">
          {names.map((name, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border-2 border-ink bg-panel px-3 py-2.5 shadow-pop-sm"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink text-xs font-black text-ink ${playerPalette(i).bg}`}
              >
                {(name || '?').slice(0, 1).toUpperCase()}
              </span>
              <input
                value={name}
                placeholder={`Player ${i + 1}`}
                maxLength={18}
                onChange={(e) => {
                  const next = [...names]
                  next[i] = e.target.value
                  setNames(next)
                  setError(null)
                }}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-dim"
              />
              {names.length > 2 && (
                <button
                  type="button"
                  aria-label={`Remove ${name || 'player'}`}
                  onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                  className="text-dim active:text-neon-red"
                >
                  <X size={15} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {names.length < MAX_PLAYERS && (
          <div className="flex gap-2">
            <input
              value={draft}
              placeholder="Add a name…"
              maxLength={18}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addName()
              }}
              className="min-w-0 flex-1 rounded-xl border-2 border-dashed border-hairline bg-panel px-3 py-2.5 text-sm outline-none placeholder:text-dim focus:border-neon-purple"
            />
            <button
              type="button"
              onClick={addName}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-neon-purple text-ink shadow-pop-sm active:translate-y-[3px] active:shadow-none"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </section>

      {error && <p className="mb-3 text-center text-xs font-black text-neon-red">{error}</p>}

      <button
        type="button"
        onClick={begin}
        className="mt-auto flex items-center justify-center gap-2 rounded-2xl border-2 border-ink bg-neon-green py-4 text-base font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none disabled:opacity-30"
      >
        <Flame size={19} /> Start the game
        <ArrowRight size={19} />
      </button>

      {names.length > 0 && cleaned.length > 0 && (
        <p className="mt-1 text-center text-[10px] text-dim">
          {cleaned.length} in the room
        </p>
      )}
    </div>
  )
}
