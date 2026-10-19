import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

/**
 * A number that rolls up from its previous value when it mounts.
 *
 * Used on the Burn Book so the totals land with a bit of drama instead of just
 * being there. `requestAnimationFrame` rather than a motion value because the
 * value is a plain integer — no spring needed, and it renders as text either
 * way. Honours reduced motion by snapping straight to the target.
 *
 * Keeps the last rendered value in a ref so a re-render (e.g. a fresh game)
 * animates from where the old number was, not always from zero.
 */
export function CountUp({
  value,
  duration = 650,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    // Reduced motion needs no ticker at all — the render below just shows the
    // final number, so there is nothing to synchronise here.
    if (reduce) return
    const start = performance.now()
    const initial = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutCubic — fast out of the gate, settles softly on the final digit.
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(initial + (value - initial) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduce])

  return <span className={className}>{reduce ? value : display}</span>
}
