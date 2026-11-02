/**
 * IMPORT PIPELINE — the front door for outside writers.
 *
 * Outside writers (agents or people) work from CONTENT-BRIEF.md and hand back a
 * JSON array per shelf. This script is the bouncer: it applies the *same* rules
 * as the content gate, adds the checks a writer cannot see (duplicates against
 * the shipped packs), and emits a human reading sheet. It never edits a pack
 * itself — curation stays a decision, not a side effect.
 *
 *   npm run import:content content/inbox/boys-01.json
 *
 * Output:
 *   content/review/<file>.md   the reading sheet + paste-ready card block
 *   stdout                     accepted / rejected counts and every reason
 *
 * Rejections are cheap and expected. Roughly half of a good submission is cut.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { VIBES, poolFor } from '../src/data/decks'
import type { Vibe } from '../src/types'
import { ideaOverlap } from './content-shapes'
import {
  FOLLOW_UP,
  LAZY_OPENER,
  NOMINATE_OPENER,
  POLICY,
  TONE,
  VAGUE,
  VAGUE_IT,
  WORD_MAX,
  WORD_MIN,
  firstWord,
  isEmbodied,
  norm,
  words,
} from './content-rules'

type Kind = 'question' | 'dare' | 'callout'
type Stage = 1 | 2 | 3

interface Candidate {
  shelf: Vibe
  kind: Kind
  stage: Stage
  text: string
  needs?: 'none' | 'phone' | 'room' | 'prop'
  why: string
}

interface Shipped {
  shelf: Vibe
  kind: Kind
  text: string
  id: string
}

const KINDS: Kind[] = ['question', 'dare', 'callout']
const NEEDS = ['none', 'phone', 'room', 'prop']

// ---- load -------------------------------------------------------------------
const file = process.argv[2]
if (!file) {
  console.error('usage: npm run import:content <file.json>')
  process.exit(2)
}

const shipped: Shipped[] = VIBES.flatMap((shelf) => {
  const pack = poolFor(shelf)
  return [
    ...pack.questions.map((c) => ({ shelf, kind: 'question' as Kind, text: c.text, id: c.id })),
    ...pack.dares.map((c) => ({ shelf, kind: 'dare' as Kind, text: c.text, id: c.id })),
    ...pack.callouts.map((c) => ({ shelf, kind: 'callout' as Kind, text: c.text, id: c.id })),
  ]
})

/** Strip the fences people paste around JSON, then parse. */
function parse(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/, '')
    .trim()
  return JSON.parse(cleaned)
}

