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
  q('Rank the group by how long they would last without a relationship, without complaining and without texting an ex.', 2),
  q('Who here has dated someone the group hated, and admitted it too late?', 3),
  q('What is the pettiest reason you have blocked someone?', 2),
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
  q('Point at whoever would be the worst witness in court, then explain what they would get wrong first.', 2),
  q('What is the most loyal thing you have done for a friend?', 3),

  // ---- work and the hustle --------------------------------------------------
  q('What is the most ridiculous thing you have done to avoid a Monday?', 2),
  q('Who here would quit a job with no plan, and what would they say?', 3),
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

  // ---- fears and quirks -----------------------------------------------------
  q('Who here would panic first in a blackout, and what would they do?', 2),
  q('Point at whoever checks the door three times before leaving, then ask what they think will happen.', 2),
  q('What ruins your day fastest?', 2),

  // ---- performance and invention --------------------------------------------
  q('Invent a new rule for this group and explain who breaks it.', 1),
  q('Give everyone here a one-word reputation and defend it.', 1),
  q('Invent a slogan for the group and deliver it like a coach.', 1),
  q('Give a five-second review of the guy to your left.', 1),

  // ---- honest ---------------------------------------------------------------
  q('What do you act like you do not care about, and secretly do?', 3),
  q('Who here would you call at 3 AM if everything went wrong, and why?', 3),
  q('Tell us about a time this group helped you and never knew.', 3),
  q('What do you want to say to someone here and never have?', 3),
  q('Rank the group by how much they have changed since you met.', 3),
  q('Who here would you trust with your phone unlocked, and what would you hide first?', 3),
  // ---- the parts nobody says out loud ----
  q('Name the worst thing you have done to a friend behind their back. One sentence, no softening.', 3),
  q('Rank the room by who would help you hide the evidence, then by who would talk first.', 3),
  q('What would you take to your grave rather than say in this room?', 3),
  q('Who here would survive an interrogation, and who would fold in the first ten minutes?', 2),
  q('What is the smallest thing someone has done that made you cut them off for good?', 2),
  q('Describe the night you have never told this group about.', 3),
  q('Who here would lie to the group for their own benefit, and what would they lie about?', 3),
  q('What is the most expensive mistake you have hidden from someone?', 2),
  q('If the group had to hand over one person to take the fall, who goes, and who volunteers?', 3),
  q('What is the biggest lie you have kept alive for years with a parent?', 3),
  q('Who here is the reason a plan fell through, and what did they say happened instead?', 2),
  q('What is the one rule you broke and watched someone else get blamed for?', 3),
  q('Rank the room by what each of them would trade for a free trip abroad, then say what yours would cost.', 3),
  q('Who here has broken a promise that mattered, and what did they promise?', 3),
  q('What do you know about someone in this room that they do not know you know?', 3),
  // ---- warm-ups: the first ten minutes of the night ----
  q('Rank the room by who survives a desert island.', 1),
  q('Rank the room by who would eat a whole lemon.', 1),
  q('Pick one: no phone or no friends for a week.', 1),
  q('Would you rather be feared or liked?', 1),
  q('Would you rather know everything or be trusted?', 1),
  q('What would this group do with a body?', 1),
  q('If this group robbed a place, who drives?', 1),
  q('Guess who here would fold first under pressure.', 1),
  q('Name the worst driver in this room.', 1),
  q('What happens when this group plans a night out?', 1),
  q('Pick the guy most likely to start a rumour.', 1),
  q('Would you rather have no secrets or no regrets?', 1),
  q('Name the worst haircut in this room.', 1),
  q('Rate your own chat history out of ten.', 1),
]

const DARES: Dare[] = [
  d('Phone the last person you texted and ask them to rate your worst quality out of ten.'),
  d('Wear the worst nickname the group invents, all night.'),
  d('Do a mean impression of the guy who just dared you.'),
  d('Show the group the photo you almost posted.'),
  d('Call a friend and ask them to settle a fight that is not happening.'),
  d('Defend your last argument as if you are in court.', 2),
  d('Say one brutal truth about everyone here, one sentence each.', 2),
  d('Rank the group by their fashion, out loud, with reasons.', 2),
  d('Type one word into the search bar of the guy on your right.', 3),
  d('Accept an award for work you did not do.'),
  d('Text your most recent contact and ask them to rate you out of ten.', 2),
  d('Leave your phone face down until the game ends.', 2),
  d('Show the group the worst selfie you have kept.', 2),
  d('Swap shoes with the guy next to you for three rounds.'),
  d('Say the most embarrassing thing you have searched this week.', 3),
  d('Hold a plank until someone here laughs.'),
  d('Post one emoji as your status for an hour, group choice.', 3),
  d('Balance a shoe on your head until your next turn.'),
  d('Name three things you would never do and one you would.'),
  d('Insult the guy to your left, then compliment him twice.'),
  d('Show the group the last thing you screenshotted.'),
  d('List your last three search results from memory.'),
  d('Let the room choose your next profile picture.', 3),
  d('Text someone that you need to talk, then put the phone down.', 3),
  d('Perform stand-up with two jokes, no notes.'),
  d('Admit the last thing you cried about, in a funny voice.', 3),
  d('Trade one accessory with the guy opposite for two rounds.'),
  d('Do an impression of someone in this room and let the group guess.', 1),
  d('Say the last thing you said before this game, in a villain voice.', 3),
  d('Sing the chorus of the song you would never admit knowing.', 1),
  d('Read your last notification out loud and defend it.', 3),
  d('Mime your morning routine in fifteen seconds.', 1),
  d('Spell your own name as if the room owes you an apology.', 2),
  d("Do a weather report for the group's mood.", 1),
  d('Recite the alphabet as if you are resigning.', 3),
  d('Narrate your week like a sports highlight reel.', 1),
  d('Draw the person opposite in fifteen seconds.', 1),
  d('Impersonate a teacher or boss everyone remembers.', 1),
  // ---- dares that cost something ----
  d('Call the person you spoke to most this week and tell them what you were actually doing when you ignored their last call.', 2),
  d('Show the room the last thing you searched and explain why it is not a problem.', 3),
  d('Name the person here you trust least, then say that to their face with one reason.', 3),
  d('Tell the room what you have done that you would deny under oath.', 3),
  d('Call a friend and ask them to describe you in three words. Read them out loud.', 2),
  d('Tell the person to your left the first impression you had of them, unedited.', 2),
  d('Say the last lie you told someone in this room, then say why you told it.', 3),
  d('Pick the person here most likely to betray you and explain it to their face.', 3),
  d('Admit the pettiest thing you have done to get back at someone.', 2),
  d('Tell the room what you would say at the funeral of the person to your left.', 3),
  d('Read out the last message you sent to someone here and explain it.', 2),
  d('Name what you have borrowed and never returned, and who still owns it.', 1),
  d('Rate the last decision this group made, honestly, out of ten, and justify it.', 2),
  d('Tell the person opposite what you would change about them, then what you would keep.', 2),
  d('Say what you have done that would make your parents look at you differently.', 3),
  d('Name the person here you would call at 4 AM and the one you would not. Both out loud.', 3),
  d('Admit the last time you were jealous of someone here, and of what.', 3),
  d('Pick who here ends up rich and who here ends up in a cell. Explain both.', 2),
  // ---- moved out of the question pool: these were always dares ----
  d('Perform the worst boss you have had, and use the one line you remember.', 1),
  d('Recreate the worst family function you have had to sit through in twenty seconds.', 2),
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
