import { motion } from 'motion/react'
import { Commentator } from '../components/Commentator'
import { reactionFor } from '../data/commentary'
import { playerPalette } from '../data/playerColors'
import { useGameStore } from '../store/gameStore'

export function NextUpScreen() {
  const gameMode = useGameStore((s) => s.gameMode)
  const turnIndex = useGameStore((s) => s.turnIndex)
  const players = useGameStore((s) => s.players)
  const round = useGameStore((s) => s.round)
  const next = () => {
    useGameStore.getState().classicNextUp()
  }

  if (gameMode !== 'classic') return null

  // advanceTurn() already rotated turnIndex to the next player, so the "next
  // up" player is simply the one now at turnIndex.
  const nextPlayer = players[turnIndex]
  const palette = playerPalette(turnIndex)
  const quip = reactionFor('pass', `${turnIndex}:${round}`)

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 rounded-3xl border border-white/8 bg-coal/80 p-8 text-center backdrop-blur"
      >
        <div className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
          Turn complete
        </div>
        <h1 className="text-3xl font-black leading-tight">
          Next up: <span className={palette.text}>{nextPlayer?.name || 'Next'}</span>
        </h1>
        <Commentator quip={quip} variant="toast" />
        <button
          type="button"
          className="mt-2 rounded-full bg-neon-purple px-6 py-3 text-sm font-bold text-void shadow-neon-purple/40 shadow-lg active:scale-95"
          onClick={next}
        >
          Next →
        </button>
      </motion.div>
    </div>
  )
}
