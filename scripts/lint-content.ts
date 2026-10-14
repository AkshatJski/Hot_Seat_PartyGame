/**
 * CONTENT LINTER — the objective quality gate for every card in every deck.
 *
 * The store/render suites prove the game *works*. They say nothing about whether
 * a card is any good. This does, as far as a machine can: it enforces the
 * mechanical half of the card rubric — the half that produced the "vague /
 * incomplete / grammatically broken" cards in the first place.
 *
 * Run:  npm run lint:content   (also part of `npm run check`)
 *
 * Rules are deliberately mechanical. "Is this funny?" cannot be automated. But
 * "does this have a hole where the content should be", "is this the same sentence
 * shape 30 times", "does this ask a player to disclose their finances" — all can,
 * and those are the failures that shipped.
 *
 * The gate is only useful if it is *right*, so it deliberately allows the
 * legitimate card genres (imperative prompts, general-opinion questions) and the
 * inherently monotone Would-You-Rather format. A gate that cries wolf gets ignored.
 */
import { DECKS, callOutDaresFor, daresFor, questionsFor } from '../src/data/decks'
import type { DeckId } from '../src/types'

type Pool = 'question' | 'dare' | 'callout'

interface Card {
  id: string
  deck: DeckId
  text: string
}

const violations: string[] = []
const stats: string[] = []

function fail(rule: string, card: Card, why: string) {
  violations.push(`[${rule}] ${card.id} (${card.deck}) — ${why}\n          "${card.text}"`)
}

const norm = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean)
const firstWord = (t: string) => words(norm(t))[0] ?? ''

// ---- thresholds -------------------------------------------------------------
const WORD_MIN = 5
const WORD_MAX = 30
/** No single opening-4-words bucket may exceed this share of a deck+pool. */
const TEMPLATE_SHARE = 0.12
const TEMPLATE_FLOOR = 4
/** A question deck should not be one shape repeated. */
const MIN_OPENERS = 4

// ---- card shapes ------------------------------------------------------------
// A card is a valid prompt if it asks something (contains "?") or opens with an
// imperative verb: "Describe your ideal Sunday." is a card, not a broken question.
const IMPERATIVE = new Set([
  'describe', 'rate', 'pick', 'say', 'tell', 'name', 'rank', 'list', 'invent',
  'give', 'choose', 'explain', 'imagine', 'act', 'make', 'assign', 'guess',
  'admit', 'confess', 'pitch', 'write', 'draw', 'roast', 'defend', 'argue',
  'share', 'read', 'spell', 'design', 'cast', 'create', 'show', 'answer',
  'deliver', 'announce', 'perform', 'improvise', 'narrate', 'recount', 'swap',
])
const isImperative = (t: string) => IMPERATIVE.has(firstWord(t))

// "Would You Rather" is one question by construction — its monotony is the
// format, so it is exempt from the opener-variety check, and its prefix is
// stripped before template bucketing (the real repetition is what *follows*
// "would you rather").
const MONO_GENRE = new Set<DeckId>(['dilemmas'])
const TEMPLATE_PREFIX: Partial<Record<DeckId, RegExp>> = {
  dilemmas: /^would you rather\s+/i,
}

// ---- banned language --------------------------------------------------------
// The placeholder words that let a card pretend to have content while having
// none. "What is something you regret?" gives the player nothing to aim at.
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

// ---- load -------------------------------------------------------------------
const decks: { id: DeckId; questions: Card[]; dares: Card[]; callouts: Card[] }[] =
  DECKS.map((d) => ({
    id: d.id,
    questions: questionsFor([d.id]) as Card[],
    dares: daresFor([d.id]) as Card[],
    callouts: callOutDaresFor([d.id]) as Card[],
  }))

// ---- rules ------------------------------------------------------------------
function checkText(card: Card, pool: Pool) {
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

  // vague language
  for (const [re, why] of VAGUE) if (re.test(t)) fail('vague', card, why)
  if (VAGUE_IT.test(t)) fail('vague-it', card, 'bare "it" with no antecedent')

  // policy
  for (const [re, why] of POLICY) if (re.test(t)) fail('policy', card, why)
}

function checkDeck(deck: { id: DeckId; questions: Card[]; dares: Card[]; callouts: Card[] }) {
  const pools: [Pool, Card[]][] = [
    ['question', deck.questions],
    ['dare', deck.dares],
    ['callout', deck.callouts],
  ]

  for (const [pool, cards] of pools) {
    for (const card of cards) checkText(card, pool)

    // duplicate text within the pool
    const seen = new Map<string, string>()
    for (const c of cards) {
      const k = norm(c.text)
      if (seen.has(k)) fail('duplicate', c, `same text as ${seen.get(k)}`)
      else seen.set(k, c.id)
    }

    // template fatigue: over-reliance on one opening shape
    const prefix = TEMPLATE_PREFIX[deck.id]
    const buckets = new Map<string, Card[]>()
    for (const c of cards) {
      const base = prefix ? norm(c.text).replace(prefix, '') : norm(c.text)
      const key = words(base).slice(0, 4).join(' ')
      buckets.set(key, [...(buckets.get(key) ?? []), c])
    }
    const cap = Math.max(TEMPLATE_FLOOR, Math.ceil(cards.length * TEMPLATE_SHARE))
    for (const [key, group] of buckets) {
      if (group.length > cap) {
        fail(
          'template',
          group[0],
          `"${key} …" opens ${group.length} of ${cards.length} ${pool}s (cap ${cap}) — e.g. ${group
            .slice(0, 3)
            .map((c) => c.id)
            .join(', ')}`,
        )
      }
    }

    stats.push(`  ${deck.id.padEnd(12)} ${String(cards.length).padStart(3)} ${pool}s`)
  }

  if (!MONO_GENRE.has(deck.id)) {
    const openers = new Set(deck.questions.map((q) => firstWord(q.text)))
    if (openers.size < MIN_OPENERS) {
      violations.push(
        `[genre-mix] ${deck.id} — only ${openers.size} distinct question openers (min ${MIN_OPENERS}): ${[...openers].join(', ')}`,
      )
    }
  }
}

// ---- run --------------------------------------------------------------------
for (const deck of decks) checkDeck(deck)

console.log('content lint')
console.log(stats.join('\n'))
console.log(
  `\n${decks.length} decks · ${decks.reduce(
    (n, d) => n + d.questions.length + d.dares.length + d.callouts.length,
    0,
  )} cards`,
)

if (violations.length === 0) {
  console.log('\nALL CLEAN — no mechanical quality violations.\n')
  process.exit(0)
}

console.log(`\n${violations.length} VIOLATION(S):\n`)
console.log(violations.join('\n'))
console.log('')
process.exit(1)
