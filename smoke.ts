import { useGameStore } from './src/store/gameStore'
import { DECKS, dareTier, contentCounts, questionsFor, daresFor, callOutDaresFor } from './src/data/decks'
import { MEMES, memeForCard } from './src/data/memes'
import { verdictFor } from './src/data/verdicts'
import type { DeckId, Player } from './src/types'

const S = () => useGameStore.getState()
let failures = 0

function check(label: string, cond: boolean, extra = '') {
  if (cond) {
    console.log('  ok  ', label)
  } else {
    failures++
    console.log('  FAIL', label, extra)
  }
}

const ALL: DeckId[] = DECKS.map((d) => d.id)

console.log('content volumes')
for (const decks of [...ALL.map((d) => [d] as DeckId[]), ALL]) {
  const c = contentCounts(decks)
  console.log(`   ${decks.join('+').padEnd(38)} q=${c.questions} d=${c.dares} c=${c.callOuts}`)
}
check('all decks together has > 500 questions', contentCounts(ALL).questions > 500)
for (const deck of ALL) {
  const c = contentCounts([deck])
  check(`${deck} has enough of each pool`, c.questions >= 50 && c.dares >= 20 && c.callOuts >= 10,
    `q=${c.questions} d=${c.dares} c=${c.callOuts}`)
}
check('every registered deck id is coverable', DECKS.every((d) => contentCounts([d.id]).questions > 0),
  DECKS.map((d) => d.id).join(','))

console.log('\ncontent integrity')
function duplicates(items: { id: string; text: string }[]): string[] {
  const seen = new Map<string, string[]>()
  for (const item of items) {
    const key = item.text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    seen.set(key, [...(seen.get(key) ?? []), item.id])
  }
  return [...seen.values()].filter((ids) => ids.length > 1).map((ids) => ids.join(' | '))
}
const allQ = questionsFor(ALL)
const allD = daresFor(ALL)
const allC = callOutDaresFor(ALL)
const qDupes = duplicates(allQ)
const dDupes = duplicates(allD)
const cDupes = duplicates(allC)
check('no duplicate question text', qDupes.length === 0, qDupes.slice(0, 5).join(' / '))
check('no duplicate dare text', dDupes.length === 0, dDupes.slice(0, 5).join(' / '))
check('no duplicate call-out text', cDupes.length === 0, cDupes.slice(0, 5).join(' / '))
const allIds = [...allQ, ...allD, ...allC].map((x) => x.id)
check('no duplicate ids', new Set(allIds).size === allIds.length, `total=${allIds.length} unique=${new Set(allIds).size}`)
check('every card has text', [...allQ, ...allD, ...allC].every((x) => x.text.trim().length > 0))
check('intensity is always 1..3', [...allD, ...allC].every((x) => x.intensity >= 1 && x.intensity <= 3))
check('every card is tagged to its deck', [...allQ, ...allD, ...allC].every((x) => ALL.includes(x.deck)))

console.log('\nmeme reactions')
check('every meme has a caption and alt', MEMES.every((m) => m.caption.length > 0 && m.alt.length > 0))
check('every meme src is a local /memes asset', MEMES.every((m) => m.src.startsWith('/memes/') && (m.src.endsWith('.svg') || m.src.endsWith('.png') || m.src.endsWith('.jpg') || m.src.endsWith('.webp'))))
check('meme ids are unique', new Set(MEMES.map((m) => m.id)).size === MEMES.length)
check(
  'memes are deterministic per card',
  allQ.every((q) => memeForCard(q.id, q.deck)?.id === memeForCard(q.id, q.deck)?.id),
)
const withMeme = allQ.filter((q) => memeForCard(q.id, q.deck) !== null).length
check('a minority of cards get a reaction', withMeme > 0 && withMeme < allQ.length * 0.8, `${withMeme}/${allQ.length}`)
check('reaction coverage is not tiny', withMeme > allQ.length * 0.4, `${withMeme}/${allQ.length}`)
check(
  'spicy deck never draws a wholesome reaction',
  allQ.filter((q) => q.deck === 'spicy').every((q) => memeForCard(q.id, q.deck)?.id !== 'chefs-kiss'),
)
check('unknown deck yields no meme, no throw', memeForCard('x', 'nope' as DeckId) === null)

console.log('\ndare tier ladder')
check('0 cowards -> tier 1', dareTier(0) === 1)
check('1 coward  -> tier 1', dareTier(1) === 1)
check('2 cowards-> tier 2', dareTier(2) === 2)
check('3 cowards-> tier 2', dareTier(3) === 2)
check('4 cowards-> tier 3', dareTier(4) === 3)
check('99 cowards->tier 3', dareTier(99) === 3)

console.log('\nsetup + first draw')
S().startGame([{ name: 'A' }, { name: 'B' }, { name: 'C' }], ['icebreakers', 'destroyers'])
check('phase is playing', S().phase === 'playing')
check('three players created', S().players.length === 3)
check('a question is dealt', S().currentQuestion !== null)
check('stage is question', S().stage === 'question')
const firstQuestion = S().currentQuestion!.id

console.log('\nswipe RIGHT (answer)')
S().answer()
check('stage is answered', S().stage === 'answered')
check('card cleared', S().currentQuestion === null)
check('player A brave = 1', S().players[0].brave === 1)
check('A bestStreak = 1', S().players[0].bestStreak === 1, `got ${S().players[0].bestStreak}`)
S().acceptCallOut()
check('advanced to player B', S().turnIndex === 1)
check('new question dealt', S().currentQuestion !== null && S().currentQuestion!.id !== firstQuestion)
check('round still 1', S().round === 1)

