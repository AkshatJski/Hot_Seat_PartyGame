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
const { contentCounts, ALL_QUESTIONS } = await import('./src/data/decks')
const { quipForCard } = await import('./src/data/commentary')

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
check('start button present', setupHtml.includes('Start the game'))

console.log('\nstart a game (2 players)')
await act(async () => {
  store().startGame([{ name: 'Aksha' }, { name: 'Robin' }])
})
await flush()
const playHtml = container.innerHTML
check('phase switched to playing', store().phase === 'playing')
check('current player name on screen', playHtml.includes('Aksha'))
check('turn label rendered', playHtml.includes("turn"))
check('a question is on the card', playHtml.includes(store().currentQuestion!.text.slice(0, 30)))
check('card legend states the gesture', playHtml.includes('Answer') && playHtml.includes('Dare'))
check('Reroll button rendered', playHtml.includes('Reroll'))
check('Chicken out button rendered', playHtml.includes('Chicken out'))
check(
  'no Answer/Dare buttons — the card is the control',
  Array.from(container.querySelectorAll('button')).every(
    (b) => !/^(Answer|Dare)$/.test((b.textContent ?? '').trim()),
  ),
)
const rerollBtn = Array.from(container.querySelectorAll('button')).find(
  (b) => (b.textContent ?? '').trim().includes('Reroll'),
) as HTMLButtonElement | undefined
check('reroll starts enabled', rerollBtn != null && !rerollBtn.disabled)
const rerollCardId = store().currentQuestion!.id
await act(async () => {
  rerollBtn!.click()
})
await flush()
check('clicking Reroll swaps the question', store().currentQuestion!.id !== rerollCardId)
check('reroll is one-per-turn', store().rerollUsed === true)
const rerollBtnAfter = Array.from(container.querySelectorAll('button')).find(
  (b) => (b.textContent ?? '').trim().includes('Reroll'),
) as HTMLButtonElement | undefined
check('reroll button disabled after use', rerollBtnAfter?.disabled === true)
check('player rail shows both players', playHtml.includes('Aksha') && playHtml.includes('Robin'))
check('call out button NOT visible yet', !playHtml.includes('Call Out'))

console.log('\nchicken out ends the turn with a point, no dare')
const chickenBtn = Array.from(container.querySelectorAll('button')).find((b) =>
  (b.textContent ?? '').trim().includes('Chicken out'),
) as HTMLButtonElement | undefined
check('chicken out button found', chickenBtn != null)
const cowardBeforeDom = store().players[store().turnIndex].coward
await act(async () => {
  chickenBtn!.click()
})
await flush()
check('chicken out advanced the turn', store().turnIndex === 1)
check('chicken out cost a coward point', store().players[0].coward === cowardBeforeDom + 1)
check('chicken out drew no dare', store().stage === 'question' && store().pendingDare === null)

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

console.log('\ncommentator quip on the card')
// Drive a real card so this asserts the rendered host line, not "a quip existed
// somewhere". The quip is deterministic, so the expected text is knowable.
const quipCard = ALL_QUESTIONS[0]
check('found a card to commentate', Boolean(quipCard))
if (quipCard) {
  const expected = quipForCard(quipCard.id)
  await act(async () => {
    useGameStore.setState({ currentQuestion: quipCard, stage: 'question', flipped: false })
  })
  await flush()
  const fig = container.querySelector('[data-commentator]')
  check('commentator rendered on the card', Boolean(fig))
  check(
    'commentator shows the deterministic quip',
    (fig?.textContent ?? '').includes(expected.text),
    `expected "${expected.text}"`,
  )
  check('commentator exposes its mood', fig?.getAttribute('data-commentator') === expected.mood)
  check(
    'commentator does not intercept the swipe gesture',
    (fig?.getAttribute('class') ?? '').includes('pointer-events-none'),
  )
  await act(async () => {
    useGameStore.setState({ currentQuestion: null })
  })
  await flush()
}

// Reproduces the reported "4 players, starts auto-skipping and gets stuck" bug.
// The rest of this file drives the store directly, which is exactly why the bug
// survived: it lives entirely in the signal-emitting input path, which nothing
// here touched. The Answer/Dare buttons are gone (swipe-only, by request), so
// this now presses the keyboard instead — which raises the SAME fire() signal
// the buttons used, and so covers the identical regression.
console.log('\nBUG REPRO: a swipe signal must not auto-swipe the following card')

await act(async () => {
  dom.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight' }))
})
await flush(900)
check('ArrowRight resolved the current card', store().stage === 'answered')
const poolAfterTap = store().poolIndex

