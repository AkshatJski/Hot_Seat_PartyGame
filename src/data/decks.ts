import type { Dare, Intensity, Question, Vibe, VibePack } from '../types'
import { BOYS } from './packs/boys'
import { FAMILY } from './packs/family'
import { FRIENDS } from './packs/friends'

/**
 * CONTENT POLICY (agreed 2026-10-04, restated 2026-10-19, dares revised
 * 2026-10-21, rebuilt around vibes 2026-11-01)
 *
 * There is no per-card category. Ever. Cards are dealt from ONE queue at a time
 * so a night never repeats a question until that queue is exhausted.
 *
 * The thing that replaced categories is the VIBE: three complete, separate
 * libraries, chosen once at setup, never mixed. Mixing was the actual bug in the
 * old category system - a spicy card could surface in a family room. A vibe
 * cannot, because the pool is swapped *before* the first card is dealt.
 *
 * - Questions carry the heat: funny, quirky, roasty.
 * - Dares are comedic and embarrassing, never dangerous, and never humiliate
 *   anyone who is not in the room and playing.
 * - Intensity on a dare is a difficulty hint for the player, not a risk level.
 */

const PACKS: Record<Vibe, VibePack> = {
  family: FAMILY,
  friends: FRIENDS,
  boys: BOYS,
}

/**
 * The three shelves, in escalation order. This is the only array the UI needs:
 * setup renders it, the store validates against it, and the linter walks it.
 */
export const VIBES: Vibe[] = ['family', 'friends', 'boys']

export function isVibe(value: unknown): value is Vibe {
  return typeof value === 'string' && (VIBES as string[]).includes(value)
}

/** One complete content library. The returned arrays are the pack's own. */
export function poolFor(vibe: Vibe): VibePack {
  return PACKS[vibe] ?? FRIENDS
}

/**
 * The chosen vibe's question pool, shuffled into a queue.
 *
 * The queue, not the deck, is the anti-repetition mechanism: a player can never
 * see the same question twice before the vibe's whole pool has been dealt.
 */
export function buildQuestionQueue(vibe: Vibe): Question[] {
  return shuffle(poolFor(vibe).questions)
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

/** Totals for the setup screen. Per-vibe, because the counts differ a lot. */
export function contentCounts(vibe: Vibe = 'friends') {
  const pack = poolFor(vibe)
  return {
    questions: pack.questions.length,
    dares: pack.dares.length,
    callouts: pack.callouts.length,
  }
}
