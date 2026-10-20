/**
 * CLASSIC CIRCLE — WILDCARD ROUNDS
 *
 * One modifier is drawn at the start of every round. It applies to the whole
 * round, so the table gets a shared twist instead of the same loop of truth,
 * dare, truth, dare.
 *
 * Focus: simple game rules that keep the room silly but are easy to follow in
 * any setting.
 */
export const WILDCARDS: string[] = [
  'No laughing. Anyone who cracks a smile owes the group a compliment.',
  'T-Rex arms. Everyone must keep their elbows stuck to their sides.',
  'Whisper only. Speaking loudly forces you to take a dare.',
  "The Floor is Lava. Everyone's feet must stay off the ground this round.",
  'No pointing. Anyone who points a finger must sit on their hands.',
  'News Anchor round. Everyone must speak like a Hindi news anchor breaking a dramatic story.',
  'Third person round. You must talk about yourself using only your name.',
  'Weak hand round. You can only hold the phone or point with your non-dominant hand.',
  'Questions back. You must ask a question to the room before giving your answer.',
  'Serious round. Deliver every answer or dare with a totally straight, serious face.',
  'No names. You must use silly descriptive insults instead of real names this round.',
  "Staring contest. You must stare into someone's eyes the entire time you speak.",
  'Echo chamber. The last word of your sentence must be repeated loudly by the person next to you.',
  'End every sentence with "and that\'s a fact."',
  'You may only speak in questions this round.',
  'Statue Mode. Nobody is allowed to move their hands or arms when they talk.',
  'Slow Motion. Everyone has to talk and move in super slow motion for the whole round.',
  'No teeth. You must hide your teeth with your lips when you speak.',
  'Cheering section. Every time someone finishes a turn, everyone must cheer loudly like watching a cricket match.',
  'Animal noises. Everyone must make an animal sound before they start speaking.',
]

/** Flat pool, so a tiny shuffle of indices is all that is needed. */
export function pickWildcard(exclude?: string | null): string {
  const pool = exclude ? WILDCARDS.filter((w) => w !== exclude) : WILDCARDS
  const source = pool.length > 0 ? pool : WILDCARDS
  return source[Math.floor(Math.random() * source.length)]
}
