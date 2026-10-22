# AGENT BRIEF — Truth or Swipe

A short orientation for an AI agent (or a new dev) picking up this repo.
Read this first; it tells you what the app is and what is actually happening.

---

## What this app is

**Truth or Swipe** is a client-only, pass-the-phone party game. One phone is
handed around a circle of friends. Whoever holds it gets a question; they either
**swipe right to answer** or **swipe left to take a dare** instead. The group can
**Call You Out** if they think the answer was weak, which docks a point and
forces a punishing dare. At the end, every player gets a verdict in the
**Burn Book**.

- **No backend, no accounts, no network calls.** One static bundle + `localStorage`.
- **Stack:** Vite 8 · React 19 · Tailwind CSS v4 · Motion (framer-motion successor) · Zustand + `persist`.
- **Installable PWA** (Add to Home Screen), no service worker / offline cache yet.

---

## The current state of the code (important)

The app is mid-refactor, and this is what an agent must understand before touching it:

1. **Categories / decks are GONE.** There used to be seven decks (Icebreakers,
   Destroyers, Spicy 18+, Confessions, Would You Rather, Chaos, Unhinged) with a
   deck picker on Setup and an 18+ age gate. All of that has been removed. There
   is **no `DeckId`, no `Deck`, no `deck` field, no `sensitive` field** anywhere.
   Do not reintroduce them.

2. **There is ONE flat pool per content type:**
   - `src/data/questions.ts` → `QUESTIONS` (137 questions)
   - `src/data/dares.ts` → `DARES` (67) and `CALL_OUT_DARES` (26)
   - `src/data/decks.ts` re-exports them as `ALL_QUESTIONS` / `ALL_DARES` /
     `ALL_CALL_OUT_DARES` and owns the shuffler, the Coward ladder and the dare
     picker. (The file is still called `decks.ts` for history; it no longer has
     anything to do with decks.)

3. **Content policy is enforced by a linter, not by vibes.** `npm run lint:content`
   (`scripts/lint-content.ts`) rejects cards for length, capitalisation, missing
   punctuation, duplicates, vague wording, and anything touching a player's
   finances / body / health. It reads the same flat pools the app does. If you add
   content, this gate must stay green.

4. **Questions are intentionally fun / quirky / roasty.** Deep-thinking, regret,
   confession and intimate questions were deliberately stripped out. The roasty
   questions point at the people in the room and are deliberately punchy.

5. **Dares and Classic Circle are KEPT.** Only the *question categories* were
   removed. Dares, the Call Out mechanic, the Coward ladder and the Classic
   Circle mode still exist and still work.

6. **Two extra controls exist on a question turn** (added on request):
   - **Reroll** — swaps the card, **once per turn**, covering both sides: a new
     question on the question side, a new dare on the dare side. Guarded by
     `rerollUsed` (reset in `blankTurn()`). A question reroll consumes a card from
     the queue; a dare reroll does not.
   - **Chicken out (−1)** — refuses *both* the question and the dare: `coward +1`,
     `flinchCount +1`, `answerStreak = 0`, turn ends, **no dare drawn**. Harsher
     than a swipe-left, which still forces a dare. Not offered during a Call Out
     (and the store routes it to the verdict if it ever is).

   These are the only buttons; there is still deliberately **no Answer/Dare
   button pair** — the card remains the swipe control.

---

## How a game flows (the real mechanics)

**Two modes**, chosen on Setup:

- **Free Play (`gameMode: 'free'`)** — the swipe loop below.
- **Classic Circle (`gameMode: 'classic'`)** — fixed turn order, each turn the
  player picks Truth or Dare, a wildcard modifier applies to the round, and 3
  truths in a row locks you into a forced dare.

**The Free Play loop** (`src/store/gameStore.ts` — one state machine):

```
setup → playing → burnbook
         │
         ├── stage: question  ──swipe right──▶ answered ──(4s Call Out window)──▶ next turn
         │                    ──swipe left───▶ dare (card 3D-flips) ──Done──▶ next turn
         └── callOut on an answered card ──▶ callout (punishing dare, Done-only)
                                                   ──Done──▶ calloutVerdict
                                                              ↳ Deserved → next turn
                                                              ↳ Wrong call → caller gets falseAccusations +1
```

