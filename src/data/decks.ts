import type { CallOutDare, Dare, Intensity, Question } from '../types'
import { QUESTIONS } from './questions'
import { DARES, CALL_OUT_DARES } from './dares'

/**
 * CONTENT POLICY (agreed 2026-10-04, restated 2026-10-19, dares revised 2026-10-21)
 * - Questions carry the heat: funny, quirky, roasty.
 * - Dares are comedic and embarrassing, never dangerous: mild physical action
 *   (silly poses, holding something, going to another room), the player's own
 *   phone or social media, and zero humiliation of anyone outside the room.
 *   There is deliberately no "dark" tier of dare.
 * - Intensity on a dare is a difficulty hint for the player, not a risk level.
 *
 * Categories are gone. There is ONE flat question pool and ONE flat dare pool,
 * dealt at random with no repeats until the pool runs dry.
 */

export const ALL_QUESTIONS: Question[] = QUESTIONS
export const ALL_DARES: Dare[] = DARES
export const ALL_CALL_OUT_DARES: CallOutDare[] = CALL_OUT_DARES

/**
 * The whole question pool, shuffled into a queue. The game ends when this queue
 * runs dry ("play until cards run out"), which is also the natural
 * anti-repetition mechanism — you can never see a card twice.
 */
export function buildQuestionQueue(): Question[] {
  return shuffle(ALL_QUESTIONS)
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
 * Flinch count → dare difficulty tier.
 * 0-1 flinches → tier 1 (trivial dares), 2-3 → tier 2, 4+ → tier 3 (hardest).
 * Escalates as the player chickens out, and can never exceed 3.
 *
 * Driven by the HIDDEN `flinchCount`, not the visible `coward` score: taking a
 * dare is free, so only refusing escalates. See `chickenOut()` in the store.
 */
export function dareTier(flinchCount: number): Intensity {
  const tier = 1 + Math.floor(flinchCount / 2)
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

export function contentCounts() {
  return {
    questions: ALL_QUESTIONS.length,
    dares: ALL_DARES.length,
    callOuts: ALL_CALL_OUT_DARES.length,
  }
}
