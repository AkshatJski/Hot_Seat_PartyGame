/**
 * ANSWER SHAPES — the one thing the old gate never measured.
 *
 * The first version of the content gate checked tone, length, vagueness and
 * duplicate *text*. All four passed while two thirds of the Friends shelf was
 * "pick a person", because "Who here is…", "Point at whoever…" and "Name the
 * person…" are three different opening-4-word buckets and therefore three
 * different templates as far as a text gate could see.
 *
 * A shape is what the *player* has to do with the card:
 *
 *   nominate  pick a person in the room            ("Point at whoever…")
 *   rank      put the room in an order             ("Rank everyone by…")
 *   story     produce an anecdote from memory      ("What is the worst…")
 *   perform   do something out loud, right now     ("Say your name as…")
 *   predict   commit to what would/will happen     ("What would this family do…")
 *   choose    pick between two given options       ("Would you rather…")
 *
 * Shape, not topic, is what the table feels. Ten cards about ten different
 * subjects can still be the same round ten times; ten cards in six shapes
 * cannot. Shared by `lint-content.ts` (which enforces the mix) and
 * `audit-content.ts` (which reports it).
 */

export type Shape = 'nominate' | 'rank' | 'story' | 'perform' | 'predict' | 'choose' | 'other'

export const SHAPES: Shape[] = ['nominate', 'rank', 'story', 'perform', 'predict', 'choose', 'other']

/** Verbs that open a card the player has to *do*, not answer. */
export const PERFORM_VERBS = new Set([
  'act',
  'announce',
  'answer',
  'argue',
  'assign',
  'call',
  'cast',
  'copy',
  'count',
  'dance',
  'defend',
  'deliver',
  'design',
  'draw',
  'explain',
  'give',
  'guess',
  'hold',
  'hum',
  'imagine',
  'imitate',
  'impersonate',
  'improvise',
  'invent',
  'list',
  'make',
  'mime',
  'mimic',
  'name',
  'narrate',
  'perform',
  'pitch',
  'pretend',
  'prove',
  'read',
  'recite',
  'recount',
  'roast',
  'say',
  'share',
  'sing',
  'spell',
  'stand',
  'swap',
  'tap',
  'tell',
  'text',
  'whisper',
  'write',
])

const NOMINATE =
  /^(point at\b|who here\b|who in this room\b|who is\b|who would\b|who has\b|which of us\b|which (?:family member|relative|person|player|friend|cousin)\b|name the person\b)/i
const RANK = /^(rank|rate|order)\b/i
const CHOOSE = /^(would you rather|pick one\b|pick between\b|choose between\b)/i
const PREDICT = /^(what would\b|what will\b|what happens\b|predict\b|if you had to\b|if the room\b|if this\b)/i
const STORY =
  /^(what (?:is|was|are|were|has|have|did)\b|when did\b|why did\b|how did\b|tell us\b|describe\b|talk us through\b|walk us through\b)/i

const firstWord = (t: string) => (t.trim().toLowerCase().match(/^[a-z']+/) ?? [''])[0]

export function shapeOf(text: string): Shape {
  const t = text.trim()
  if (NOMINATE.test(t)) return 'nominate'
  if (RANK.test(t)) return 'rank'
  if (CHOOSE.test(t)) return 'choose'
  if (PREDICT.test(t)) return 'predict'
  if (STORY.test(t)) return 'story'
  if (PERFORM_VERBS.has(firstWord(t))) return 'perform'
  return 'other'
}

/** Words that carry no idea — ignored when comparing two cards. */
const STOP = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from',
  'your', 'yours', 'you', 'their', 'they', 'them', 'that', 'this', 'these', 'those', 'what',
  'which', 'who', 'whom', 'when', 'where', 'why', 'how', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'would', 'will', 'could',
  'should', 'can', 'may', 'might', 'must', 'here', 'there', 'then', 'than', 'so', 'if',
  'not', 'no', 'yes', 'most', 'ever', 'never', 'always', 'one', 'every', 'each', 'any',
  'all', 'some', 'more', 'much', 'very', 'just', 'also', 'out', 'up', 'down', 'off', 'over',
  'about', 'into', 'onto', 'by', 'as', 'it', 'its', 'his', 'her', 'hers', 'him', 'she',
  'he', 'theyre', 'im', 'ive', 'dont', 'doesnt', 'didnt', 'wouldnt', 'cant', 'wont',
])

export function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
}

/** Jaccard overlap of two cards' content words, 0–1. */
export function ideaOverlap(a: string, b: string): { score: number; shared: number } {
  const A = new Set(contentWords(a))
  const B = new Set(contentWords(b))
  let shared = 0
  for (const w of A) if (B.has(w)) shared++
  const union = A.size + B.size - shared
  return { score: union === 0 ? 0 : shared / union, shared }
}
