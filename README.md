<div align="center">

# Truth or Swipe

**A pass-the-phone party game. One phone, a circle of friends, and a deck of
questions you're all going to regret answering honestly.**

Swipe right to answer. Swipe left and you owe a dare. Think you got away with
something? The group can **Call You Out**.

</div>

---

<div align="center">

<a href="https://github.com/AkshatJski/Hot_Seat_PartyGame/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/AkshatJski/Hot_Seat_PartyGame?label=release&color=ff2d6f&style=flat-square" /></a>
<img alt="CI" src="https://github.com/AkshatJski/Hot_Seat_PartyGame/actions/workflows/ci.yml/badge.svg" />
<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?style=flat-square&logo=typescript&logoColor=white" />
<img alt="React" src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" />
<img alt="Vite" src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white" />
<img alt="License" src="https://img.shields.io/badge/license-all%20rights%20reserved-lightgrey?style=flat-square" />

</div>

<br>

<!-- TODO: paste a real screenshot here once you have one on a phone. -->

## Play it

**Live now → [akshatjski.github.io/Hot_Seat_PartyGame](https://akshatjski.github.io/Hot_Seat_PartyGame/)**
— also on [Vercel](https://hot-seat-party-game.vercel.app)

> **Always take the newest release.** Two published artifacts are known-bad:
>
> - **v1.0.0** — the dare card renders as reversed/mirrored text.
> - **v1.0.1** — tapping the Dare/Answer buttons auto-swipes the *following*
>   card, and can cascade into the game playing itself.
>
> Both are fixed in the current release. The live links above are always current.

1. Open the app on one phone and hand it around. That's the whole setup.
2. Add 2–10 players and hit start. No decks to pick.
3. Play until the cards run out — **137 questions** means the game decides how
   long it lasts.
4. Survive the Burn Book.

**Install it.** Add to Home Screen and it launches fullscreen with no browser
chrome, like a real app:

- **iOS Safari** — Share → *Add to Home Screen*
- **Android Chrome** — ⋮ → *Install app* / *Add to Home screen*

> ⚠️ **Roast warning.** The questions point at the people in the room, so play
> with adults who know each other and can take a joke. See
> [Content policy](#content-policy) for the rules the content follows.

---

## How it works

### The basic loop

| You do | You get |
| --- | --- |
| **Swipe right** | Brave **+1**. Turn passes. |
| **Swipe left** | **Free** — the card **flips to a dare** you have to do. Turn passes. |
| **Reroll** | Swap the card once per turn. Costs nothing. Swapping a *question* does burn it from the deck. |
| **Chicken out** | Refuse everything: Coward **+1** and the turn ends with no dare. |
| **Call Out** | The group overruling your answer: Brave **−1** and a punishing dare from a *separate* pool. **You keep the turn.** |

Taking a dare is free **on purpose**: the app rewards doing something over
refusing everything, and only *chicken out* costs you.

There is **no Answer button and no Dare button**. The card *is* the control —
that's the whole game. On a keyboard, `←` / `→` raise the exact same internal
signal a drag does, so it stays a genuine equal alternative.

### Call Out

After you swipe right there's a **four-second window**. If the room thinks your
answer was weak or a lie, someone hits Call Out:

- Your Brave point is gone.
- You get a dare from the Call Out pool. **There is no passing** — no reroll, no
  chicken out. It's you and the dare.
- When you're done, the group renders a verdict: **"Did they deserve that?"**
  - **Deserved it** → turn passes, life goes on.
  - **Wrong call** → the caller who overreached is flagged with a **false
    accusation**, and your Brave point comes back. Overturned means the penalty
    was illegitimate, so it never should have applied.

### The difficulty ladder

Dodging raises the stakes, but the counter behind it is **hidden** — separate from
the Coward score you can see:

| Times you chickened out | Dare tier |
| --- | --- |
| 0–1 | 1 — surface level |
| 2–3 | 2 — got spicy |
| 4+ | 3 — went nuclear |

The tier is a **floor**, so the app can't hand you a gentle dare when you've been
chickening out. It also degrades gracefully — it will never dead-end because the
hard dares ran out.

### The Burn Book

When the last card is gone, **every player gets a verdict** — one archetype card
picked from their own stats, so nobody leaves empty-handed and there are no
arbitrary tie-breaks:

- **The Reckless** — took the nuclear dare
- **No Regrets** — never chickened out once
- **On a Tear** — the longest unbroken run of answers
- **Cry Wolf** — kept calling people out and getting overruled
- **The Ghost** — never touched a card
- and a dozen more, driven by chicken-outs, dares, depth, and being called out

Share the whole thing to the group chat.

---

## Content

No categories, no deck picking. **135 questions, 85 dares, 33 Call Out dares** —
one flat pool of fun, quirky and roasty questions, dealt at random.

Because the whole set is shuffled into one queue and dealt without replacement,
**no question repeats** in a session. The length of the game follows from how
long the pool lasts.

### The host

Every card is narrated by a small trash-talking commentator. It reviews the
question in one line, then barks at what actually happens — an answer, a dare, a
Call Out, a verdict. It's **all text, all offline, zero image assets**:

- **No external API, no model.** The lines are authored, curated pools in
  `src/data/commentary.ts`. Nothing to rate-limit, nothing to break mid-party.
- **Deterministic per card.** The line is picked by hashing the card id, so it
  never changes while the player is holding the phone still. (React re-renders
  constantly; a random pick would flicker between two lines under a thumb.)
- **One flat voice.** Every card draws from the same quip pool, so the host
  reads the same no matter what it's reviewing.
- **Mood-driven.** Every line carries a mood — hype, judgy, spicy, chaos,
  sympathy, deadpan or suspicious — which picks its emoji face, its colour block
  and its accent.
- **The bubble is `pointer-events-none`** on purpose: it sits over a drag-to-swipe
  card, and anything that captures a pointer there eats the gesture.
- **The linter reads it too.** `npm run lint:content` checks the host's voice for
  length, capitalisation, terminal punctuation, duplicates, and that every mood
  actually has styling.

### Content policy

These are product decisions, not accident — they're written into the code:

1. **Questions carry the heat. Dares stay doable.** A dare's intensity is a
   *difficulty* hint, never a risk level — nothing here should hurt anyone.
2. **Fun, quirky and roasty only.** Questions keep it light and point at the
   people in the room, written for an Indian context. Anything that asks for
   deep thinking, regret, confession or intimacy is out.
3. **Nobody gets targeted on something they can't choose.** No cards about a
   player's name, identity, health, body, trauma, or finances.
4. **Dares may involve mild physical actions, silly props, or the player's own
   phone and social media** — and that is a deliberate change from earlier
   versions. What stays off the table: anything that risks real injury, spills
   something messy, involves strangers, animals or property damage, or posts
   publicly without the player doing it themselves. Safety tags like
   "(gently!)" and "(safely!)" mark the risky edges on purpose.
5. **The real risk is social, not technical.** A party game can humiliate
   someone having a bad week. That's why the punishments are the game's, and
   why Call Out is resolved by the room rather than by an algorithm.

---

## Try it locally

Requires Node 20.19+ or 22.12+ (Vite 8).

```bash
git clone https://github.com/AkshatJski/Hot_Seat_PartyGame.git
cd Hot_Seat_PartyGame
npm install
npm run dev
```

Vite prints a **LAN URL** (`http://192.168.x.x:5173`). Open that on your phone —
it's the only way to actually test the swipe physics and haptics.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Typecheck (`tsc -b`) then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | oxlint |
| `npm run typecheck` | App **and** test-script typechecks |
| `npm test` | Store + content suite (turn machine, scoring, full playthrough) |
| `npm run test:render` | Mounts the real React tree in jsdom, asserts the DOM at every stage |
| `npm run check` | **Everything above, plus build.** Run this before any commit. |
| `npm run icons` | Regenerate PWA icons from `public/icon.svg` |

### Deploying your own copy

`dist/` is a plain static bundle. It works on any static host — Vercel, Netlify,
Cloudflare Pages, GitHub Pages, S3, nginx.

The app has **no URL router** (the phase switch is component state, not a path),
so no SPA 404-rewrite is needed on any host.

If you deploy to a **subpath** rather than a domain root, set `BASE_PATH`:

```bash
BASE_PATH=/Hot_Seat_PartyGame/ npm run build
```

Getting `base` wrong makes every asset 404 and the page render blank. Leave it
unset for root hosting.

---

## How it's built

No backend, no accounts, no network requests. The app is one static bundle and
`localStorage`.

| Layer | Choice | Why |
| --- | --- | --- |
| Build | **Vite 8** | Fast, minimal config |
| UI | **React 19** | — |
| Styling | **Tailwind CSS v4** | CSS-first `@theme`, no config file |
| Animation | **Motion** | The swipe is gesture + spring driven |
| State | **Zustand** + `persist` | Selective subscriptions; scores survive a refresh |
| Lint | **oxlint** | Fast |
| Tests | **tsx** + **jsdom** | Two suites, no browser needed |

A few decisions worth knowing about if you read the source:

- **The swipe isn't React state.** Drag is `MotionValue`s mutated directly, so
  dragging costs **zero re-renders**. The stamps you see fade in as a derived
  transform, not as state changes.
- **The fly-off is imperative.** Once the gesture ends, Motion no longer owns `x`,
  so the card is animated out via `animate()` *before* the callback that advances
  the turn. The card is never unmounted mid-flight.
- **`AnimatePresence` is deliberately absent** from the phase router. With
  `mode="wait"` the outgoing screen waits for its exit animation — which cost
  ~220ms of dead screen on every phase change, and could strand the screen
  entirely. A keyed `motion.div` gives the same enter animation instantly.
- **The card `key` never includes `stage`.** A skip has to keep the *same* card
  instance so the 3D flip animates; keying on `stage` remounted it mid-reveal and
  replayed the flip from the front face.
- **Persistence stores question IDs, not questions.** Queue order has to survive a
  refresh, but the *content* should stay live. The in-flight card is deliberately
  not persisted — restarting a dare someone walked away from is worse than dealing
  a fresh one.
- **Only ids in the URL-less state machine.** `stage` (`question → answered →
  dare / callout → verdict`) is the spine; nearly every action funnels through one
  `advanceTurn()`, so turn rotation and game-over are implemented exactly once.

### Layout

```
src/
├─ components/SwipeCard.tsx      the whole mechanic: physics, 3D flip, haptics
├─ components/Commentator.tsx    the host: emoji face + one-line review
├─ components/CountUp.tsx        roll-up numbers for the Burn Book
├─ components/ConfettiBurst.tsx  emoji confetti on an answered card
├─ components/ArcadeBackdrop.tsx the drifting neon wash behind everything
├─ store/gameStore.ts            turn machine, scoring, persistence
├─ screens/
│  ├─ SetupScreen.tsx            players + game mode
│  ├─ GameScreen.tsx             card stack, Call Out window, verdict
│  └─ BurnBookScreen.tsx         awards, tie handling, share
├─ data/
│  ├─ questions.ts               content — one flat question pool
│  ├─ dares.ts                   content — dares + Call Out dares
│  ├─ commentary.ts              host quips + event barks, deterministic picker
│  ├─ playerColors.ts            seat colours across rail / card / Burn Book
│  └─ decks.ts                   aggregation, Coward ladder, dare picker
├─ types.ts                      the vocabulary
├─ App.tsx                       phase router
└─ index.css                     Tailwind @theme — palette, hard shadows, keyframes

smoke.ts                         store suite
render-smoke.tsx                 jsdom DOM suite
scripts/lint-content.ts          the content + host-voice quality gate
scripts/make-icons.ts            icon.svg → PNGs
```

---

## Known limitations

Being straight about these:

- **The physics have never been felt on a real device.** Every spring constant and
  threshold was written without a browser. Expect to want to retune
  `commitAnswer` / `commitSkip`.
- **The card is swipe-only.** The visible Answer / Dare buttons were removed by
  request, so on a phone a drag is the only way to commit a card — the keyboard
  arrows only help a desktop user. That's a deliberate trade for the gesture-first
  feel the game is named after, but it is a real accessibility gap.
- **The host's voice is finite.** 84 authored lines in one flat pool, so a
  long session will hear the same bark twice. The pool is cheap to extend — and
  `npm run lint:content` will refuse a duplicate line.
- **`preserve-3d` on the card is load-bearing.** Anything that flattens the 3D
  rendering context — a missing `transform-style`, or `overflow: hidden` on the
  card — makes the dare render mirrored. There is an assertion in
  `render-smoke.tsx` guarding both, because it shipped broken once already.
- **Haptics don't work on iOS.** `navigator.vibrate` is unsupported on iOS Safari
  everywhere. The visual stamps are the real feedback channel.
- **Refresh mid-question skips that card.** Scores survive; the in-flight card
  doesn't, by choice.
- **The 4-second Call Out window is a guess.** It needs testing with real players.
- **No PWA offline cache yet.** It's installable and cached opportunistically by
  the browser, but there's no service worker, so it still wants a connection.
- **Same-device play only.** One phone, everyone huddled. There's no second-screen
  or cast support.

---

## Contributing

Not open source, and honestly not much of a contribution model — see
[`LICENSE`](LICENSE). But content improvements, bug reports and accessibility
fixes are genuinely welcome: **[open an issue](https://github.com/AkshatJski/Hot_Seat_PartyGame/issues)**.
Read [`CONTRIBUTING.md`](CONTRIBUTING.md) first, and please run `npm run check`.

## Code of conduct

[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md) — with content-specific rules, because
this is a project where people actually embarrass each other.

## Security

[`SECURITY.md`](SECURITY.md). It's a client-only app with no backend, so the
interesting vector is unescaped rendering of player names. **Please don't open a
public issue for it.**

## License

**All rights reserved.** No open-source license — see [`LICENSE`](LICENSE).

If you want to fork it, study it, or ship it, open an issue and ask.

---

<div align="center">

Made with too much content and not enough sense.

**Swipe right to answer. There's no wrong answer. That's the problem.**

</div>