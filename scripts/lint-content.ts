/**
 * CONTENT LINTER — the objective quality gate for every card in every vibe.
 *
 * Three shelves, three complete libraries. The linter checks each one on its
 * own (shape, length, vagueness, duplicates, template fatigue) AND against the
 * others (no card may appear on two shelves), then applies the TONE GATE: the
 * one rule that cannot be eyeballed reliably across 250+ cards is that a family
 * game never swears and a friends game never gets explicit.
 *
 * Run:  npm run lint:content   (also part of `npm run check`)
 */
import { VIBES, poolFor } from '../src/data/decks'
import { CARD_QUIPS, EVENT_QUIPS, MOODS, type Quip } from '../src/data/commentary'
import type { Vibe } from '../src/types'
import { ideaOverlap, shapeOf, type Shape } from './content-shapes'

type Pool = 'question' | 'dare' | 'callout'

interface Card {
  id: string
  text: string
  intensity?: number
}

const violations: string[] = []
const stats: string[] = []

function fail(rule: string, card: Card, why: string) {
  violations.push(`[${rule}] ${card.id} — ${why}\n          "${card.text}"`)
}

const norm = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean)
const firstWord = (t: string) => words(norm(t))[0] ?? ''

// ---- thresholds -------------------------------------------------------------
const WORD_MIN = 5
const WORD_MAX = 30
/** No single opening-4-words bucket may exceed this share of a pool. */
const TEMPLATE_SHARE = 0.12
const TEMPLATE_FLOOR = 4
/** A shelf nobody can play for an evening is a broken shelf. */
const MIN_CARDS = { question: 60, dare: 40, callout: 18 } as const

/**
 * MIX THRESHOLDS — the rules that make "is this any good?" measurable.
 *
 * These are deliberately generous. A gate that cries wolf gets switched off,
 * which is worse than no gate. Each one encodes a defect that actually shipped:
 *
 *   shape-share  one answer shape is most of a shelf. Friends was 67% "pick a
 *                person". Six shapes means a healthy shelf sits near 17%.
 *   nominate     the specific monoculture: the answer is a name, the turn ends,
 *                nobody reacts. Capped harder than the general shape cap.
 *   follow-up    a nominate card with no second clause is a one-word turn.
 *   intensity    the ladder the UI promises (pips, dare tiers, "deepest
 *                answered") has to exist in the data. Friends had 0 tier-3s.
 *   length       uniform card length is the strongest "written all at once"
 *                tell. Some cards must be a stab, some a scene.
 *   verb-spread  one dare opener doing a quarter of the work.
 */
const SHAPE_SHARE = 0.35
const NOMINATE_SHARE = 0.25
const FOLLOW_UP = /,\s+\S+\s+\S+| then \S+/i
const TIER1_SHARE = 0.1
const TIER3_SHARE = 0.08
const TIER2_SHARE = 0.2
const SHORT_SHARE = 0.08
const LONG_SHARE = 0.08
const SHORT_WORDS = 8
const LONG_WORDS = 18
const DARE_VERB_SHARE = 0.25
const CALLOUT_VERB_SHARE = 0.3
const NOMINATE_OPENER = /^(point at|who here|who in this room|which of us|name the person)\b/i
// ---- card shapes ------------------------------------------------------------
// A card is a valid prompt if it asks something (contains "?") or opens with an
// imperative verb: "Describe your ideal Sunday." is a card, not a broken question.
const IMPERATIVE = new Set([
  'describe', 'rate', 'pick', 'say', 'tell', 'name', 'rank', 'list', 'invent',
  'give', 'choose', 'explain', 'imagine', 'act', 'make', 'assign', 'guess',
  'admit', 'confess', 'pitch', 'write', 'draw', 'roast', 'defend', 'argue',
  'share', 'read', 'spell', 'design', 'cast', 'create', 'show', 'answer',
  'deliver', 'announce', 'perform', 'improvise', 'narrate', 'recount', 'swap',
  // "Point at the person most likely to..." is the single most-used prompt
  // shape in the game. It is an imperative, so it belongs here — it used to fail
  // the shape gate unless the card also ended in a question mark.
  'point',
  // Verbs the shape work added. A card that opens with one of these is an
  // instruction: it must end in a period, never a question mark.
  'sing', 'hum', 'mime', 'mimic', 'impersonate', 'recite', 'copy', 'hold',
  'stand', 'text', 'call', 'count', 'pretend', 'whisper', 'tap', 'dance',
  'speak', 'put', 'open', 'prove', 'sort', 'do', 'recreate', 'play', 'sell',
])
const isImperative = (t: string) => IMPERATIVE.has(firstWord(t))

