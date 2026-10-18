import { motion } from 'motion/react'
import { useGameStore, selectCurrentPlayer } from '../store/gameStore'

export function TruthOrDareScreen() {
  const currentPlayer = useGameStore(selectCurrentPlayer)
  const gameMode = useGameStore((s) => s.gameMode)

  if (gameMode !== 'classic') return null

  const classicChooseTruth = useGameStore((s) => s.classicChooseTruth)
  const chooseTruth = () => {
    classicChooseTruth()
  }

  const classicRefuseTruth = useGameStore((s) => s.classicRefuseTruth)
  const chooseDare = () => {
    classicRefuseTruth()
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-white/8 bg-coal/80 p-8 text-center backdrop-blur"
      >
        <div className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
          {currentPlayer?.name}'s Turn
        </div>
        <h1 className="text-4xl font-black">Truth or Dare?</h1>
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => chooseTruth()}
            className="flex-1 rounded-full bg-neon-green px-6 py-3 text-sm font-bold text-void shadow-neon-green/40 shadow-lg active:scale-95"
          >
            TRUTH
          </button>
          <button
            type="button"
            onClick={() => chooseDare()}
            className="flex-1 rounded-full bg-neon-red px-6 py-3 text-sm font-bold text-bone shadow-neon-red/40 shadow-lg active:scale-95"
          >
            DARE
          </button>
        </div>
      </motion.div>
    </div>
  )
}
