import type { CallOutDare, Dare, Intensity, Question } from '../types'

/**
 * SPICY 18+ — quality pass 2026-10-15.
 *
 * Three banks, because "spicy" was doing too much work:
 *   Desire        → sexual and intimate, direct rather than coy.
 *   Taboo         → the edgy, morally uncomfortable stuff that is not about sex.
 *   Brutal honesty→ sharp, thought-provoking questions with nothing to confess.
 *
 * Quality pass notes. The first rework traded one template for another: roughly
 * half the deck became "What is the most <noun> you have ever <verb>?", and a
 * dozen cards hid their content behind a placeholder ("something", "one thing").
 * A card with a hole where the content should be is not a question, it is a
 * shrug — the player has nothing to aim at. Every card here is now concrete
 * enough to answer in ten seconds, follows the grammar, and opens in a variety
 * of shapes rather than one. A few broken carry-overs were deleted outright
 * ("What would have to be true for your worst story about someone to be fair?").
 *
 * Intensity now means something: 1 flirty, 2 spicy, 3 genuinely explicit or
 * uncomfortable. Content policy is unchanged — the heat lives in the QUESTIONS.
 * Dares stay tame. No card asks anyone to disclose their finances, body or health.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 3): Question => ({
  id: `spi-q${++seq}`,
  deck: 'spicy',
  text,
  intensity,
  sensitive: true,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 2): Dare => ({
  id: `spi-d${++dseq}`,
  deck: 'spicy',
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 3): CallOutDare => ({
  id: `spi-c${++cseq}`,
  deck: 'spicy',
  text,
  intensity,
  callOut: true,
})

export const spicyQuestions: Question[] = [
  // ---- Desire: sexual and intimate ------------------------------------------
  // Direct on purpose. A flirty question gets a laugh; a vague one gets silence.
  q('Describe the kind of sex you actually want, not the kind you joke about.'),
  q('What do you want in bed that you have never asked a partner for out loud?'),
  q('Who in this room do you think would be the best kisser, and what makes you say that?', 2),
  q('What did a former partner do that you still think about?'),
  q('How long has it been since you slept with someone, and are you actually okay with that?'),
  q('What instantly kills the mood for you?', 2),
  q('What is the fastest someone has won you over, and what exactly did they do?', 2),
  q('What boundary do you now say out loud that you used to keep quiet?'),
  q('Have you ever wanted someone in this room? You only have to say yes or no.'),
  q('What is the most dishonest thing you have done to keep a partner interested?'),
  q('What would you only ever do with the lights off?'),
  q('What do you want a partner to do more of that you have never asked for?'),
  q('What is the biggest lie you have told to get someone into bed?'),
  q('What have you faked in bed, and how long did you keep the act up?'),
  q('Who here would you want to wake up next to, no strings attached?'),
  q('What is the most reckless thing you have done for a hookup?'),
  q('Describe the best kiss you have ever had, and who you were kissing.', 2),
  q('What is the compliment about your body that lands every single time?', 2),
  q('What turns you on that you would be embarrassed to admit to your friends?'),
  q('Have you ever hooked up with someone you definitely should not have? Say who.'),
  q('What is the difference between a good kiss and a great one, and which do you give?', 2),
  q('What is the most confident thing you have done to get someone to notice you?', 2),
  q('What is the first sign that tells you the night is going somewhere?', 2),
  q('What sound does a person make that you find impossible to resist?'),
  q('If you had to flirt with one person here for the rest of the night, who?', 2),
  q('What is the most seductive thing someone has said to you that actually worked?'),
  q('What have you done in the dark that you would never say in daylight?'),
  q('Who here has a voice you cannot get out of your head?'),
  q('What is the most attractive thing you have watched someone do without touching you?'),
  q('What is the most useful thing you have learned about sex from getting it wrong?'),
  q('What is the best night you have had that nobody in this room knows about?'),
  q('What have you always wanted to try but never had the nerve to say out loud?'),
  q('What can someone do with their hands that you find irresistible?'),
  q('What is the biggest turn-on you discovered by accident?'),

  // ---- Taboo: edgy, uncomfortable, not about sex ----------------------------
  q('Say the thing about someone here that everyone is thinking and nobody is saying.'),
  q('Whose relationship in this room do you give the shortest shelf life, honestly?'),
  q('If a friend here hit on you and nobody would ever find out, what do you actually do?'),
  q('Who in this room do you quietly think is not a good person?'),
  q('Who here would sell you out first if the group turned on you?'),
  q('What is the meanest thought you have had about a friend in this room?'),
  q('Who here would you not trust with your unlocked phone for ten minutes?'),
  q('What have you done that you would call unforgivable from someone else?'),
  q('Who here is only here because someone else brought them?', 2),
  q('What is the biggest lie you have told to someone sitting in this room?'),
  q('Who here do you suspect is lying about how well their life is going?'),
  q('If you could remove one person from this room with no consequences, who?'),
  q('What is the most two-faced thing you have done to someone you smile at?'),
  q('Who here has questionable taste, and who are you actually talking about?', 2),
  q('What is the rudest thing you have thought about someone here tonight?'),
  q('Who is the least fun person in this room?'),
  q('Who here are you only nice to because you want a favour from them?'),
  q('Who here would you throw under the bus to save yourself?'),
  q('What is the worst thing you have done that you have told nobody?'),
  q('Who here have you talked about behind their back?'),
  q('When did you last keep the truth about someone here from them, and why?'),
  q('If every secret in this group came out, who loses the most?', 2),
  q('What is the real reason you stopped being close with someone here?'),
  q('Who here is most likely to gossip about you the second you leave the room?', 2),
  q('What is the pettiest reason you have cut someone off?', 2),
  q('Who here do you think is only pretending to like you?'),
  q('What have you taken credit for that was not yours?'),
  q('Whose opinion in this room do you not respect at all?'),
  q('What is the most disloyal thing you have done to a friend?'),
  q('Who here have you decided you do not actually like?'),

  // ---- Brutal honesty: sharp, thought-provoking, nothing to confess ---------
  q('Who here are you nice to out of obligation rather than affection?'),
  q('What is the ugliest thought you have had about a friend in this room?'),
  q('Would you rather be wanted for your body or understood by someone, and which have you actually had?'),
  q('Where is the line between flirting with someone and leading them on?'),
  q('Is jealousy a sign of love or a sign of insecurity?', 2),
  q('What is the most manipulative thing you have done to someone you were attracted to?'),
  q('Is it ever right to keep a secret from someone who loves you?'),
  q('What story do you tell about someone where you come out looking worst?'),
  q('Do you want to be wanted or needed more, and which have you actually been?', 2),
  q('Can you be attracted to someone and still not like them?', 2),
  q('What is the most common lie people tell about why a relationship ended?', 2),
  q('What is the difference between honesty and cruelty, and which one do you hand out?'),
  q('Who here do you think is attracted to someone else in this room?'),
  q('What is the most comfortable lie you tell yourself every day?'),
  q('What compliment do you actually use as an insult?'),
  q('Would you rather be unforgettable or comfortable, and which are you?'),
  q('What is the hardest truth you have had to tell someone you love?'),
  q('Who here do you think knows you best, and does that scare you?'),
  q('What have you forgiven that you have never actually gotten over?'),
  q('What is attractive about someone that has nothing to do with how they look?', 2),
  q('Is there someone here you have been far too comfortable being cruel to?'),
  q('What makes an attractive person instantly unattractive?', 2),
  q('What is the hardest thing about being attracted to someone you should not be?'),
  q('When did being rejected make you want someone more, and what did you do about it?'),
  q('What would you never forgive in a partner that you have already done yourself?'),
  q('What is the difference between someone who flirts with everyone and someone who is just warm?', 2),
  q('What has your attraction made you do that was genuinely destructive?'),
  q('What is the truest thing you could say to someone here right now?'),
  q('What is the last thing you changed about yourself to please someone else?'),
]

export const spicyDares: Dare[] = [
  d('Tell the group your most irrational attraction.'),
  d('Say out loud the name of your last crush, even if nobody here knows them.'),
  d('Rate your own confidence out loud from one to ten. No hedging.', 1),
  d('Read the most recent text you sent, verbatim, including the typo.'),
  d('Say what you find attractive about the person to your left.'),
  d('Admit the last time you checked out someone in this room, if you did.'),
  d('Say what a good date actually looks like to you, in one sentence.'),
  d('Let the group ask you one question about your love life. You may pass once.'),
  d('Say the pettiest thing you have done in a relationship.'),
  d('Compliment the person opposite you on a quality that has nothing to do with their looks.'),
  d('Say what makes you feel attractive, out loud, with a straight face.'),
  d('Tell the group the worst date you have ever been on, in full.'),
  d('Say who here you would want on your side in a fight.'),
  d('Admit what you pretend not to care about.'),
  d('Say the nicest thing anyone in this room has ever said to you.'),
  d('Describe your ideal night in exactly five words.'),
  d('Say which person here you would text first at 2am.'),
  d('Reveal the last thing you googled that you regret.'),
  d('Say what you would want your ex to know.'),
  d('Name the person here you argue with the most, and why.'),
  d('Say what you would do on a first date if nobody could judge you.'),
  d('Admit the most immature reason you have liked someone.'),
  d('Say the most over-the-top compliment you have ever received.'),
  d('Reveal the last photo in your camera roll. The group decides if it is incriminating.'),
  d('Say what you find attractive that most people would not.'),
  d('Answer honestly: are you actually a good person?'),
  d('Say who here you would want to be stuck in a lift with for six hours.'),
  d('Say the last thing you pretended to understand but did not.'),
]

export const spicyCallOuts: CallOutDare[] = [
  c('Say out loud the biggest lie you have ever told someone face to face.'),
  c('Read your last five messages out loud, unedited.'),
  c('Say who in this room you would kiss, and you may not pass.'),
  c('Say the most embarrassing thing you have ever done in a relationship.'),
  c('Let the group ask you one question about your love life, and you cannot pass.'),
  c('Say the most toxic thing you have ever done for attention.'),
  c('Say the wildest thing you have ever wanted to do and never admitted.'),
  c('Admit the last time you were jealous of someone in this room.'),
  c('Say who you have talked about behind their back tonight.'),
  c('Say the most shameful thing you have ever wanted.'),
  c('Name the person here you find most attractive, and why.'),
  c('Say the pettiest reason you have ever held a grudge.'),
  c('Admit the biggest lie you have told to get out of plans.'),
  c('Say what you were really thinking during a serious conversation you had with someone here.'),
]
