<!--
Thanks for taking the time. This is not an open-source project (see LICENSE), so
there's no expectation that you can just open a PR — but small, focused fixes are
welcome, and content improvements are the most valuable thing you can send.
-->

## Before you open this

- **Is this a content change?** If so, it belongs in an issue, not a PR. See
  `CONTRIBUTING.md`.
- **Could it be a one-line fix?** Comment on the issue and I'll do it. That's
  often faster than a PR round-trip.
- **Does it touch a spring constant, threshold, or haptic pattern?** Say so, and
  say how it *feels*. There is no browser in the environment this was built in, so
  those values are all untested guesses.

## What will be asked of you

- `npm run check` green — lint, both typechecks, both test suites, and a build.
- A test in `render-smoke.tsx` if you change a screen. Three UI bugs got through
  the store suite and were only caught by the DOM suite; a screen change without
  an assertion will get asked for one.
- Match the surrounding style. Notably: comments explain *why*, never *what*, and
  colours come from the `@theme` palette in `src/index.css` rather than hex codes.

## Checklist

- [ ] `npm run check` passes
- [ ] Added/updated an assertion in `render-smoke.tsx` if this touches UI
- [ ] No hardcoded colours
- [ ] No secrets, analytics, or network calls introduced
- [ ] New content follows the policy in `CONTRIBUTING.md` and the 18+ rules
- [ ] Commit messages say *why*, not just *what*