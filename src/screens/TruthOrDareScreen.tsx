import { motion } from 'motion/react'
import { Lock } from 'lucide-react'
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

  if (gameMode !== 'classic') return null

  const streak = currentPlayer?.truthStreak ?? 0
  const dareForced = truthsLeft <= 0

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="panel flex flex-col items-center gap-5 p-6"
      >
        <div className="flex w-full items-center justify-between">
          <span className="chip">{currentPlayer?.name}</span>
          <span
            className={`chip ${
              dareForced ? 'bg-berry/15 text-berry-deep' : 'bg-tint text-muted'
            }`}
          >
            {dareForced ? 'Dare is mandatory' : `${truthsLeft} truth${truthsLeft === 1 ? '' : 's'} left`}
          </span>
        </div>

        <h1 className="text-center font-display text-[32px] leading-[1.05] font-bold tracking-[-0.01em] text-ink">
          Truth or Dare?
        </h1>

        {/* Truth-streak meter: 3 truths in a row forces a dare. Rounded pills —
            the last one turns berry when the dare is locked in. */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TRUTH_STREAK_LIMIT }).map((_, i) => (
            <span
              key={i}
              className={`h-2.5 w-12 rounded-full ${
                i < streak
                  ? dareForced && i === TRUTH_STREAK_LIMIT - 1
                    ? 'bg-berry'
                    : 'bg-mint'
                  : 'bg-line'
              }`}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={() => classicChooseTruth()}
            disabled={dareForced}
            className={`btn h-15 w-full text-[17px] ${
              dareForced ? 'btn-quiet' : 'btn-sky'
            }`}
          >
            {dareForced && <Lock size={15} />}
            TRUTH
          </button>
          <button
            type="button"
            onClick={() => classicChooseDare()}
            className="btn btn-sun h-15 w-full text-[17px]"
          >
            DARE
          </button>
        </div>

        <p className="text-center text-[12px] leading-snug font-medium text-muted">
          {dareForced
            ? 'Three truths in a row — the circle demands a dare.'
            : 'Pick either. Dares are always free — no penalty.'}
        </p>
      </motion.div>
    </div>
  )
}
