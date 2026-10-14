import type { CallOutDare, Dare, Intensity, Question } from '../types'

/**
 * WOULD YOU RATHER — impossible choices, loyalty tests and moral dilemmas.
 *
 * Every question is a forced binary. The fun is not the answer, it is watching
 * someone defend it while the room disagrees. `sensitive` is false: the subjects
 * are heavy but nothing here is explicit. Dares stay tame per the content policy.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 2): Question => ({
  id: `wyr-q${++seq}`,
  deck: 'dilemmas',
  text,
  intensity,
  sensitive: false,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `wyr-d${++dseq}`,
  deck: 'dilemmas',
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 2): CallOutDare => ({
  id: `wyr-c${++cseq}`,
  deck: 'dilemmas',
  text,
  intensity,
  callOut: true,
})

export const dilemmaQuestions: Question[] = [
  // ---- Privacy, truth and secrets -------------------------------------------
  q('Would you rather everyone here read your search history or your bank statements?'),
  q('Would you rather be cheated on once and never find out, or be told the moment it starts?', 3),
  q('Would you rather always tell the truth and hurt people, or lie and keep the peace?'),
  q('Would you rather never be lied to again or never be able to lie again?'),
  q('Would you rather know what everyone here really thinks of you for one minute, or never know?'),
  q('Would you rather your worst secret be public or your best moment be forgotten?'),
  q('Would you rather have everyone here know your worst mistake or your worst fear?'),
  q('Would you rather everyone here read your notes app or your group chat?'),
  q('Would you rather swap lives with someone here for a week or swap phones for an hour?'),
  q('Would you rather know which of your friends secretly dislikes you or never be told?'),
  q('Would you rather know the truth about everyone in this room or have them know the truth about you?'),
  q('Would you rather everyone here read your messages or hear your honest thoughts about them?'),
  q('Would you rather read minds and hate what you find, or never read them?', 3),
  q('Would you rather lie and be believed or tell the truth and be doubted?'),

  // ---- Love, loyalty and betrayal -------------------------------------------
  q('Would you rather be loved by someone who does not know you, or known by someone who does not love you?', 3),
  q('Would you rather know the exact date you die, or never know if it is soon?', 3),
  q('Would you rather find out your best friend talks about you or your partner does?', 3),
  q('Would you rather have one true friend or a hundred who would forget you by next week?'),
  q('Would you rather always be the one who cares more, or always the one who cares less?', 3),
  q('Would you rather have a partner who lies to protect you or one who hurts you with truth?', 3),
  q('Would you rather never be alone or never be truly known?', 3),
  q('Would you rather be the one who leaves or the one who is left?'),
  q('Would you rather know how every relationship in your life ends or never start one?', 3),
  q('Would you rather be honest about how you feel and lose them, or stay quiet and keep them?', 3),
  q('Would you rather have your loyalty tested and fail privately, or pass publicly?', 3),
  q('Would you rather be forgiven without an apology or apologize and be refused?'),
  q('Would you rather be loved for the wrong reasons or hated for the right ones?'),
  q('Would you rather be owed an apology forever or give one you do not mean?'),
  q('Would you rather have a friend who tells you everything or one who tells you nothing but stays?'),
  q('Would you rather be the hero of your story and the villain of theirs, or the reverse?', 3),
  q('Would you rather have one relationship with no secrets or five with no honesty?', 3),
  q('Would you rather be left on read forever or get a reply that says only "ok"?'),
  q('Would you rather be the reason the group falls apart or the one who holds it together in silence?', 3),
  q('Would you rather be envied or pitied?'),

  // ---- Identity, ambition and the self ---------------------------------------
  q('Would you rather be the smartest person in the room or the most liked?'),
  q('Would you rather be rich and lonely or broke and surrounded by people who love you?'),
  q('Would you rather be famous for work you hate or unknown for work you love?'),
  q('Would you rather have your future told to you or your past erased?'),
  q('Would you rather be wrong and together or right and alone?'),
  q('Would you rather have your life turn out ordinary and happy or extraordinary and lonely?', 3),
  q('Would you rather be unforgettable to one person or memorable to everyone?'),
  q('Would you rather never feel embarrassment or never feel guilt?'),
  q('Would you rather be the most honest person in the room or the most trusted?'),
  q('Would you rather have your kindness taken advantage of or your cruelty never noticed?'),
  q('Would you rather wrongly trust someone and get hurt, or wrongly doubt someone and lose them?'),
  q('Would you rather be the person people call at 2am or the person they never need to?', 3),
  q('Would you rather be punished for a crime you did not commit or escape one you did?', 3),
  q('Would you rather be excused for everything or held accountable for everything?'),
  q('Would you rather never make a mistake again or never regret one?'),
  q('Would you rather undo your biggest regret or relive it knowing how it ends?'),
  q('Would you rather always know when someone is lying or never know again?'),
  q('Would you rather be the most interesting person here or the most comfortable?'),

  // ---- Impossible losses ------------------------------------------------------
  q('Would you rather lose all your memories of one person, or keep them and never speak again?', 3),
  q('Would you rather relive your worst heartbreak or skip your best memory?', 3),
  q('Would you rather be told a hard truth now or a soft lie forever?', 3),
  q('Would you rather keep a secret that hurts you or share it and hurt someone else?', 3),
  q('Would you rather trade your best quality for someone else\u2019s best quality?', 3),
  q('Would you rather forget everyone in this room or have them forget you?', 3),
  q('Would you rather be alone at the end of the night or the first one to leave?', 3),
  q('Would you rather be misunderstood your whole life or understood only at the end?', 3),
  q('Would you rather be remembered as kind or as honest?'),
  q('Would you rather lose your sense of humour or your sense of self?'),
]

export const dilemmaDares: Dare[] = [
  d('Answer the next three questions with no explanation.'),
  d('Let the group pick any dilemma and you must decide instantly.'),
  d('Defend the choice you just made as if your life depended on it.'),
  d('Answer your last dilemma again, and this time you cannot lie.'),
  d('Say who in this room would judge you hardest for your last choice.'),
  d('Explain your last answer out loud in exactly five words.'),
  d('Read the group your last three notes.'),
  d('Switch your last answer and defend the opposite.'),
  d('Choose for the person to your left instead of yourself.'),
  d('Say which dilemma tonight was the hardest, and why.'),
  d('Admit which of your answers tonight was a lie.'),
  d('Answer one question entirely in questions.'),
  d('Say what you would have picked last year instead.'),
  d('Give the group a dilemma of your own, and they must choose.'),
  d('Say the choice you regret making tonight.'),
  d('Answer the next dilemma in one word only.'),
  d('Say which option you could never survive, and why.'),
  d('Admit which answer you gave just to look good.'),
  d('Let the group decide your answer to the next dilemma, and hold you to it.'),
  d('Say who in this room you were trying hardest to impress.', 2),
  d('Reveal one answer you gave that you have already changed your mind about.', 2),
]

export const dilemmaCallOuts: CallOutDare[] = [
  c('Answer three dilemmas in a row, three seconds each, no passes.'),
  c('Say which choice tonight you regret, and why.'),
  c('Explain the logic behind your last three choices or lose the point.'),
  c('Admit which answer was designed to impress someone here.'),
  c('Let the group decide your answer to the next dilemma and hold you to it.'),
  c('Say what you would actually have picked if nobody was watching.'),
  c('Answer your last dilemma again, and reverse it.'),
  c('Name whose judgement you feared most when you were choosing.'),
  c('Say which of your choices tonight was a lie and which was real.'),
  c('Reveal the answer you gave and the one you wanted to give.'),
  c('Answer three questions with only yes or no. No hedging.'),
  c('Say who in this room you were trying to impress.'),
]
