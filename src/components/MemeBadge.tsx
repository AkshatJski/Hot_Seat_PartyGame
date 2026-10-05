import { motion } from 'motion/react'
import type { Meme } from '../data/memes'

/**
 * The reaction badge pinned under a card.
 *
 * Deliberately `pointer-events-none`: a swipe is a drag across the whole card,
 * and anything that intercepts a pointer here eats the gesture or blocks the
 * drag. The image is decoration, never a control.
 *
 * `key` is driven by the caller so a new card gets a fresh pop-in animation.
 */
export function MemeBadge({ meme }: { meme: Meme }) {
  return (
    <motion.figure
      key={meme.id}
      initial={{ opacity: 0, y: 14, scale: 0.85, rotate: -6 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.12 }}
      className="pointer-events-none mt-3 flex items-center justify-center gap-2.5"
    >
      <img
        src={meme.src}
        alt={meme.alt}
        width={72}
        height={45}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-[45px] w-[72px] rounded-md border border-white/10 object-cover opacity-90"
      />
      <figcaption className="max-w-[150px] text-[10px] leading-tight font-bold tracking-wide text-white/45">
        {meme.caption}
      </figcaption>
    </motion.figure>
  )
}
