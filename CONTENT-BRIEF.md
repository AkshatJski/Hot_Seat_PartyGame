# Truth or Swipe — Content Brief

You are writing cards for a real party game played by real groups in one room.
This document is the whole specification: voice, hard limits, per-shelf briefs,
worked exemplars, and the exact JSON to emit. Follow it literally. Anything that
does not match the schema is rejected by `npm run import:content` before a human
ever reads it.

---

## 1. What the game is

Phone passed around a table. A card appears; the player swipes right (truth,
answer it) or left (dare, do it). Three shelves, chosen once at setup, never
mixed:

| Shelf | Who is in the room | Tone |
|---|---|---|
| `family` | siblings, parents, cousins, grandparents | warm, specific, zero edgy |
| `friends` | the class group, the office, the group chat | honest, petty, funny, adult |
| `boys` | 18+, a group of men who know each other too well | dark, unhinged, confessional |

A card is **one turn**. If it can be answered in a word and nothing happens after,
it is a bad card.

---

## 2. Hard limits (non-negotiable)

These are enforced by the gate. A card that breaks one costs you the whole batch.

1. **Length** 5–30 words, one sentence or two. Median should land near 13.
2. **No player finances.** Never `money`, `salary`, `income`, `wage`, `net worth`,
   `bank balance`, `bank account`, `paycheck`. "Expensive mistake" and "the bill"
   are fine; asking someone what they earn is not.
3. **No player bodies or health.** Never `weight`, `fat`, `obese`, `diagnosis`,
   `medication`, `disorder`, `disabled`. Bodies as comedy (a bad haircut, a
   terrible dance) are fine; bodies as a measurement are not.
4. **No third party gets hurt.** Dares may involve phones, the room, mild physical
   stuff. Never injuries, never driving, never strangers, never anything illegal
   *as an instruction*. Boys may use crime as a **story or a hypothetical**.
5. **Family shelf**: zero profanity, zero sex, zero alcohol, zero romance
   (`dating`, `crush`, `girlfriend`, `boyfriend`, `ex`, `kiss`).
6. **Friends shelf**: no hard profanity, nothing explicit, no `porn`, `hookup`,
   `one-night`.
7. **Boys shelf**: profanity and darkness allowed. No explicit sex, no slurs, no
   instructions that would injure someone or get them arrested.
8. **No fake emergencies.** Never tell a player to text "I need help" or imply a
   crisis to someone outside the game.

---

## 3. Card grammar

A card must contain a **scene or a stake**. Concretely:

- **Name a specific thing**: a dish, a person in the room, a message, a night, a
  habit, a relative, a photo, a rule. Abstract nouns (`your journey`,
  `your values`, `your biggest fear`) are dead cards.
- **A nominate card needs a second clause.** `Who here is always late?` is a
  one-word turn and is rejected. `Who here is always late, and what is their
  excuse?` is a card.
- **Forbidden openers** (they read as a form to fill in):
  - `What is the most/biggest/worst/best X you have ever Y?`
  - `Something`, `anything`, `one thing`, `stuff`, `a thing`.
  - Bare `it` after do/say/want/try/like (`...and say it`).
- **No therapy.** No "what does success mean to you", no "when did you last feel
  truly seen". This is a party, not a workshop.
- **No instructions in the question pool.** A question is answered sitting down.
  If the card opens with a physical or performance verb (`mime`, `draw`, `dance`,
  `stand`, `perform`, `sing`, `hum`, `recite`, `recreate`, `impersonate`), it is a
  **dare**, not a question.
- **Answer shapes must vary.** Across a batch, mix: nominate (pick a person in the
  room), rank, story (a real memory), perform, predict (what would happen),
  choose (would you rather). No single shape over 35%.

---

## 4. The stage ladder  (this is the most important rule)

`stage` is what the evening feels like, and it is the same field the app calls
*intensity*. The deck is dealt **stage 1 → stage 2 → stage 3**, shuffled inside
each stage. So every batch must fill all three rungs, in these proportions:

