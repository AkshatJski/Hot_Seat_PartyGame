/**
 * Dumps every card on every shelf to CONTENT-DUMP.txt — questions, dares and
 * call-out dares, grouped by vibe. Throwaway utility for eyeballing content
 * (and for printing a shelf to proofread it away from the editor).
 *
 *   npx tsx --tsconfig tsconfig.scripts.json scripts/dump-content.ts
 */
import { writeFileSync } from 'node:fs'
import { VIBES, poolFor } from '../src/data/decks'

const lines: string[] = []
const rule = (c = '-') => lines.push(c.repeat(64))

rule('=')
lines.push('TRUTH OR SWIPE — FULL CONTENT DUMP')
rule('=')
lines.push('')

let total = 0

for (const vibe of VIBES) {
  const pack = poolFor(vibe)
  const count = pack.questions.length + pack.dares.length + pack.callouts.length
  total += count

  lines.push('')
  rule('=')
  lines.push(`${vibe.toUpperCase()} (${count} cards)`)
  rule('=')

  lines.push(`\nQUESTIONS (${pack.questions.length})`)
  rule()
  pack.questions.forEach((q, i) => lines.push(`${i + 1}. ${q.text}   [intensity ${q.intensity}]`))

  lines.push(`\nDARES (${pack.dares.length})`)
  rule()
  pack.dares.forEach((d, i) => lines.push(`${i + 1}. ${d.text}   [intensity ${d.intensity}]`))

  lines.push(`\nCALL OUT DARES (${pack.callouts.length})`)
  rule()
  pack.callouts.forEach((c, i) => lines.push(`${i + 1}. ${c.text}   [intensity ${c.intensity}]`))
  lines.push('')
}

rule('=')
lines.push(`TOTAL: ${total} cards across ${VIBES.length} vibes`)
rule('=')

writeFileSync('CONTENT-DUMP.txt', lines.join('\n') + '\n', 'utf8')
console.log(`Wrote CONTENT-DUMP.txt (${lines.length} lines, ${total} cards)`)