/** Typographic quotes and stray whitespace are normalisation, not judgement. */
function normalise(text: string): string {
  return text
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

const accepted: Candidate[] = []
const rejected: { text: string; why: string }[] = []
const seen = new Map<string, string>()

function reject(raw: unknown, why: string) {
  const text = typeof raw === 'string' ? raw : JSON.stringify(raw)
  rejected.push({ text, why })
}

function check(c: Candidate): string | null {
  const t = c.text
  const n = words(t).length

  if (!shelfOk(c.shelf)) return `unknown shelf "${c.shelf}"`
  if (!KINDS.includes(c.kind)) return `unknown kind "${c.kind}"`
  if (![1, 2, 3].includes(c.stage)) return `stage must be 1, 2 or 3 (got ${c.stage})`
  if (!c.why || !c.why.trim()) return 'missing "why" — curation needs to know what you were aiming at'

  if (t.length === 0) return 'empty text'
  if (n < WORD_MIN) return `only ${n} words (min ${WORD_MIN})`
  if (n > WORD_MAX) return `${n} words (max ${WORD_MAX}) — essay, not a card`
  if (!/^[A-Z0-9"]/.test(t)) return 'does not start with a capital'

  if (c.kind === 'question') {
    if (!t.includes('?')) return 'a question must contain a "?"'
    if (isEmbodied(t)) return 'opens with a performance verb — that is a dare, not a question'
    if (LAZY_OPENER.test(t)) return 'lazy opener ("the most X you have ever Y")'
    if (NOMINATE_OPENER.test(t) && !FOLLOW_UP.test(t))
      return 'nominate card with no second clause — the answer is one name'
  } else {
    if (t.endsWith('?')) return 'a dare/call-out is an instruction, not a question'
  }

  for (const [re, why] of VAGUE) if (re.test(t)) return why
  if (VAGUE_IT.test(t)) return 'bare "it" with no antecedent'
  for (const [re, why] of POLICY) if (re.test(t)) return why
  for (const [re, why] of TONE[c.shelf].rules) if (re.test(t)) return why

  const key = `${c.shelf}|${norm(t)}`
  const prior = seen.get(key)
  if (prior) return `duplicate of another card in this file: "${prior}"`

  for (const s of shipped) {
    if (norm(s.text) === norm(t)) return `already shipped as ${s.shelf}/${s.kind} ${s.id}`
    const { score, shared } = ideaOverlap(t, s.text)
    if (score >= 0.6 && shared >= 4)
      return `near-duplicate of ${s.shelf}/${s.kind} ${s.id} (overlap ${score.toFixed(2)}) — "${s.text}"`
  }

  return null
}

function shelfOk(v: unknown): v is Vibe {
  return typeof v === 'string' && (VIBES as string[]).includes(v)
}

// ---- run --------------------------------------------------------------------
let payload: unknown
try {
  payload = parse(readFileSync(file, 'utf8'))
} catch (err) {
  console.error(`could not read ${file} as JSON: ${(err as Error).message}`)
  process.exit(1)
}

if (!Array.isArray(payload)) {
  console.error('expected a JSON array of cards at the top level')
  process.exit(1)
}

for (const raw of payload) {
  if (typeof raw !== 'object' || raw === null) {
    reject(raw, 'not an object')
    continue
  }
  const o = raw as Record<string, unknown>
  const shelf = o.shelf
  const kind = o.kind
  const stage = Number(o.stage)
  const text = typeof o.text === 'string' ? normalise(o.text) : ''
  const needs = o.needs === undefined ? 'none' : String(o.needs)

  if (!shelfOk(shelf)) {
    reject(text || JSON.stringify(raw), `unknown shelf "${String(shelf)}"`)
    continue
  }
  if (!KINDS.includes(kind as Kind)) {
    reject(text || JSON.stringify(raw), `unknown kind "${String(kind)}"`)
    continue
  }
  if (!NEEDS.includes(needs)) {
    reject(text || JSON.stringify(raw), `unknown needs "${needs}" (use none|phone|room|prop)`)
    continue
  }
  if (![1, 2, 3].includes(stage)) {
    reject(text || JSON.stringify(raw), `stage must be 1, 2 or 3 (got ${String(o.stage)})`)
    continue
  }

  const candidate: Candidate = {
    shelf,
    kind: kind as Kind,
    stage: stage as Stage,
    text,
    needs: needs as Candidate['needs'],
    why: typeof o.why === 'string' ? o.why.trim() : '',
  }

  const problem = check(candidate)
  if (problem) {
    reject(text || JSON.stringify(raw), problem)
    continue
  }
  seen.set(`${candidate.shelf}|${norm(candidate.text)}`, candidate.text)
  accepted.push(candidate)
}

// ---- report -----------------------------------------------------------------
const byShelf = new Map<string, Candidate[]>()
for (const c of accepted) byShelf.set(c.shelf, [...(byShelf.get(c.shelf) ?? []), c])

const stageCount = (list: Candidate[], s: Stage) => list.filter((c) => c.stage === s).length
const pct = (n: number, d: number) => (d === 0 ? '0%' : `${Math.round((n / d) * 100)}%`)

const lines: string[] = []
lines.push(`# Reading sheet — ${basename(file)}`)
lines.push('')
lines.push(`Source: \`${file}\`  ·  accepted **${accepted.length}**  ·  rejected **${rejected.length}**`)
lines.push('')
lines.push('This file is generated by `scripts/import-content.ts`. Curation is manual:')
lines.push('mark the ones you want, then paste the block at the bottom into the pack.')
lines.push('')

for (const [shelf, list] of byShelf) {
  lines.push(`## ${shelf} — ${list.length} card(s)`)
  lines.push('')
  lines.push(
    `Stage mix: 1 → ${stageCount(list, 1)} (${pct(stageCount(list, 1), list.length)}) · ` +
      `2 → ${stageCount(list, 2)} (${pct(stageCount(list, 2), list.length)}) · ` +
      `3 → ${stageCount(list, 3)} (${pct(stageCount(list, 3), list.length)}). Target ≈ 25 / 50 / 25.`,
  )
  lines.push('')
  for (const kind of KINDS) {
    const cards = list.filter((c) => c.kind === kind)
    if (cards.length === 0) continue
    lines.push(`### ${kind} (${cards.length})`)
    lines.push('')
    lines.push('| # | Stage | Needs | Card | Why it should land |')
    lines.push('|---|---|---|---|---|')
    cards.forEach((c, i) => {
      const text = c.text.replace(/\|/g, '\\|')
      const why = c.why.replace(/\|/g, '\\|')
      lines.push(`| ${i + 1} | ${c.stage} | ${c.needs} | ${text} | ${why} |`)
    })
    lines.push('')
  }
}

if (rejected.length) {
  lines.push(`## Rejected (${rejected.length})`)
  lines.push('')
  lines.push('| Card | Reason |')
  lines.push('|---|---|')
  for (const r of rejected) {
    lines.push(`| ${r.text.replace(/\|/g, '\\|')} | ${r.why.replace(/\|/g, '\\|')} |`)
  }
  lines.push('')
}

const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
lines.push('## Paste block')
lines.push('')
lines.push('Accepted cards, in pack syntax, grouped by shelf and pool.')
lines.push('')
for (const [shelf, list] of byShelf) {
  lines.push(`### ${shelf}`)
  lines.push('')
  for (const kind of ['question', 'dare', 'callout'] as Kind[]) {
    const cards = list.filter((c) => c.kind === kind)
    if (cards.length === 0) continue
    const fn = kind === 'question' ? 'q' : kind === 'dare' ? 'd' : 'c'
    lines.push(`\`\`\`ts`)
    for (const c of cards) lines.push(`  ${fn}('${esc(c.text)}', ${c.stage}),`)
    lines.push('```')
    lines.push('')
  }
}

const outDir = 'content/review'
mkdirSync(outDir, { recursive: true })
const outFile = join(outDir, `${basename(file).replace(/\.[^.]+$/, '')}.md`)
writeFileSync(outFile, lines.join('\n'))

console.log(`import: ${basename(file)}`)
console.log(`  accepted ${accepted.length}  ·  rejected ${rejected.length}`)
for (const [shelf, list] of byShelf) {
  console.log(
    `  ${shelf.padEnd(8)} ${String(list.length).padStart(3)} card(s)   stage 1/2/3 = ` +
      `${stageCount(list, 1)}/${stageCount(list, 2)}/${stageCount(list, 3)}`,
  )
}
if (rejected.length) {
  console.log('\nrejected:')
  for (const r of rejected.slice(0, 40)) console.log(`  ✗ ${r.text} — ${r.why}`)
  if (rejected.length > 40) console.log(`  … and ${rejected.length - 40} more (see the sheet)`)
}
console.log(`\nreading sheet: ${outFile}`)
console.log('next: npm run lint:content after pasting the kept cards into the pack')

if (accepted.length === 0) process.exit(1)
