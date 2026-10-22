import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, X } from 'lucide-react'
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
    // Rows are free-text inputs, so names can be duplicated by typing the same
    // thing twice. `addName` guards its own path; this guards the Start button.
    const lowered = cleaned.map((n) => n.toLowerCase())
    if (new Set(lowered).size !== lowered.length) {
      setError('Two players have the same name.')
      return
    }
    startGame(cleaned.map((name) => ({ name })), { gameMode, roundsPerPlayer })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-10 pb-8">
      <header className="mb-9">
        <div className="mb-4 flex items-baseline justify-between">
          <span className="meta text-dim">hot seat</span>
          <span className="meta text-dim">party edition</span>
        </div>

        <h1 className="text-[40px] leading-[1.02] font-semibold tracking-[-0.03em] text-ink">
          Truth or Swipe
        </h1>

        <div className="mt-4 h-px w-full bg-hairline" />

        <p className="mt-4 text-[13px] leading-snug text-muted">
          Pass the phone. Swipe right to answer.
          <br />A trash-talking host will be watching. Do not embarrass yourself.
        </p>
      </header>

      {/* Game Mode -----------------------------------------------------------
          Two words in a hairline box. The selected one is inverted, like a
          circled option on a paper form — not a coloured pill. */}
      <section className="mb-7">
        <h2 className="meta mb-2.5 text-dim">Game Mode</h2>
        <div className="flex border border-hairline p-1">
          <button
            type="button"
            onClick={() => setGameMode('free')}
            className={`flex-1 px-3 py-2 text-[13px] font-semibold transition-colors ${
              gameMode === 'free' ? 'bg-ink text-stage' : 'text-dim active:text-ink'
            }`}
          >
            Free Play (Legacy)
          </button>
          <button
            type="button"
            onClick={() => setGameMode('classic')}
            className={`flex-1 px-3 py-2 text-[13px] font-semibold transition-colors ${
              gameMode === 'classic' ? 'bg-ink text-stage' : 'text-dim active:text-ink'
            }`}
          >
            Classic Circle
          </button>
        </div>
        <p className="mt-2 text-[12px] leading-snug text-muted">
          {gameMode === 'free' ? 'Pass & swipe as usual.' : 'Fixed turn order. Truth or Dare each turn.'}
        </p>
      </section>

      {/* Players --------------------------------------------------------------
          A sign-up sheet: numbered lines, not a stack of coloured avatar cards. */}
      <section className="mb-7">
        <h2 className="meta mb-2.5 text-dim">Players</h2>

        <div className="border-t border-hairline">
          {names.map((name, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 border-b border-hairline py-2.5"
            >
              <span className="meta w-5 shrink-0 text-dim">{String(i + 1).padStart(2, '0')}</span>
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
                className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-dim"
              />
              {names.length > 2 && (
                <button
                  type="button"
                  aria-label={`Remove ${name || 'player'}`}
                  onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                  className="shrink-0 p-1 text-dim active:text-accent"
                >
                  <X size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>

        {names.length < MAX_PLAYERS && (
          <div className="mt-3 flex items-center gap-3 border-b border-hairline pb-2.5">
            <span className="meta w-5 shrink-0 text-dim">+</span>
            <input
              value={draft}
              placeholder="Add a name…"
              maxLength={18}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addName()
              }}
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-dim"
            />
            <button
              type="button"
              onClick={addName}
              aria-label="Add player"
              className="shrink-0 p-1 text-dim active:text-ink"
            >
              <Plus size={15} />
            </button>
          </div>
        )}
      </section>

      {error && <p className="mb-3 text-[12px] font-medium text-accent">{error}</p>}

      <button
        type="button"
        onClick={begin}
        className="mt-auto flex h-14 items-center justify-center bg-ink text-[15px] font-semibold text-stage transition-transform active:translate-y-[1px] disabled:opacity-30"
      >
        Start the game
      </button>

      {cleaned.length > 0 && (
        <p className="mt-2 text-center font-mono text-[10px] text-dim">
          {cleaned.length} in the room
        </p>
      )}
    </div>
  )
}
