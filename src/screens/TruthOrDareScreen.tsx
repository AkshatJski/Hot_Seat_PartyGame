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
        className="flex flex-col items-center gap-6 rounded-3xl border-2 border-ink bg-panel p-8 text-center shadow-pop-lg"
      >
        <div className="text-[11px] font-black tracking-widest text-muted uppercase">
          <span className={palette.text}>{currentPlayer?.name}</span>'s Turn
        </div>
        <h1 className="text-4xl font-black">Truth or Dare?</h1>

        {/* Truth-streak meter: 3 truths in a row forces a dare. */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-black tracking-widest text-muted uppercase">
            {dareForced ? 'Dare is mandatory' : `${truthsLeft} truth${truthsLeft === 1 ? '' : 's'} left`}
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: TRUTH_STREAK_LIMIT }).map((_, i) => (
              <span
                key={i}
                className={`h-3 w-9 rounded-sm border-2 border-ink ${
                  i < streak
                    ? dareForced && i === TRUTH_STREAK_LIMIT - 1
                      ? 'bg-neon-red'
                      : 'bg-neon-green'
                    : 'bg-hairline'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => classicChooseTruth()}
            disabled={dareForced}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-ink py-4 text-base font-black tracking-wide ${
              dareForced
                ? 'bg-coal text-dim'
                : 'bg-neon-green text-ink shadow-pop active:translate-y-[5px] active:shadow-none'
            }`}
          >
            {dareForced && <Lock size={16} />}
            TRUTH
          </button>
          <button
            type="button"
            onClick={() => classicChooseDare()}
            className="flex-1 rounded-2xl border-2 border-ink bg-neon-red py-4 text-base font-black tracking-wide text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
          >
            DARE
          </button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted">
          {dareForced
            ? 'Three truths in a row — the circle demands a dare.'
            : 'Pick either. Dares are always free — no penalty.'}
        </p>
      </motion.div>
    </div>
  )
}
