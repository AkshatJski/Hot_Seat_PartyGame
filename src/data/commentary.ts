import type { DeckId } from '../types'

/**
 * THE COMMENTATOR
 *
 * The trash-talking host that replaced the reaction memes. It speaks in two
 * modes:
 *
 *   1. PER CARD — `quipForCard()` pins a line to the question on screen. This is
 *      the direct replacement for the old `memeForCard()` reaction image.
 *   2. PER EVENT — `reactionFor()` barks when something happens (an answer, a
 *      skip, a Call Out, a verdict).
 *
 * Both are picked by DETERMINISTIC hash, never `Math.random()`. That is the
 * whole trick: React re-renders constantly, and a random pick would re-roll the
 * line under the player's thumb, flickering between two barks as they hold the
 * phone still. Hashing the card id / event seed keeps a line stable for the life
 * of whatever it is attached to.
 *
 * The pools are typed `Record<DeckId, …>` / `Record<GameEvent, …>` on purpose:
 * adding a deck or an event becomes a COMPILE ERROR until it has a voice.
 *
 * Every line carries a `mood`, which the UI turns into an emoji face and an
 * accent colour. Tone is deliberately playful, never cruel, and the Spicy pool
 * stays suggestive without being explicit — it does not raise the deck's heat.
 */
export type Mood =
  | 'hype'
  | 'judgy'
  | 'spicy'
  | 'chaos'
  | 'sympathy'
  | 'deadpan'
  | 'suspicious'

export interface Quip {
  text: string
  mood: Mood
}

export const MOOD_EMOJI: Record<Mood, string> = {
  hype: '🔥',
  judgy: '😏',
  spicy: '😳',
  chaos: '🫠',
  sympathy: '😬',
  deadpan: '😐',
  suspicious: '👀',
}

/** Tailwind text-colour class per mood. Also read by the content linter. */
export const MOOD_ACCENT: Record<Mood, string> = {
  hype: 'text-neon-amber',
  judgy: 'text-neon-purple',
  spicy: 'text-neon-red',
  chaos: 'text-neon-lime',
  sympathy: 'text-neon-cyan',
  deadpan: 'text-white/50',
  suspicious: 'text-neon-pink',
}

const q = (text: string, mood: Mood): Quip => ({ text, mood })

/** One-liners pinned under the card. Tone tracks the deck. */
export const CARD_QUIPS: Record<DeckId, Quip[]> = {
  icebreakers: [
    q('Easy one. Too easy.', 'deadpan'),
    q('Starters do not get softer than this.', 'deadpan'),
    q('Answer like your mother is watching.', 'judgy'),
    q('Low stakes. High judgement.', 'judgy'),
    q('Warm-up lap. Do not pull a hamstring.', 'hype'),
    q('You can tell a lot from this answer.', 'suspicious'),
    q('Gentle. For now.', 'suspicious'),
    q('This one is basically a handshake.', 'deadpan'),
  ],
  destroyers: [
    q('Someone at this table is in trouble.', 'suspicious'),
    q('Say it to their face. Coward.', 'judgy'),
    q('This is how friendships end. Nicely.', 'deadpan'),
    q('The room already knows the answer.', 'judgy'),
    q('Name names. Go on.', 'hype'),
    q('Ooh. Careful now.', 'sympathy'),
    q('There is no safe answer here.', 'suspicious'),
    q('Point at someone. We are watching.', 'judgy'),
  ],
  spicy: [
    q('Careful. This one bites.', 'spicy'),
    q('Oh, we are going there.', 'spicy'),
    q('Answer honestly. Or lie very well.', 'judgy'),
    q('Blushing is not an answer.', 'judgy'),
    q('The room is listening very closely.', 'suspicious'),
    q('Keep it clean. Ish.', 'spicy'),
    q('Yikes. Good luck.', 'sympathy'),
    q('No take-backs on this one.', 'deadpan'),
  ],
  unhinged: [
    q('What is wrong with you people?', 'chaos'),
    q('This is not a normal question.', 'chaos'),
    q('Embrace the gremlin within.', 'chaos'),
    q('There are no rules out here.', 'chaos'),
    q('Answer it. Regret it later.', 'hype'),
    q('I have lost control of this game.', 'chaos'),
    q('Nothing about this makes sense.', 'deadpan'),
    q('Yes. Obviously yes.', 'hype'),
  ],
  confessions: [
    q('Ooh. That one is heavy.', 'sympathy'),
    q('No wrong answers. Only honest ones.', 'sympathy'),
    q('Deep breath. Go.', 'sympathy'),
    q('The circle is bound by oath.', 'deadpan'),
    q('You do not have to look at anyone.', 'sympathy'),
    q('This is the good stuff.', 'hype'),
    q('Admit it. You will feel better.', 'judgy'),
    q('We all already assumed that.', 'deadpan'),
  ],
  dilemmas: [
    q('No third option. Choose.', 'judgy'),
    q('Both are bad. Pick your bad.', 'deadpan'),
    q('Defend it out loud.', 'hype'),
    q('The room judges your logic.', 'judgy'),
    q('There is a right answer. Probably.', 'suspicious'),
    q('Commit to one. No waffling.', 'judgy'),
    q('Two doors. One choice.', 'deadpan'),
    q('Explain yourself. Thoroughly.', 'judgy'),
  ],
  chaos: [
    q('This one is about all of you.', 'hype'),
    q('Whoever flinches first loses.', 'chaos'),
    q('Absolute nonsense. Continue.', 'chaos'),
    q('The group has been summoned.', 'suspicious'),
    q('Somebody is getting exposed.', 'hype'),
    q('Point. Accuse. Escalate.', 'hype'),
    q('Reality is optional here.', 'chaos'),
    q('Chaos requested. Chaos delivered.', 'chaos'),
  ],
}

