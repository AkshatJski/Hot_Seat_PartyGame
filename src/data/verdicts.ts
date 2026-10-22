import type { Player } from '../types'

/**
 * BURN BOOK VERDICTS
 *
 * The end-of-game scoreboard gives every player exactly ONE archetype, picked
 * from their own stats by this ladder — first match wins. Nobody is ever left
 * with an empty "—" slot, and there are no winners/runners-up to tie.
 *
 * The ladder is deliberately TOTAL: the last rule (All-Rounder) catches anyone
 * who slipped through, so `verdictFor` always returns a result. It's a pure
 * function — no icons, no JSX, and deliberately no colour: the screen decides
 * how a verdict looks, so an archetype can never arrive with its own palette.
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
}

const v = (kind: VerdictKind, title: string, blurb: string): Verdict => ({ kind, title, blurb })

export function verdictFor(p: Player): Verdict {
  const brave = p.brave ?? 0
  // `coward` counts chicken-outs only. A wrong Call Out is recorded separately in
  // `falseAccusations`, so it does not leak in here and block "No Regrets".
  const chickenOuts = p.coward ?? 0
  const dares = p.daresCompleted ?? 0
  const calledOut = p.timesCalledOut ?? 0
  const falseCalls = p.falseAccusations ?? 0
  const best = p.bestStreak ?? 0
  const deep = p.deepestAnswered ?? 1
  const worst = p.worstDare ?? 1

  const faced = brave + dares + chickenOuts
  const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

  // 1 — never engaged at all.
  if (faced === 0) return v('ghost', 'The Ghost', 'Never touched a card.')
  // 2 — flinched, but never answered or dared.
  if (brave + dares === 0) {
    return v('flincher', 'Serial Flincher', `Chickened out on all ${chickenOuts}.`)
  }
  // 3 — took a nuclear dare.
  if (worst === 3) return v('reckless', 'The Reckless', 'Took the nuclear dare.')
  // 4 — answered a nuclear question.
  if (deep === 3) return v('nuclear', 'Went Nuclear', 'Answered to the bottom.')
  // 5 — did both, never ducked.
  if (chickenOuts === 0 && brave > 0 && dares > 0) {
    return v('noRegrets', 'No Regrets', 'Never chickened out. Not once.')
  }
  // 6 — the heater.
  if (best >= 5) return v('onATear', 'On a Tear', `Answered ${best} in a row.`)
  // 7 — all truth, no dare, no flinch.
  if (chickenOuts === 0 && brave > 0) {
    return v('openBook', 'Open Book', 'All truth, no dare.')
  }
  // 8 — kept making calls that got overruled.
  if (falseCalls >= 2) {
    return v('cryWolf', 'Cry Wolf', `Wrongly called out ${falseCalls}.`)
  }
  // 9 — the group kept coming for them.
  if (calledOut >= 3) {
    return v('publicEnemy', 'Public Enemy', `Called out ${calledOut} times.`)
  }
  // 10 — said yes to the dare more than the truth.
  if (dares > brave) {
    return v(
      'yesMachine',
      'The Yes Machine',
      `${dares} dares, ${brave} ${plural(brave, 'truth', 'truths')}.`,
    )
  }
  // 11 — left is their favourite direction.
  if (chickenOuts > brave) {
    return v('dodger', 'The Dodger', `Chickened out ${chickenOuts}, answered ${brave}.`)
  }
  // 12 — called out at least once, but not enough for Public Enemy.
  if (calledOut >= 1) {
    return v('sus', 'Sus', `Called out ${calledOut} ${plural(calledOut, 'time', 'times')}.`)
  }
  // 13 — the catch-all.
  return v('allRounder', 'The All-Rounder', 'A bit of everything.')
}