const VAGUE: [RegExp, string][] = [
  [/\bsomething\b/i, 'vague payload "something"'],
  [/\banything\b/i, 'vague payload "anything"'],
  [/\ba thing\b/i, 'vague payload "a thing"'],
  [/\bone thing\b/i, 'vague payload "one thing"'],
  [/\bstuff\b/i, 'vague payload "stuff"'],
  [/\bsome thing\b/i, 'vague payload "some thing"'],
  [/\bkind of thing\b/i, 'vague payload "kind of thing"'],
]

/** Verb + bare "it" with no antecedent: "want it", "do it", "are you into it". */
const VAGUE_IT =
  /\b(do|does|did|done|doing|want|wants|wanted|say|says|said|try|tries|tried|like|likes|liked|into)\s+it\b/i

/** Content policy: never make a player disclose status they cannot choose. */
const POLICY: [RegExp, string][] = [
  [
    /\b(money|salary|salaries|income|wage|wages|net worth|bank balance|bank account|paycheck)\b/i,
    'policy: a player\u2019s finances',
  ],
  [/\b(weight|overweight|obese|body fat|fat shaming)\b/i, 'policy: a player\u2019s body'],
  [
    /\b(diagnos\w*|medication|disorder|disabled|autis\w*|schizo\w*)\b/i,
    'policy: a player\u2019s health',
  ],
]

// ---- the tone gate ----------------------------------------------------------
/**
 * HARD PROFANITY. Banned from Family and Friends outright; allowed on Boys.
 * Word-boundary matched so "class" is not "ass" and "Scunthorpe" is not a bug.
 */
const PROFANITY =
  /\b(f+u+c+k\w*|shit\w*|bullshit|bitch\w*|bastard\w*|dick\w*|cock\w*|pussy|cunt\w*|asshole\w*|arsehole\w*|whore\w*|slut\w*|porn\w*|boobs?|tits?|wank\w*)\b/i

/** Sexual content and substance use. Banned from Family; fine for Friends. */
const ADULT =
  /\b(sex\w*|horny|hookups?|hook-ups?|one-night stand|drunk\w*|booze|alcohol|vodka|whisky|beer|weed|marijuana|hangover\w*)\b/i

/**
 * Dating and romance. Deliberately absent from the Family shelf.
 *
 * `ex` is spelled out rather than written as `ex-?\w+`: the greedy version
 * matched "escape", "exactly", "excuse", "exit" and "explain", which flagged six
 * perfectly innocent family cards. Word boundaries only.
 */
const ROMANCE = /\b(dating|crush\w*|girlfriends?|boyfriends?|ex|exes|kiss\w*)\b/i

/**
 * The gate itself. Explicit per vibe rather than a shared "mild" list, so adding
 * a shelf means making a decision rather than inheriting one by accident.
 */
const TONE: Record<Vibe, { label: string; rules: [RegExp, string][] }> = {
  family: {
    label: 'family = zero profanity, zero adult content, no romance',
    rules: [
      [PROFANITY, 'family shelf must be completely clean'],
      [ADULT, 'family shelf must not mention sex or substances'],
      [ROMANCE, 'family shelf must not mention dating or crushes'],
    ],
  },
  friends: {
    label: 'friends = no hard profanity, nothing explicit',
    rules: [
      [PROFANITY, 'friends shelf must not swear'],
      [/\b(porn\w*|hookup|hook-up|one-night)\b/i, 'friends shelf must not get explicit'],
    ],
  },
  boys: { label: 'boys = 18+, no tone restriction', rules: [] },
}