| Stage | Share | Job | Test |
|---|---|---|---|
| 1 | ~25% | warm-up, first ten minutes, nobody exposed | a stranger could answer it |
| 2 | ~50% | the night has loosened up; specific, funny, a bit exposing | needs this group to land |
| 3 | ~25% | late game: confession, dark, the reason the shelf exists | someone hesitates before answering |

A shelf with no stage 1 opens at maximum heat and has nowhere to climb. A shelf
with no stage 3 has no ending, and dares stop escalating.

**Dares escalate too.** A dare's stage is a floor: in the last third of the
evening the room gets the hardest dares on the shelf. Write stage-3 dares that
actually cost something — a real message sent, a real admission, a real risk in
the room.

---

## 5. Shelf briefs

### 5.1 `family` — 170 questions · 70 dares · 40 call-outs

**The night:** a Sunday lunch that ran long. Warm, loud, a bit nosy. The best
cards are about the specific machinery of *this* family: who cooks, who is late,
who is the favourite, who never does the washing up. Played with a 12-year-old
and a grandparent in the same room.

**Allowed:** food, chores, siblings, weddings, funerals, holidays, photos,
group chats, family rules, mild physical dares, calling a relative.

**Banned:** romance, alcohol, profanity, sex, anything that makes a parent
uncomfortable, anything that makes a child feel tested.

**Themes with room left:**
- the unspoken seating rule, the dish that must exist, the phrase that ends an argument
- sibling alliances and the thing you hid from your parents together
- the relative nobody sits next to, and exactly what they ask you
- the family group chat and what it is actually used for
- what you would change about the family if nobody could take offence

**Dare ceiling:** ring a relative, swap phones for one round, admit a petty thing,
impersonate the family, dance like a relative. Never physical risk, never
anything that reveals something a parent should not hear at this table.

### 5.2 `friends` — 200 questions · 90 dares · 45 call-outs

**The night:** the group chat, in person, with consequences. The humour is petty
and specific: the friend who replies in four days, the bill nobody wants to
split, the screenshot everyone knows exists. Cards should feel like someone has
been saving this up.

**Allowed:** work, money-adjacent messiness (never income), dating, holidays,
housemates, group dynamics, phones, mild conflict, honesty about who is annoying.

**Banned:** hard profanity, explicit content, anything that would damage a real
friendship permanently — punch up at behaviour, not at a person's worth.

**Themes with room left:**
- who keeps score, and what is on the list
- the favour everyone knows you cannot refuse
- the thing said about someone the moment they left the room
- who takes credit, who disappears, who shows up at 3 AM
- the pettiest grudge and the pettiest revenge, both still alive

**Dare ceiling:** send a real message, call someone, read the deleted thing,
admit a relief at someone else's failure, swap phones, rank the room out loud.

### 5.3 `boys` — 220 questions · 100 dares · 35 call-outs

**The night:** 1 AM, everyone has stopped performing. The shelf should feel like
someone said the thing out loud. Dark, funny, occasionally uncomfortable — the
kind of card that gets a laugh and then a silence.

**Allowed:** profanity, betrayal, cowardice, jealousy, crime *as story or
hypothetical*, death jokes, cannibalism as a hypothetical, funeral speeches,
friendship debt, humiliation with consent, phones, secrets.

**Banned:** explicit sex, slurs, instructions to injure or break the law, real
threats, anything about a player's body, health or income. ("No guardrails" means
*no cosy cards* — it does not mean removing these three.)

**The shelf has two registers and needs both.** A shelf of nothing but confessions
becomes a therapy circle; a shelf of nothing but absurdity becomes a comedy night.
Write roughly half of each:

1. **Invent, together.** High-concept scenarios the group has to cast and decide:
   hide a body and assign jobs, found a cult and name the first heretic, turn the
   group into a country and ban something, cast a heist including the fall guy,
   survive a zombie room and pick who is bitten first, decide who gets eaten. This
   register spreads the answer across the table instead of pinning one person, and
   it makes people say true things they would dodge if asked directly.
