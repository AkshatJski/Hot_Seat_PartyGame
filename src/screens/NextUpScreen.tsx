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
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="panel flex flex-col items-center gap-5 p-6 text-center"
      >
        <span className="chip">Turn complete</span>

        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full font-display text-[26px] font-bold ${palette.bg} ${palette.text}`}
        >
          {(nextPlayer?.name || '?').slice(0, 1).toUpperCase()}
        </span>

        <div>
          <p className="text-[12px] font-semibold text-muted">Next up</p>
          <h1 className="mt-0.5 font-display text-[32px] leading-[1.05] font-bold tracking-[-0.01em] text-ink">
            {nextPlayer?.name || 'Next'}
          </h1>
        </div>

        <Commentator quip={quip} />

        <button type="button" onClick={next} className="btn btn-coral h-13 w-full text-[16px]">
          Next &rarr;
        </button>
      </motion.div>
    </div>
  )
}
