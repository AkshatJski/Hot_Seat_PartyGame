/**
 * SEAT COLOURS
 *
 * Every seat gets a bright avatar circle, assigned by INDEX (not by name), so the
 * rail, the card and the Burn Book all agree on who is who at a glance.
 *
 * These came back after one pass without them. In a print-style layout, per-seat
 * hues were decoration; in a game lobby they carry real information — with eight
 * people crowded around a phone, "the grape one" is faster than reading names.
 *
 * The palette is a flat array of Tailwind CLASS STRINGS rather than hex values:
 * the app themes colour through utilities, and because the strings appear
 * literally here the Tailwind v4 scanner picks every one of them up.
 *
 * Six hues, cycled. A party of seven gets a repeat, which is fine: the active
 * seat is also marked by an inverted background, so a shared colour still reads.
 */
export interface PlayerPalette {
  /** Debug / test label. */
  name: string
  /** Avatar fill. */
  bg: string
  /** Text on the avatar — dark on the pale hues, white on the saturated ones. */
  text: string
  /** Tinted background for a whole row or card. */
  soft: string
  /** Matching border, for the active-seat outline. */
  border: string
}

export const PLAYER_PALETTE: PlayerPalette[] = [
  { name: 'coral', bg: 'bg-coral', text: 'text-white', soft: 'bg-coral/12', border: 'border-coral' },
  { name: 'sky', bg: 'bg-sky', text: 'text-white', soft: 'bg-sky/12', border: 'border-sky' },
  {
    name: 'sun',
    bg: 'bg-sun',
    text: 'text-[#4a3200]',
    soft: 'bg-sun/18',
    border: 'border-sun',
  },
  {
    name: 'mint',
    bg: 'bg-mint',
    text: 'text-[#083a26]',
    soft: 'bg-mint/15',
    border: 'border-mint',
  },
  {
    name: 'grape',
    bg: 'bg-grape',
    text: 'text-white',
    soft: 'bg-grape/15',
    border: 'border-grape',
  },
  {
    name: 'berry',
    bg: 'bg-berry',
    text: 'text-white',
    soft: 'bg-berry/12',
    border: 'border-berry',
  },
]

/** Wrap `index` so a negative or overflowing seat still lands on a colour. */
export function playerPalette(index: number): PlayerPalette {
  const i = ((index % PLAYER_PALETTE.length) + PLAYER_PALETTE.length) % PLAYER_PALETTE.length
  return PLAYER_PALETTE[i]
}
