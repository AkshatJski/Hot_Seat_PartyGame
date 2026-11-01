/**
 * 1 = light, 2 = spicy, 3 = philosophical / no-go-there-deep.
 *
 * Intensity is a DIFFICULTY hint within a vibe, not an age rating. The age rating
 * is the vibe itself (see `Vibe`).
 */
export type Intensity = 1 | 2 | 3

/**
 * WHO IS IN THE ROOM.
 *
 * This is the only content switch in the game, and it is deliberately coarse:
 * three shelves, chosen once, never mixed. Picking a vibe swaps the *entire*
 * content library - questions, dares and Call Out dares - because a family dare
 * shown next to a boys question would be a worse failure than either one alone.
 *
 *  family  - siblings, parents, cousins. Nothing that needs explaining to a
 *            seven-year-old, and nothing that makes a parent uncomfortable.
 *  friends - the class group, the office, female friends. Roasty and honest,
 *            no sexual content, nothing that gets someone in trouble.
 *  boys    - 18+. Crude, profane, unhinged. Never shown without a warning.
 */
export type Vibe = 'family' | 'friends' | 'boys'

/** One complete content library for one vibe. */
export interface VibePack {
  questions: Question[]
  dares: Dare[]
  callouts: CallOutDare[]
}

export type SwipeDirection = 'left' | 'right'

export interface Question {
  id: string
  text: string
  intensity: Intensity
}

export interface Dare {
  id: string
  text: string
  intensity: Intensity
}

/** Punishing overwrite used by the Call Out button. Drawn from a separate pool. */
export interface CallOutDare extends Dare {
  callOut: true
}

export interface Player {
  id: string
  name: string
  /** Answers given. Cleared / reversed by a Call Out. */
  brave: number
  /** Times swiped left or chickened out. The visible Coward score on the rail. */
  coward: number
  /**
   * Hidden escalation counter. Separate from `coward` on purpose: taking a dare
   * is free (no Coward), so the *score* can no longer double as the difficulty
   * driver. This only ever rises, and only chicken-outs feed it, so a chronic
   * dodger still gets harder dares without the score changing shape.
   * Deliberately NOT rendered on the player rail.
   */
  flinchCount: number
  daresCompleted: number
  /**
   * Times this player was called out by the group. Named `callOutsMade` before
   * 2026-10-19, which read as the opposite - the caller is never identified
   * (the increment was always on the accused). Feeds "Public Enemy" / "Sus".
   */
  timesCalledOut: number
  /** Times this player called someone out and got overruled. Feeds "Cry Wolf". */
  falseAccusations: number
  /** Longest run of questions answered in a row without a skip. Feeds "On a Tear". */
  bestStreak: number
  /** Current unbroken run of answers, reset by a skip. Only ever feeds `bestStreak`. */
  answerStreak: number
  /** Highest question intensity this player actually answered. Feeds "Went Nuclear". */
  deepestAnswered: Intensity
  /** Highest dare intensity this player actually performed. Feeds "The Reckless". */
  worstDare: Intensity
}

export type GamePhase = 'setup' | 'playing' | 'burnbook'
