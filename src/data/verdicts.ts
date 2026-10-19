import type { Player } from '../types'

/**
 * BURN BOOK VERDICTS
 *
 * The end-of-game scoreboard gives every player exactly ONE archetype card,
 * picked from their own stats by this ladder — first match wins. Nobody is ever
 * left with an empty "—" slot, and there are no winners/runners-up to tie.
 *
 * The ladder is deliberately TOTAL: the last rule (All-Rounder) catches anyone
 * who slipped through, so `verdictFor` always returns a card. It's a pure
 * function — no icons, no JSX — so `smoke.ts` can unit-test every branch. The
 * screen owns the icon per `kind`.
 */

export type VerdictKind =
  | 'ghost'
  | 'flincher'
  | 'reckless'
  | 'nuclear'
  | 'noRegrets'
  | 'onATear'
  | 'openBook'
  | 'cryWolf'
  | 'publicEnemy'
  | 'yesMachine'
  | 'dodger'
  | 'sus'
  | 'allRounder'

export interface Verdict {
  kind: VerdictKind
  /** Shown big on the card. */
  title: string
  /** One-line, stat-aware explanation. */
  blurb: string
  /** Tailwind text-colour class. */
  accent: string
}

const v = (
  kind: VerdictKind,
  title: string,
  blurb: string,
  accent: string,
): Verdict => ({ kind, title, blurb, accent })

export function verdictFor(p: Player): Verdict {
  const brave = p.brave ?? 0
  const skips = p.coward ?? 0
  const dares = p.daresCompleted ?? 0
  const calledOut = p.timesCalledOut ?? 0
  const falseCalls = p.falseAccusations ?? 0
  const best = p.bestStreak ?? 0
  const deep = p.deepestAnswered ?? 1
  const worst = p.worstDare ?? 1

  const faced = brave + dares + skips
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

  // 1 — never engaged at all.
  if (faced === 0) return v('ghost', 'The Ghost', 'Never touched a card.', 'text-muted')
  // 2 — flinched, but never answered or dared.
  if (brave + dares === 0) {
    return v('flincher', 'Serial Flincher', `Skipped all ${skips}.`, 'text-neon-red')
  }
  // 3 — took a nuclear dare.
  if (worst === 3) return v('reckless', 'The Reckless', 'Took the nuclear dare.', 'text-neon-amber')
  // 4 — answered a nuclear question.
  if (deep === 3) return v('nuclear', 'Went Nuclear', 'Answered to the bottom.', 'text-neon-red')
  // 5 — did both, never ducked.
  if (skips === 0 && brave > 0 && dares > 0) {
    return v('noRegrets', 'No Regrets', 'Never skipped. Not once.', 'text-neon-green')
  }
  // 6 — the heater.
  if (best >= 5) return v('onATear', 'On a Tear', `Answered ${best} in a row.`, 'text-neon-amber')
  // 7 — all truth, no dare, no flinch.
  if (skips === 0 && brave > 0) {
    return v('openBook', 'Open Book', 'All truth, no dare.', 'text-neon-cyan')
  }
  // 8 — kept making calls that got overruled.
  if (falseCalls >= 2) {
    return v('cryWolf', 'Cry Wolf', `Wrongly called out ${falseCalls}.`, 'text-neon-purple')
  }
  // 9 — the group kept coming for them.
  if (calledOut >= 3) {
    return v('publicEnemy', 'Public Enemy', `Called out ${calledOut} times.`, 'text-neon-red')
  }
  // 10 — said yes to the dare more than the truth.
  if (dares > brave) {
    return v(
      'yesMachine',
      'The Yes Machine',
      `${dares} dares, ${brave} ${plural(brave, 'truth', 'truths')}.`,
      'text-neon-green',
    )
  }
  // 11 — left is their favourite direction.
  if (skips > brave) {
    return v('dodger', 'The Dodger', `Skipped ${skips}, answered ${brave}.`, 'text-neon-amber')
  }
  // 12 — called out at least once, but not enough for Public Enemy.
  if (calledOut >= 1) {
    return v('sus', 'Sus', `Called out ${calledOut} ${plural(calledOut, 'time', 'times')}.`, 'text-neon-purple')
  }
  // 13 — the catch-all.
  return v('allRounder', 'The All-Rounder', 'A bit of everything.', 'text-neon-cyan')
}
