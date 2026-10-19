/**
 * PLAYER IDENTITY COLOURS
 *
 * Every seat at the table gets its own hue, assigned by INDEX (not by name), so
 * the rail, the card and the Burn Book all agree on who is who at a glance.
 *
 * The palette is a flat array of Tailwind CLASS STRINGS rather than hex values.
 * Two reasons: the app themes colour through Tailwind utilities, and because the
 * strings appear literally in this file the Tailwind v4 scanner picks every one
 * of them up — no dynamic class construction, no purge surprises.
 *
 * Every value is SOLID. `soft` is a hand-picked dark tint of its own hue rather
 * than `bg-neon-purple/12`, because a translucent wash reads as "website glass"
 * — the exact thing the arcade restyle exists to kill. A depth-per-hue tint
 * keeps the surface opaque while still feeling coloured.
 *
 * Six hues, cycled. A party of seven gets a repeat, which is fine: two players
 * sharing a colour still read differently once the active seat is highlighted.
 */
export interface PlayerPalette {
  /** Debug / test label. */
  name: string
  /** Foreground accent. */
  text: string
  /** Solid fill — pair with `text-ink`. */
  bg: string
  /** Opaque dark tint of the same hue, for panels and inactive chips. */
  soft: string
  /** Solid panel border. */
  border: string
}

export const PLAYER_PALETTE: PlayerPalette[] = [
  {
    name: 'purple',
    text: 'text-neon-purple',
    bg: 'bg-neon-purple',
    soft: 'bg-[#2b1b3f]',
    border: 'border-neon-purple',
  },
  {
    name: 'cyan',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan',
    soft: 'bg-[#0e2a34]',
    border: 'border-neon-cyan',
  },
  {
    name: 'pink',
    text: 'text-neon-pink',
    bg: 'bg-neon-pink',
    soft: 'bg-[#3a1a30]',
    border: 'border-neon-pink',
  },
  {
    name: 'lime',
    text: 'text-neon-lime',
    bg: 'bg-neon-lime',
    soft: 'bg-[#243310]',
    border: 'border-neon-lime',
  },
  {
    name: 'orange',
    text: 'text-neon-orange',
    bg: 'bg-neon-orange',
    soft: 'bg-[#38230f]',
    border: 'border-neon-orange',
  },
  {
    name: 'amber',
    text: 'text-neon-amber',
    bg: 'bg-neon-amber',
    soft: 'bg-[#3a2d0f]',
    border: 'border-neon-amber',
  },
]

/** Stable hue for seat `index`. Negative / oversized indexes wrap safely. */
export function playerPalette(index: number): PlayerPalette {
  const n = PLAYER_PALETTE.length
  return PLAYER_PALETTE[((index % n) + n) % n]
}
