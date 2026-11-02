# content/inbox

Drop one JSON file per shelf per batch here, then run:

```bash
npm run import:content content/inbox/boys-01.json
```

The importer writes a **reading sheet** to `content/review/boys-01.md`:

- accepted cards, grouped by shelf and pool, with stage and the writer's `why`
- everything rejected, with the exact reason
- a paste-ready TypeScript block for the cards you decide to keep

It never edits a pack. Curation stays a human decision.

## Rules the importer enforces

These are the same rules as `npm run lint:content` (both read
`scripts/content-rules.ts`), plus duplicate detection against the shipped packs:

| Check | Rejects |
|---|---|
| schema | unknown shelf/kind/needs, missing `why`, stage not 1–3 |
| length | under 5 or over 30 words |
| shape | a question with no `?`; a dare ending in `?` |
| mode | a question opening with a performance verb (`Mime`, `Dance`, `Draw`…) |
| follow-up | a `Who here…` card with no second clause |
| laziness | `the most X you have ever Y` |
| vagueness | `something`, `anything`, `one thing`, `stuff`, bare `it` |
| policy | finances, body, health (all shelves — never relaxed) |
| tone | family keeps romance/substances/profanity out; friends keeps profanity/explicit out |
| duplicates | exact or idea-overlap ≥ 0.6 against any shipped card on any shelf |

## What to expect

Roughly half of any batch is rejected or cut in curation. That is the design:
write more than you need, aim at the stage mix (≈25% stage 1, 50% stage 2,
25% stage 3), and read `CONTENT-BRIEF.md` before you start.

`_example.json` is a three-card sample that the importer accepts — run it to see
the output shape.
