/**
 * CONTENT LINTER — the objective quality gate for every card in the flat pool.
 *
 * Categories are gone: there is ONE question pool, ONE dare pool and ONE
 * call-out pool. The linter now checks those flat pools plus the host's voice.
 *
 * Run:  npm run lint:content   (also part of `npm run check`)
 */
import { ALL_CALL_OUT_DARES, ALL_DARES, ALL_QUESTIONS } from '../src/data/decks'
import { CARD_QUIPS, EVENT_QUIPS, MOODS, type Quip } from '../src/data/commentary'

type Pool = 'question' | 'dare' | 'callout'

interface Card {
  id: string
  text: string
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

// "Would You Rather" no longer exists as a deck, so no genre is exempt from the
// opener-variety check.
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
const pools: { name: Pool; cards: Card[] }[] = [
  { name: 'question', cards: ALL_QUESTIONS as Card[] },
  { name: 'dare', cards: ALL_DARES as Card[] },
  { name: 'callout', cards: ALL_CALL_OUT_DARES as Card[] },
]

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

function checkPool({ name, cards }: { name: Pool; cards: Card[] }) {
  for (const card of cards) checkText(card, name)

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
        `"${key} …" opens ${group.length} of ${cards.length} ${name}s (cap ${cap}) — e.g. ${group
          .slice(0, 3)
          .map((c) => c.id)
          .join(', ')}`,
      )
    }
  }

  stats.push(`  ${name.padEnd(12)} ${String(cards.length).padStart(3)} cards`)
}

// ---- run --------------------------------------------------------------------
for (const pool of pools) checkPool(pool)

// ---- commentator voice ------------------------------------------------------
// The host's barks are content too, and fail the same ways: empty, typo'd,
// duplicated, or quoting a mood the UI has no styling for.
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
stats.push(`  ${'commentator'.padEnd(12)} ${String(quipCount).padStart(3)} quips`)

console.log('content lint')
console.log(stats.join('\n'))
console.log(
  `\n${pools.length} pools · ${pools.reduce((n, p) => n + p.cards.length, 0)} cards`,
)

if (violations.length === 0) {
  console.log('\nALL CLEAN — no mechanical quality violations.\n')
  process.exit(0)
}

console.log(`\n${violations.length} VIOLATION(S):\n`)
console.log(violations.join('\n'))
console.log('')
process.exit(1)
