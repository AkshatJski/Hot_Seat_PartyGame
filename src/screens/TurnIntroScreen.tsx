import { motion } from 'motion/react'
import { Commentator } from '../components/Commentator'
import { reactionFor } from '../data/commentary'
import { useGameStore, selectCurrentPlayer } from '../store/gameStore'

export function TurnIntroScreen() {
  const currentPlayer = useGameStore(selectCurrentPlayer)
  const gameMode = useGameStore((s) => s.gameMode)
  const beginClassicTurn = useGameStore((s) => s.beginClassicTurn)
  const wildcard = useGameStore((s) => s.wildcard)
  const round = useGameStore((s) => s.round)
  const turnIndex = useGameStore((s) => s.turnIndex)

  if (gameMode !== 'classic' || !currentPlayer) {
    return null
  }

  const quip = reactionFor('roundStart', `${turnIndex}:${round}`)

  const next = () => {
    beginClassicTurn()
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col gap-7 border border-hairline bg-panel p-7 shadow-pop-lg"
      >
        <div className="flex items-baseline justify-between">
          <span className="meta text-dim">Classic Circle</span>
          <span className="meta text-dim">round {round}</span>
        </div>

        <div>
          <h1 className="text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] text-ink">
            {currentPlayer.name}
            <span className="block text-[28px] text-muted">&rsquo;s turn</span>
          </h1>
          <p className="mt-3 text-[13px] text-muted">Hand the phone to them.</p>
        </div>

        <Commentator quip={quip} />

        {wildcard && (
          <div className="border-l-2 border-ochre pl-3">
            <p className="meta text-ochre">Wildcard Round</p>
            <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{wildcard}</p>
          </div>
        )}

        <button
          type="button"
          onClick={next}
          className="flex h-12 items-center justify-center bg-ink text-[14px] font-semibold text-stage transition-transform active:translate-y-[1px]"
        >
          Start Turn &rarr;
        </button>
      </motion.div>
    </div>
  )
}
