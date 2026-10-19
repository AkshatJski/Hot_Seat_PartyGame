import { motion, useReducedMotion } from 'motion/react'
import { MOOD_ACCENT, MOOD_BUBBLE, MOOD_EMOJI, type Quip } from '../data/commentary'

interface CommentatorProps {
  quip: Quip
  /** `card` sits inline under a question; `toast` is a standalone bark. */
  variant?: 'card' | 'toast'
}

/**
 * The host: a mood-emoji face in a speech bubble with a one-line review of
 * whatever is happening. This is the replacement for the old reaction meme.
 *
 * Styled as an arcade sticker, not a glass panel: solid fill, 2px ink outline,
 * hard offset shadow, no translucency and no backdrop-blur.
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
      className={`pointer-events-none flex max-w-full items-start gap-2.5 ${toast ? '' : 'mt-3'}`}
    >
      <span
        aria-hidden
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-base leading-none shadow-pop-sm ${MOOD_BUBBLE[quip.mood]}`}
      >
        {MOOD_EMOJI[quip.mood]}
      </span>
      <figcaption className="min-w-0 rounded-2xl rounded-tl-sm border-2 border-ink bg-panel px-3 py-1.5 shadow-pop-sm">
        <span
          className={`mr-1.5 align-middle text-[9px] font-black tracking-[0.15em] uppercase ${MOOD_ACCENT[quip.mood]}`}
        >
          Host
        </span>
        <span className="align-middle text-[12px] leading-snug font-bold text-bone italic">
          {quip.text}
        </span>
      </figcaption>
    </motion.figure>
  )
}
