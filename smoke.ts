import {
  mergePersisted,
  selectAwaitingCallOutDare,
  selectAwaitingDare,
  useGameStore,
} from './src/store/gameStore'
import {
  ALL_CALL_OUT_DARES,
  ALL_DARES,
  ALL_QUESTIONS,
  dareTier,
  contentCounts,
} from './src/data/decks'
import {
  CARD_QUIPS,
  EVENT_QUIPS,
  MOODS,
  quipForCard,
  reactionFor,
} from './src/data/commentary'
import { verdictFor } from './src/data/verdicts'
import type { Player } from './src/types'

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

console.log('content volumes')
const c = contentCounts()
console.log(`   flat pool q=${c.questions} d=${c.dares} c=${c.callOuts}`)
check('flat pool has > 40 questions', c.questions > 40)
check('flat pool has > 10 dares', c.dares > 10)
check('flat pool has > 5 call-outs', c.callOuts > 5)

console.log('\ncontent integrity')
function duplicates(items: { id: string; text: string }[]): string[] {
  const seen = new Map<string, string[]>()
  for (const item of items) {
    const key = item.text.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    seen.set(key, [...(seen.get(key) ?? []), item.id])
  }
  return [...seen.values()].filter((ids) => ids.length > 1).map((ids) => ids.join(' | '))
}
const allQ = ALL_QUESTIONS
const allD = ALL_DARES
const allC = ALL_CALL_OUT_DARES
const qDupes = duplicates(allQ)
const dDupes = duplicates(allD)
const cDupes = duplicates(allC)
check('no duplicate question text', qDupes.length === 0, qDupes.slice(0, 5).join(' / '))
check('no duplicate dare text', dDupes.length === 0, dDupes.slice(0, 5).join(' / '))
check('no duplicate call-out text', cDupes.length === 0, cDupes.slice(0, 5).join(' / '))
const allIds = [...allQ, ...allD, ...allC].map((x) => x.id)
check('no duplicate ids', new Set(allIds).size === allIds.length, `total=${allIds.length} unique=${new Set(allIds).size}`)
check('every card has text', [...allQ, ...allD, ...allC].every((x) => x.text.trim().length > 0))
check('intensity is always 1..3', [...allQ, ...allD, ...allC].every((x) => x.intensity >= 1 && x.intensity <= 3))

console.log('\ncommentator voice')
const ALL_QUIPS = [...CARD_QUIPS, ...Object.values(EVENT_QUIPS).flat()]
const EVENTS = Object.keys(EVENT_QUIPS) as (keyof typeof EVENT_QUIPS)[]
check('card quip pool has enough lines', CARD_QUIPS.length >= 6)
check('every event owns a bark pool', EVENTS.every((e) => EVENT_QUIPS[e].length >= 3))
check(
  'every line carries a known mood',
  ALL_QUIPS.every((q) => MOODS.includes(q.mood)),
)
check('every card draws a quip', allQ.every((q) => quipForCard(q.id).text.length > 0))
check(
  'quips are deterministic per card',
  allQ.every((q) => quipForCard(q.id).text === quipForCard(q.id).text),
)
check(
  'event barks are deterministic per seed',
  EVENTS.every((e) => reactionFor(e, 'seed').text === reactionFor(e, 'seed').text),
)
check(
  'every quip is capitalised and punctuated',
  ALL_QUIPS.every((q) => /^[A-Z0-9]/.test(q.text) && /[.!?]$/.test(q.text)),
)
check(
  'no duplicated quip in the whole voice',
  (() => {
    const seen = ALL_QUIPS.map((q) => q.text.toLowerCase())
    return new Set(seen).size === seen.length
  })(),
)
check('quipForCard never throws', quipForCard('x').text.length > 0)

console.log('\ndare tier ladder')
check('0 cowards -> tier 1', dareTier(0) === 1)
check('1 coward  -> tier 1', dareTier(1) === 1)
check('2 cowards-> tier 2', dareTier(2) === 2)
check('3 cowards-> tier 2', dareTier(3) === 2)
check('4 cowards-> tier 3', dareTier(4) === 3)
check('99 cowards->tier 3', dareTier(99) === 3)

console.log('\nsetup + first draw')
S().startGame([{ name: 'A' }, { name: 'B' }, { name: 'C' }])
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
check('taking a dare charges NO coward point', S().players[1].coward === 0, `got ${S().players[1].coward}`)
check('taking a dare leaves the tier alone', S().players[1].flinchCount === 0, `got ${S().players[1].flinchCount}`)
check('B answerStreak reset by skip', S().players[1].answerStreak === 0, `got ${S().players[1].answerStreak}`)
check('not a call-out dare', S().pendingIsCallOut === false)

