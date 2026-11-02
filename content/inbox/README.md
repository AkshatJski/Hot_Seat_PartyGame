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

`_example.json` is a four-card sample that the importer accepts — run it to see
the output shape. It includes an **imperative question** (`Rank the room by who
would last longest in a cult.`) on purpose: that is the path the importer used to
reject while the gate accepted it (`report.md` BUG-014), and CI now runs this file
on every push.

## Keeping a batch

Once a batch has been curated and pasted into a pack, keep the JSON file as the
record of what was submitted. Re-running it will reject every card as a duplicate
of a shipped card — that is the duplicate check working, not a failure.

`boys-chaos.json` is the first real submission (114 cards, 6 rejected, all six
rewritten, then 114/114 accepted).