2. **Confess, alone.** The darkest register: the worst thing done to someone in
   this room and never admitted, the lie still being told, who you secretly wrote
   off, whose trust you are betraying right now, the funeral speech you would never
   give, who you would abandon in a crisis.

**Nothing on this shelf may be safe.** If a card could appear on the Friends shelf,
it belongs there. The test: would somebody at this table hesitate for half a second
before answering? If not, cut it.

**Still off the table even here:** explicit sex, slurs, and any instruction that
could injure a player or get them arrested. Crime is always hypothetical or
narrated — *"you have one hour to hide a body, what is your job?"* is a game;
*"steal something from the shop"* is a police report.

**Volume:** 217 questions · 97 dares · 36 call-outs as of 2026-11-02 23:32. Next
target 250 / 110 / 40, and the priority is judging the batch that exists (run it
with a real group, cut what dies) rather than writing more blind.

**Themes with room left:**
- group-level chaos: founding a religion, a country, a cult, a criminal enterprise
- the vote with a real cost: who gets left behind, who takes the blame, who is eaten
- what you owe someone here and will never repay
- the thing you would do if you knew you would never be caught
- the worst version of you, and who here has met it

**Dare ceiling:** name the person you trust least and say it to their face; admit
what you would deny under oath; call someone and ask what they really think;
rate the group's last decision to their faces.

**Crime is a story, not a plan.** "What is the pettiest thing you have done that
you would deny under oath?" works. "Steal something from the shop" does not.

---

## 6. Call-out dares (`kind: "callout"`)

A call-out is played *on top of* whatever card was just read: the group decides
you answered badly, and you must redo it with a constraint. So a call-out must be
a **modifier**, not a new question.

- Good: `Answer this while holding eye contact with the person who called you out.`
- Good: `Redo the answer in the voice of a newsreader, no smiling.`
- Bad: `Tell us your worst habit.` (that is a question, not a constraint)

Keep them short (5–14 words), physically safe, and finishable in the same turn.

---

## 7. Exemplars — this is the bar

All of these are **already shipped** and passed the gate. Match this level.

### Family
| Stage | Kind | Card | Why it works |
|---|---|---|---|
| 1 | question | Would you rather host or be hosted? | short, warm, instantly answerable |
| 2 | question | Who here would take the whole family in if things went wrong, and who would need taking in? | names a real trade-off, two clauses |
| 1 | question | What is the rule about who sits where at dinner, and who enforces it? | specific machinery of this family |
| 2 | dare | Ring a relative who is not here and tell them a truth you have never said out loud. | costs something, still safe |
| 2 | dare | Tell the person to your left what you would change about them, then what you would keep. | real risk, protected by the second half |
| 3 | dare | Swap phones with the person next to you for one round. No locking the screen. | the hardest thing this shelf can ask |

### Friends
| Stage | Kind | Card | Why it works |
|---|---|---|---|
| 1 | question | Rank the group by reply speed. | six words, whole table reacts |
| 2 | question | What is the one favour people ask you for because they know you will not refuse? | self-implicating, no escape |
| 3 | question | Who here has quietly stopped being friends with someone in this room, and what ended it? | the silence it creates is the point |
| 2 | dare | Text the third person in your recent chats a single full stop. | tiny act, real consequence |
| 3 | dare | Say one true thing about every person here, and let them guess which one hurt. | everyone stays in the round |
| 2 | dare | Give the person opposite a compliment that costs you pride to say. | cheap to do, expensive to mean |