console.log('\nreroll a DARE (once per turn)')
const dareBeforeReroll = S().pendingDare!.id
check('reroll not yet used this turn', S().rerollUsed === false)
S().reroll()
check('dare actually changed', S().pendingDare!.id !== dareBeforeReroll, `still ${dareBeforeReroll}`)
check('reroll now marked used', S().rerollUsed === true)
check('still on the dare stage', S().stage === 'dare')
const dareAfterReroll = S().pendingDare!.id
S().reroll()
check('second dare reroll is refused', S().pendingDare!.id === dareAfterReroll, 'reroll must be once per turn')

S().completeDare()
check('B daresCompleted = 1', S().players[1].daresCompleted === 1)
check('advanced to player C', S().turnIndex === 2)
check('reroll resets for the new turn', S().rerollUsed === false)

console.log('\nreroll a QUESTION (once per turn)')
const qBeforeReroll = S().currentQuestion!.id
const cardsLeftBefore = S().pool.length - S().poolIndex
S().reroll()
check('question actually changed', S().currentQuestion!.id !== qBeforeReroll, `still ${qBeforeReroll}`)
check('exactly one card consumed by the reroll', S().pool.length - S().poolIndex === cardsLeftBefore - 1)
check('reroll did NOT score an answer', S().players[2].brave === 0, `brave=${S().players[2].brave}`)
check('reroll did NOT charge a coward point', S().players[2].coward === 0, `coward=${S().players[2].coward}`)
check('reroll did NOT advance the turn', S().turnIndex === 2)
check('still on the question stage', S().stage === 'question')
check('card is not flipped', S().flipped === false)
const qAfterReroll = S().currentQuestion!.id
S().reroll()
check('second question reroll is refused', S().currentQuestion!.id === qAfterReroll, 'reroll must be once per turn')

console.log('\nchicken out (refuse both, take a point, no dare)')
const cowardBefore = S().players[2].coward
const answerStreakBefore = S().players[2].answerStreak
const daresDoneBefore = S().players[2].daresCompleted
S().chickenOut()
check('player C took a coward point', S().players[2].coward === cowardBefore + 1, `got ${S().players[2].coward}`)
check('chicken out drew NO dare', S().players[2].daresCompleted === daresDoneBefore)
check('chicken out reset the answer streak', S().players[2].answerStreak === 0, `was ${answerStreakBefore}`)
check('chicken out ended the turn', S().turnIndex === 0, `turnIndex=${S().turnIndex}`)
check('a fresh question was dealt', S().currentQuestion !== null)
check('a coward point raises the dare tier', dareTier(S().players[2].coward) >= 1)
check('reroll available again next turn', S().rerollUsed === false)

console.log('\nrestore a known state for the Call Out tests')
// The chicken-out above left the game on player A's turn. Put player C back on
// turn and answer a fresh card, so the Call Out assertions below start from a
// clean `answered` stage.
useGameStore.setState({ turnIndex: 2 })
S().answer()

console.log('\nCALL OUT on an answered question')
check('C brave = 1', S().players[2].brave === 1)
S().callOut()
check('stage is callout', S().stage === 'callout')
check('Brave docked back to 0', S().players[2].brave === 0, `got ${S().players[2].brave}`)
check('timesCalledOut = 1', S().players[2].timesCalledOut === 1, `got ${S().players[2].timesCalledOut}`)
check('call-out dare loaded', S().pendingDare !== null && S().pendingIsCallOut === true)
check('turn did NOT rotate', S().turnIndex === 2)
check('a call out is NOT an ordinary dare', selectAwaitingDare(S()) === false)
check('a call out gets its own-only-Done bar', selectAwaitingCallOutDare(S()) === true)
S().completeDare()
check('stage is calloutVerdict', S().stage === 'calloutVerdict')
check('C daresCompleted = 1', S().players[2].daresCompleted === 1)

console.log('\nwrong call out costs the caller')
const callerId = S().players[0].id
const braveBefore = S().players[2].brave
const callerCowardBefore = S().players[0].coward
S().penalizeCaller(callerId)
check(
  'caller A coward is NOT charged (chicken-outs only)',
  S().players[0].coward === callerCowardBefore,
  `got ${S().players[0].coward}`,
)
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

console.log('\nescalation: the hidden flinch counter drives dare tier')
const s = S()
const victim = s.players[1]
useGameStore.setState({
  players: s.players.map((p) => (p.id === victim.id ? { ...p, flinchCount: 6 } : p)),
})
useGameStore.setState({ turnIndex: 1 })
S().skip()
check('player with 6 flinches still gets a dare', S().pendingDare !== null)
check('that dare is max intensity (tier 3)', S().pendingDare?.intensity === 3, `got intensity ${S().pendingDare?.intensity}`)
check('the visible coward score stays 0', S().players[1].coward === 0, `got ${S().players[1].coward}`)

