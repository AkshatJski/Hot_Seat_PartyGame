import { motion, useReducedMotion } from 'motion/react'
import type { Quip } from '../data/commentary'

interface CommentatorProps {
  /** `card` sits inline under a question; `toast` is a standalone line. */
  quip: Quip
  variant?: 'card' | 'toast'
}

/**
 * The host, as a byline.
 *
 * This used to be an emoji face in a rounded speech bubble with a hard shadow —
 * three separate tells at once. It is now what it always should have been: an
 * attributed line of type. An em dash, the word HOST in mono, the review in
 * italic. Nothing to draw, nothing to colour, and it reads like the caption in a
 * magazine rather than like a chat app.
 *
 * Deliberately `pointer-events-none`: a swipe is a drag across the whole card,
 * and anything that catches a pointer here eats the gesture. The host is
 * decoration, never a control.
 *
 * `key` on the figure is the quip text, so a new line gets a fresh fade while an
 * unchanged one (same object out of the deterministic pool) stays put.
 */
export function Commentator({ quip, variant = 'card' }: CommentatorProps) {
  const reduce = useReducedMotion()
  const toast = variant === 'toast'

  return (
    <motion.figure
      key={quip.text}
      data-commentator={quip.mood}
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, delay: toast ? 0 : 0.08 }}
      className={`pointer-events-none max-w-full ${toast ? 'text-center' : 'mt-5'}`}
    >
      <figcaption className={toast ? 'mx-auto max-w-sm' : 'border-l border-hairline pl-3'}>
        <span className="meta">&mdash; host</span>
        <span
          className={`text-muted italic ${toast ? 'block text-[12.5px] leading-snug' : 'mt-1 block text-[13px] leading-snug'}`}
        >
          {quip.text}
        </span>
      </figcaption>
    </motion.figure>
  )
}
