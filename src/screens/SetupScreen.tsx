import { useState } from 'react'
import { motion } from 'motion/react'
import { AlertTriangle, ArrowRight, Flame, Plus, ShieldAlert, X } from 'lucide-react'
import { contentCounts, DECKS } from '../data/decks'
import { useGameStore } from '../store/gameStore'
import type { DeckId } from '../types'

const MAX_PLAYERS = 10

export function SetupScreen() {
  const startGame = useGameStore((s) => s.startGame)

  const [names, setNames] = useState<string[]>(['', ''])
  const [draft, setDraft] = useState('')
  const [deckIds, setDeckIds] = useState<DeckId[]>(['icebreakers', 'destroyers'])
  const [ageOk, setAgeOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cleaned = names.map((n) => n.trim()).filter(Boolean)
  const wantsSpicy = deckIds.includes('spicy')
  const spicyLocked = wantsSpicy && !ageOk
  const counts = contentCounts(deckIds)

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

  function toggleDeck(id: DeckId) {
    setDeckIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    )
    setError(null)
  }

  function begin() {
    if (cleaned.length < 2) {
      setError('Add at least two players.')
      return
    }
    if (deckIds.length === 0) {
      setError('Pick at least one deck.')
      return
    }
    if (spicyLocked) {
      setError('Confirm the 18+ deck to continue.')
      return
    }
    startGame(
      cleaned.map((name) => ({ name })),
      deckIds,
    )
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 pt-10 pb-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          Truth or <span className="text-neon-red">Swipe</span>
        </h1>
        <p className="mt-2 text-[11px] tracking-widest text-white/35 uppercase">
          Pass the phone. Swipe right to answer.
        </p>
      </header>

      {/* Players ------------------------------------------------------------ */}
      <section className="mb-7">
        <h2 className="mb-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">
          Players
        </h2>

        <div className="mb-3 space-y-2">
          {names.map((name, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-coal px-3 py-2.5"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neon-purple text-xs font-black text-void">
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
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-white/20"
              />
              {names.length > 2 && (
                <button
                  type="button"
                  aria-label={`Remove ${name || 'player'}`}
                  onClick={() => setNames(names.filter((_, idx) => idx !== i))}
                  className="text-white/30 active:text-neon-red"
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
              className="min-w-0 flex-1 rounded-xl border border-dashed border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-white/25 focus:border-neon-purple"
            />
            <button
              type="button"
              onClick={addName}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/8 active:scale-95"
            >
              <Plus size={18} />
            </button>
          </div>
        )}
      </section>

      {/* Decks -------------------------------------------------------------- */}
      <section className="mb-7">
        <h2 className="mb-3 text-[11px] font-bold tracking-widest text-white/40 uppercase">
          Decks <span className="normal-case">(pick any mix)</span>
        </h2>

        <div className="space-y-2">
          {DECKS.map((deck) => {
            const on = deckIds.includes(deck.id)
            return (
              <button
                key={deck.id}
                type="button"
                onClick={() => toggleDeck(deck.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                  on
                    ? 'border-neon-purple/60 bg-neon-purple/10'
                    : 'border-white/8 bg-coal/50'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                    on ? 'border-neon-purple bg-neon-purple' : 'border-white/20'
                  }`}
                >
                  {on && <span className="h-1.5 w-1.5 rounded-full bg-void" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    {deck.label}
                    {deck.minAge === 18 && <ShieldAlert size={12} className="text-neon-red" />}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-white/40">{deck.blurb}</span>
                </span>
              </button>
            )
          })}
        </div>

        {wantsSpicy && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            type="button"
            onClick={() => setAgeOk(!ageOk)}
            className={`mt-3 flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-[11px] font-bold tracking-wide ${
              ageOk
                ? 'border-neon-red/50 bg-neon-red/10 text-neon-red'
                : 'border-neon-red/30 bg-transparent text-white/60'
            }`}
          >
            <AlertTriangle size={14} className="shrink-0" />
            {ageOk
              ? 'Confirmed — everyone here is 18 or over.'
              : 'Everyone in this room is 18 or over.'}
          </motion.button>
        )}
      </section>

      {error && <p className="mb-3 text-center text-xs font-semibold text-neon-red">{error}</p>}

      <button
        type="button"
        onClick={begin}
        disabled={spicyLocked}
        className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-neon-green py-4 text-base font-black tracking-wide text-void active:scale-[0.98] disabled:opacity-30"
      >
        <Flame size={19} /> Start the game
        <ArrowRight size={19} />
      </button>

      {deckIds.length > 0 && (
        <p className="mt-3 text-center text-[10px] tracking-widest text-white/25 uppercase">
          {counts.questions} questions &middot; {counts.dares} dares &middot;{' '}
          {counts.callOuts} call-outs &middot; ends when cards run out
        </p>
      )}

      {names.length > 0 && cleaned.length > 0 && (
        <p className="mt-1 text-center text-[10px] text-white/20">
          {cleaned.length} in the room
        </p>
      )}
    </div>
  )
}