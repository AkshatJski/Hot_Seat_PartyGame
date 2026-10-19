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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex flex-col items-center gap-6 rounded-3xl border-2 border-ink bg-panel p-8 text-center shadow-pop-lg"
      >
        <div className="text-[11px] font-black tracking-widest text-muted uppercase">
          Classic Circle &middot; Round {round}
        </div>
        <h1 className="text-4xl leading-tight font-black">
          It's <span className={palette.text}>{currentPlayer.name}</span>'s turn
        </h1>
        <Commentator quip={quip} variant="toast" />
        <p className="text-sm text-muted">Hand the phone to them.</p>

        {wildcard && (
          <div className="w-full rounded-2xl border-2 border-neon-amber bg-[#3a2d0f] px-4 py-3 shadow-pop-sm">
            <div className="text-[10px] font-black tracking-widest text-neon-amber uppercase">
              Wildcard Round
            </div>
            <p className="mt-1 text-[13px] leading-snug text-bone">{wildcard}</p>
          </div>
        )}

        <button
          type="button"
          onClick={next}
          className="mt-2 rounded-2xl border-2 border-ink bg-neon-purple px-6 py-3 text-base font-black text-ink shadow-pop active:translate-y-[5px] active:shadow-none"
        >
          Start Turn →
        </button>
      </motion.div>
    </div>
  )
}
