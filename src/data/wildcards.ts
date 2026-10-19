/**
 * CLASSIC CIRCLE — WILDCARD ROUNDS
 *
 * One modifier is drawn at the start of every round. It applies to the whole
 * round, so the table gets a shared twist instead of the same loop of truth,
 * dare, truth, dare. All modifiers are mechanical/behavioural only: they change
 * *how* people talk, never what they are allowed to disclose. No card content,
 * no scoring, no risk — they exist purely for variety and laughs.
 *
 * Keep every entry short (it renders as a one-line badge) and imperative-free
 * of anything that could read as a dare.
 */
export const WILDCARDS: string[] = [
  'No laughing. Anyone who cracks owes the group a compliment.',
  'Accent round — everyone speaks in a silly accent.',
  'Whisper only. Volume is now a crime.',
  'Third person round. Refer to yourself by name.',
  'No saying the word "I" for the whole round.',
  'Every answer must end with "and that is the truth".',
  'Compliment the person on your left before every answer.',
  'Talk with your hands. Arms stay visible or you forfeit the round.',
  'Questions back. Ask a question before you give any answer.',
  'Solemn round — deliver everything like a courtroom statement.',
  'No names. Point instead of saying anyone in the room.',
  'Dramatic pause before every answer. At least three seconds.',
  'End every sentence with "allegedly".',
  'You may only speak in questions this round.',
]

/** Deck-agnostic, so a tiny shuffle of indices is all that is needed. */
export function pickWildcard(exclude?: string | null): string {
  const pool = exclude ? WILDCARDS.filter((w) => w !== exclude) : WILDCARDS
  const source = pool.length > 0 ? pool : WILDCARDS
  return source[Math.floor(Math.random() * source.length)]
}