console.log('\nswipe LEFT (skip -> dare)')
S().skip()
check('stage is dare', S().stage === 'dare')
check('a dare was loaded', S().pendingDare !== null)
check('card is flipped', S().flipped === true)
check('player B coward = 1', S().players[1].coward === 1)
check('B answerStreak reset by skip', S().players[1].answerStreak === 0, `got ${S().players[1].answerStreak}`)
check('not a call-out dare', S().pendingIsCallOut === false)
S().completeDare()
check('B daresCompleted = 1', S().players[1].daresCompleted === 1)
check('advanced to player C', S().turnIndex === 2)

console.log('\nCALL OUT on an answered question')
S().answer()
check('C brave = 1', S().players[2].brave === 1)
S().callOut()
check('stage is callout', S().stage === 'callout')
check('Brave docked back to 0', S().players[2].brave === 0, `got ${S().players[2].brave}`)
check('timesCalledOut = 1', S().players[2].timesCalledOut === 1, `got ${S().players[2].timesCalledOut}`)
check('call-out dare loaded', S().pendingDare !== null && S().pendingIsCallOut === true)
check('turn did NOT rotate', S().turnIndex === 2)
S().completeDare()
check('stage is calloutVerdict', S().stage === 'calloutVerdict')
check('C daresCompleted = 1', S().players[2].daresCompleted === 1)

console.log('\nwrong call out costs the caller')
const callerId = S().players[0].id
const braveBefore = S().players[2].brave
const callerCowardBefore = S().players[0].coward
S().penalizeCaller(callerId)
check('caller A coward +1', S().players[0].coward === callerCowardBefore + 1)
check('caller A falseAccusations = 1', S().players[0].falseAccusations === 1, `got ${S().players[0].falseAccusations}`)
check('accused Brave restored', S().players[2].brave === braveBefore + 1)
check('turn advanced to A', S().turnIndex === 0)

console.log('\naccepting a fair call out')
S().answer()
S().callOut()
S().completeDare()
const roundBefore = S().round
const turnBefore = S().turnIndex
const lastIndex = S().players.length - 1
S().acceptCallOut()
check('turn advanced', S().turnIndex !== turnBefore)
if (turnBefore === lastIndex) {
  check('round wrapped up', S().round === roundBefore + 1, `round=${S().round}`)
} else {
  check('round unchanged mid-cycle', S().round === roundBefore, `round=${S().round}`)
}

console.log('\nescalation: coward meter drives dare tier')
const s = S()
const victim = s.players[1]
useGameStore.setState({
  players: s.players.map((p) => (p.id === victim.id ? { ...p, coward: 6 } : p)),
})
useGameStore.setState({ turnIndex: 1 })
S().skip()
check('player at 7 cowards still gets a dare', S().pendingDare !== null)
check('that dare is max intensity (tier 3)', S().pendingDare?.intensity === 3, `got intensity ${S().pendingDare?.intensity}`)

console.log('\nplay to exhaustion -> burn book')
S().restart()
S().startGame([{ name: 'A' }, { name: 'B' }], ['icebreakers'])
const total = S().pool.length
let guard = 0
while (S().phase === 'playing' && guard++ < total * 3 + 20) {
  const stage = S().stage
  if (stage === 'question') S().answer()
  else if (stage === 'dare' || stage === 'callout') S().completeDare()
  else S().acceptCallOut()
}
check('game ended', S().phase === 'burnbook', `phase=${S().phase}`)
check(`consumed all ${total} questions`, S().poolIndex === total, `poolIndex=${S().poolIndex}`)
check('cardsLeft is 0', Math.max(0, S().pool.length - S().poolIndex) === 0)
check('players have scores', S().players.every((p) => p.brave + p.coward > 0))

console.log('\nrestart resets')
S().restart()
check('phase back to setup', S().phase === 'setup')
check('players cleared', S().players.length === 0)
check('pool cleared', S().pool.length === 0)

console.log('\nburn book verdict ladder')
const mk = (over: Partial<Player>): Player => ({
  id: 'x',
  name: 'X',
  brave: 0,
  coward: 0,
  daresCompleted: 0,
  timesCalledOut: 0,
  falseAccusations: 0,
  bestStreak: 0,
  answerStreak: 0,
  truthStreak: 0,
  deepestAnswered: 1,
  worstDare: 1,
  ...over,
})
const kind = (over: Partial<Player>) => verdictFor(mk(over)).kind
check('all-zero -> Ghost', kind({}) === 'ghost')
check('skips only -> Serial Flincher', kind({ coward: 3 }) === 'flincher')
check('nuclear dare -> The Reckless', kind({ brave: 1, worstDare: 3 }) === 'reckless')
check('nuclear question -> Went Nuclear', kind({ brave: 1, deepestAnswered: 3 }) === 'nuclear')
check('no skips, both -> No Regrets', kind({ brave: 3, daresCompleted: 2 }) === 'noRegrets')
check('long run -> On a Tear', kind({ brave: 1, coward: 1, bestStreak: 6 }) === 'onATear')
check('truths only, no skips -> Open Book', kind({ brave: 4 }) === 'openBook')
check('two wrong calls -> Cry Wolf', kind({ brave: 1, coward: 1, falseAccusations: 2 }) === 'cryWolf')
check('called out 3x -> Public Enemy', kind({ brave: 1, coward: 1, timesCalledOut: 3 }) === 'publicEnemy')
check('dare-heavy, slipped once -> The Yes Machine', kind({ brave: 1, daresCompleted: 3, coward: 1 }) === 'yesMachine')
check('skip-heavy -> The Dodger', kind({ brave: 1, coward: 3 }) === 'dodger')
check('called out once -> Sus', kind({ brave: 1, coward: 1, timesCalledOut: 1 }) === 'sus')
check('catch-all -> The All-Rounder', kind({ brave: 2, daresCompleted: 2, coward: 1 }) === 'allRounder')

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)