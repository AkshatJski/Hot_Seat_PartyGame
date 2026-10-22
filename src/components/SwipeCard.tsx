import { useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform, type PanInfo } from 'motion/react'
import { quipForCard } from '../data/commentary'
import { Commentator } from './Commentator'
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

/** Three rounded bars. Sun because intensity belongs to the dare side. */
function IntensityPips({ level }: { level: Intensity }) {
  return (
    <span className="flex items-center gap-[3px]" aria-label={`intensity ${level} of 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-[6px] w-[10px] rounded-full ${n <= level ? 'bg-sun' : 'bg-line'}`}
        />
      ))}
    </span>
  )
}

/** Lets a parent (keyboard, future game loop) force a swipe without a drag. */
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
  /** Printed card number, like a real deck. `n` is 1-based. */
  cardNumber?: { n: number; total: number } | null
  onSwipe: (direction: SwipeDirection) => void
  onFlipComplete: () => void
}

export function SwipeCard({
  question,
  playerName,
  dare,
  flipped,
  signal,
  cardNumber,
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
  const flipStarted = useRef(flipped)
  const lockedRef = useRef(false)
  const lastSignal = useRef(0)

  const rotateY = useTransform(flip, [0, 1], [0, 180])
  const answerStamp = useTransform(x, [30, SWIPE_DISTANCE], [0, 1])
  const dareStamp = useTransform(x, [-30, -SWIPE_DISTANCE], [0, 1])
  const answerTilt = useTransform(x, [0, SWIPE_DISTANCE], [0, 7])
  const dareTilt = useTransform(x, [-SWIPE_DISTANCE, 0], [-7, 0])

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

  const cardKey = question?.id ?? 'callout'

  // The host's card quip hangs off the question's id, so it is stable for the
  // life of the card and never re-rolls under the player's thumb.
  const quip = question ? quipForCard(question.id) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      // The panel shadow lives on the wrapper, not the card: the card sets
      // preserve-3d, and keeping its box free of extra paint work avoids any
      // browser that flattens a 3D context when the element gets a shadow.
      className="relative mx-auto w-[min(88vw,380px)] shadow-card"
    >
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
        // transform-3d (preserve-3d) is REQUIRED, not decorative. Without a 3D
        // rendering context the two faces get flattened into the parent's plane:
        // backface-visibility stops working, and the back face's pre-mirrored
        // rotateY(180deg) renders as literal reversed text on top of the front.
        // Also note nothing on this element may set overflow:hidden — that
        // flattens the context again and re-breaks the flip.
        className="relative h-[min(62vh,520px)] w-full touch-pan-y rounded-[28px] bg-panel transform-3d"
      >
        {/* FRONT — the question, or a Called Out notice when there is none. */}
        <div className="absolute inset-0 flex flex-col rounded-[28px] bg-panel p-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
          {/* Header: deck number left, player + intensity right. */}
          <div className="flex items-center justify-between gap-2">
            <span className="chip">
              {cardNumber ? `${cardNumber.n} / ${cardNumber.total}` : 'call out'}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-display text-[12.5px] font-semibold text-muted">
                {playerName}
              </span>
              <IntensityPips level={question?.intensity ?? 1} />
            </span>
          </div>

          {/* The question + host line share the flexible middle region, so a long
              question eats the slack instead of shoving the footer off the
              bottom of the fixed-height card. */}
          <div className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
            <p className="font-display text-[26px] leading-[1.16] font-semibold tracking-[-0.01em] text-balance text-ink">
              {question?.text ?? 'Called out. Brave does not protect you here.'}
            </p>

            {quip && <Commentator quip={quip} />}
          </div>

          {/* Pinned footer: the gesture legend, as two little pills. */}
          <div className="mt-3 flex shrink-0 items-center justify-between">
            <span className="chip bg-sun/25 text-[#8a5f00]">&larr; dare</span>
            <span className="text-[11px] font-semibold text-dim">or</span>
            <span className="chip bg-mint/20 text-[#0d6b47]">answer &rarr;</span>
          </div>

          {/* Swipe stamps: rotated type over the card, no filled blocks. */}
          <motion.div
            style={{ opacity: dareStamp, rotate: dareTilt }}
            className="pointer-events-none absolute top-16 left-5 rounded-xl border-[3px] border-berry px-2.5 py-1 font-display text-[17px] font-bold tracking-wide text-berry uppercase"
          >
            Dare
          </motion.div>
          <motion.div
            style={{ opacity: answerStamp, rotate: answerTilt }}
            className="pointer-events-none absolute top-16 right-5 rounded-xl border-[3px] border-mint px-2.5 py-1 font-display text-[17px] font-bold tracking-wide text-mint-deep uppercase"
          >
            Answer
          </motion.div>

          {celebrating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0 rounded-[28px] border-4 border-mint"
            />
          )}
        </div>

        {/* BACK — the dare, revealed by the 3D flip. Same card, warm printing, so
            it reads as the other side of one object rather than a new screen.
            The rotateY(180deg) pre-mirrors this face so that once the parent
            reaches 180deg the two cancel and the text reads forwards. It only
            works because the parent sets preserve-3d. */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-[28px] bg-[#FFFBEF] p-5 [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center justify-between gap-2">
            <span className="chip bg-sun text-[#4a3200]">DARE</span>
            <IntensityPips level={dare?.intensity ?? 1} />
          </div>

          <p className="font-display text-[26px] leading-[1.16] font-semibold tracking-[-0.01em] text-balance text-ink">
            {dare?.text ?? 'No dare loaded.'}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-display text-[12.5px] font-semibold text-muted">{playerName}</span>
            <span className="text-[11px] font-semibold text-dim">do it, then hit done</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
