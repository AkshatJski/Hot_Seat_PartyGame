import { useState } from 'react'
import { motion } from 'motion/react'
import { Flame, HeartHandshake, Plus, Users, X } from 'lucide-react'
import { playerPalette } from '../data/playerColors'
import { contentCounts } from '../data/decks'
import { useGameStore } from '../store/gameStore'
import type { Vibe } from '../types'

const MAX_PLAYERS = 10

/**
 * How long a game runs, in turns PER PLAYER.
 *
 * `null` is Endless: the queue reshuffles forever and the only ways out are the
 * End button or the Burn Book. The fixed options exist because the previous only
 * ending was "the whole deck is gone", which is 30 minutes into a night and
 * always arrives as a surprise.
 */
const LENGTHS: { value: number | null; label: string }[] = [
  { value: null, label: 'Endless' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
  { value: 8, label: '8' },
]

/**
 * THE VIBE PICKER.
 *
 * This replaced a Free Play / Classic Circle switch. It is the single most
 * important control on the screen, because it decides which of three completely
 * separate content libraries the whole night draws from - so it gets a full row
 * per option, a plain-language description, and its own colour instead of a
 * cramped segmented toggle.
 *
 * Class strings are written out in full rather than composed (`bg-${x}` does not
 * survive Tailwind's scanner).
 */
const VIBE_META: {
  value: Vibe
  label: string
  blurb: string
  Icon: typeof Users
  active: string
  dot: string
}[] = [
  {
    value: 'family',
    label: 'Family',
    blurb: 'Mum, dad, cousins. Nothing that needs explaining in a whisper.',
    Icon: HeartHandshake,
    active: 'border-mint bg-mint/10',
    dot: 'bg-mint text-white',
  },
  {
    value: 'friends',
    label: 'Friends',
    blurb: 'The class group, the office, the group chat. Roasty but safe.',
    Icon: Users,
    active: 'border-sky bg-sky/10',
    dot: 'bg-sky text-white',
  },
  {
    value: 'boys',
    label: 'Boys',
    blurb: '18+. No guardrails. Crude, profane, unhinged.',
    Icon: Flame,
    active: 'border-berry bg-berry/10',
    dot: 'bg-berry text-white',
  },
]

export function SetupScreen() {
  const startGame = useGameStore((s) => s.startGame)

  const [names, setNames] = useState<string[]>(['', ''])
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [vibe, setVibe] = useState<Vibe>('friends')
  const [turnsEach, setTurnsEach] = useState<number | null>(null)

  const cleaned = names.map((n) => n.trim()).filter(Boolean)
  const counts = contentCounts(vibe)
  const adult = vibe === 'boys'

  /**
   * A rough running time, because "5 turns each" means nothing to a table trying
   * to decide whether to start at 11pm. ~50s per turn covers a question, a dare
   * and the bickering in between.
   */
  const estimate =
    turnsEach !== null && cleaned.length >= 2
      ? `about ${Math.max(2, Math.round((turnsEach * cleaned.length * 50) / 60))} min`
      : null

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
    startGame(
      cleaned.map((name) => ({ name })),
      { vibe, roundsPerPlayer: turnsEach },
    )
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

      {/* Who is in the room ---------------------------------------------------
          Three shelves, not three difficulty settings: each one is a separate
          set of questions AND dares, so a family night cannot accidentally deal
          a boys card. */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-display text-[13px] font-semibold text-ink">Who&apos;s playing?</h2>
          <span className="chip">
            {counts.questions} Q · {counts.dares} D
          </span>
        </div>
        <div className="space-y-1.5">
          {VIBE_META.map((option) => {
            const selected = vibe === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setVibe(option.value)
                  setError(null)
                }}
                aria-pressed={selected}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-2.5 text-left transition-colors ${
                  selected ? option.active : 'border-line bg-tint/50 active:bg-tint'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${option.dot}`}
                >
                  <option.Icon size={17} strokeWidth={2.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[14px] font-semibold text-ink">
                    {option.label}
                  </span>
                  <span className="block text-[11.5px] leading-snug font-medium text-dim">
                    {option.blurb}
                  </span>
                </span>
                <span
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    selected ? 'border-ink bg-ink' : 'border-line'
                  }`}
                />
              </button>
            )
          })}
        </div>
        {adult ? (
          <p className="mt-2 rounded-xl bg-berry/12 px-3 py-2 text-[11.5px] leading-snug font-semibold text-berry-deep">
            18+ only. This shelf swears, drinks, and asks about your exes. If your mother is in the
            room, pick Family.
          </p>
        ) : (
          <p className="mt-2 pl-1 text-[11.5px] font-medium text-dim">
            {counts.callouts} Call Out punishments on this shelf. Only this shelf&apos;s cards are
            dealt.
          </p>
        )}
      </section>

      {/* How long -------------------------------------------------------------
          Turns PER PLAYER, not total: "5 turns each" with six players is 30
          turns. Endless shuffles the deck forever and stops only when someone
          presses End, which is stated plainly so it is not a surprise at 2am. */}
      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-display text-[13px] font-semibold text-ink">How long?</h2>
          <span className="chip">{estimate ?? `${cleaned.length || 0} playing`}</span>
        </div>
        <div className="flex gap-1 rounded-2xl bg-tint p-1">
          {LENGTHS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setTurnsEach(option.value)}
              className={`flex-1 rounded-xl py-2 font-display text-[13px] font-semibold transition-colors ${
                turnsEach === option.value
                  ? 'bg-coral text-white shadow-soft'
                  : 'text-muted active:text-ink'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="mt-2 pl-1 text-[11.5px] font-medium text-dim">
          {turnsEach === null
            ? 'Endless. The deck reshuffles instead of running out.'
            : `${turnsEach} turns each. The Burn Book opens when everyone is done.`}
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
        {adult ? 'Start the 18+ game' : 'Start the game'}
      </button>

      {cleaned.length > 0 && (
        <p className="mt-2.5 text-center font-display text-[11.5px] font-medium text-dim">
          {cleaned.length} in the room · {VIBE_META.find((v) => v.value === vibe)?.label} edition
        </p>
      )}
    </div>
  )
}
