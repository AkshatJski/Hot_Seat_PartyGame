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

1. **Categories / decks are GONE, and so is Classic Circle.** There used to be
   seven decks (Icebreakers, Destroyers, Spicy 18+, Confessions, Would You Rather,
   Chaos, Unhinged) with a deck picker, an 18+ gate and a second game mode called
   Classic Circle (fixed turn order, Truth-or-Dare choice, wildcard per round).
   All of it has been removed. There is **no `DeckId`, no `Deck`, no `deck` field,
   no `sensitive` field, no `gameMode`, no `classicStage`, no `wildcard`, no
   `truthStreak`** anywhere. Do not reintroduce them.

2. **What replaced categories is the VIBE.** Three complete, separate content
   libraries — `family`, `friends`, `boys` — chosen once on Setup and never mixed
   during a game:
   - `src/data/packs/family.ts` → 140 questions / 70 dares / 30 call-outs
   - `src/data/packs/friends.ts` → 190 / 110 / 40
   - `src/data/packs/boys.ts` → 150 / 70 / 30 (18+)
   - `src/data/decks.ts` owns `VIBES`, `poolFor(vibe)`, `buildQuestionQueue(vibe)`,
     `dareTier`, `pickDare` and `contentCounts(vibe)`. The name is kept for
     history; it no longer has anything to do with decks.
   A card carries no `vibe` field: **the pack it lives in IS its vibe**. Ids are
   prefixed (`fam-`, `frn-`, `boy-`) so they stay unique across shelves.

3. **Content policy is enforced by a linter, not by vibes.** `npm run lint:content`
   (`scripts/lint-content.ts`) rejects cards for length, capitalisation, missing
   punctuation, duplicates (within and ACROSS shelves), vague wording, and
   anything touching a player's finances / body / health. It also applies a
   **tone gate**: the family shelf must contain zero profanity, zero adult content
   and no romance; the friends shelf must not swear or get explicit; the boys
   shelf is unrestricted. The host's barks are checked against the strictest gate,
   because the same voice speaks to every shelf. If you add content, this gate
   must stay green.

3b. **Content QUALITY is gated too, not just content legality.** `scripts/content-shapes.ts`
   classifies every question into one of six answer shapes
   (`nominate | rank | story | perform | predict | choose`, plus `other`) and the
   linter enforces: no shape above 35% of a pool, `nominate` at most 25% **and**
   every nominate card must carry a second clause, tier 1 ≥10% and tier 3 ≥8% and
   tier 2 ≥20%,
   cards of ≤8 words and ≥18 words each ≥8%, one dare opener ≤25% of dares and one
   call-out opener ≤30%. `npm run audit:content` prints those numbers per shelf
   (it never fails the build - it is the measuring instrument, not the gate).

4. **Questions are fun / quirky / roasty, but no longer one shape on loop.** The
   roasty "point at whoever" card still exists - it is capped at a quarter of a
   shelf and always demands evidence, an action or a consequence, never just a
   name. Tier 3 exists on every shelf and means something different on each:
   warmth on Family, uncomfortable honesty on Friends, loyalty and regret on Boys.
   Crude-for-the-sake-of-crude is not the goal; the shape spread is.

5. **Dares, Call Out, the Coward ladder and the turn limit are KEPT.** Only the
   second game mode and the question categories were removed.

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

**One mode, three shelves.** Setup picks the vibe (Family / Friends / Boys) and
an optional turn limit, then everything is the swipe loop below. The vibe decides
which question pool, dare pool and call-out pool the whole game draws from.

**The loop** (`src/store/gameStore.ts` — one state machine):

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

**Randomness + ending:** the chosen vibe's question pool is Fisher-Yates shuffled
into a queue (`buildQuestionQueue(vibe)`), dealt without replacement. When the
queue dries it **reshuffles the same vibe's pool** instead of ending the game
(`· ×2` on the card tells you which pass you are on), so the only ending is the
per-player turn limit or the End button.

**Persistence:** Zustand `persist` stores only **question IDs** (not the
question objects) plus scores and the chosen `vibe`, so queue order survives a
refresh while content stays live. The in-flight card is deliberately not
persisted. A save written before vibes existed has no `vibe` and dead ids: the
pool rebuilds empty, `poolIndex` clamps to 0, scores survive, and the next draw
reshuffles.

---

## Where things live

```
src/
├─ App.tsx                    phase router (setup | playing | burnbook)
├─ types.ts                   the vocabulary — Vibe/VibePack/Question/Dare/Player/GamePhase/Intensity
├─ store/gameStore.ts         turn machine, scoring, persistence, all game actions
├─ components/
│  ├─ SwipeCard.tsx           THE mechanic: drag physics, 3D flip, stamps, footer legend
│  ├─ Commentator.tsx         the host: drawn face in a speech bubble
│  └─ ...                     CountUp
├─ screens/
│  ├─ SetupScreen.tsx         names + vibe picker (with the 18+ warning) + length
│  ├─ GameScreen.tsx          card stack, Call Out window, verdict
│  └─ BurnBookScreen.tsx      per-player verdicts + share + colophon easter egg
└─ data/
   ├─ packs/family.ts         content — the family shelf (written clean)
   ├─ packs/friends.ts        content — the friends shelf
   ├─ packs/boys.ts           content — the 18+ shelf
   ├─ commentary.ts           host quips + event barks (deterministic hash picker)
   ├─ verdicts.ts             Burn Book archetypes (pure, no colour)
   ├─ playerColors.ts         seat palette
   └─ decks.ts                shelf lookup + queue + Coward ladder + dare picker
```

---

## Commands an agent should run before claiming a change is done

```bash
npm run check   # typecheck + lint + lint:content + smoke + render-smoke + build
```

Individually: `npm run typecheck`, `npm run lint`, `npm run lint:content`,
`npm test` (store suite), `npm run test:render` (jsdom DOM suite), `npm run build`.

To *see* the content mix rather than pass/fail it: `npm run audit:content`
(shape bar chart, intensity split, length spread, idea duplicates, dare verbs per
shelf). To read every card as plain text: `npm run dump:content` → `CONTENT-DUMP.txt`.

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
