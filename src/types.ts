/** 1 = light, 2 = spicy, 3 = philosophical / no-go-there-deep. */
export type Intensity = 1 | 2 | 3

export type DeckId = 'icebreakers' | 'destroyers' | 'spicy' | 'unhinged'

export type SwipeDirection = 'left' | 'right'

export interface Question {
  id: string
  deck: DeckId
  text: string
  intensity: Intensity
  /** Front of the card stays blurred until tapped. Drives the per-card 18+ marker. */
  sensitive: boolean
}

export interface Dare {
  id: string
  deck: DeckId
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
  callOutsMade: number
  /** Highest question intensity this player actually answered. Feeds "Most Exposed". */
  deepestAnswered: Intensity
  /** Highest dare intensity this player actually performed. Feeds "Menace to Society". */
  worstDare: Intensity
}

export interface Deck {
  id: DeckId
  label: string
  blurb: string
  minAge: 18 | 0
}

export type GamePhase = 'setup' | 'playing' | 'burnbook'