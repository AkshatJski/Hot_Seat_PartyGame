import type { CallOutDare, Dare, Intensity, Question } from '../types'

/**
 * CONFESSIONS — secrets, regret, and the things you have never said out loud.
 *
 * Non-sexual by design: that territory belongs to Spicy. This deck is about the
 * heavier stuff people carry — mistakes, betrayals, grudges, unspoken truths.
 *
 * Quality pass 2026-10-15. The first draft collapsed into one sentence shape —
 * "What is something you have done that …" — for nearly a third of the deck, and
 * left the actual content in a placeholder ("something"), so the player had
 * nothing concrete to confess. Every card now names the thing being asked for.
 *
 * Deliberately NOT age-gated (user decision, 2026-10-14), so `sensitive` is false
 * throughout: the blur marker exists to flag 18+ content, and this deck is not
 * that. Dares stay tame per the content policy.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 2): Question => ({
  id: `con-q${++seq}`,
  deck: 'confessions',
  text,
  intensity,
  sensitive: false,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `con-d${++dseq}`,
  deck: 'confessions',
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 2): CallOutDare => ({
  id: `con-c${++cseq}`,
  deck: 'confessions',
  text,
  intensity,
  callOut: true,
})

export const confessionQuestions: Question[] = [
  // ---- Secrets never told ---------------------------------------------------
  q('What part of your past would you lie about if it came up tonight?', 3),
  q('What is the last decision you are still quietly ashamed of?', 3),
  q('What is the mistake you are most afraid your family will find out about?', 3),
  q('What is the worst thing you have done to someone who trusted you?', 3),
  q('What lie have you kept going for years?'),
  q('What have you taken that was never yours?'),
  q('Whose trust have you broken without them ever finding out?', 3),
  q('What have you done that would change how this room sees you?', 3),
  q('What is the biggest thing you have hidden from your family?', 3),
  q('What promise did you break and never admit?'),
  q('What are you pretending to be over when you absolutely are not?'),
  q('What is the meanest thing you have done to someone who loved you?', 3),
  q('What mistake will you absolutely make again, and you know it?'),
  q('Which story do you tell where you come out looking better than you were?'),
  q('What have you done that you would not forgive in someone else?', 3),
  q('What is the biggest risk you have taken and never told anyone about?'),
  q('What have you faked — a feeling, a skill, a whole personality?'),
  q('What is the last thing you did that you knew was wrong at the time?'),
  q('Who have you decided to forgive without really meaning it?'),
  q('What is the most honest thing you have never said to your parents?'),
  q('What secret did someone trust you with that you passed on?', 3),
  q('What is the worst thing you have ever said to a friend?', 3),
  q('What did you do in a relationship that you have never confessed?', 3),
  q('What is the pettiest grudge you are still holding, and who is it against?'),

  // ---- Regret, guilt and self -------------------------------------------------
  q('What is the most embarrassing thing you have whispered to yourself at 3am?'),
  q('What hurt you that you convinced everyone you were fine about?', 3),
  q('What do you regret that you would do again anyway?'),
  q('When did you last betray someone, even in a small way?', 3),
  q('What is a truth you have avoided saying to someone in this room?', 3),
  q('What is the most self-destructive thing you have done this year?', 3),
  q('What do you keep hidden from the people who love you most?', 3),
  q('What are you most afraid someone here already knows?'),
  q('What have you never apologized for?'),
  q('What is the best lie you ever told, and did anyone believe you?'),
  q('What did you do that you still have not owned?'),
  q('What is the loneliest you have felt this year, and where were you?', 3),
  q('What are you jealous of that you would never admit?'),
  q('What is the smallest thing you did this week that you are still embarrassed by?'),
  q('How have you sabotaged yourself on purpose?'),
  q('What is the last thing you did that you hope nobody ever finds out?', 3),
  q('What have you pretended not to notice because it suited you?'),
  q('What is the promise you keep making to yourself and keep breaking?'),
  q('What is the most cowardly thing you have ever done?'),
  q('What did you promise to keep quiet and then told anyway?'),
  q('What did you do for attention that you would deny today?'),
  q('What is the worst way you have ended a friendship?'),
  q('What is the last thing you lied about to get out of trouble?'),
  q('What did you keep from someone so they would keep loving you?', 3),
  q('What is the thing you would say to someone here if this were the last time you saw them?'),
  q('What is the thing you have rehearsed saying out loud but never actually said?'),
  q('What do you know about yourself that you keep avoiding admitting?', 3),
  q('What is the kindest thing you have done that nobody ever found out about?', 1),
  q('What are you proud of that you never tell people?', 1),
  q('Who in this room would you trust with your worst secret, and why?', 1),
]

export const confessionDares: Dare[] = [
  d('Admit the secret you have never told this group.'),
  d('Say the last lie you told, out loud.'),
  d('Tell the group the last thing you were ashamed of.'),
  d('Say what you have taken, even if it was tiny.'),
  d('Admit the last time you were wrong and did not apologize.'),
  d('Say a promise you broke and never owned up to.'),
  d('Tell the group the last thing you cried about.'),
  d('Name the person you are still holding a grudge against, and why.'),
  d('Admit what you only pretend to be over.'),
  d('Say the most embarrassing thing you have searched for at night.'),
  d('Tell the group a secret that is no longer harmful to say.'),
  d('Say the last thing you did you would not want your family to know.'),
  d('Admit who in this room you have talked about when they were not there.'),
  d('Say what you have done that this group would judge you for.'),
  d('Tell the group the meanest thing you have said to a friend.'),
  d('Admit the last time you lied to avoid someone.'),
  d('Say the biggest thing you have hidden from your parents.'),
  d('Reveal the last thing you apologized for, and whether you meant it.'),
  d('Say what you would not forgive in someone else but did yourself.'),
  d('Tell the group what you have never owned up to.'),
  d('Admit the most cowardly thing you have done this year.'),
  d('Say the nicest thing someone here has done for you that you never acknowledged.', 1),
]

export const confessionCallOuts: CallOutDare[] = [
  c('Admit the worst thing you have ever done to someone who trusted you.', 3),
  c('Say a secret you have never told anyone in this room.', 3),
  c('Confess the last lie you told, and why you told it.', 3),
  c('Tell the group what you have hidden from the people who love you.', 3),
  c('Say the thing you are most afraid we already know.', 3),
  c('Admit the last time you betrayed someone, even a little.', 3),
  c('Say the biggest thing you regret and have never owned up to.', 3),
  c('Confess what you did that you would judge someone else for.', 3),
  c('Tell the group the last thing you did that you hope nobody finds out.', 3),
  c('Say the most dishonest thing you have done to keep someone close.'),
  c('Admit a grudge you are still holding and who it is against.'),
  c('Confess the last time you let someone down on purpose.'),
]