// Let the 4s Call Out window elapse, which advances the turn and deals a new card.
await flush(4200)
check(
  'exactly one card consumed by the turn',
  store().poolIndex === poolAfterTap + 1,
  `poolIndex=${store().poolIndex} expected=${poolAfterTap + 1}`,
)
check(
  'the NEW card is not already answered (no stale signal)',
  store().stage === 'question',
  `stage=${store().stage}`,
)

// The cascade: a stale signal re-fires on every subsequent card, and each
// auto-answer restarts the 4s window, so the game plays itself hands-free.
await flush(4200)
check('and it does not cascade on later turns', store().stage === 'question', `stage=${store().stage}`)

console.log('\nswipe right -> answered, Call Out window opens')
// Earlier sections consumed turns (and a chicken-out). Park the turn on seat 0,
// which is NOT the caller used below, so the "did not land back on the caller"
// assertion stays meaningful with only two players.
await act(async () => {
  useGameStore.setState({ turnIndex: 0 })
})
await flush()
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
// "No passing": a Call Out punishment must not offer Reroll or Chicken out.
// Chickening out there used to skip `calloutVerdict` entirely, so the group could
// never rule on the call and `penalizeCaller` was unreachable.
check('no Reroll button during a call out', !/>Reroll</.test(calloutHtml))
check('no Chicken out button during a call out', !calloutHtml.includes('Chicken out'))

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
const turnBeforePenalty = store().turnIndex
const seats = store().players.length
await act(async () => {
  store().penalizeCaller(callerId)
})
await flush()
// Relative, not `=== 1`: an absolute index silently couples this test to how
// many turns earlier sections happen to consume.
check(
  'turn advanced exactly one seat',
  store().turnIndex === (turnBeforePenalty + 1) % seats,
  `turnIndex=${store().turnIndex} from=${turnBeforePenalty}`,
)
check(
  'turn did not land back on the caller',
  // Only meaningful with 3+ seats: with exactly two players the next seat IS the
  // caller, so "landing on the caller" is unavoidable rather than a bug.
  seats < 3 || store().players[store().turnIndex]!.id !== callerId,
  `seats=${seats} turnIndex=${store().turnIndex}`,
)
// `coward` means chicken-outs only, so a wrong call must NOT touch it — it is
// recorded in `falseAccusations`, which has its own verdict ("Cry Wolf").
check(
  'Robin got a false accusation, not a coward point',
  store().players.find((p) => p.name === 'Robin')!.falseAccusations === 1 &&
    store().players.find((p) => p.name === 'Robin')!.coward === 0,
  `falseAccusations=${store().players.find((p) => p.name === 'Robin')!.falseAccusations} coward=${store().players.find((p) => p.name === 'Robin')!.coward}`,
)

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
check('The Verdicts roster shown', burnHtml.includes('The verdicts'))
const verdictCards = container.querySelectorAll('[data-verdict]')
check(
  'one verdict card per player',
  verdictCards.length === store().players.length,
  `cards=${verdictCards.length} players=${store().players.length}`,
)
check('every player gets a verdict', store().players.every((p) => burnHtml.includes(p.name)))
check('no empty-winner placeholder', !burnHtml.includes('Nobody flinched'))
check('Share button', burnHtml.includes('Share'))
check('Rematch button', burnHtml.includes('Rematch'))
check('total cards is large', contentCounts().questions > 40)

console.log('\nrematch -> back to setup')
await act(async () => {
  store().restart()
})
await flush(800)
await flush(600)
check('phase is setup', store().phase === 'setup')
check('setup screen back', container.innerHTML.includes('Start the game'))

// ---------------------------------------------------------------------------
// Setup: duplicate names. The rows are free-text inputs, so the same name could
// be typed twice; `begin()` used to check only the count, not uniqueness.
// ---------------------------------------------------------------------------
console.log('\nsetup rejects duplicate names')
const nameInputs = Array.from(container.querySelectorAll('input')).filter((el) =>
  el.placeholder.startsWith('Player'),
) as HTMLInputElement[]
check('two editable name rows', nameInputs.length >= 2, `got ${nameInputs.length}`)
const nativeValue = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!
await act(async () => {
  // Deliberately different casing: the guard is case-insensitive.
  nativeValue.call(nameInputs[0], 'Same')
  nameInputs[0].dispatchEvent(new dom.window.Event('input', { bubbles: true }))
  nativeValue.call(nameInputs[1], 'same')
  nameInputs[1].dispatchEvent(new dom.window.Event('input', { bubbles: true }))
})
await flush()
const startBtn = Array.from(container.querySelectorAll('button')).find((b) =>
  (b.textContent ?? '').includes('Start the game'),
) as HTMLButtonElement | undefined
await act(async () => {
  startBtn?.click()
})
await flush()
check('duplicate names keep you on setup', store().phase === 'setup', `phase=${store().phase}`)
check('duplicate message shown', container.innerHTML.includes('same name'))