### Boys
| Stage | Kind | Card | Why it works |
|---|---|---|---|
| 1 | question | Everyone here gets a warning label. What is yours, and who ignores theirs? | cheap, funny, and quietly a roast |
| 1 | question | Would you rather be feared or liked? | short, icebreaker, still loaded |
| 2 | question | Give everyone here a criminal alias and the crime they are known for, starting with yourself. | crime as story, and you go first |
| 3 | question | Name the worst thing you have done to a friend behind their back. One sentence, no softening. | the shelf's thesis |
| 3 | question | You are all in a Saw trap. Who solves it, who sacrifices themselves, who is the traitor? | three roles, and the traitor is a real accusation |
| 3 | question | If this group had to eat one person here to survive, who cooks, who refuses, who asks for seconds? | the seconds answer is the whole game |
| 2 | question | Who here is the reason a plan fell through, and what did they say happened instead? | accuses the room, not a person |
| 3 | question | What do you know about someone in this room that they do not know you know? | silence, then a laugh, then a confession |
| 3 | dare | Tell the room what you have done that you would deny under oath. | no props required, maximum cost |
| 3 | dare | Tell the room what you would do if you knew you would never be caught. | the no-guardrails card |
| 3 | dare | Name the person here you trust least, then say that to their face with one reason. | the room holds its breath |
| 2 | dare | Tell the person to your left the first impression you had of them, unedited. | warm and dangerous at once |

### Call-outs
| Kind | Card |
|---|---|
| callout | Redo the answer in the voice of a newsreader, no smiling. |
| callout | Answer this while holding eye contact with the person who called you out. |
| callout | Give your answer standing, like a press conference. |

---

## 8. Output format

Emit **one JSON file per shelf**. No prose, no markdown fences needed (the
importer strips them anyway).

```json
[
  {
    "shelf": "boys",
    "kind": "question",
    "stage": 3,
    "text": "What do you know about someone in this room that they do not know you know?",
    "why": "accuses nobody and everybody; the pause is the content"
  },
  {
    "shelf": "boys",
    "kind": "dare",
    "stage": 2,
    "text": "Tell the person to your left the first impression you had of them, unedited.",
    "needs": "none",
    "why": "real social risk, zero props"
  }
]
```

Field rules:

| Field | Required | Values |
|---|---|---|
| `shelf` | yes | `family` \| `friends` \| `boys` |
| `kind` | yes | `question` \| `dare` \| `callout` |
| `stage` | yes | `1` \| `2` \| `3` |
| `text` | yes | 5–30 words, final copy, correct punctuation |
| `needs` | no | `none` \| `phone` \| `room` \| `prop` (advisory only; tells curation what the dare needs) |
| `why` | yes | one line: what makes it land. Not shown to players. |

Deliver in batches of **40–60 cards** per file so failures are cheap. Name files
`content/inbox/<shelf>-<batch>.json`.

---

## 9. Before you submit — self-check

Run these three and fix everything they report:

```bash
npm run import:content content/inbox/boys-01.json   # schema, dupes, policy, shape
npm run lint:content                                # the full gate
npm run audit:content                               # stage mix, shape mix, stakes
```

The importer rejects, with a reason, any card that is:

- not valid JSON, or missing/typo'd fields
- outside 5–30 words
- tripping a policy word (§2)
- a near-duplicate of a shipped card (idea overlap ≥ 0.6)
- a duplicate of another card in the same file
- a question opening with a performance verb (§3)
- a nominate card without a second clause
- a lazy opener or a vague payload

Everything else goes into a **reading sheet** at `content/review/` for a human to
curate. Expect roughly half of what you submit to be cut. That is normal and
healthy — write more than you think is needed.

---

## 10. What we are deleting, and will not accept back

These classes were removed from the shipped packs on purpose. Do not reintroduce
them:

- **The voice-trick dare.** "Say the alphabet as a breakup speech", "read your
  last message in a villain voice", "speak in an accent for three rounds". Funny
  once, filler the fourth time. At most one per shelf, ever.
- **The superlative form.** "What is the most embarrassing thing you have ever
  done?" — no scene, no specifics, nobody remembers the answer.
- **The vote with no consequence.** "Rank everyone here by how loud they are."
  Ranking is allowed, but it must cost something or reveal something.
- **The therapy prompt.** "Describe your biggest change this year."
- **The duplicate idea.** The same card with one noun swapped. If a shipped card
  already covers it, write a different card.

If you are unsure whether a card is good, ask: *would anyone repeat it at work on
Monday?* If not, cut it yourself before we do.
