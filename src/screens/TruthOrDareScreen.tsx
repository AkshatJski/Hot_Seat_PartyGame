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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-7 border border-hairline bg-panel p-7 shadow-pop-lg"
      >
        <div className="flex items-baseline justify-between">
          <span className="meta text-dim">{currentPlayer?.name}</span>
          <span className="meta text-dim">
            {dareForced ? 'Dare is mandatory' : `${truthsLeft} truth${truthsLeft === 1 ? '' : 's'} left`}
          </span>
        </div>

        <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
          Truth or Dare?
        </h1>

        {/* Truth-streak meter: 3 truths in a row forces a dare. Printed bars,
            not pills — the last one goes vermillion when the dare is forced. */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TRUTH_STREAK_LIMIT }).map((_, i) => (
            <span
              key={i}
              className={`h-[6px] flex-1 ${
                i < streak
                  ? dareForced && i === TRUTH_STREAK_LIMIT - 1
                    ? 'bg-accent'
                    : 'bg-sage'
                  : 'bg-hairline'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => classicChooseTruth()}
            disabled={dareForced}
            className={`flex h-14 items-center justify-center gap-2 border text-[15px] font-semibold transition-colors ${
              dareForced
                ? 'cursor-not-allowed border-hairline text-dim'
                : 'border-hairline text-ink active:bg-sheet'
            }`}
          >
            {dareForced && <Lock size={14} />}
            TRUTH
          </button>
          <button
            type="button"
            onClick={() => classicChooseDare()}
            className="flex h-14 items-center justify-center bg-ochre text-[15px] font-semibold text-stage transition-transform active:translate-y-[1px]"
          >
            DARE
          </button>
        </div>

        <p className="border-l border-hairline pl-3 text-[12.5px] leading-snug text-muted">
          {dareForced
            ? 'Three truths in a row — the circle demands a dare.'
            : 'Pick either. Dares are always free — no penalty.'}
        </p>
      </motion.div>
    </div>
  )
}
