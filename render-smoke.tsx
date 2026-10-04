/**
 * Mounts the real React tree in jsdom so effects actually run.
 * Catches what a store-only smoke test cannot: bad hooks order, render crashes,
 * missing props, infinite effect loops, crashes on the Burn Book.
 *
 *   npm run test:render
 */
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

const g = globalThis as unknown as Record<string, unknown>
g.window = dom.window
g.document = dom.window.document
Object.defineProperty(globalThis, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  writable: true,
})
g.HTMLElement = dom.window.HTMLElement
g.HTMLInputElement = dom.window.HTMLInputElement
g.Node = dom.window.Node
g.Element = dom.window.Element
g.Event = dom.window.Event
g.MouseEvent = dom.window.MouseEvent
g.KeyboardEvent = dom.window.KeyboardEvent
g.getComputedStyle = dom.window.getComputedStyle
g.requestAnimationFrame = dom.window.requestAnimationFrame
g.cancelAnimationFrame = dom.window.cancelAnimationFrame
g.IS_REACT_ACT_ENVIRONMENT = true
// jsdom has no layout engine, so motion can't measure. Stub the pieces it needs.
dom.window.HTMLElement.prototype.getBoundingClientRect = () =>
  ({ width: 380, height: 520, top: 0, left: 0, right: 380, bottom: 520, x: 0, y: 0 }) as DOMRect

const errors: string[] = []
const origError = console.error
console.error = (...args: unknown[]) => {
  errors.push(args.map(String).join(' '))
  origError(...args)
}

const { createRoot } = await import('react-dom/client')
const { act } = await import('react')
const React = await import('react')
const { default: App } = await import('./src/App')
const { useGameStore } = await import('./src/store/gameStore')
const { contentCounts } = await import('./src/data/decks')

// lowercase name so oxlint doesn't mistake this for a component
const store = () => useGameStore.getState()
let failures = 0

function check(label: string, cond: boolean, extra = '') {
  if (cond) console.log('  ok  ', label)
  else {
    failures++
    console.log('  FAIL', label, extra)
  }
}

const container = dom.window.document.getElementById('root')!
async function mountApp() {
  const root = createRoot(container)
  await act(async () => {
    root.render(React.createElement(App))
  })
  await flush()
  return root
}

async function flush(ms = 420) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms))
  })
}

console.log('mount: setup screen')
await mountApp()
const setupHtml = container.innerHTML
check('#root has content', setupHtml.length > 500)
check('title rendered', setupHtml.includes('Truth or') && setupHtml.includes('Swipe'))
check('deck labels rendered', setupHtml.includes('Icebreakers') && setupHtml.includes('Friendship Destroyers'))
check('18+ deck present', setupHtml.includes('Spicy'))
check('start button present', setupHtml.includes('Start the game'))
check('no duplicate deck typo', setupHtml.includes('Friendship Destroyers'))

console.log('\nstart a game (2 players, mixed decks, 18+ confirmed)')
await act(async () => {
  store().startGame(
    [{ name: 'Aksha' }, { name: 'Robin' }],
    ['icebreakers', 'destroyers', 'spicy'],
  )
})
await flush()
const playHtml = container.innerHTML
check('phase switched to playing', store().phase === 'playing')
check('current player name on screen', playHtml.includes('Aksha'))
check('turn label rendered', playHtml.includes("turn"))
check('a question is on the card', playHtml.includes(store().currentQuestion!.text.slice(0, 30)))
check('answer button rendered', playHtml.includes('Answer'))
check('dare button rendered', playHtml.includes('Dare'))
check('player rail shows both players', playHtml.includes('Aksha') && playHtml.includes('Robin'))
check('call out button NOT visible yet', !playHtml.includes('Call Out'))

// jsdom does no 3D rendering, so this cannot test that the flip *looks* right.
// It can test the CSS invariants that caused it to look wrong: without
// `preserve-3d` on the card there is no 3D context, `backface-visibility` is
// inert, and the pre-mirrored back face renders as reversed text over the front.
// That shipped as a real bug, so it gets a permanent assertion.
console.log('\ncard 3D flip invariants (the reversed-dare bug)')
const cardEl = container.querySelector('[data-card]')
check('card element found', Boolean(cardEl))
const cardClasses = cardEl?.getAttribute('class') ?? ''
check('card has preserve-3d (transform-3d)', cardClasses.includes('transform-3d'))
check(
  'card does NOT set overflow-hidden (would re-flatten the 3D context)',
  !cardClasses.includes('overflow-hidden'),
)
const faces = Array.from(cardEl?.children ?? [])
check('card has exactly two faces', faces.length === 2, `found ${faces.length}`)
for (const [i, face] of faces.entries()) {
  const cls = face.getAttribute('class') ?? ''
  check(`face ${i} hides its backface`, cls.includes('backface-visibility:hidden'))
  check(
    `face ${i} includes -webkit-backface-visibility (older iOS Safari)`,
    cls.includes('-webkit-backface-visibility:hidden'),
  )
}
const backFaceClasses = faces[1]?.getAttribute('class') ?? ''
check(
  'back face is pre-mirrored with rotateY(180deg)',
  backFaceClasses.includes('rotateY(180deg)'),
)

