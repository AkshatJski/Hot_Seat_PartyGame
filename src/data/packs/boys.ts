import type { CallOutDare, Dare, Intensity, Question, VibePack } from '../../types'

/**
 * BOYS - the top shelf.
 *
 * Tone: the group chat at 1 AM. Exes, bad decisions, loyalty, and the specific
 * shame of being the guy who cried at a film. Swearing and drinking are allowed
 * here; being cruel about someone's body, health or finances is not.
 *
 * HARD RULES (enforced by `npm run lint:content`):
 *   - no sexual content about anyone who is not in the room and consenting
 *   - no jokes about assault, self-harm, or anybody's body
 *   - nothing that involves a minor in a sexual way, ever
 *   - no dare that would get someone arrested, hurt, or fired
 *   - the money / body / health policy is global and does NOT relax here
 *
 * CRAFT RULES (enforced by the mix gate, see `scripts/content-shapes.ts`):
 *   - nominate cards carry a second clause. "Who here is X" is not a question,
 *     it is a vote, and the vote ends the turn.
 *   - six answer shapes; the crude shelf is still not allowed one round on loop.
 *   - dares and call-outs must not repeat the Friends shelf word for word. Same
 *     mechanics, different night.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 1): Question => ({
  id: `boy-q${++seq}`,
  text,
  intensity,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `boy-d${++dseq}`,
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 2): CallOutDare => ({
  id: `boy-c${++cseq}`,
  text,
  intensity,
  callOut: true,
})

const QUESTIONS: Question[] = [
  // ---- exes and dating ------------------------------------------------------
  q('What is the most embarrassing thing you have ever done in public to impress someone you had barely met?', 2),
  q('Who here would text an ex tonight and call it closure, and what would the message say?', 3),
  q('Describe the worst date you have been on, including the moment you knew.', 2),
  q('Rank everyone here by how badly they handle being left on read for two days by someone they liked.', 2),
  q('What is the biggest lie you have ever told to get out of a second date you had already agreed to?', 2),
  q('Rank the group by how often they date the same person in a different body.', 3),
  q('What is the most pathetic thing you have done at 2 AM after a breakup?', 3),
  q('Who here would go back to an ex if they asked nicely, and how fast?', 3),
  q('Describe the most awkward run-in with an ex you have had in public.', 3),
  q('What would you do if your ex walked in right now with someone new?', 3),
  q('Who here gives the worst dating advice, and what was the last piece?', 2),
  q('What is the most ridiculous thing you have ever done to get one specific person to notice you at all?', 2),
  q('Rank the group by how long they would last without a relationship, without complaining and without texting an ex.', 2),
  q('Who here has dated someone the group hated, and admitted it too late?', 3),
  q('What is the pettiest reason you have blocked someone?', 2),
  q('Would you rather date someone exactly like this group or stay single for five years?', 2),
  q("Point at whoever would read their partner's messages and call it concern, then say what they would find.", 2),
  q('What is the worst advice you have actually taken about dating?', 2),

  // ---- 2 AM decisions -------------------------------------------------------
  q('What is the worst decision you have made after midnight?', 3),
  q('Who here would suggest one more round at 3 AM, and who would agree?', 2),
  q('Describe the night that ended with you somewhere you did not plan to be.', 3),
  q('Rank everyone here by how likely they are to lose their phone on a night out.', 2),
  q('Rank the group by the cost of their worst bar mistake.', 2),
  q('Describe the guy who disappears for two hours and comes back with a story.', 2),
  q('Name the strangest thing you have lost on a night out and never found.', 2),
  q('Who here would get everyone thrown out, and for what?', 2),
  q('Describe the last time you had to apologise on behalf of someone else.', 2),
  q('What would you do if the group wanted to stay out and you wanted to leave?', 2),
  q('Who here has the best bad-idea streak, and what was the last one?', 2),
  q('Name the most ridiculous thing you have eaten at 4 AM.', 2),
  q('Rank the group by who would survive a full weekend without sleep.', 2),
  q('Point at whoever always says they are leaving and never leaves, then guess what time they actually go.', 2),
  q('What do you always regret the morning after?', 3),
  q('Would you rather never drink again or never go out again?', 2),

  // ---- friends and betrayal -------------------------------------------------
  q('Who here would snitch under pressure, and what would it take?', 3),
  q('What is the worst thing a friend has done to you that you forgave?', 3),
  q('Describe the moment you realised a friend was not really a friend.', 3),
  q('Rank everyone here by how loyal they actually are.', 3),
  q('Point at the one who would sell the group out for a free trip, then name the price and the destination.', 3),
  q('What is the biggest secret you have kept from this group?', 3),
  q('Name the most borrowed and least returned item in this group.', 2),
  q('Describe the pettiest thing you have done after a fight with a friend.', 2),
  q('What would you do if you found out a friend was lying to the group?', 3),
  q('Who here is the most two-faced, and who hides it best?', 3),
  q('What is the longest you have gone without talking to a friend, and why?', 3),
  q('Rank the group by how well they keep a secret.', 3),
  q('Point at whoever would be the worst witness in court, then explain what they would get wrong first.', 2),
  q('What is the most loyal thing you have done for a friend?', 3),

  // ---- work and the hustle --------------------------------------------------
  q('What is the most ridiculous thing you have done to avoid a Monday?', 2),
  q('Who here would quit a job with no plan, and what would they say?', 3),
  q('Perform the worst boss you have had, and use the one line you remember.', 1),
  q('Rank everyone here by how long they would last in a nine-to-five.', 2),
  q('What is the most elaborate lie you have told a manager, and how long did you keep it going?', 2),
  q('Point at the guy who is always about to start his big project, then ask what happened to the last one.', 2),
  q('What would you do if your boss asked you to work the weekend?', 2),
  q('Describe where you have fallen asleep in public.', 1),
  q('Explain your most pointless paid task.', 1),
  q('Who here would be fired first if the group ran a company, and why?', 2),
  q('What is the worst interview answer you have given?', 1),
  q('Would you rather work with your best friend or for your worst enemy?', 2),

  // ---- family embarrassment -------------------------------------------------
  q('What is the most embarrassing thing a relative has said about you in public?', 3),
  q('Who here would get interrogated at a family function and crack, and what would they admit first?', 2),
  q('Recreate the worst family function you have had to sit through in twenty seconds.', 2),
  q('Rank the group by how well they handle nosy relatives.', 2),
  q('Name the guy whose mother still calls him first, and what she says.', 2),
  q('What is the strangest advice a relative has given you?', 1),
  q('What would you do if a relative asked when you are getting married?', 2),
  q('Who here has lied to a relative and been caught instantly, and what gave it away?', 2),
  q('Describe the relative everyone in your family avoids, and the exact behaviour that made the whole family avoid them.', 2),
  q('Would you rather attend every family function or move abroad for a year?', 2),

  // ---- sport ----------------------------------------------------------------
  q('What is the most embarrassing thing you have done on a field or court?', 2),
  q('Who here would drop the easiest catch and blame the sun, and what is the excuse?', 2),
  q('Describe the worst loss you have been part of, and the aftermath.', 2),
  q('Rank the group by how likely they are to start a fight at a match.', 2),
  q('Point at the guy who argues with the umpire from the boundary, then quote his best appeal.', 2),
  q('Name your best sporting excuse.', 1),
  q('Who here would fake an injury to avoid the last over, and what would the injury be?', 2),
  q('Describe the best comeback you have seen in any sport.', 1),
  q('What would you do if your team lost because of one decision?', 2),
  q('Would you rather play badly and win or play brilliantly and lose?', 1),

  // ---- group chat crimes ----------------------------------------------------
  q('What is the worst thing you have accidentally sent to this group?', 3),
  q('Who here screenshots everything, and what have they got on us?', 3),
  q('Describe the most chaotic night this group chat has produced.', 2),
  q('Rank the group by how likely they are to leak a private chat.', 3),
  q('Name the guy who replies with one letter and expects credit.', 2),
  q('What is the most incriminating thing in your camera roll right now?', 3),
  q('Who here would get catfished by someone pretending to be a celebrity, and who falls fastest?', 2),
  q('What would this group chat look like if it leaked tomorrow?', 3),
  q('Describe the worst group photo you are still in.', 2),
  q('Who here has the worst typing style, and can you imitate it?', 2),
  q('What is the last thing you deleted from your phone in a hurry?', 3),
  q('Would you rather lose this group chat forever or your whole gallery?', 2),

  // ---- the gym --------------------------------------------------------------
  q('What is the most creative excuse you have used to skip the gym?', 1),
  q('Who here talks about training most and trains least, and what is the latest excuse?', 2),
  q('Describe the strangest thing you have seen at a gym.', 1),
  q('Rank the group by how long they would last in a proper session.', 2),
  q('Name the guy who would fake a wrist injury to avoid leg day.', 2),
  q('What is the one exercise you will never do again?', 1),
  q('Who here has taken a gym selfie and posted it immediately, and how many filters?', 2),
  q('If the group trained for a fight camp, who would quit first?', 2),
  q('What is the worst gym advice you have received?', 1),
  q('Would you rather train for six months or run a marathon next week?', 1),

  // ---- school and college ---------------------------------------------------
  q('Describe the most embarrassing thing that happened to you at school.', 2),
  q('Who here was caught cheating, and how obvious was it?', 2),
  q('Describe the worst teacher you have had, and one line they said.', 2),
  q('Rank the group by how likely they were to be sent out of class.', 2),
  q('Point at the guy who peaked in school and knows it, then name the year he keeps mentioning.', 3),
  q('What is the dumbest thing you did in a school corridor?', 2),
  q('Who here was terrified of one teacher and never admitted it, and who was it?', 2),
  q('Describe the worst group project you have been part of, including who did nothing and who got the credit.', 2),
  q('What would you do if you had to repeat one year of college?', 2),
  q('Name the guy who faked being ill to skip an exam.', 2),
  q('What is the best excuse you have used to leave a class?', 2),
  q('Would you rather be the smartest or the funniest in a classroom?', 2),

  // ---- fears and quirks -----------------------------------------------------
  q('What is the most irrational fear you have, and where did that come from?', 2),
  q('Who here would panic first in a blackout, and what would they do?', 2),
  q('Describe the strangest habit you have when nobody is watching.', 2),
  q('Rank the group by how dramatic they are when ill.', 2),
  q('Point at whoever checks the door three times before leaving, then ask what they think will happen.', 2),
  q('What ruins your day fastest?', 2),
  q('Who here talks to themselves and gets caught mid-sentence, and what do they usually say?', 2),
  q('Describe the weirdest thing you have done before a big moment.', 1),
  q('What would you do with no phone and no charger for two days?', 2),
  q('Would you rather never be surprised again or never be bored again?', 1),

  // ---- performance and invention --------------------------------------------
  q('Do an impression of someone in this room and let the group guess.', 1),
  q('Say the last thing you said before this game, in a villain voice.', 3),
  q('Invent a new rule for this group and explain who breaks it.', 1),
  q('Sing the chorus of the song you would never admit knowing.', 1),
  q('Read your last notification out loud and defend it.', 3),
  q('Give everyone here a one-word reputation and defend it.', 1),
  q('Mime your morning routine in fifteen seconds.', 1),
  q('Spell your own name as if the room owes you an apology.', 2),
  q('Invent a slogan for the group and deliver it like a coach.', 1),
  q("Do a weather report for the group's mood.", 1),
  q('Hum a song you would deny knowing.', 1),
  q('Recite the alphabet as if you are resigning.', 3),
  q('Narrate your week like a sports highlight reel.', 1),
  q('Give a five-second review of the guy to your left.', 1),
  q('Draw the person opposite in fifteen seconds.', 1),
  q('Impersonate a teacher or boss everyone remembers.', 1),

  // ---- honest ---------------------------------------------------------------
  q('What do you act like you do not care about, and secretly do?', 3),
  q('Who here would you call at 3 AM if everything went wrong, and why?', 3),
  q('Tell us about a time this group helped you and never knew.', 3),
  q('Describe your biggest change this year.', 3),
  q('Who here knows you best, and what do they know?', 3),
  q('What do you want to say to someone here and never have?', 3),
  q('Rank the group by how much they have changed since you met.', 3),
  q('Who here would you trust with your phone unlocked, and what would you hide first?', 3),
  q('What is the best decision you have made since meeting these guys?', 3),
  q('Describe a moment you were proud of someone here and never told them.', 3),
]

const DARES: Dare[] = [
  d('Phone the last person you texted and ask them to rate your worst quality out of ten.'),
  d('Wear the worst nickname the group invents, all night.'),
  d('Read your last three sent messages in a villain voice.'),
  d('Do a mean impression of the guy who just dared you.'),
  d('Show the group the photo you almost posted.'),
  d('Say the alphabet like a man who is being arrested politely.'),
  d('Sing the chorus of a song you claim to hate.'),
  d('Call a friend and ask them to settle a fight that is not happening.'),
  d('Speak in the accent the group picks for three rounds.'),
  d('Defend your last argument as if you are in court.', 2),
  d('Pitch your worst habit to the group like an investor.'),
  d('Narrate the next round like a wildlife documentary.'),
  d('Cross the room like you own it, then apologise to the room.'),
  d('Say one brutal truth about everyone here, one sentence each.', 2),
  d('Do the wedding dance you would never normally do.'),
  d('Read the last notification on your phone aloud, unedited.'),
  d('Rank the group by their fashion, out loud, with reasons.', 2),
  d('Defend your most-used emoji like a lawyer.'),
  d('Do a card trick that fails, and commit to the failure.'),
  d('Play ten seconds of air guitar with full commitment.'),
  d('Call the next question like a boxing commentator.'),
  d('Type one word into the search bar of the guy on your right.', 3),
  d('Accept an award for work you did not do.'),
  d('Recite a poem about the guy opposite you, badly.'),
  d('Text your most recent contact and ask them to rate you out of ten.', 2),
  d('Leave your phone face down until the game ends.', 2),
  d('Do an impression of a famous person and let the group guess.'),
  d('Give the group a two-minute speech about your life choices.'),
  d('Read the next question as a news anchor.'),
  d('Spell your own name as if you are furious at it.'),
  d('Show the group the worst selfie you have kept.', 2),
  d('Swap shoes with the guy next to you for three rounds.'),
  d('Do a dramatic reading of the nearest food packet.'),
  d('Say the most embarrassing thing you have searched this week.', 3),
  d('Explain a film plot in one sentence and let the group guess.'),
  d('Hold a plank until someone here laughs.'),
  d('Give the room a ten-second drumroll and then deliver nothing.'),
  d('Post one emoji as your status for an hour, group choice.', 3),
  d('Do an impression of your father answering the phone.'),
  d('Say the alphabet under your breath, then shout it.'),
  d('Read your last message in a villain voice.'),
  d('Play waiter and take everyone here their order.'),
  d('Balance a shoe on your head until your next turn.'),
  d('Review the last show you watched without spoilers.'),
  d('Give the group a nickname and defend the logic.'),
  d('Do a car alarm at full volume for ten seconds.'),
  d('Name three things you would never do and one you would.'),
  d('Sell the group your most useless life hack.'),
  d('Act out your last embarrassing moment in slow motion.'),
  d('Insult the guy to your left, then compliment him twice.'),
  d('Explain your phone home screen like a strategy meeting.'),
  d('Do the voice of a GPS that hates you.'),
  d('Show the group the last thing you screenshotted.'),
  d('List your last three search results from memory.'),
  d('Play a teacher scolding the group for thirty seconds.'),
  d('Sing every answer for the next two rounds.'),
  d('Do an impression of the most tired guy here.'),
  d('Give a one-minute lecture on your favourite food.'),
  d('Do a magic trick that fails on purpose.'),
  d('Say one sentence in a fake language and translate it badly.'),
  d('Let the room choose your next profile picture.', 3),
  d('Text someone that you need to talk, then put the phone down.', 3),
  d('Explain your life as a film trailer.'),
  d('Perform stand-up with two jokes, no notes.'),
  d('Speak in rhyme only until your next turn.'),
  d('Admit the last thing you cried about, in a funny voice.', 3),
  d('Play flight attendant giving safety instructions.'),
  d('Beat out a rhythm and make the group join in.'),
  d('Do an impression of an angry customer.'),
  d('Trade one accessory with the guy opposite for two rounds.'),
]

const CALL_OUT_DARES: CallOutDare[] = [
  c("Use your worst boss's voice for this answer."),
  c('Announce a title for your answer before you start.'),
  c('Stare at the guy opposite for the whole answer.'),
  c('Deliver your answer standing, like a press conference.'),
  c('Give one word first, then explain for thirty seconds.'),
  c('Whisper your answer to your left, who repeats it.'),
  c('Start the answer already annoyed.'),
  c('Stall dramatically in the middle of the answer.'),
  c('Talk about yourself in the third person throughout.'),
  c('Grab a spoon from the table and hold it while answering.'),
  c('Do the answer in the accent of the guy who called you out.'),
  c('Offer two answers and refuse to say which is true.'),
  c('Wait for a ten-second countdown from the group.'),
  c('Read your answer off an imaginary script.'),
  c('Keep a dead straight face while the group heckles.'),
  c('Rhyme the answer or take the dare instead.'),
  c('Take the answer as a phone call to the group.'),
  c('Score your own answer out of ten at the end.'),
  c('Tell the moment instead of explaining it.'),
  c('Shut your eyes and keep your hands still.', 3),
  c('Deliver the answer like a boxing commentator.'),
  c('Let the guy on your right act out your answer.', 2),
  c('Include a detail you have never told anyone.', 3),
  c('Answer as if everyone already knew.'),
  c('Answer in the past tense no matter what.'),
  c('Name every guy in the room before answering.'),
  c('Back your answer with a film reference.'),
  c('Retreat slowly while giving the answer.'),
  c('Confess the answer like a crime.', 3),
  c('Sigh before and after the answer, dramatically.'),
]

export const BOYS: VibePack = {
  questions: QUESTIONS,
  dares: DARES,
  callouts: CALL_OUT_DARES,
}
