import type {
  CallOutDare,
  Dare,
  Deck,
  DeckId,
  Intensity,
  Question,
} from '../types'
import { destroyerCallOuts, destroyerDares, destroyerQuestions } from './destroyers'
import { icebreakerCallOuts, icebreakerDares, icebreakerQuestions } from './icebreakers'
import { spicyCallOuts, spicyDares, spicyQuestions } from './spicy'
import { unhingedCallOuts, unhingedDares, unhingedQuestions } from './unhinged'

/**
 * CONTENT POLICY (agreed 2026-10-04)
 * - Questions carry the heat: spicy, philosophical, thought-provoking, funny.
 * - Dares are deliberately TAME: comedic, embarrassing, zero physical risk,
 *   zero humiliation of anyone outside the room. No "dark" tier of dare.
 * - Intensity on a dare is a difficulty hint for the player, not a risk level.
 */

export const DECKS: Deck[] = [
  {
    id: 'icebreakers',
    label: 'Icebreakers',
    blurb: 'Light, funny, observational. Safe for work.',
    minAge: 0,
  },
  {
    id: 'destroyers',
    label: 'Friendship Destroyers',
    blurb: 'Playful, chaotic, room-based roasting.',
    minAge: 0,
  },
  {
    id: 'spicy',
    label: 'Spicy 18+',
    blurb: 'The questions get real. Dares stay harmless.',
    minAge: 18,
  },
  {
    id: 'unhinged',
    label: 'Unhinged',
    blurb: 'Peak cursed energy. Pure unadulterated chaos.',
    minAge: 0,
  },
]

export const QUESTIONS: Question[] = [
  ...icebreakerQuestions,
  ...destroyerQuestions,
  ...spicyQuestions,
  ...unhingedQuestions,
]

export const DARES: Dare[] = [...icebreakerDares, ...destroyerDares, ...spicyDares, ...unhingedDares]

export const CALL_OUT_DARES: CallOutDare[] = [
  ...icebreakerCallOuts,
  ...destroyerCallOuts,
  ...spicyCallOuts,
  ...unhingedCallOuts,
]

export function getDeck(id: DeckId): Deck {
  const deck = DECKS.find((d) => d.id === id)
  if (!deck) throw new Error(`Unknown deck: ${id}`)
  return deck
}

export function deckLabel(id: DeckId): string {
  return getDeck(id).label
}

function fromDecks<T extends { deck: DeckId }>(all: T[], ids: DeckId[]): T[] {
  if (ids.length === 0) return []
  const set = new Set(ids)
  return all.filter((item) => set.has(item.deck))
}

export function questionsFor(ids: DeckId[]): Question[] {
  return fromDecks(QUESTIONS, ids)
}

export function daresFor(ids: DeckId[]): Dare[] {
  return fromDecks(DARES, ids)
}

export function callOutDaresFor(ids: DeckId[]): CallOutDare[] {
  return fromDecks(CALL_OUT_DARES, ids)
}

/** Fisher-Yates. Returns a new array; does not mutate the input. */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * The whole question pool for the chosen decks, shuffled into a queue.
 * The game ends when this queue runs dry ("play until cards run out"), which is
 * also the natural anti-repetition mechanism — you can never see a card twice.
 */
export function buildQuestionQueue(ids: DeckId[]): Question[] {
  return shuffle(questionsFor(ids))
}

/**
 * Coward Meter → dare difficulty tier.
 * 0-1 cowards → tier 1 (trivial dares), 2-3 → tier 2, 4+ → tier 3 (hardest).
 * Escalates as the player chickens out, and can never exceed 3.
 */
export function dareTier(coward: number): Intensity {
  const tier = 1 + Math.floor(coward / 2)
  return Math.min(3, Math.max(1, tier)) as Intensity
}

/**
 * Pick a dare for a player.
 *
 * The tier is a FLOOR on intensity: a player who has chickened out four times
 * is not allowed to get off with a trivial dare. If the strict floor leaves
 * nothing in the pool we relax it rather than fail, so the game never dead-ends.
 *
 * `recent` holds ids already handed out in this session; excluding them stops a
 * small pool from dealing the same dare twice in a row.
 */
export function pickDare<T extends Dare>(
  pool: T[],
  tier: Intensity,
  recent: readonly string[] = [],
): T | null {
  if (pool.length === 0) return null
  const fresh = pool.filter((d) => !recent.includes(d.id))
  const candidates = fresh.length > 0 ? fresh : pool
  const strict = candidates.filter((d) => d.intensity >= tier)
  const usable = strict.length > 0 ? strict : candidates
  return usable[Math.floor(Math.random() * usable.length)]
}

export function contentCounts(ids: DeckId[]) {
  return {
    questions: questionsFor(ids).length,
    dares: daresFor(ids).length,
    callOuts: callOutDaresFor(ids).length,
  }
}