import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, X } from 'lucide-react'
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
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-9 pb-7">
      <header className="mb-6 text-center">
        <h1 className="font-display leading-[0.92] font-bold tracking-[-0.02em]">
          <span className="block text-[20px] font-medium tracking-normal text-muted">Truth or</span>
          <span className="block text-[46px] text-coral">Swipe</span>
        </h1>
        <p className="mt-2.5 text-[12.5px] leading-snug font-medium text-muted">
          Pass the phone. Swipe right to answer.
          <br />
          A trash-talking host will be watching. Do not embarrass yourself.
        </p>
      </header>

      {/* Game Mode -----------------------------------------------------------
          A segmented switch. The selected side is a filled coral pill, so the
          choice is legible from across a table. */}
      <section className="mb-5">
        <div className="flex gap-1 rounded-2xl bg-tint p-1">
          <button
            type="button"
            onClick={() => setGameMode('free')}
            className={`flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors ${
              gameMode === 'free' ? 'bg-coral text-white shadow-soft' : 'text-muted active:text-ink'
            }`}
          >
            Free Play
          </button>
          <button
            type="button"
            onClick={() => setGameMode('classic')}
            className={`flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors ${
              gameMode === 'classic' ? 'bg-coral text-white shadow-soft' : 'text-muted active:text-ink'
            }`}
          >
            Classic Circle
          </button>
        </div>
        <p className="mt-2 pl-1 text-[11.5px] font-medium text-dim">
          {gameMode === 'free' ? 'Pass & swipe as usual.' : 'Fixed turn order. Truth or Dare each turn.'}
        </p>
      </section>

      {/* Players --------------------------------------------------------------
          The lobby. One white panel holding the whole list, so it reads as a
          single object rather than a stack of rows. */}
      <section className="mb-5">
        <div className="panel p-3.5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold text-ink">Players</h2>
            <span className="chip">
              {cleaned.length} / {MAX_PLAYERS}
            </span>
          </div>

          <div className="space-y-1.5">
            {names.map((name, i) => {
              const palette = playerPalette(i)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 rounded-xl bg-tint/70 px-2.5 py-1.5"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-[13px] font-bold ${palette.bg} ${palette.text}`}
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
                    className="min-w-0 flex-1 bg-transparent font-display text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-dim"
                  />
                  {names.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Remove ${name || 'player'}`}
                      onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                      className="shrink-0 rounded-full p-1.5 text-dim active:bg-berry/15 active:text-berry-deep"
                    >
                      <X size={14} />
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

          {names.length < MAX_PLAYERS && (
            <div className="mt-2 flex items-center gap-2 rounded-xl border-2 border-dashed border-line px-2.5 py-1.5">
              <input
                value={draft}
                placeholder="Add a name…"
                maxLength={18}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addName()
                }}
                className="min-w-0 flex-1 bg-transparent font-display text-[15px] font-medium text-ink outline-none placeholder:font-normal placeholder:text-dim"
              />
              <button
                type="button"
                onClick={addName}
                aria-label="Add player"
                className="btn btn-sun h-8 w-8 shrink-0 rounded-xl p-0"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </section>

      {error && (
        <p className="mb-2.5 rounded-xl bg-berry/12 px-3 py-2 text-center text-[12.5px] font-semibold text-berry-deep">
          {error}
        </p>
      )}

      <button type="button" onClick={begin} className="btn btn-coral mt-auto h-14 w-full text-[17px]">
        Start the game
      </button>

      {cleaned.length > 0 && (
        <p className="mt-2.5 text-center font-display text-[11.5px] font-medium text-dim">
          {cleaned.length} in the room
        </p>
      )}
    </div>
  )
}