// ---- load -------------------------------------------------------------------
const pools: { vibe: Vibe; name: Pool; cards: Card[] }[] = VIBES.flatMap((vibe) => {
  const pack = poolFor(vibe)
  return [
    { vibe, name: 'question' as Pool, cards: pack.questions as Card[] },
    { vibe, name: 'dare' as Pool, cards: pack.dares as Card[] },
    { vibe, name: 'callout' as Pool, cards: pack.callouts as Card[] },
  ]
})

// ---- rules ------------------------------------------------------------------
function checkText(card: Card, pool: Pool, vibe: Vibe) {
  const t = card.text
  const n = words(t).length

  // length window — too short is vague, too long is an essay
  if (n < WORD_MIN) fail('length', card, `only ${n} words (min ${WORD_MIN})`)
  if (n > WORD_MAX) fail('length', card, `${n} words (max ${WORD_MAX}) — essay, not a card`)

  // shape
  if (!/^[A-Z0-9"]/.test(t.trim())) fail('shape', card, 'does not start with a capital')
  if (pool === 'question') {
    if (!t.includes('?') && !isImperative(t))
      fail('shape', card, 'asks nothing — no "?" and not an imperative prompt')
  } else if (t.trim().endsWith('?') && !isImperative(t)) {
    fail('shape', card, 'a dare/call-out must be an instruction, not a question')
  }

  // punctuation — an instruction is not a question. 38 Friends cards ended in
  // "?" purely because "point at" used to fail the shape gate without one.
  if (isImperative(t) && t.trim().endsWith('?'))
    fail('punct', card, 'an instruction ending in "?" — end it with a period')

  // vague language
  for (const [re, why] of VAGUE) if (re.test(t)) fail('vague', card, why)
  if (VAGUE_IT.test(t)) fail('vague-it', card, 'bare "it" with no antecedent')

  // policy — global, and deliberately NOT relaxed for Boys
  for (const [re, why] of POLICY) if (re.test(t)) fail('policy', card, why)

  // tone — per shelf
  for (const [re, why] of TONE[vibe].rules) if (re.test(t)) fail(`tone:${vibe}`, card, why)
}

function checkPool({ vibe, name, cards }: { vibe: Vibe; name: Pool; cards: Card[] }) {
  for (const card of cards) checkText(card, name, vibe)

  if (cards.length < MIN_CARDS[name]) {
    violations.push(
      `[volume] ${vibe}/${name} — only ${cards.length} cards (min ${MIN_CARDS[name]})`,
    )
  }

  // duplicate text within the pool
  const seen = new Map<string, string>()
  for (const c of cards) {
    const k = norm(c.text)
    if (seen.has(k)) fail('duplicate', c, `same text as ${seen.get(k)}`)
    else seen.set(k, c.id)
  }

  // template fatigue: over-reliance on one opening shape
  const buckets = new Map<string, Card[]>()
  for (const c of cards) {
    const base = norm(c.text)
    const key = words(base).slice(0, 4).join(' ')
    buckets.set(key, [...(buckets.get(key) ?? []), c])
  }
  const cap = Math.max(TEMPLATE_FLOOR, Math.ceil(cards.length * TEMPLATE_SHARE))
  for (const [key, group] of buckets) {
    if (group.length > cap) {
      fail(
        'template',
        group[0],
        `"${key} …" opens ${group.length} of ${cards.length} ${vibe} ${name}s (cap ${cap}) — e.g. ${group
          .slice(0, 3)
          .map((c) => c.id)
          .join(', ')}`,
      )
    }
  }

  stats.push(
    `  ${vibe.padEnd(8)} ${name.padEnd(9)} ${String(cards.length).padStart(3)} cards   ${TONE[vibe].label}`,
  )

  // ---- idea duplicates ------------------------------------------------------
  // Text-level dedupe misses the real repeats: three Boys cards were all "the
  // most embarrassing thing you have done to impress someone", differing only
  // in the noun. Compare the ideas, not the strings.
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const { score, shared } = ideaOverlap(cards[i].text, cards[j].text)
      if (score >= 0.6 && shared >= 4)
        fail('idea-dup', cards[i], `same idea as ${cards[j].id} (overlap ${score.toFixed(2)})`)
    }
  }

  // ---- verb spread ----------------------------------------------------------
  // "Let the group…" was a quarter of the Friends dares. Same joke, same verb.
  const verbCap =
    name === 'dare'
      ? Math.ceil(cards.length * DARE_VERB_SHARE)
      : name === 'callout'
        ? Math.ceil(cards.length * CALLOUT_VERB_SHARE)
        : Infinity
  if (Number.isFinite(verbCap)) {
    const byVerb = new Map<string, Card[]>()
    for (const c of cards) {
      const v = firstWord(c.text)
      byVerb.set(v, [...(byVerb.get(v) ?? []), c])
    }
    for (const [verb, group] of byVerb) {
      if (group.length > verbCap)
        fail(
          'verb-spread',
          group[0],
          `"${verb} …" opens ${group.length} of ${cards.length} ${vibe} ${name}s (cap ${verbCap})`,
        )
    }
  }

  if (name !== 'question') return

  // ---- answer-shape mix -----------------------------------------------------
  const byShape = new Map<Shape, Card[]>()
  for (const c of cards) {
    const s = shapeOf(c.text)
    byShape.set(s, [...(byShape.get(s) ?? []), c])
  }
  const shapeCap = Math.ceil(cards.length * SHAPE_SHARE)
  for (const [shape, group] of byShape) {
    if (group.length > shapeCap)
      fail(
        'shape-share',
        group[0],
        `${shape} is ${group.length} of ${cards.length} ${vibe} questions (cap ${shapeCap}) — the table plays the same round twice`,
      )
  }

  // ---- the nominate monoculture --------------------------------------------
  const nominate = cards.filter((c) => NOMINATE_OPENER.test(c.text.trim()))
  const nominateCap = Math.ceil(cards.length * NOMINATE_SHARE)
  if (nominate.length > nominateCap)
    fail(
      'nominate-share',
      nominate[0],
      `${nominate.length} of ${cards.length} ${vibe} questions answer with a name (cap ${nominateCap})`,
    )
  for (const c of nominate) {
    if (!FOLLOW_UP.test(c.text))
      fail(
        'follow-up',
        c,
        'a nominate card with no second clause — the answer is one name and the turn is over',
      )
  }

  // ---- intensity ladder -----------------------------------------------------
  const tier3 = cards.filter((c) => (c.intensity ?? 1) === 3).length
  const tier2 = cards.filter((c) => (c.intensity ?? 1) === 2).length
  const tier1 = cards.length - tier2 - tier3
  if (tier1 < cards.length * TIER1_SHARE)
    fail(
      'intensity-spread',
      cards[0],
      `only ${tier1} of ${cards.length} ${vibe} questions are tier 1 (need ${Math.ceil(cards.length * TIER1_SHARE)}) — the shelf starts at maximum heat`,
    )
  if (tier3 < cards.length * TIER3_SHARE)
    fail(
      'intensity-spread',
      cards[0],
      `only ${tier3} of ${cards.length} ${vibe} questions are tier 3 (need ${Math.ceil(cards.length * TIER3_SHARE)}) — the escalation is fiction`,
    )
  if (tier2 < cards.length * TIER2_SHARE)
    fail(
      'intensity-spread',
      cards[0],
      `only ${tier2} of ${cards.length} ${vibe} questions are tier 2 (need ${Math.ceil(cards.length * TIER2_SHARE)})`,
    )

  // ---- length spread --------------------------------------------------------
  const lens = cards.map((c) => words(c.text).length)
  const short = lens.filter((n) => n <= SHORT_WORDS).length
  const long = lens.filter((n) => n >= LONG_WORDS).length
  if (short < cards.length * SHORT_SHARE)
    fail(
      'length-spread',
      cards[0],
      `only ${short} of ${cards.length} ${vibe} questions are ${SHORT_WORDS} words or fewer — no punch, one rhythm`,
    )
  if (long < cards.length * LONG_SHARE)
    fail(
      'length-spread',
      cards[0],
      `only ${long} of ${cards.length} ${vibe} questions are ${LONG_WORDS}+ words — no scene-setters, one rhythm`,
    )
}

