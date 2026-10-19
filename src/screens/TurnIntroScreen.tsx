import { motion } from 'motion/react'
import { useGameStore, selectCurrentPlayer } from '../store/gameStore'

export function TurnIntroScreen() {
  const currentPlayer = useGameStore(selectCurrentPlayer)
  const gameMode = useGameStore((s) => s.gameMode)
  const beginClassicTurn = useGameStore((s) => s.beginClassicTurn)
  const wildcard = useGameStore((s) => s.wildcard)
  const round = useGameStore((s) => s.round)

  if (gameMode !== 'classic' || !currentPlayer) {
    return null
  }

  const next = () => {
    beginClassicTurn()
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
          Classic Circle · Round {round}
        </div>
        <h1 className="text-4xl font-black leading-tight">
          It's <span className="text-neon-purple">{currentPlayer.name}</span>'s turn
        </h1>
        <p className="text-sm text-white/60">Hand the phone to them.</p>

        {wildcard && (
          <div className="w-full rounded-2xl border border-neon-amber/30 bg-neon-amber/10 px-4 py-3">
            <div className="text-[10px] font-bold tracking-widest text-neon-amber uppercase">
              Wildcard Round
            </div>
            <p className="mt-1 text-[13px] leading-snug text-white/80">{wildcard}</p>
          </div>
        )}

        <button
          type="button"
          onClick={next}
          className="mt-2 rounded-full bg-neon-purple px-6 py-3 text-sm font-bold text-void shadow-neon-purple/40 shadow-lg active:scale-95"
        >
          Start Turn →
        </button>
      </motion.div>
    </div>
  )
}
