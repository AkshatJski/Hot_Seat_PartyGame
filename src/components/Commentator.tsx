import { motion, useReducedMotion } from 'motion/react'
import type { Quip } from '../data/commentary'
import { HostFace } from './HostFace'

interface CommentatorProps {
  /** `card` sits inside a question card; `toast` is a standalone line below it. */
  quip: Quip
  variant?: 'card' | 'toast'
}

/**
 * The host: a drawn face in a speech bubble with a one-line review of whatever
 * just happened.
 *
 * This is the third iteration of the same component — reaction image, then an
 * emoji sticker, now a bubble that belongs to the design. The bubble is a tinted
 * block with a CSS tail, so it reads as speech without a rounded-glass panel and
 * without a shadow of its own; the panel underneath already owns the elevation.
 *
 * Deliberately `pointer-events-none`: a swipe is a drag across the whole card,
 * and anything that catches a pointer here eats the gesture. The host is
 * decoration, never a control.
 *
 * `key` on the wrapper is the quip text, so a new line pops in while an unchanged
 * one (same object out of the deterministic pool) stays put.
 */
export function Commentator({ quip, variant = 'card' }: CommentatorProps) {
  const reduce = useReducedMotion()
  const toast = variant === 'toast'

  return (
    <motion.figure
      key={quip.text}
      data-commentator={quip.mood}
      initial={reduce ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: toast ? 0 : 0.06 }}
      className={`pointer-events-none ${toast ? 'mx-auto w-full max-w-sm' : 'mt-4'}`}
    >
      <figcaption className={`bubble flex items-start gap-2.5 px-3.5 py-3`}>
        <HostFace mood={quip.mood} />
        <span className="text-[13.5px] leading-[1.35] font-medium text-muted">{quip.text}</span>
      </figcaption>
    </motion.figure>
  )
}
