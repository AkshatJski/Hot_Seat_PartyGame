import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from 'motion/react'
import { Eye, Flame, ShieldAlert, Zap } from 'lucide-react'
import type { Dare, Intensity, Question, SwipeDirection } from '../types'

/** Past this horizontal offset the gesture counts as a real swipe. */
export const SWIPE_DISTANCE = 110
/** ...but a fast flick commits even if it never travelled this far. */
export const SWIPE_VELOCITY = 550
/** Where an answered card gets thrown so it is safely off-screen. */
const FLY_OFF = 720

function buzz(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern)
  }
}

function IntensityPips({ level }: { level: Intensity }) {
  return (
    <span className="flex items-center gap-[3px]">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-1.5 rounded-full ${
            n <= level ? 'bg-neon-amber' : 'bg-white/20'
          }`}
        />
      ))}
    </span>
  )
}

/** Lets a parent (buttons, keyboard, future game loop) force a swipe without a drag. */
export interface SwipeSignal {
  direction: SwipeDirection
  id: number
}

interface SwipeCardProps {
  /** `null` renders the Called Out notice instead of a question. */
  question: Question | null
  playerName: string
  /** Must be supplied before `flipped` flips to true, or the back face renders empty. */
  dare: Dare | null
  /** Controlled by the caller, NOT by the card. Keeps dare selection in the store. */
  flipped: boolean
  signal?: SwipeSignal | null
  onSwipe: (direction: SwipeDirection) => void
  onFlipComplete: () => void
}

export function SwipeCard({
  question,
  playerName,
  dare,
  flipped,
  signal,
  onSwipe,
  onFlipComplete,
}: SwipeCardProps) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  // Seeded from `flipped` so a card that mounts already-revealed (the Call Out
  // dare card) shows its back face on the very first paint — no front-face flash.
  const flip = useMotionValue(flipped ? 1 : 0)

  const [locked, setLocked] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const flipStarted = useRef(flipped)
  const lockedRef = useRef(false)
  const lastSignal = useRef(0)

  const rotateY = useTransform(flip, [0, 1], [0, 180])
  const answerStamp = useTransform(x, [30, SWIPE_DISTANCE], [0, 1])
  const dareStamp = useTransform(x, [-30, -SWIPE_DISTANCE], [0, 1])
  const answerTilt = useTransform(x, [0, SWIPE_DISTANCE], [0, 14])
  const dareTilt = useTransform(x, [-SWIPE_DISTANCE, 0], [-14, 0])

  // No reset effect on purpose: the parent remounts the card via `key` whenever
  // a new question is dealt, so every instance starts with clean state anyway.

  useEffect(() => {
    if (!flipped || flipStarted.current) return
    flipStarted.current = true
    buzz([10, 30, 10])
    void animate(flip, 1, {
      type: 'spring',
      stiffness: 150,
      damping: 17,
    }).then(() => onFlipComplete())
  }, [flipped, flip, onFlipComplete])

  useEffect(() => {
    if (!signal || signal.id === lastSignal.current || lockedRef.current) return
    lastSignal.current = signal.id
    const offsetX = signal.direction === 'right' ? SWIPE_DISTANCE : -SWIPE_DISTANCE
    const synthetic = {
      offset: { x: offsetX, y: 0 },
      velocity: { x: 0, y: 0 },
    } as PanInfo
    if (signal.direction === 'right') void commitAnswer(synthetic)
    else void commitSkip()
    // commitAnswer/commitSkip are stable enough for a signal-driven side effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal])

  function handleDragEnd(_event: unknown, info: PanInfo) {
    if (lockedRef.current) return
    const past = info.offset.x
    const flung = info.velocity.x
    if (past >= SWIPE_DISTANCE || flung >= SWIPE_VELOCITY) {
      void commitAnswer(info)
    } else if (past <= -SWIPE_DISTANCE || flung <= -SWIPE_VELOCITY) {
      void commitSkip()
    }
    // Otherwise: do nothing. Framer Motion's dragMomentum springs x back to 0
    // on its own. Snapping back is the absence of an action, not an action.
  }

  async function commitAnswer(info: PanInfo) {
    lockedRef.current = true
    setLocked(true)
    setCelebrating(true)
    buzz([14, 26, 20])
    await Promise.all([
      animate(x, FLY_OFF, { type: 'spring', stiffness: 230, damping: 24 }),
      animate(y, info.offset.y + info.velocity.y * 0.15, {
        type: 'spring',
        stiffness: 190,
        damping: 26,
      }),
      animate(rotate, 18, { type: 'spring', stiffness: 170, damping: 20 }),
    ])
    onSwipe('right')
  }

  async function commitSkip() {
    lockedRef.current = true
    setLocked(true)
    buzz(34)
    await Promise.all([
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 24 }),
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 24 }),
      animate(rotate, 0, { type: 'spring', stiffness: 300, damping: 24 }),
    ])
    onSwipe('left')
  }

  const blurred = Boolean(question?.sensitive) && !revealed
  const cardKey = question?.id ?? 'callout'

  return (
    <div className="relative mx-auto w-[min(88vw,380px)]">
      <div className="absolute inset-0 translate-y-3 rounded-[32px] bg-neon-purple/10 blur-2xl" />

      <motion.div
        drag={locked || flipped ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        dragMomentum={false}
        dragDirectionLock
        dragTransition={{ power: 0, timeConstant: 900 }}
        onDragEnd={handleDragEnd}
        style={{ x, y, rotate, rotateY, transformPerspective: 1400 }}
        data-card={cardKey}
        className="relative h-[min(62vh,520px)] w-full touch-pan-y rounded-[28px] border border-white/10 bg-coal shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
      >
        {/* FRONT — the question, or a Called Out notice when there is none */}
        <div className="absolute inset-0 flex flex-col rounded-[28px] bg-linear-to-b from-slate-panel to-coal p-6 [backface-visibility:hidden]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5 text-xs font-semibold tracking-wide">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neon-purple text-[10px] font-black text-void">
                {playerName.slice(0, 1).toUpperCase()}
              </span>
              {playerName}
            </span>
            <span className="flex items-center gap-2 text-[11px] text-white/45">
              <IntensityPips level={question?.intensity ?? 1} />
            </span>
          </div>

          {question?.sensitive && (
            <span className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-neon-red/40 bg-neon-red/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-neon-red uppercase">
              <ShieldAlert size={11} /> 18+
            </span>
          )}

          <button
            type="button"
            onClick={() => setRevealed(true)}
            disabled={!blurred}
            className="relative mt-4 flex-1 text-left"
          >
            <p
              className={`text-[26px] leading-[1.25] font-semibold text-balance text-bone transition-[filter,opacity] duration-300 ${
                blurred ? 'blur-[7px] opacity-60 select-none' : ''
              }`}
            >
              {question?.text ?? 'Called out. Brave does not protect you here.'}
            </p>
            {blurred && (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Eye size={22} className="text-neon-red" />
                <span className="rounded-full bg-neon-red px-4 py-1.5 text-[11px] font-black tracking-widest text-void uppercase">
                  Tap to reveal
                </span>
              </span>
            )}
          </button>

          <div className="mt-4 flex items-center justify-between text-[11px] font-bold tracking-widest uppercase">
            <span className="flex items-center gap-1.5 text-neon-red/80">
              <Zap size={12} /> Dare
            </span>
            <span className="text-white/25">or</span>
            <span className="flex items-center gap-1.5 text-neon-green/80">
              Answer <Zap size={12} />
            </span>
          </div>

          {/* Swipe stamps, driven straight off the x motion value */}
          <motion.div
            style={{ opacity: dareStamp, rotate: dareTilt }}
            className="pointer-events-none absolute top-8 right-6 rounded-xl border-[3px] border-neon-red px-3 py-1 text-lg font-black tracking-widest text-neon-red uppercase"
          >
            Dare
          </motion.div>
          <motion.div
            style={{ opacity: answerStamp, rotate: answerTilt }}
            className="pointer-events-none absolute top-8 left-6 rounded-xl border-[3px] border-neon-green px-3 py-1 text-lg font-black tracking-widest text-neon-green uppercase"
          >
            Answer
          </motion.div>

          {celebrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0 rounded-[28px] bg-neon-green/25"
            />
          )}
        </div>

        {/* BACK — the dare, revealed by the 3D flip */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-[28px] bg-linear-to-b from-neon-red/25 to-coal p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-neon-red px-3 py-1.5 text-[11px] font-black tracking-widest text-void uppercase">
              <Flame size={13} /> Dare
            </span>
            <span className="ml-3 inline-flex items-center gap-2 align-middle">
              <IntensityPips level={dare?.intensity ?? 1} />
            </span>
          </div>

          <p className="text-[26px] leading-[1.25] font-semibold text-balance text-bone">
            {dare?.text ?? 'No dare loaded.'}
          </p>

          <span className="text-[11px] font-bold tracking-widest text-white/40 uppercase">
            {playerName} &middot; do it, then hit done
          </span>
        </div>
      </motion.div>
    </div>
  )
}