/** Barks fired by game events, not by a specific card. */
export type GameEvent =
  | 'answer'
  | 'dare'
  | 'callOut'
  | 'verdict'
  | 'roundStart'
  | 'pass'
  | 'lastCard'
  | 'finish'

export const EVENT_QUIPS: Record<GameEvent, Quip[]> = {
  answer: [
    q('Bold. Documented.', 'hype'),
    q('Answered. The room heard it.', 'deadpan'),
    q('That counts. Barely.', 'judgy'),
    q('Nerves of steel. Noted.', 'hype'),
    q('Okay, that was actually good.', 'hype'),
    q('Brave point earned. Spend it wisely.', 'hype'),
  ],
  dare: [
    q('A dare. How brave of you.', 'judgy'),
    q('Dare revealed. No complaints.', 'deadpan'),
    q('The fun stuff. Get on with it.', 'hype'),
    q('I picked this one specially.', 'suspicious'),
    q('Perform. The circle is waiting.', 'hype'),
  ],
  callOut: [
    q('CALLED OUT. No escape.', 'hype'),
    q('The group smells weakness.', 'suspicious'),
    q('Overturned. Prove it again.', 'judgy'),
    q('Brave point. Gone.', 'hype'),
    q('The gavel has spoken.', 'judgy'),
    q('Called out. Sweating yet?', 'suspicious'),
  ],
  verdict: [
    q('Was that real? Vote now.', 'suspicious'),
    q('The court is in session.', 'judgy'),
    q('Somebody is about to lose a point.', 'hype'),
    q('Justice, or chaos. Your call.', 'deadpan'),
  ],
  roundStart: [
    q('New round. New crimes.', 'hype'),
    q('Fresh nightmare. Same table.', 'chaos'),
    q('Another round of bad decisions.', 'hype'),
    q('Cards shuffled. Reputations at risk.', 'judgy'),
  ],
  pass: [
    q('Hand it over. Gently.', 'deadpan'),
    q('Next victim, please.', 'judgy'),
    q('Your turn is someone else problem now.', 'hype'),
    q('Pass the phone. Face the music.', 'hype'),
  ],
  lastCard: [
    q('Final card. Make it count.', 'hype'),
    q('Last one. Go out loud.', 'hype'),
    q('End of the line. Impress me.', 'judgy'),
  ],
  finish: [
    q('That is a wrap. Receipts below.', 'judgy'),
    q('Game over. The Burn Book awakens.', 'hype'),
    q('You survived. Mostly.', 'deadpan'),
    q('Scores are in. No arguments.', 'judgy'),
  ],
}

/** FNV-1a. Small, fast, stable across runs — no randomness, no hydration drift. */
function hash(input: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/**
 * The line pinned to a card. Stable per (card id, deck): the same card always
 * draws the same joke, and it never changes while the card is on screen.
 */
export function quipForCard(cardId: string, deck: DeckId): Quip {
  // The `??` is not paranoia for its own sake: the old meme picker returned null
  // for an unknown deck and the tests asserted "no throw". DeckId is a closed
  // union, but a stale persisted card can still carry an id this build no longer
  // knows, and a party game must never white-screen over a joke.
  const pool = CARD_QUIPS[deck] ?? CARD_QUIPS.icebreakers
  return pool[hash(cardId) % pool.length]
}

/**
 * A bark for an event. `seed` (usually the turn or round) keeps it from being
 * the same line every single time the event fires, while still being stable for
 * a given seed.
 */
export function reactionFor(event: GameEvent, seed: string): Quip {
  const pool = EVENT_QUIPS[event]
  return pool[hash(`${event}:${seed}`) % pool.length]
}
