import { useReducedMotion } from 'motion/react'
import type { CSSProperties } from 'react'

const BITS = ['🔥', '🎉', '💥', '⭐', '✨', '🎊']

/**
 * A one-shot emoji confetti pop, thrown outward from the centre.
 *
 * Each piece carries its own direction, distance and spin as CSS custom
 * properties, which a single keyframe (`confetti-fly` in `index.css`) consumes —
 * so the whole burst is one CSS animation per bit and no JS runs per frame.
 *
 * Returns nothing at all under reduced motion rather than a static puff.
 */
export function ConfettiBurst({ count = 16 }: { count?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count
        const dist = 84 + (i % 5) * 26
        const style = {
          '--dx': `${(Math.cos(angle) * dist).toFixed(1)}px`,
          '--dy': `${(Math.sin(angle) * dist - 26).toFixed(1)}px`,
          '--rot': `${(i % 2 ? 1 : -1) * (150 + i * 23)}deg`,
          animationDelay: `${(i % 4) * 42}ms`,
          fontSize: `${16 + (i % 3) * 4}px`,
        } as CSSProperties
        return (
          <span key={i} className="confetti-bit absolute top-1/2 left-1/2" style={style}>
            {BITS[i % BITS.length]}
          </span>
        )
      })}
    </span>
  )
}
