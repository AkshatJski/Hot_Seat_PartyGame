/**
 * CONTENT RULES — the single source of truth for "is this card allowed?".
 *
 * Extracted from `lint-content.ts` so the *importer* enforces exactly the same
 * rules as the *gate*. If these two drift, content gets imported under one rule
 * set and rejected under another, and the writer brief becomes a lie. Nothing in
 * here knows about files, shelves or the app: it is pure vocabulary.
 *
 * Consumers:
 *   scripts/lint-content.ts   (the gate — every card in every shelf)
 *   scripts/import-content.ts (the pipeline — every card an outside writer sends)
 */
import type { Vibe } from '../src/types'

// ---- thresholds -------------------------------------------------------------
export const WORD_MIN = 5
export const WORD_MAX = 30
/** No single opening-4-words bucket may exceed this share of a pool. */
export const TEMPLATE_SHARE = 0.12
export const TEMPLATE_FLOOR = 4
/** A shelf nobody can play for an evening is a broken shelf. */
export const MIN_CARDS = { question: 60, dare: 40, callout: 18 } as const

/**
 * MIX THRESHOLDS — the rules that make "is this any good?" measurable.
 *
 * These are deliberately generous. A gate that cries wolf gets switched off,
 * which is worse than no gate. Each one encodes a defect that actually shipped:
 *
 *   shape-share  one answer shape is most of a shelf. Friends was 67% "pick a
 *                person". Six shapes means a healthy shelf sits near 17%.
 *   nominate     the specific monoculture: the answer is a name, the turn ends,
 *                nobody reacts. Capped harder than the general shape cap.
 *   follow-up    a nominate card with no second clause is a one-word turn.
 *   intensity    the ladder the UI promises (pips, dare tiers, "deepest
 *                answered") has to exist in the data. Friends had 0 tier-3s.
 *   length       uniform card length is the strongest "written all at once"
 *                tell. Some cards must be a stab, some a scene.
 *   verb-spread  one dare opener doing a quarter of the work.
 */
export const SHAPE_SHARE = 0.35
export const NOMINATE_SHARE = 0.25
export const RANK_SHARE = 0.18
export const LAZY_SHARE = 0.06
export const FOLLOW_UP = /,\s+\S+\s+\S+| then \S+/i
// Intensity IS the deal stage (see `buildQuestionQueue`): tier 1 is the warm-up
// third, tier 3 is the late game. A shelf with almost no tier 1 starts the night
// at medium heat and has nowhere to climb — that shipped once (report.md BUG-009).
export const TIER1_SHARE = 0.15
export const TIER3_SHARE = 0.08
export const TIER2_SHARE = 0.2
export const SHORT_SHARE = 0.08
export const LONG_SHARE = 0.08
export const SHORT_WORDS = 8
export const LONG_WORDS = 18
export const DARE_VERB_SHARE = 0.25
export const CALLOUT_VERB_SHARE = 0.3
export const NOMINATE_OPENER = /^(point at|who here|who in this room|which of us|name the person)\b/i

// ---- text helpers -----------------------------------------------------------
export const norm = (t: string) =>
  t.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()
export const words = (t: string) => t.trim().split(/\s+/).filter(Boolean)
export const firstWord = (t: string) => words(norm(t))[0] ?? ''

// ---- card shapes ------------------------------------------------------------
// A card is a valid prompt if it asks something (contains "?") or opens with an
// imperative verb: "Describe your ideal Sunday." is a card, not a broken question.
export const IMPERATIVE = new Set([
  'describe', 'rate', 'pick', 'say', 'tell', 'name', 'rank', 'list', 'invent',
  'give', 'choose', 'explain', 'imagine', 'act', 'make', 'assign', 'guess',
  'admit', 'confess', 'pitch', 'write', 'draw', 'roast', 'defend', 'argue',
  'share', 'read', 'spell', 'design', 'cast', 'create', 'show', 'answer',
  'deliver', 'announce', 'perform', 'improvise', 'narrate', 'recount', 'swap',
  // "Point at the person most likely to..." is the single most-used prompt
  // shape in the game. It is an imperative, so it belongs here — it used to fail
  // the shape gate unless the card also ended in a question mark.
  'point',
  // Verbs the shape work added. A card that opens with one of these is an
  // instruction: it must end in a period, never a question mark.
  'sing', 'hum', 'mime', 'mimic', 'impersonate', 'recite', 'copy', 'hold',
  'stand', 'text', 'call', 'count', 'pretend', 'whisper', 'tap', 'dance',
  'speak', 'put', 'open', 'prove', 'sort', 'do', 'recreate', 'play', 'sell',
])
export const isImperative = (t: string) => IMPERATIVE.has(firstWord(t))

