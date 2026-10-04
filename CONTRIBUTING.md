# Contributing

Thanks for looking at this. A few honest notes before you start.

## The short version

This project is **not open source**. It carries no license (see [`LICENSE`](LICENSE)),
which means there is no contribution model in the usual sense — by default you
have no right to ship a derivative, and I have no obligation to merge anything.

If you'd like to contribute, **open an issue first** and say what you have in
mind. That's it. Most small fixes I'll just do.

## What is actually useful

Ordered roughly by how much I'd appreciate it.

| Kind | Example | Notes |
| --- | --- | --- |
| **Content** | New questions/dares, better phrasing, removing anything that landed badly | The highest-value contribution by far. Content is the product. |
| **Bug report** | "On iPhone 14 Safari, the flip animation stops halfway" | Include device + browser + what you expected |
| **Bug fix** | A PR with the fix | Run `npm run check` first |
| **Accessibility** | Keyboard traps, contrast, screen-reader labels | I care about this more than most party-game projects do |
| **Physics feel** | "The snap-back is too fast at 0.6× overshoot" | Needs a real device; see below |
| **New mechanic** | New deck, new award, new punishment | Open an issue *before* writing it |

## Before you open a PR

```bash
npm install
npm run check
```

`npm run check` is lint + both typechecks + both test suites + a production
build. All of it must be green. If it isn't and you can't work out why, open an
issue with the output — that's a bug in my setup, not in your PR.

### The tests are not optional

There are two suites and they catch different things:

- `npm test` — the store and content. Drives the turn machine, scoring, the Coward
  ladder, and a full playthrough.
- `npm run test:render` — mounts the real React tree in jsdom and asserts the DOM
  at every stage, plus zero console errors.

Three real UI bugs shipped through the first suite cleanly and were only caught
by the second. If you change a screen, add an assertion to
[`render-smoke.tsx`](render-smoke.tsx).

### Code conventions

Match what's already there. In short:

- **No comments explaining *what*.** Comments explain *why* — especially why an
  approach that looks wrong was chosen. The codebase is dense with them for that
  reason.
- Strict TypeScript. `erasableSyntaxOnly` is on: no `enum`, no parameter
  properties.
- Tailwind utilities for styling. The neon palette lives in `@theme` in
  `src/index.css` (`bg-coal`, `text-neon-green`, `border-neon-purple`, …).
  Don't hardcode hex values in components.
- Motion values (`useMotionValue` / `useTransform`) for anything driven by a
  gesture or animation. Never React state per frame — that's the whole reason
  dragging costs zero re-renders here.

### Content rules, which are not negotiable

These are product decisions, documented in `src/data/decks.ts`:

1. **Questions carry the heat. Dares are deliberately tame.** There is no "dark"
   dare tier, and there won't be one. `Intensity` on a dare is a *difficulty*
   hint, never a risk level.
2. **No physical risk, no property damage, no tasks involving strangers,
   animals, or anyone outside the room.**
3. **No targeting anyone by name, identity, health, body, trauma, or finances.**
   The game is played by people who know each other — a card can be humiliating
   by accident.
4. Anything sexual belongs in the Spicy deck only, which is 18+ gated.
5. Write for a mixed audience. If a card needs a content warning, it's the wrong
   card.

## Physics and haptics need a real device

There is no browser in the environment this was built in, so every spring
constant, threshold and haptics pattern is **written but never felt**. If you have
a phone:

```bash
npm run dev
# then open the LAN URL Vite prints on that phone
```

`commitAnswer`, `commitSkip` and `buzz()` in
[`src/components/SwipeCard.tsx`](src/components/SwipeCard.tsx) are where to
change it. Concrete numbers with how they *feel* are far more useful than
"feels better".

## Adding content

Content lives in one file per deck under `src/data/`, aggregated by
`src/data/decks.ts`. To add a whole new deck:

1. Add the id to the `DeckId` union in `src/types.ts` — the compiler will then
   point at every switch and record that needs updating. That's deliberate.
2. Create `src/data/<deck>.ts` exporting `questions`, `dares`, `callOutDares`.
3. Register it in `DECKS` in `src/data/decks.ts`.
4. Add a `label`, `blurb` and `minAge`.

`npm test` asserts the content counts, so a malformed deck fails loudly.

## Reporting security issues

Not via public issues — see [`SECURITY.md`](SECURITY.md).

## Code of conduct

[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).