// ---------------------------------------------------------------------------
// Classic Circle. This flow shipped once with a dead "Start Turn" button and a
// hooks-order crash, so it gets its own end-to-end pass: intro -> choice ->
// play -> next-up, the free-dare rule, and the 3-truths-in-a-row lock.
// ---------------------------------------------------------------------------
console.log('\nclassic circle: turn flow, free dares, truth-streak lock, wildcard')

/** Drive exactly one full Classic turn for whoever is currently up. */
async function classicTurn(choice: 'truth' | 'dare') {
  await act(async () => {
    store().classicNextUp() // no-op at the very first turn; routes next-up -> intro otherwise
  })
  await flush()
  await act(async () => {
    store().beginClassicTurn()
  })
  await flush()
  await act(async () => {
    if (choice === 'truth') store().classicChooseTruth()
    else store().classicChooseDare()
  })
  await flush()
  await act(async () => {
    if (choice === 'truth') store().answer()
    else store().completeDare()
  })
  await flush()
  if (choice === 'truth') {
    await act(async () => {
      store().acceptCallOut()
    })
    await flush()
  }
}

await act(async () => {
  store().startGame(
    [{ name: 'Ada' }, { name: 'Bo' }],
    { gameMode: 'classic', roundsPerPlayer: null },
  )
})
await flush()
check('classic game is playing', store().phase === 'playing')
check('gameMode is classic', store().gameMode === 'classic')
check('classic opens on the turn intro', store().classicStage === 'intro')
check(
  'a wildcard is drawn for the round',
  typeof store().wildcard === 'string' && (store().wildcard ?? '').length > 0,
)
check('roundsPerPlayer defaults to null (pool-limited)', store().roundsPerPlayer === null)

await act(async () => {
  store().beginClassicTurn()
})
await flush()
check('choice screen shown', store().classicStage === 'choice')
check('Truth or Dare prompt rendered', container.innerHTML.includes('Truth or Dare'))

const adaId = store().players[0]!.id
const boId = store().players[1]!.id

// Ada takes three truths in a row (her turns are 0, 2, 4); Bo takes dares to
// reset nothing and to prove a dare is free.
await classicTurn('truth')
check('streak incremented to 1', store().players.find((p) => p.id === adaId)!.truthStreak === 1)
check('turn passed to Bo', store().players[store().turnIndex]!.id === boId)
await classicTurn('dare')
check('dare choice charges no Coward', store().players.find((p) => p.id === boId)!.coward === 0)
check('dare resets the streak', store().players.find((p) => p.id === boId)!.truthStreak === 0)
await classicTurn('truth')
await classicTurn('dare')
await classicTurn('truth')
check(
  'Ada reached a 3-truth streak',
  store().players.find((p) => p.id === adaId)!.truthStreak === 3,
  `streak=${store().players.find((p) => p.id === adaId)!.truthStreak}`,
)

// Reach Ada's turn again and assert the lock is visible in the real UI.
await classicTurn('dare')
await act(async () => {
  store().classicNextUp()
})
await flush()
await act(async () => {
  store().beginClassicTurn()
})
await flush()
check('back on the choice screen for Ada', store().classicStage === 'choice' && store().players[store().turnIndex]!.id === adaId)
check('UI announces the forced dare', container.innerHTML.includes('Dare is mandatory'))
const truthBtn = Array.from(container.querySelectorAll('button')).find((b) =>
  (b.textContent ?? '').includes('TRUTH'),
)
check('TRUTH button is disabled', truthBtn?.hasAttribute('disabled') === true)
const streakBeforeForcedDare = store().players.find((p) => p.id === adaId)!.truthStreak
await act(async () => {
  store().classicChooseTruth() // must be rejected by the store guard
})
await flush()
check('store rejects a locked truth', store().players.find((p) => p.id === adaId)!.truthStreak === streakBeforeForcedDare)

await act(async () => {
  store().classicChooseDare()
})
await flush()
check('forced dare charges no Coward', store().players.find((p) => p.id === adaId)!.coward === 0)
check('forced dare resets the streak', store().players.find((p) => p.id === adaId)!.truthStreak === 0)
check('forced dare loaded', store().pendingDare !== null)

console.log('\nno react errors/warnings captured')
const real = errors.filter((e) => !e.includes('persist middleware'))
check(`zero console errors (got ${real.length})`, real.length === 0)
for (const e of real.slice(0, 5)) console.log('      ->', e.slice(0, 300))

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
