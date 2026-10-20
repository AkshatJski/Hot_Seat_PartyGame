/** 1 = light, 2 = spicy, 3 = philosophical / no-go-there-deep. */
export type Intensity = 1 | 2 | 3

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
  /** Times swiped left. Drives the Coward Meter's dare tier. */
  coward: number
  daresCompleted: number
  /**
   * Times this player was called out by the group. Named `callOutsMade` before
   * 2026-10-19, which read as the opposite — the caller is never identified
   * (the increment was always on the accused). Feeds "Public Enemy" / "Sus".
   */
  timesCalledOut: number
  /** Times this player called someone out and got overruled. Feeds "Cry Wolf". */
  falseAccusations: number
  /** Longest run of questions answered in a row without a skip. Feeds "On a Tear". */
  bestStreak: number
  /** Current unbroken run of answers, reset by a skip. Only ever feeds `bestStreak`. */
  answerStreak: number
  /**
   * Classic Circle only. Consecutive truths taken without a dare in between.
   * At TRUTH_STREAK_LIMIT the player must take a dare; any dare resets it to 0.
   * Optional so older persisted games rehydrate cleanly (read via `?? 0`).
   */
  truthStreak?: number
  /** Highest question intensity this player actually answered. Feeds "Went Nuclear". */
  deepestAnswered: Intensity
  /** Highest dare intensity this player actually performed. Feeds "The Reckless". */
  worstDare: Intensity
}

export type GamePhase = 'setup' | 'playing' | 'burnbook'