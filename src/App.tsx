import { useEffect } from 'react'
import { motion } from 'motion/react'
import { BurnBookScreen } from './screens/BurnBookScreen'
import { GameScreen } from './screens/GameScreen'
import { NextUpScreen } from './screens/NextUpScreen'
import { SetupScreen } from './screens/SetupScreen'
import { TruthOrDareScreen } from './screens/TruthOrDareScreen'
import { TurnIntroScreen } from './screens/TurnIntroScreen'
import { useGameStore } from './store/gameStore'
import { unlockAudio } from './lib/sound'

export default function App() {
  const phase = useGameStore((s) => s.phase)
  const gameMode = useGameStore((s) => s.gameMode)
  const classicStage = useGameStore((s) => s.classicStage)

  /**
   * Browsers only allow an AudioContext to start inside a gesture, and the first
   * cue of a game (`flip`) fires from an effect *after* the tap that caused it.
   * Unlocking on the very first pointerdown means that cue is never swallowed.
   * `once`, and it never makes a sound by itself.
   */
  useEffect(() => {
    const unlock = () => unlockAudio()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [])

  return (
    <div className="min-h-full">
      {/*
        Keyed on `phase` so each screen animates in on mount. Deliberately NOT
        wrapped in AnimatePresence: `mode="wait"` holds the old screen on screen
        until its exit finishes, which added ~220ms of dead time before the new
        screen appeared — a bad trade in a party game where the room is waiting.
        Enter-only is instant and cannot get stuck.

        A small spring pop, not a slide: the whole card language is physical, so
        screens should land like a card being dealt rather than fade like a web
        page. 12px of travel, damped hard enough that it never wobbles.
      */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: 12, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.7 }}
      >
        {phase === 'setup' && <SetupScreen />}
        {phase === 'playing' && gameMode === 'classic' && classicStage === 'intro' && <TurnIntroScreen />}
        {phase === 'playing' && gameMode === 'classic' && classicStage === 'choice' && <TruthOrDareScreen />}
        {phase === 'playing' && gameMode === 'classic' && (classicStage === 'playing' || classicStage === null) && <GameScreen />}
        {phase === 'playing' && gameMode === 'classic' && classicStage === 'nextup' && <NextUpScreen />}
        {phase === 'playing' && gameMode === 'free' && <GameScreen />}
        {phase === 'burnbook' && <BurnBookScreen />}
      </motion.div>
    </div>
  )
}