// ---- cross-shelf duplicates -------------------------------------------------
/**
 * A card must live on exactly one shelf. The same text on two shelves is not a
 * style issue: it means one of them was copy-pasted instead of written, and the
 * shelf that got the copy is almost always the wrong tone.
 */
function checkCrossShelf() {
  const seen = new Map<string, string>()
  for (const { vibe, name, cards } of pools) {
    for (const c of cards) {
      const k = norm(c.text)
      const prior = seen.get(k)
      if (prior) fail('cross-shelf', c, `also on ${prior} (duplicate across vibes)`)
      else seen.set(k, `${vibe}/${name}`)
    }
  }
}

// ---- run --------------------------------------------------------------------
for (const pool of pools) checkPool(pool)
checkCrossShelf()

// ---- commentator voice ------------------------------------------------------
// The host's barks are content too, and fail the same ways: empty, typo'd,
// duplicated, or quoting a mood the UI has no styling for. They are also the one
// piece of copy the player cannot escape, so they must be shelf-neutral: scrubbed
// against the strictest tone gate (Family), not the loosest.
const QUIP_MIN = 3
const QUIP_MAX = 90
const QUIP_END = /[.!?]$/
const quipSeen = new Map<string, string>()
let quipCount = 0

function checkQuip(where: string, quip: Quip) {
  quipCount++
  const t = quip.text.trim()
  if (t.length < QUIP_MIN) violations.push(`[quip-short] ${where} — "${t}"`)
  if (t.length > QUIP_MAX) violations.push(`[quip-long] ${where} — ${t.length} chars: "${t}"`)
  if (!/^[A-Z0-9]/.test(t)) violations.push(`[quip-shape] ${where} — not capitalised: "${t}"`)
  if (!QUIP_END.test(t)) violations.push(`[quip-shape] ${where} — no terminal punctuation: "${t}"`)
  if (/\s{2,}/.test(t)) violations.push(`[quip-space] ${where} — double space: "${t}"`)
  if (!MOODS.includes(quip.mood))
    violations.push(`[quip-mood] ${where} — unknown mood "${quip.mood}"`)
  if (PROFANITY.test(t) || ADULT.test(t)) {
    violations.push(`[quip-tone] ${where} — the host speaks to every shelf: "${t}"`)
  }
  const key = t.toLowerCase()
  const prior = quipSeen.get(key)
  if (prior) violations.push(`[quip-dupe] ${where} — same as ${prior}: "${t}"`)
  else quipSeen.set(key, where)
}

for (const quip of CARD_QUIPS) checkQuip('card-quip', quip)
for (const [event, quips] of Object.entries(EVENT_QUIPS)) {
  if (quips.length < 3) violations.push(`[quip-pool] ${event} — only ${quips.length} event quips (min 3)`)
  for (const quip of quips) checkQuip(`event:${event}`, quip)
}
stats.push(`  ${'commentator'.padEnd(18)} ${String(quipCount).padStart(3)} quips`)

console.log('content lint')
console.log(stats.join('\n'))
console.log(
  `\n${pools.length} pools · ${pools.reduce((n, p) => n + p.cards.length, 0)} cards · ${VIBES.length} vibes`,
)

if (violations.length === 0) {
  console.log('\nALL CLEAN — no mechanical quality violations.\n')
  process.exit(0)
}

console.log(`\n${violations.length} VIOLATION(S):\n`)
console.log(violations.join('\n'))
console.log('')
process.exit(1)
