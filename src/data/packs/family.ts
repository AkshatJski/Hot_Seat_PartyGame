import type { CallOutDare, Dare, Intensity, Question, VibePack } from '../../types'

/**
 * FAMILY - the bottom shelf.
 *
 * Tone: warm, nostalgic, roasty in a way that survives a grandmother overhearing
 * it. This is the pool you can play at a dinner table with parents, siblings and
 * cousins without anyone having to explain a joke in a whisper.
 *
 * HARD RULES (enforced by `npm run lint:content`):
 *   - zero profanity, zero sexual content, zero alcohol or drug references
 *   - nothing about anyone's body, health or money (nobody should have to
 *     disclose something they cannot choose to share)
 *   - every dare happens indoors, needs no props, and cannot break anything
 *
 * Specifically NOT here: dating, crushes, exes, secrets from parents that would
 * get a child in trouble, anything about a person's appearance.
 *
 * CRAFT RULES (enforced by the mix gate, see `scripts/content-shapes.ts`):
 *   - a nominate card carries a second clause: evidence, defence, action or
 *     ranking. The answer is never a bare name.
 *   - six answer shapes, and no shape may exceed a third of the pool.
 *   - lengths alternate: a five-word stab, then a twenty-word scene.
 *   - tier 3 is warmth and honesty on this shelf, not shock. No shocks here.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 1): Question => ({
  id: `fam-q${++seq}`,
  text,
  intensity,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `fam-d${++dseq}`,
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 2): CallOutDare => ({
  id: `fam-c${++cseq}`,
  text,
  intensity,
  callOut: true,
})

const QUESTIONS: Question[] = [
  // ---- at the table ---------------------------------------------------------
  q('Name the one dish that has to be on the table at every family meal, and who cooks it best.'),
  q('Point at the person who takes the biggest portion before anyone else is served, then name their excuse.'),
  q('Who here eats the last sweet and denies it, and how do they get away with it?'),
  q('Rank the dinner dishes, best to most overrated.'),
  q('Describe the one food you refuse at a family dinner, and exactly what happens when you say no.', 2),
  q('Point at whoever sneaks snacks before dinner and then claims they are not hungry, and list what they ate.'),
  q('Say the one food rule here that visitors always find strange.'),
  q('Would you rather eat the same dinner for a month or never eat your favourite dish again?', 2),
  q('Name the strangest food combination this family defends.'),
  q('Who here orders the most at a restaurant and finishes the least, and what do they always order?'),
  q('Describe a meal that went wrong in a way everyone still laughs about.', 2),

  // ---- childhood and school -------------------------------------------------
  q('What was your most dramatic tantrum as a child, and who was it aimed at?', 2),
  q('Tell us about the silliest excuse you gave a teacher that actually worked.', 2),
  q('Point at the person who was the class clown, then do their best bit.', 2),
  q('Tell us which school rule you broke most often, and whether anyone caught you.', 2),
  q('Name the teacher everyone in this family remembers for the wrong reason.', 2),
  q('What did you want to be at seven years old, and what killed that plan?', 2),
  q('Describe your worst school photo, down to the haircut and the shirt.', 2),
  q('Which useless fact from school have you never managed to forget?'),
  q('Rank everyone here by how well they would do on a school exam tomorrow.', 2),
  q('If this family ran a school, who would be expelled in a week?', 2),

  // ---- parents and grandparents ---------------------------------------------
  q('Tell us the story a parent or grandparent retells at every single gathering.'),
  q('What is the phrase a parent here says that you have started saying too?', 2),
  q('Point at the person most likely to turn into their mother or father one day, then explain exactly why.', 2),
  q('What is the strictest rule your parents had that you now think was fair?', 3),
  q('Name a habit you picked up from a grandparent without meaning to.', 2),
  q('What did your parents always seem to know before you told them?', 2),
  q('Point at whoever gives advice nobody asked for, then repeat the last piece they gave.'),
  q('Tell us what a parent here does that annoys you and that you secretly do too.', 3),
  q('Point at whoever is the favourite child, and prove it with one example.', 3),
  q('What is the oldest object this family refuses to throw away?', 2),
  q('If you had the best day of your life, who here would you tell first?', 2),
  q('Say what your parents got right that you would copy exactly.', 3),

  // ---- siblings and cousins -------------------------------------------------
  q('Point at the sibling or cousin who started the most trouble and never took the blame, and recount the incident.', 2),
  q('What is the pettiest fight you have had with a sibling, and who apologised first?', 2),
  q('Describe a trick you played on a sibling that you would still deny today.', 3),
  q('What is the most annoying thing a sibling has done that you now find funny?', 2),
  q('What did you and a sibling team up to hide from your parents?', 3),
  q('Describe the worst group punishment you earned because of a sibling.', 2),
  q('What is the nicest thing a sibling has done that you never thanked them for?', 3),
  q('Say the nickname only family may use.', 2),

  // ---- functions and weddings ----------------------------------------------
  q('What is the strangest excuse you have used to leave a family function early?', 2),
  q('What is the funniest thing you have seen happen at a wedding?', 2),
  q('Who here dances first and worst, and what is the move called?', 2),
  q('Describe the longest goodbye you have ever seen at a family gathering, and how many attempts it took to leave.', 2),
  q('What is the one relative everybody hides from at a function, and what do they always want from you?', 2),
  q('What is the most dramatic thing that has happened at a family wedding?', 3),
  q('What is the strangest gift this family has given at a wedding?', 2),
  q('Say the one function this family would never skip, and who would notice most.', 2),

  // ---- travel ---------------------------------------------------------------
  q('Who here is the worst passenger on a long drive, and what exactly do they do that drives everyone else mad?', 2),
  q('Describe the most chaotic family trip you have ever taken, from the first wrong turn to the last apology.', 2),
  q('Rank everyone here by how well they would cope with no internet, no television and no phone for a whole day.', 2),
  q('What is the strangest thing you have seen a family member do on a holiday?', 2),
  q('What is the rule this family follows on every trip, and who made it?', 2),
  q('Would you rather take a road trip with no music or a flight with no snacks?'),

  // ---- house rules and chores ----------------------------------------------
  q('What is one chore you pretended not to hear being asked of you?', 2),
  q('Point at whoever leaves the light on in every room and denies it, then count the lit rooms.'),
  q('Describe the household habit you assumed was completely normal until you saw how another family lives at home.', 3),
  q('Say the rule in this house that visitors break first.', 2),
  q('Who here complains most and helps least, and what was the last complaint?', 2),
  q('What would happen if nobody in this house got a reminder for a week?', 2),
  q('Rank everyone here by how tidy their room actually is.', 2),
  q('Say the house rule you will definitely give your own family one day.', 3),

  // ---- screens and songs ----------------------------------------------------
  q('Point at the person who talks through the whole film, then quote their last interruption.'),
  q('What is the film this family has watched the most times, and who always picks it?'),
  q('Name the song that makes everyone here sing along, and who starts first.', 2),
  q('Describe the worst film a relative dragged you to see.', 2),
  q('Who here spoils film endings on purpose, and which film did they ruin last?'),
  q('What would happen here if the television broke for a whole month?'),
  q('Rank everyone here by how likely they are to fall asleep before the film ends.'),
  q('Name the film character this family says you are most like.', 3),

  // ---- phones and group chats ----------------------------------------------
  q('Point at the person with the most unread messages right now, without checking.'),
  q('What is the strangest thing this family group chat has been used for?', 2),
  q('Who here types the longest message to make the shortest point, and what was the last essay?'),
  q('Describe the last photo you took and how it went wrong.', 2),
  q('What would this family miss first if phones vanished tonight?', 2),
  q('Name the one video this family sends each other every single year.', 2),
  q('Who here would struggle most without a phone for a whole day, and what would break first?', 2),
  q('What is the strangest thing you have bought because of the internet?', 2),
  q('Say the last thing you searched that you would not want read aloud.', 3),
  q('Rank everyone here by how fast they reply to the family group chat.', 2),

  // ---- habits and quirks ----------------------------------------------------
  q('Point at the person who checks the door twice before leaving the house, and say what they are afraid of.'),
  q('What is the most pointless skill you have practised until it looked impressive?', 2),
  q('Who here has the most chaotic handwriting, and can anyone else read it?'),
  q('Describe the noise a person here makes when they are annoyed, without naming them.', 2),
  q('Name the person here most likely to narrate a film out loud, then quote their commentary.'),
  q('What would ruin dinner fastest: a late guest, a cold dish or a dead router?', 2),
  q('Rank everyone here by how well they hide a bad mood.', 2),
  q('Say the phrase this family uses instead of an answer.', 2),
  q('Point at whoever arrives exactly on time and makes everyone else look late, and say what time they really left.', 2),
  q('Describe the face a relative makes when they disapprove of you.', 2),

  // ---- warm, honest, tier 3 -------------------------------------------------
  q('Tell one person here what they taught you that you have never said out loud.', 3),
  q('Who here would you call first if everything went wrong, and why them?', 3),
  q('What do you want to thank a parent here for that they never noticed?', 3),
  q('Say the family rule you still follow as an adult, and who gave it to you.', 3),
  q('Who here have you argued with the most, and what were you really fighting about?', 3),
  q('What is the kindest thing anyone in this room has done for you?', 3),
  q('Tell us about a moment you were proud of someone here and never told them.', 3),
  q('Point at the person you would want beside you in a hospital waiting room, and say what they would bring.', 3),
  q('What do you wish this family did more often?', 3),
  q('Say the sentence a grandparent used that you will teach your own children.', 3),
  q('Who here knows you best, and what do they know that others do not?', 3),

  // ---- performance and invention -------------------------------------------
  q('Invent a new family rule and explain who it is really aimed at.', 2),
  q('Give every person here a new family nickname and explain each one.', 2),
  q('Invent a name for this family\'s whole personality and defend it.', 2),
  q('Spell your name as a strict teacher.', 2),
  q('Describe a sibling in three words that are all true and all unfair.', 2),
  q('Invent a festival this family should celebrate every single year.', 2),
  // ---- the whole family, not just the loudest four ----
  q('What does a grandparent say that nobody in this family ever argues with?', 2),
  q('Who here would take the whole family in if things went wrong, and who would need taking in?', 2),
  q('What is the rule about who sits where at dinner, and who enforces it?', 1),
  q('Say the exact words a parent here uses to end an argument, in their voice.', 2),
  q('Who here still gets treated like a child, and what exactly do they get away with?', 2),
  q('What would you change about family gatherings if nobody could take offence?', 2),
  q('What is the oldest thing in this house that nobody may throw away, and whose is it?', 2),
  q('What did you learn to cook here, and who taught you without meaning to?', 2),
  // ---- warm-ups: the first ten minutes of the night ----
  q('Would you rather host or be hosted?', 1),
  q('Rank the family by how late they turn up.', 1),
  q('What would this family do without wifi for a week?', 1),
  q('What would relatives say if you moved out tomorrow?', 1),
  q('Pick one chore to ban forever.', 1),
  q('Sit next to the loudest or the quietest?', 1),
  q('What if nobody washed up for three days?', 1),
  q('If you had to share a room with one relative, who?', 2),
  q('Rank the family by cooking skill.', 1),
  q('One family holiday on repeat, or no holiday for three years?', 1),
  q('What if this family had to share one car?', 1),
  q('Pick who starts the family group call.', 1),
  q('Cook for everyone or clean up after everyone?', 1),
  q('Rank the family photos by how bad they are.', 1),
]

const DARES: Dare[] = [
  d('Sing the first line of the last song stuck in your head.'),
  d('Do a dramatic impression of a relative who is not here.'),
  d('Compliment every person here, one sentence each, no repeats.'),
  d('Announce the next family function like a newsreader.'),
  d('Hand every person here a job title for this family and defend each one.', 2),
  d('Pretend to commentate the rest of dinner like a cricket final.'),
  d('Read any message in a film-trailer voice, full drama.'),
  d('Count from twenty down to one as if the room is about to explode.'),
  d('Describe your day as if it were a nature documentary.'),
  d('Invent a handshake for this family and teach everyone.'),
  d('Name every person here and one dish they are known for.'),
  d('Text one word to a relative and read the reply aloud when it arrives.'),
  d('Swap seats with the person across from you for the next three rounds.'),
  d('Design a flag for this family and explain the symbols.'),
  d('Guess the last photo in the gallery of the person on your right.'),
  d('Review the last thing you ate in exactly five seconds.'),
  d('Hold a plank until your next turn, or until the group laughs.', 2),
  d('Improvise a two-line song about the person who just dared you.', 2),
  d('Roast the person to your left, kindly, for exactly three sentences.', 2),
  d('Defend the least popular food on this table for a full minute.', 2),
  d('Argue that Sunday should be cancelled, with real conviction.', 2),
  d('List five uses for a spoon that nobody has tried.'),
  d('Admit what you always pretend not to care about.', 3),
  d('Recount the best day of your year in under twenty seconds.', 3),
  d('Say the next thing you say as if reading a bedtime story.'),
  d('Keep eye contact with the person opposite for ten silent seconds.'),
  d('Deliver a formal thank-you speech to the person who called you out.'),
  d('Hum the advert this family still quotes.'),
  d('Do your best impression of a relative who is not in the room.', 2),
  d('Say the dinner menu of this family in the voice of a sports commentator.', 3),
  d('Perform a ten-second theme song.', 3),
  d('Do the noise a relative makes sitting down.', 2),
  d('Mime one everyday thing this family does and let them guess.', 2),
  d('Say a sentence a parent here says every day, in that parent\'s voice.', 3),
  d('Read the last message you sent in the voice of a newsreader.', 3),
  d('Do an impression of this family waiting for someone who is late.', 2),
  d('Give this group a team chant.', 2),
  d('Hum the song this family argues about.'),
  // ---- dares that cost something ----
  d('Ring a relative who is not here and tell them a truth you have never said out loud.', 2),
  d('Name the relative you are most like and prove it with one habit.', 2),
  d('Give every person here the job they actually do at a family function, and defend each one.', 2),
  d('Dance the way a relative dances at a wedding until someone guesses who.', 2),
  d('Tell the person to your left what you would change about them, then what you would keep.', 2),
  d('Read out the last family group message and explain it to the room.', 2),
  d('Compliment the person you argue with most, then say what the argument is really about.', 3),
  d('Give a one-minute speech for the next family wedding. Start now.', 1),
  d('Imitate a grandparent answering the phone and hold it for ten seconds.', 1),
  d('Say the rule you would set for this family if you were in charge.', 2),
  d('Ask the room to name your worst habit, then defend it.', 2),
  d('Tell the room the last thing you lied to a relative about.', 3),
  // ---- family dares that cost something ----
  d('Ring the relative who always calls first and let the room hear the conversation.', 2),
  d('Name the family rule you break when nobody is watching, and why you break it.', 3),
  d('Ask the oldest person here what they would change about this family, then repeat their answer exactly.', 3),
  d('Tell the room the last thing you got away with in this house.', 2),
  d('Swap phones with the person next to you for one round. No locking the screen.', 3),
  d('Admit the pettiest thing you have done to get out of a family duty.', 2),
]

const CALL_OUT_DARES: CallOutDare[] = [
  c('Repeat the question in a movie-trailer voice before you answer.'),
  c('Thank the person who called you out, by name, before you answer.'),
  c('Use the voice of a relative who is not here for your whole answer.'),
  c('Stand up while you answer, then sit down without explanation.'),
  c('Keep your hands on your head for the entire turn.'),
  c('Sing the first three words of your answer.'),
  c('Give your answer, then take a bow.'),
  c('Wait five seconds, counting out loud, before you answer.'),
  c('Hold a serious face while you answer; the room tries to break you.'),
  c('Let the room pick the accent you answer in.'),
  c('Deliver your answer in one long sentence with no pauses.'),
  c('Speak in the third person, as if reporting on yourself.'),
  c('Whisper your answer, then repeat it loudly.'),
  c('Balance on one leg while you answer.'),
  c('Pass your answer to the person on your left, who delivers it.'),
  c('Take a ten-second drumroll from the group before you answer.'),
  c('Pretend the whole room is hard of hearing.'),
  c('Explain your answer to a seven-year-old, out loud.'),
  c('Rhyme your answer, or repeat it twice.'),
  c('Close your eyes the entire time you answer.', 3),
  c('Rate your own answer out of ten after you give it.'),
  c('Let the person to your right narrate your answer.'),
  c('Use only short words, eight in total, for this answer.'),
  c('Pause for exactly five dramatic seconds before you answer.'),
  c('Thank everyone here by name after you answer.'),
  c('Answer as if you are being interviewed on the news.'),
  c('Ask the room to vote on whether you meant your answer.'),
  c('Give two answers: one honest, one as a joke.'),
  c('Put your hands behind your back for the entire turn.'),
  c('Invite one follow-up question from the room after you answer.'),
]

export const FAMILY: VibePack = {
  questions: QUESTIONS,
  dares: DARES,
  callouts: CALL_OUT_DARES,
}
