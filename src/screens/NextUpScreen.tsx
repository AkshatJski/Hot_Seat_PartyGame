import { motion } from 'motion/react'
import { Commentator } from '../components/Commentator'
import { reactionFor } from '../data/commentary'
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
  const quip = reactionFor('pass', `${turnIndex}:${round}`)

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-7 border border-hairline bg-panel p-7 shadow-pop-lg"
      >
        <div className="flex items-baseline justify-between">
          <span className="meta text-dim">Turn complete</span>
          <span className="meta text-dim">round {round}</span>
        </div>

        <div>
          <p className="meta text-dim">Next up</p>
          <h1 className="mt-2 text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
            {nextPlayer?.name || 'Next'}
          </h1>
        </div>

        <Commentator quip={quip} />

        <button
          type="button"
          className="flex h-12 items-center justify-center bg-ink text-[14px] font-semibold text-stage transition-transform active:translate-y-[1px]"
          onClick={next}
        >
          Next &rarr;
        </button>
      </motion.div>
    </div>
  )
}