**Scoring / stakes:**
- Swipe right → `brave +1`.
- Swipe left → **free**, and the card flips to a dare you must do. (Dares are
  incentivised; only refusing costs you.)
- Chicken out → `coward +1` **and** `flinchCount +1`, no dare, turn ends. Reroll →
  swaps the card once per turn, no score change either way.
- Call Out → `brave −1`, `timesCalledOut +1`, and a dare from the separate
  `CALL_OUT_DARES` pool. The accused keeps the turn. That dare is **not** a normal
  dare: `selectAwaitingDare` excludes it, the action bar is Done-only, and
  `chickenOut()` during it routes to `calloutVerdict` rather than ending the turn —
  otherwise the verdict (and `penalizeCaller`) would be unreachable.
- `flinchCount` (hidden) raises the **dare tier** (`1 + floor(flinchCount/2)`,
  capped at 3) — a *floor* on dare intensity, so a chronic dodger can't be let off
  with an easy dare. It degrades gracefully if hard dares run out. The visible
  `coward` score is **not** an input to this.
- A wrong call increments `falseAccusations` only. It deliberately does not touch
  `coward`, which `verdictFor()` reads as chicken-outs.

**Randomness:** the whole question pool is Fisher-Yates shuffled into a queue
(`buildQuestionQueue()`), dealt without replacement. **"Cards run out = game
over"** is both the end condition and the anti-repetition mechanism.

**Persistence:** Zustand `persist` stores only **question IDs** (not the
question objects) plus scores, so queue order survives a refresh while content
stays live. The in-flight card is deliberately not persisted.

---

## Where things live

```
src/
├─ App.tsx                    phase router (also branches Classic Circle sub-stages)
├─ types.ts                   the vocabulary — Question/Dare/Player/GamePhase/Intensity
├─ store/gameStore.ts         turn machine, scoring, persistence, all game actions
├─ components/
│  ├─ SwipeCard.tsx           THE mechanic: drag physics, 3D flip, stamps, footer legend
│  ├─ Commentator.tsx         the host: drawn face in a speech bubble
│  └─ ...                     CountUp
├─ screens/
│  ├─ SetupScreen.tsx         names + game mode (no decks, no 18+ gate)
│  ├─ GameScreen.tsx          card stack, Call Out window, verdict
│  ├─ TurnIntroScreen.tsx     Classic Circle: round intro / wildcard
│  ├─ TruthOrDareScreen.tsx   Classic Circle: Truth or Dare choice
│  ├─ NextUpScreen.tsx        Classic Circle: pass-the-phone screen
│  └─ BurnBookScreen.tsx      per-player verdicts + share + colophon easter egg
└─ data/
   ├─ questions.ts            content — flat question pool
   ├─ dares.ts                content — dares + call-out dares
   ├─ commentary.ts           host quips + event barks (deterministic hash picker)
   ├─ wildcards.ts            Classic Circle round modifiers
   ├─ verdicts.ts             Burn Book archetypes (pure, no colour)
   └─ decks.ts                aggregation + Coward ladder + dare picker
```

---

## Commands an agent should run before claiming a change is done

```bash
npm run check   # typecheck + lint + lint:content + smoke + render-smoke + build
```

Individually: `npm run typecheck`, `npm run lint`, `npm run lint:content`,
`npm test` (store suite), `npm run test:render` (jsdom DOM suite), `npm run build`.

---

## Gotchas that have bitten before

- **`preserve-3d` on the card is load-bearing.** Remove it (or add
  `overflow:hidden`) and the dare renders as mirrored text. There are assertions
  in `render-smoke.tsx` guarding this because it shipped broken once.
- **The card is swipe-only.** There are no Answer/Dare buttons by design. Keyboard
  arrows (`←`/`→`) in GameScreen raise the same signal a drag does. The two
  buttons that *do* exist (Reroll, Chicken out) express things a swipe cannot.
- **The card front face is a fixed height.** The question + host quip live in a
  `flex-1 min-h-0` region; the "Dare / or / Answer" row is a pinned `shrink-0`
  footer so it can't be pushed off by long text.
- **The host's voice is deterministic**, hashed from the card id — never
  `Math.random()`, or the line flickers on every re-render.
- **`decision.md`, `Flow.md`, `learn.md` are local-only** (gitignored engineering
  docs). Keep them updated when code changes; they are intentionally not pushed.
```
