import { motion } from 'motion/react'
import { BurnBookScreen } from './screens/BurnBookScreen'
import { GameScreen } from './screens/GameScreen'
import { SetupScreen } from './screens/SetupScreen'
import { useGameStore } from './store/gameStore'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  return (
    <div className="min-h-full">
      {/*
        Keyed on `phase` so each screen animates in on mount. Deliberately NOT
        wrapped in AnimatePresence: `mode="wait"` holds the old screen on screen
        until its exit finishes, which added ~220ms of dead time before the new
        screen appeared — a bad trade in a party game where the room is waiting.
        Enter-only is instant and cannot get stuck.
      */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {phase === 'setup' && <SetupScreen />}
        {phase === 'playing' && <GameScreen />}
        {phase === 'burnbook' && <BurnBookScreen />}
      </motion.div>
    </div>
  )
}