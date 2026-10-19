import { motion } from 'motion/react'
import { Lock } from 'lucide-react'
import { playerPalette } from '../data/playerColors'
import {
  TRUTH_STREAK_LIMIT,
  selectCurrentPlayer,
  selectTruthsLeft,
  useGameStore,
} from '../store/gameStore'

export function TruthOrDareScreen() {
  const currentPlayer = useGameStore(selectCurrentPlayer)
  const gameMode = useGameStore((s) => s.gameMode)
  const classicChooseTruth = useGameStore((s) => s.classicChooseTruth)
  const classicChooseDare = useGameStore((s) => s.classicChooseDare)
  const truthsLeft = useGameStore(selectTruthsLeft)
  const turnIndex = useGameStore((s) => s.turnIndex)

  if (gameMode !== 'classic') return null

  const streak = currentPlayer?.truthStreak ?? 0
  const dareForced = truthsLeft <= 0
  const palette = playerPalette(turnIndex)

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-white/8 bg-coal/80 p-8 text-center backdrop-blur"
      >
        <div className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
          <span className={palette.text}>{currentPlayer?.name}</span>'s Turn
        </div>
        <h1 className="text-4xl font-black">Truth or Dare?</h1>

        {/* Truth-streak meter: 3 truths in a row forces a dare. */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest text-white/35 uppercase">
            {dareForced ? 'Dare is mandatory' : `${truthsLeft} truth${truthsLeft === 1 ? '' : 's'} left`}
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: TRUTH_STREAK_LIMIT }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-8 rounded-full transition ${
                  i < streak
                    ? dareForced && i === TRUTH_STREAK_LIMIT - 1
                      ? 'bg-neon-red'
                      : 'bg-neon-green'
                    : 'bg-white/12'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={dareForced}
            onClick={() => classicChooseTruth()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold active:scale-95 ${
              dareForced
                ? 'cursor-not-allowed border border-white/10 bg-white/5 text-white/30'
                : 'bg-neon-green text-void shadow-neon-green/40 shadow-lg'
            }`}
          >
            {dareForced && <Lock size={16} />}
            TRUTH
          </button>
          <button
            type="button"
            onClick={() => classicChooseDare()}
            className="flex-1 rounded-full bg-neon-red px-6 py-3 text-sm font-bold text-bone shadow-neon-red/40 shadow-lg active:scale-95"
          >
            DARE
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-white/40">
          {dareForced
            ? 'Three truths in a row — the circle demands a dare.'
            : 'Pick either. Dares are always free — no penalty.'}
        </p>
      </motion.div>
    </div>
  )
}
