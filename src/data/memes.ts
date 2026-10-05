import type { DeckId } from '../types'

/**
 * MEME / REACTION SYSTEM
 *
 * Deliberately offline and self-owned. Every asset in `public/memes/` is an
 * original SVG authored for this project, so there is no scraping, no external
 * API, no NSFW surprise, and nothing to break when a third-party endpoint goes
 * down mid-party. Total weight is a few kilobytes.
 *
 * A reaction is attached to a card by DETERMINISTIC hash of the card id, not by
 * random draw. That matters: React strict-mode double-renders and every re-render
 * would otherwise re-roll the image, making it flicker between two reactions as
 * the player holds the phone still.
 */
export interface Meme {
  id: string
  /** File under /memes. */
  src: string
  /** Short alt text; also used as the button label tooltip. */
  alt: string
  /** Short caption shown under the image while it is on screen. */
  caption: string
}

export const MEMES: Meme[] = [
  {
    id: 'chefs-kiss',
    src: '/memes/chefs-kiss.svg',
    alt: "Chef's kiss",
    caption: 'Perfect answer.',
  },
  {
    id: 'big-brain',
    src: '/memes/big-brain.svg',
    alt: 'Big brain',
    caption: 'Answer of the night.',
  },
  {
    id: 'no-thoughts',
    src: '/memes/no-thoughts.svg',
    alt: 'No thoughts, just vibes',
    caption: 'Instinct took over.',
  },
  {
    id: 'this-is-fine',
    src: '/memes/this-is-fine.svg',
    alt: 'This is fine',
    caption: 'Everything is normal.',
  },
  {
    id: 'send-it',
    src: '/memes/send-it.svg',
    alt: 'Send it',
    caption: 'No safety net.',
  },
  {
    id: 'cringe',
    src: '/memes/cringe.svg',
    alt: 'Cringe',
    caption: 'Burn Book material.',
  },
  {
    id: 'bruh',
    src: '/memes/bruh.svg',
    alt: 'Bruh',
    caption: 'That was devastating.',
  },
  {
    id: 'eye-roll',
    src: '/memes/eye-roll.svg',
    alt: 'Eye roll',
    caption: 'Unbelievable.',
  },
  {
    id: 'ratio',
    src: '/memes/ratio.svg',
    alt: 'Ratio',
    caption: 'You could not.',
  },
]

const BY_ID = new Map(MEMES.map((m) => [m.id, m]))

/**
 * Decks whose questions are NOT reactions-in-waiting. Spicy and Unhinged get a
 * curated subset so a spicy card never draws "chef's kiss" — the joke has to
 * match the heat of the question it is pinned to.
 */
const DECK_POOL: Record<DeckId, string[]> = {
  icebreakers: MEMES.map((m) => m.id),
  destroyers: ['chefs-kiss', 'big-brain', 'cringe', 'bruh', 'eye-roll', 'no-thoughts', 'this-is-fine'],
  spicy: ['no-thoughts', 'eye-roll', 'bruh', 'cringe', 'ratio', 'send-it'],
  unhinged: ['send-it', 'no-thoughts', 'this-is-fine', 'cringe', 'bruh', 'ratio', 'big-brain'],
}

/** FNV-1a. Small, fast, and stable across runs — no randomness, no hydration drift. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * The reaction shown on a card. Deterministic: the same card id always yields
 * the same meme, and it never changes while the card is on screen.
 *
 * Only ~65% of cards get a meme at all. A reaction on EVERY card stops being a
 * reaction and becomes wallpaper, so the feature is sprinkled, not applied.
 */
export function memeForCard(cardId: string, deck: DeckId): Meme | null {
  const pool = DECK_POOL[deck]
  if (!pool || pool.length === 0) return null
  const h = hash(cardId)
  if (h % 100 >= 65) return null
  return BY_ID.get(pool[h % pool.length]) ?? null
}