console.log('\nswipe right -> answered, Call Out window opens')
await act(async () => {
  store().answer()
})
await flush()
const answeredHtml = container.innerHTML
check('stage is answered', store().stage === 'answered')
check('Call Out button now visible', answeredHtml.includes('Call Out'))
check('answered confirmation shown', answeredHtml.includes('answered'))

console.log('\nCall Out -> dare card mounts already flipped')
await act(async () => {
  store().callOut()
})
await flush(400)
const calloutHtml = container.innerHTML
check('stage is callout', store().stage === 'callout')
check('dare text is on screen', (store().pendingDare?.text.length ?? 0) > 0)
check('dare card rendered', calloutHtml.includes('Dare'))
check('Done button visible', calloutHtml.includes('Done'))

console.log('\ncomplete call-out dare -> verdict screen')
await act(async () => {
  store().completeDare()
})
await flush()
const verdictHtml = container.innerHTML
check('stage is calloutVerdict', store().stage === 'calloutVerdict')
check('verdict question shown', verdictHtml.includes('deserve'))
check('caller picker shown', verdictHtml.includes('Wrong call'))

console.log('\npick a wrong caller -> turn advances')
const callerId = store().players.find((p) => p.name === 'Robin')!.id
await act(async () => {
  store().penalizeCaller(callerId)
})
await flush()
check('turn advanced to Robin', store().turnIndex === 1)
check('Robin got a coward point', store().players.find((p) => p.name === 'Robin')!.coward === 1)

// Regression: during the verdict the action bar used to fall through to the
// default branch, leaving Dare/Answer live. A queued `signal` was then consumed
// by the next card on mount, silently auto-swiping a fresh question.
// Asserted against `verdictHtml`, captured above while the verdict was on screen.
check('no Dare/Answer buttons during verdict', !/>Dare</.test(verdictHtml) && !/>Answer</.test(verdictHtml))
check('no Call Out button during verdict', !/>Call Out</.test(verdictHtml))
check('no Done button during verdict', !/>Done</.test(verdictHtml))

const beforeVerdictNext = store().poolIndex
await act(async () => {
  store().acceptCallOut()
})
await flush(600)
check(
  'next card did NOT auto-swipe',
  store().poolIndex === beforeVerdictNext + 1,
  `poolIndex=${store().poolIndex} expected=${beforeVerdictNext + 1}`,
)
check('next card is a clean question stage', store().stage === 'question')

console.log('\nskip -> flip animation, then Done')
await act(async () => {
  store().skip()
})
await flush(500)
check('stage is dare', store().stage === 'dare')
check('dare loaded', store().pendingDare !== null)
check('flipped flag set', store().flipped === true)
const dareHtml = container.innerHTML
check('dare text visible in DOM', dareHtml.includes(store().pendingDare!.text.slice(0, 25)))
check('Done button visible', dareHtml.includes('Done'))

await act(async () => {
  store().completeDare()
})
await flush()
check('stage back to question', store().stage === 'question')
check('a fresh question dealt', store().currentQuestion !== null)

console.log('\nrun the whole game to the Burn Book')
let guard = 0
while (store().phase === 'playing' && guard++ < 2000) {
  const stage = store().stage
  await act(async () => {
    if (stage === 'question') store().answer()
    else if (stage === 'dare' || stage === 'callout') store().completeDare()
    else store().acceptCallOut()
  })
}
check('reached burn book', store().phase === 'burnbook', `phase=${store().phase}`)
await flush(1200)
await flush(800)
const burnHtml = container.innerHTML
if (!burnHtml.includes('Burn Book')) console.log('   DEBUG html:', burnHtml.slice(0, 300))
check('Burn Book title', burnHtml.includes('Burn Book'))
check('Biggest Coward award', burnHtml.includes('Biggest Coward'))
check('Most Exposed award', burnHtml.includes('Most Exposed'))
check('Menace to Society award', burnHtml.includes('Menace to Society'))
check('Straightest Shooter award', burnHtml.includes('Straightest Shooter'))
check('Share button', burnHtml.includes('Share'))
check('Rematch button', burnHtml.includes('Rematch'))
check('total cards is large', contentCounts(['icebreakers', 'destroyers', 'spicy']).questions > 400)

console.log('\nrematch -> back to setup')
await act(async () => {
  store().restart()
})
await flush(800)
await flush(600)
check('phase is setup', store().phase === 'setup')
check('setup screen back', container.innerHTML.includes('Start the game'))

console.log('\nno react errors/warnings captured')
const real = errors.filter((e) => !e.includes('persist middleware'))
check(`zero console errors (got ${real.length})`, real.length === 0)
for (const e of real.slice(0, 5)) console.log('      ->', e.slice(0, 300))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)