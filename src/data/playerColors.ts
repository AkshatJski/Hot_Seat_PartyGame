/**
 * PLAYER IDENTITY COLOURS
 *
 * Every seat at the table gets its own hue, assigned by INDEX (not by name), so
 * the rail, the card and the Burn Book all agree on who is who at a glance.
 *
 * The palette is a flat array of Tailwind CLASS STRINGS rather than hex values.
 * Two reasons: the app themes colour through Tailwind utilities (so `/12`
 * opacity variants come for free), and because the strings appear literally in
 * this file the Tailwind v4 scanner picks every one of them up — no dynamic
 * class construction, no purge surprises.
 *
 * Six hues, cycled. A party of seven gets a repeat, which is fine: two players
 * sharing a colour still read differently once the active seat is highlighted.
 */
export interface PlayerPalette {
  /** Debug / test label. */
  name: string
  /** Foreground accent. */
  text: string
  /** Solid fill — pair with `text-void`. */
  bg: string
  /** Translucent wash for panels and inactive chips. */
  soft: string
  /** Panel border. */
  border: string
}

export const PLAYER_PALETTE: PlayerPalette[] = [
  {
    name: 'purple',
    text: 'text-neon-purple',
    bg: 'bg-neon-purple',
    soft: 'bg-neon-purple/12',
    border: 'border-neon-purple/60',
  },
  {
    name: 'cyan',
    text: 'text-neon-cyan',
    bg: 'bg-neon-cyan',
    soft: 'bg-neon-cyan/12',
    border: 'border-neon-cyan/60',
  },
  {
    name: 'pink',
    text: 'text-neon-pink',
    bg: 'bg-neon-pink',
    soft: 'bg-neon-pink/12',
    border: 'border-neon-pink/60',
  },
  {
    name: 'lime',
    text: 'text-neon-lime',
    bg: 'bg-neon-lime',
    soft: 'bg-neon-lime/12',
    border: 'border-neon-lime/60',
  },
  {
    name: 'orange',
    text: 'text-neon-orange',
    bg: 'bg-neon-orange',
    soft: 'bg-neon-orange/12',
    border: 'border-neon-orange/60',
  },
  {
    name: 'amber',
    text: 'text-neon-amber',
    bg: 'bg-neon-amber',
    soft: 'bg-neon-amber/12',
    border: 'border-neon-amber/60',
  },
]

/** Stable hue for seat `index`. Negative / oversized indexes wrap safely. */
export function playerPalette(index: number): PlayerPalette {
  const n = PLAYER_PALETTE.length
  return PLAYER_PALETTE[((index % n) + n) % n]
}
