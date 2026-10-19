/**
 * The ambient neon wash behind the whole app.
 *
 * Three soft blobs drifting on a 19s loop, drawn with CSS keyframes (see
 * `index.css`) so it costs nothing per frame and switches off wholesale under
 * `prefers-reduced-motion`. `aria-hidden` + `pointer-events-none`: it is pure
 * atmosphere and must never be reachable or tappable.
 */
export function ArcadeBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aura-blob absolute -top-24 -left-20 h-72 w-72 rounded-full bg-neon-purple/20 blur-3xl" />
      <div
        className="aura-blob absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-neon-cyan/12 blur-3xl"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="aura-blob absolute -bottom-28 left-[18%] h-72 w-72 rounded-full bg-neon-pink/12 blur-3xl"
        style={{ animationDelay: '-12s' }}
      />
    </div>
  )
}
