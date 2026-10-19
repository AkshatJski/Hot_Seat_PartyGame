import { motion, useReducedMotion } from 'motion/react'
import { MOOD_ACCENT, MOOD_EMOJI, type Quip } from '../data/commentary'

interface CommentatorProps {
  quip: Quip
  /** `card` sits inline under a question; `toast` is a standalone bark. */
  variant?: 'card' | 'toast'
}

/**
 * The host: a mood-emoji face in a bubble with a one-line review of whatever is
 * happening. This is the replacement for the old reaction meme.
 *
 * Deliberately `pointer-events-none`: a swipe is a drag across the whole card,
 * and anything that catches a pointer here eats the gesture. The host is
 * decoration, never a control.
 *
 * `key` on the figure is the quip text, so a new line gets a fresh pop-in while
 * an unchanged one (same object out of the deterministic pool) stays put.
 */
export function Commentator({ quip, variant = 'card' }: CommentatorProps) {
  const reduce = useReducedMotion()
  const toast = variant === 'toast'

  return (
    <motion.figure
      key={quip.text}
      data-commentator={quip.mood}
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18, delay: toast ? 0 : 0.1 }}
      className={`pointer-events-none flex items-start gap-2.5 ${toast ? '' : 'mt-3'}`}
    >
      <span
        aria-hidden
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[15px] leading-none ${MOOD_ACCENT[quip.mood]}`}
      >
        {MOOD_EMOJI[quip.mood]}
      </span>
      <figcaption className="relative rounded-2xl rounded-tl-sm border border-white/10 bg-white/6 px-3 py-1.5">
        <span
          className={`mr-1.5 align-middle text-[9px] font-black tracking-widest uppercase ${MOOD_ACCENT[quip.mood]}`}
        >
          Host
        </span>
        <span className="align-middle text-[12px] leading-snug font-semibold text-white/70 italic">
          {quip.text}
        </span>
      </figcaption>
    </motion.figure>
  )
}
