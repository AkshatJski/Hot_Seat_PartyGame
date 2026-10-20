/**
 * Dumps every card in the app to CONTENT-DUMP.txt — questions, dares,
 * call-out dares and wildcards. Throwaway utility for eyeballing the content.
 *
 *   npx tsx --tsconfig tsconfig.scripts.json scripts/dump-content.ts
 */
import { writeFileSync } from 'node:fs'
import { ALL_CALL_OUT_DARES, ALL_DARES, ALL_QUESTIONS } from '../src/data/decks'
import { WILDCARDS } from '../src/data/wildcards'

const lines: string[] = []
const rule = (c = '-') => lines.push(c.repeat(64))

rule('=')
lines.push('TRUTH OR SWIPE — FULL CONTENT DUMP')
rule('=')
lines.push('')

lines.push(`QUESTIONS (${ALL_QUESTIONS.length})`)
rule()
ALL_QUESTIONS.forEach((q, i) => lines.push(`${i + 1}. ${q.text}   [intensity ${q.intensity}]`))
lines.push('')

lines.push(`DARES (${ALL_DARES.length})`)
rule()
ALL_DARES.forEach((d, i) => lines.push(`${i + 1}. ${d.text}   [intensity ${d.intensity}]`))
lines.push('')

lines.push(`CALL OUT DARES (${ALL_CALL_OUT_DARES.length})`)
rule()
ALL_CALL_OUT_DARES.forEach((c, i) => lines.push(`${i + 1}. ${c.text}   [intensity ${c.intensity}]`))
lines.push('')

lines.push(`WILDCARDS (${WILDCARDS.length})`)
rule()
WILDCARDS.forEach((w, i) => lines.push(`${i + 1}. ${w}`))
lines.push('')

rule('=')
lines.push(
  `TOTAL: ${ALL_QUESTIONS.length} questions + ${ALL_DARES.length} dares + ` +
    `${ALL_CALL_OUT_DARES.length} call-out dares + ${WILDCARDS.length} wildcards`,
)
rule('=')

writeFileSync('CONTENT-DUMP.txt', lines.join('\n') + '\n', 'utf8')
console.log(`Wrote CONTENT-DUMP.txt (${lines.length} lines)`)