/**
 * Embodied verbs. A card that opens with one of these asks the player to *do*
 * something with their body or their voice — stand, draw, mime, imitate, sing.
 * That is a dare. It may never sit in a question pool, where the promise is
 * "answer this out loud, sitting down, in one turn".
 */
export const EMBODIED = new Set([
  'mime', 'mimic', 'impersonate', 'draw', 'dance', 'stand', 'act', 'perform',
  'sing', 'hum', 'recite', 'recreate', 'balance', 'sketch', 'paint', 'juggle',
  'crawl', 'walk', 'wear',
])
export const isEmbodied = (t: string) => EMBODIED.has(firstWord(t))

/**
 * The laziest opener in the game: "<superlative> thing you have ever done".
 * It fills a card without giving the player a scene, so it is capped hard rather
 * than banned — two or three are fine, a shelf of them is a form to fill in.
 */
export const LAZY_OPENER =
  /^what is the (most|biggest|worst|best|strangest|weirdest|silliest|dumbest|pettiest|most [a-z]+)\b[^?]*\b(you have ever|you've ever|have you ever)\b/i

export const VAGUE: [RegExp, string][] = [
  [/\bsomething\b/i, 'vague payload "something"'],
  [/\banything\b/i, 'vague payload "anything"'],
  [/\ba thing\b/i, 'vague payload "a thing"'],
  [/\bone thing\b/i, 'vague payload "one thing"'],
  [/\bstuff\b/i, 'vague payload "stuff"'],
  [/\bsome thing\b/i, 'vague payload "some thing"'],
  [/\bkind of thing\b/i, 'vague payload "kind of thing"'],
]

/** Verb + bare "it" with no antecedent: "want it", "do it", "are you into it". */
export const VAGUE_IT =
  /\b(do|does|did|done|doing|want|wants|wanted|say|says|said|try|tries|tried|like|likes|liked|into)\s+it\b/i

/** Content policy: never make a player disclose status they cannot choose. */
export const POLICY: [RegExp, string][] = [
  [
    /\b(money|salary|salaries|income|wage|wages|net worth|bank balance|bank account|paycheck)\b/i,
    'policy: a player\u2019s finances',
  ],
  [/\b(weight|overweight|obese|body fat|fat shaming)\b/i, 'policy: a player\u2019s body'],
  [
    /\b(diagnos\w*|medication|disorder|disabled|autis\w*|schizo\w*)\b/i,
    'policy: a player\u2019s health',
  ],
]

// ---- the tone gate ----------------------------------------------------------
/**
 * HARD PROFANITY. Banned from Family and Friends outright; allowed on Boys.
 * Word-boundary matched so "class" is not "ass" and "Scunthorpe" is not a bug.
 */
export const PROFANITY =
  /\b(f+u+c+k\w*|shit\w*|bullshit|bitch\w*|bastard\w*|dick\w*|cock\w*|pussy|cunt\w*|asshole\w*|arsehole\w*|whore\w*|slut\w*|porn\w*|boobs?|tits?|wank\w*)\b/i

/** Sexual content and substance use. Banned from Family; fine for Friends. */
export const ADULT =
  /\b(sex\w*|horny|hookups?|hook-ups?|one-night stand|drunk\w*|booze|alcohol|vodka|whisky|beer|weed|marijuana|hangover\w*)\b/i

/**
 * Dating and romance. Deliberately absent from the Family shelf.
 *
 * `ex` is spelled out rather than written as `ex-?\w+`: the greedy version
 * matched "escape", "exactly", "excuse", "exit" and "explain", which flagged six
 * perfectly innocent family cards. Word boundaries only.
 */
export const ROMANCE = /\b(dating|crush\w*|girlfriends?|boyfriends?|ex|exes|kiss\w*)\b/i

/**
 * The gate itself. Explicit per vibe rather than a shared "mild" list, so adding
 * a shelf means making a decision rather than inheriting one by accident.
 */
export const TONE: Record<Vibe, { label: string; rules: [RegExp, string][] }> = {
  family: {
    label: 'family = zero profanity, zero adult content, no romance',
    rules: [
      [PROFANITY, 'family shelf must be completely clean'],
      [ADULT, 'family shelf must not mention sex or substances'],
      [ROMANCE, 'family shelf must not mention dating or crushes'],
    ],
  },
  friends: {
    label: 'friends = no hard profanity, nothing explicit',
    rules: [
      [PROFANITY, 'friends shelf must not swear'],
      [/\b(porn\w*|hookup|hook-up|one-night)\b/i, 'friends shelf must not get explicit'],
    ],
  },
  boys: { label: 'boys = 18+, no tone restriction', rules: [] },
}
