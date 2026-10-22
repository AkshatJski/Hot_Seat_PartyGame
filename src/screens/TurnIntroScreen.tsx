import { motion } from 'motion/react'
import { Commentator } from '../components/Commentator'
import { reactionFor } from '../data/commentary'
import { playerPalette } from '../data/playerColors'
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

  const palette = playerPalette(turnIndex)
  const quip = reactionFor('roundStart', `${turnIndex}:${round}`)

  const next = () => {
    beginClassicTurn()
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="panel flex flex-col items-center gap-5 p-6 text-center"
      >
        <span className="chip">
          Classic Circle &middot; Round {round}
        </span>

        <span
          className={`flex h-16 w-16 items-center justify-center rounded-full font-display text-[26px] font-bold ${palette.bg} ${palette.text}`}
        >
          {currentPlayer.name.slice(0, 1).toUpperCase()}
        </span>

        <h1 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.01em] text-ink">
          {currentPlayer.name}
          <span className="block text-[24px] font-medium text-muted">&rsquo;s turn</span>
        </h1>

        <p className="-mt-2 text-[12.5px] font-medium text-muted">Hand the phone to them.</p>

        <Commentator quip={quip} />

        {wildcard && (
          <div className="w-full rounded-2xl bg-sun/20 px-3.5 py-3 text-left">
            <span className="chip bg-sun text-[#4a3200]">Wildcard Round</span>
            <p className="mt-1.5 text-[12.5px] leading-snug font-medium text-muted">{wildcard}</p>
          </div>
        )}

        <button
          type="button"
          onClick={next}
          className="btn btn-coral h-13 w-full text-[16px]"
        >
          Start Turn &rarr;
        </button>
      </motion.div>
    </div>
  )
}
