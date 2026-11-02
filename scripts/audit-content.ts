/**
 * CONTENT AUDIT — the measuring instrument behind `lint-content`.
 *
 * The linter is a gate: it says pass or fail. This says *what the shelf is made
 * of*: which answer shape dominates, where the intensity ladder actually sits,
 * how long the cards are, and which dares share a first verb. Run it before and
 * after a content pass — if the numbers did not move, the pass did not happen.
 *
 * It never exits non-zero. `npm run lint:content` owns the failing.
 *
 * Run:  npm run audit:content
 */
import { VIBES, poolFor } from '../src/data/decks'
import type { Vibe } from '../src/types'
import { ideaOverlap, shapeOf, SHAPES } from './content-shapes'

const pct = (n: number, d: number) => `${Math.round((100 * n) / d)}%`.padStart(4)
const words = (t: string) => t.trim().split(/\s+/).filter(Boolean)
const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
const firstWord = (t: string) => words(norm(t))[0] ?? '?'

/** "Point at whoever…" must not be answerable with a bare name. */
const NOMINATE = /^(point at|who here|who in this room|which of us|name the person)/i
const FOLLOW_UP = /,\s*\S| then \S/i

function bar(n: number, total: number) {
  const filled = Math.round((n / total) * 20)
  return '█'.repeat(filled) + '·'.repeat(20 - filled)
}

let totalCards = 0
let totalQuestions = 0

for (const vibe of VIBES as Vibe[]) {
  const pack = poolFor(vibe)
  const qs = pack.questions
  totalCards += qs.length + pack.dares.length + pack.callouts.length
  totalQuestions += qs.length

  console.log(`\n══ ${vibe.toUpperCase()} ${'═'.repeat(Math.max(0, 54 - vibe.length))}`)
  console.log(
    `   ${qs.length} questions · ${pack.dares.length} dares · ${pack.callouts.length} call-outs`,
  )

  // ---- shape mix -----------------------------------------------------------
  const shapes = new Map<string, number>()
  for (const q of qs) {
    const s = shapeOf(q.text)
    shapes.set(s, (shapes.get(s) ?? 0) + 1)
  }
  console.log('\n   answer shape')
  for (const s of SHAPES) {
    const n = shapes.get(s) ?? 0
    if (n === 0 && s === 'other') continue
    console.log(`     ${s.padEnd(9)} ${String(n).padStart(3)}  ${pct(n, qs.length)}  ${bar(n, qs.length)}`)
  }

  // ---- nominates without a follow-up --------------------------------------
  const nom = qs.filter((q) => NOMINATE.test(q.text.trim()))
  const bare = nom.filter((q) => !FOLLOW_UP.test(q.text))
  console.log(
    `\n   nominate-a-person ${nom.length}/${qs.length} (${pct(nom.length, qs.length).trim()}) · ${bare.length} with no follow-up clause`,
  )

  // ---- intensity ----------------------------------------------------------
  const tiers = [1, 2, 3].map((i) => qs.filter((q) => (q.intensity ?? 1) === i).length)
  console.log(
    `\n   intensity 1/2/3      ${tiers.map((n, i) => `${n} (${pct(n, qs.length).trim()})`).join(' / ')}`,
  )

  // ---- length -------------------------------------------------------------
  const lens = qs.map((q) => words(q.text).length).sort((a, b) => a - b)
  const short = lens.filter((n) => n <= 8).length
  const long = lens.filter((n) => n >= 18).length
  const median = lens[Math.floor(lens.length / 2)] ?? 0
  console.log(
    `   length               min ${lens[0]} · median ${median} · max ${lens[lens.length - 1]} · ${short} short (≤8) · ${long} long (≥18)`,
  )

  // ---- punctuation --------------------------------------------------------
  const punct = qs.filter((q) => /[.!]$/.test(q.text.trim()) === false && !q.text.trim().endsWith('?'))
  const imperativeQ = qs.filter((q) => q.text.trim().endsWith('?') && isImperativeQuestion(q.text))
  console.log(
    `   punctuation          ${imperativeQ.length} instructions ending in "?" · ${punct.length} with no terminal mark`,
  )

  // ---- idea duplicates ----------------------------------------------------
  const pairs: string[] = []
  for (let i = 0; i < qs.length; i++) {
    for (let j = i + 1; j < qs.length; j++) {
      const { score, shared } = ideaOverlap(qs[i].text, qs[j].text)
      if (score >= 0.6 && shared >= 4) pairs.push(`${qs[i].id} ~ ${qs[j].id} (${score.toFixed(2)})`)
    }
  }
  console.log(`   idea duplicates      ${pairs.length} pair(s) at Jaccard ≥ 0.6`)
  for (const p of pairs.slice(0, 6)) console.log(`     ${p}`)

  // ---- verb spread in dares and call-outs ---------------------------------
  for (const [name, cards] of [
    ['dare', pack.dares],
    ['call-out', pack.callouts],
  ] as const) {
    const counts = new Map<string, number>()
    for (const c of cards) {
      const v = firstWord(c.text)
      counts.set(v, (counts.get(v) ?? 0) + 1)
    }
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    console.log(
      `   ${name.padEnd(9)} verbs      ` +
        top.map(([v, n]) => `${v} ${n} (${pct(n, cards.length).trim()})`).join(' · '),
    )
  }
}

/** Same shortcut the linter uses: an instruction is not a question. */
function isImperativeQuestion(t: string) {
  const v = firstWord(t)
  return [
    'point', 'name', 'describe', 'rank', 'rate', 'pick', 'say', 'tell', 'list',
    'give', 'choose', 'explain', 'invent', 'act', 'make', 'assign', 'guess',
    'admit', 'confess', 'pitch', 'write', 'draw', 'roast', 'defend', 'argue',
    'share', 'read', 'spell', 'design', 'cast', 'create', 'show', 'answer',
    'deliver', 'announce', 'perform', 'improvise', 'narrate', 'recount', 'swap',
    'sing', 'hum', 'mime', 'mimic', 'impersonate', 'recite', 'copy', 'hold',
    'stand', 'text', 'call', 'count', 'pretend', 'whisper',
  ].includes(v)
}

console.log(
  `\n── ${totalQuestions} questions, ${totalCards} cards across ${VIBES.length} shelves ──\n`,
)