console.log('\nchicken out is the ONLY thing that raises the tier')
S().restart()
S().startGame([{ name: 'A' }, { name: 'B' }])
S().skip()
check('swipe-left left flinchCount at 0', S().players[0].flinchCount === 0, `got ${S().players[0].flinchCount}`)
S().chickenOut()
check('chicken out floored coward at 0 then added 1', S().players[0].coward === 1, `got ${S().players[0].coward}`)
check('chicken out raised flinchCount to 1', S().players[0].flinchCount === 1, `got ${S().players[0].flinchCount}`)
const daresDoneBeforeChicken = S().players[0].daresCompleted
// Chicken out ends the turn, so step back onto player A and drive them to the
// dare stage to prove the dare-stage path works for the SAME counter.
S().turnIndex = 0
useGameStore.setState({ turnIndex: 0 })
S().skip()
const flinchBeforeDareChicken = S().players[0].flinchCount
check('swipe-left again still adds no flinch', flinchBeforeDareChicken === 1, `got ${flinchBeforeDareChicken}`)
S().chickenOut()
check('chicken out on the DARE stage still works', S().players[0].flinchCount === flinchBeforeDareChicken + 1, `got ${S().players[0].flinchCount}`)
check('abandoning a dare earns no completion credit', S().players[0].daresCompleted === daresDoneBeforeChicken)

console.log('\nchicken out during a Call Out still reaches the verdict')
S().restart()
S().startGame([{ name: 'A' }, { name: 'B' }])
S().answer()
S().callOut()
const accusedIndex = S().turnIndex
const dareCreditBeforeChicken = S().players[accusedIndex].daresCompleted
check('stage is callout', S().stage === 'callout', `got ${S().stage}`)
check('call out is excluded from the dare bar', selectAwaitingDare(S()) === false)
S().chickenOut()
check('chicken out routes to the verdict', S().stage === 'calloutVerdict', `got ${S().stage}`)
check(
  'refusing the punishment earns no dare credit',
  S().players[accusedIndex].daresCompleted === dareCreditBeforeChicken,
  `got ${S().players[accusedIndex].daresCompleted}`,
)
check('the punishment still costs a coward point', S().players[accusedIndex].coward === 1)
S().acceptCallOut()

console.log('\nplay to exhaustion -> burn book')
S().restart()
S().startGame([{ name: 'A' }, { name: 'B' }])
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

console.log('\nrehydration keeps progression, not just scores')
S().startGame([{ name: 'A' }, { name: 'B' }])
S().answer()
S().acceptCallOut()
S().answer()
S().acceptCallOut()
const live = S()
const save = {
  phase: 'playing' as const,
  players: live.players,
  turnIndex: live.turnIndex,
  round: live.round,
  poolIds: live.pool.map((q) => q.id),
  poolIndex: live.poolIndex,
  gameMode: live.gameMode,
  turnOrder: live.turnOrder,
  turnsTaken: live.turnsTaken,
  roundsPerPlayer: live.roundsPerPlayer,
  wildcard: live.wildcard,
}
const restored = mergePersisted(save, { ...live, phase: 'setup', players: [], pool: [], poolIndex: 0 })
check('pool is rebuilt from saved ids', restored.pool.length === live.pool.length, `got ${restored.pool.length}`)
check(
  'poolIndex survives a refresh',
  restored.poolIndex === live.poolIndex,
  `got ${restored.poolIndex} want ${live.poolIndex}`,
)
check('scores survive a refresh', restored.players[0]?.brave === live.players[0].brave)
check('cardsLeft survives a refresh', restored.pool.length - restored.poolIndex === live.pool.length - live.poolIndex)

const pruned = mergePersisted({ ...save, poolIds: [...save.poolIds, 'gone'], poolIndex: 999 }, S())
check(
  'poolIndex is clamped to the rebuilt pool',
  pruned.poolIndex === pruned.pool.length,
  `got ${pruned.poolIndex} of ${pruned.pool.length}`,
)
check('a non-playing save is ignored', mergePersisted({ phase: 'setup' }, S()).phase === S().phase)

console.log('\nclassic: chicken out breaks the truth streak')
S().restart()
S().startGame([{ name: 'A' }, { name: 'B' }], { gameMode: 'classic' })
S().beginClassicTurn()
S().classicChooseTruth()
check('truth streak is 1', S().players[0].truthStreak === 1, `got ${S().players[0].truthStreak}`)
S().chickenOut()
check('chicken out resets truthStreak', S().players[0].truthStreak === 0, `got ${S().players[0].truthStreak}`)

console.log('\nburn book verdict ladder')
const mk = (over: Partial<Player>): Player => ({
  id: 'x',
  name: 'X',
  brave: 0,
  coward: 0,
  flinchCount: 0,
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
check('chicken-outs only -> Serial Flincher', kind({ coward: 3 }) === 'flincher')
check(
  'false call-outs alone are NOT chicken-outs',
  kind({ brave: 2, daresCompleted: 2, falseAccusations: 1 }) === 'noRegrets',
  `got ${kind({ brave: 2, daresCompleted: 2, falseAccusations: 1 })}`,
)
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
