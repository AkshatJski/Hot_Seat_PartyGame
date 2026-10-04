import { useGameStore } from './src/store/gameStore'
import { dareTier, contentCounts } from './src/data/decks'

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
for (const decks of [['icebreakers'], ['destroyers'], ['spicy'], ['icebreakers', 'destroyers', 'spicy']] as const) {
  const c = contentCounts([...decks])
  console.log(`   ${decks.join('+').padEnd(32)} q=${c.questions} d=${c.dares} c=${c.callOuts}`)
}
check('all decks together has > 400 questions', contentCounts(['icebreakers', 'destroyers', 'spicy']).questions > 400)

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
check('callOutsMade = 1', S().players[2].callOutsMade === 1)
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

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)