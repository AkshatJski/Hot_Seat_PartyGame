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
  q('What is the silliest thing you have seen someone do to avoid washing the dishes?'),
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
  q('What is the bravest thing you did before you turned twelve?', 2),
  q('Tell us which school rule you broke most often, and whether anyone caught you.', 2),
  q('Name the teacher everyone in this family remembers for the wrong reason.', 2),
  q('Who here won the most pointless prize at school, and what was it for?', 2),
  q('What did you want to be at seven years old, and what killed that plan?', 2),
  q('Describe your worst school photo, down to the haircut and the shirt.', 2),
  q('Recite the most useless fact school taught you.'),
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
  q('Who here is the bossiest cousin, and what do they try to control?'),
  q('Describe a trick you played on a sibling that you would still deny today.', 3),
  q('Rank the cousins by rumour risk.', 2),
  q('What is the most annoying thing a sibling has done that you now find funny?', 2),
  q('Point at the person who was the golden child, then give the evidence.', 3),
  q('What did you and a sibling team up to hide from your parents?', 3),
  q('Who here borrows a jacket and keeps it for a year, and what is their best excuse?'),
  q('Describe the worst group punishment you earned because of a sibling.', 2),
  q('What is the nicest thing a sibling has done that you never thanked them for?', 3),
  q('Say the nickname only family may use.', 2),

  // ---- functions and weddings ----------------------------------------------
  q('What is the strangest excuse you have used to leave a family function early?', 2),
  q('Point at whoever disappears the moment the work starts at a function, then name their hiding place.'),
  q('What is the funniest thing you have seen happen at a wedding?', 2),
  q('Who here dances first and worst, and what is the move called?', 2),
  q('Describe the longest goodbye you have ever seen at a family gathering, and how many attempts it took to leave.', 2),
  q('What is the one relative everybody hides from at a function, and what do they always want from you?', 2),
  q('Rank the festival foods here, best to most overrated.'),
  q('What is the most dramatic thing that has happened at a family wedding?', 3),
  q('Name the family\'s designated organiser.', 2),
  q('What is the strangest gift this family has given at a wedding?', 2),
  q('Point at whoever photographs everything and posts nothing, then describe the last album they made.'),
  q('Say the one function this family would never skip, and who would notice most.', 2),

  // ---- travel ---------------------------------------------------------------
  q('Who here is the worst passenger on a long drive, and what exactly do they do that drives everyone else mad?', 2),
  q('Describe the most chaotic family trip you have ever taken, from the first wrong turn to the last apology.', 2),
  q('Name the item a person here always forgets to pack.'),
  q('Rank everyone here by how well they would cope with no internet, no television and no phone for a whole day.', 2),
  q('Point at the person who needs a full itinerary before leaving the house, then name the last thing they planned.'),
  q('What is the strangest thing you have seen a family member do on a holiday?', 2),
  q('Tell us about a trip that went wrong in the funniest possible way.', 2),
  q('Who here would get lost in a hotel corridor, and how long would it take?', 2),
  q('What is the rule this family follows on every trip, and who made it?', 2),
  q('Would you rather take a road trip with no music or a flight with no snacks?'),

  // ---- house rules and chores ----------------------------------------------
  q('What is one chore you pretended not to hear being asked of you?', 2),
  q('Point at whoever leaves the light on in every room and denies it, then count the lit rooms.'),
  q('Describe the household habit you assumed was completely normal until you saw how another family lives at home.', 3),
  q('Say the rule in this house that visitors break first.', 2),
  q('Who here complains most and helps least, and what was the last complaint?', 2),
  q('Name the job nobody here wants.', 2),
  q('What would happen if nobody in this house got a reminder for a week?', 2),
  q('Rank everyone here by how tidy their room actually is.', 2),
  q('Point at the person who reorganises the kitchen and then cannot find the salt, and name the lost item.'),
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
  q('Hum the advert this family still quotes.'),
  q('Would you rather watch the worst film ever made twice or one great film once?', 2),

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
  q('What is the oddest thing you do when nobody is watching?', 3),
  q('Name the person here most likely to narrate a film out loud, then quote their commentary.'),
  q('What would ruin dinner fastest: a late guest, a cold dish or a dead router?', 2),
  q('Rank everyone here by how well they hide a bad mood.', 2),
  q('Say the phrase this family uses instead of an answer.', 2),
  q('What is one habit you inherited and now cannot stop?', 2),
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
  q('Describe the one family moment you would pay any price to live through again, exactly as it was.', 3),

  // ---- performance and invention -------------------------------------------
  q('Do your best impression of a relative who is not in the room.', 2),
  q('Invent a new family rule and explain who it is really aimed at.', 2),
  q('Say the dinner menu of this family in the voice of a sports commentator.', 3),
  q('Perform a ten-second theme song.', 3),
  q('Do the noise a relative makes sitting down.', 2),
  q('Give every person here a new family nickname and explain each one.', 2),
  q('Mime one everyday thing this family does and let them guess.', 2),
  q('Say a sentence a parent here says every day, in that parent\'s voice.', 3),
  q('Invent a name for this family\'s whole personality and defend it.', 2),
  q('Spell your name as a strict teacher.', 2),
  q('Describe a sibling in three words that are all true and all unfair.', 2),
  q('Read the last message you sent in the voice of a newsreader.', 3),
  q('Do an impression of this family waiting for someone who is late.', 2),
  q('Give this group a team chant.', 2),
  q('Hum the song this family argues about.'),
  q('Invent a festival this family should celebrate every single year.', 2),
]

const DARES: Dare[] = [
  d('Give a thirty-second speech on why this family is the best one in the building.'),
  d('Say the alphabet backwards, slowly, while everyone watches.'),
  d('Sing the first line of the last song stuck in your head.'),
  d('Hold a serious face for twenty seconds while the group makes noises at you.'),
  d('Do a dramatic impression of a relative who is not here.'),
  d('Compliment every person here, one sentence each, no repeats.'),
  d('Read your last sent message out loud in a dramatic voice.'),
  d('Draw the person to your left in fifteen seconds and show everyone.'),
  d('Mimic how a relative answers the front door.'),
  d('Announce the next family function like a newsreader.'),
  d('Speak only in questions until your next turn.'),
  d('Explain the plot of the last film you watched in three sentences.'),
  d('Hand every person here a job title for this family and defend each one.', 2),
  d('Whisper your full name as if telling the biggest secret in the room.'),
  d('Spell your own name the way a strict teacher would.'),
  d('Stand up and take a long, serious bow for no reason.'),
  d('Walk like someone who just dropped their phone in public.'),
  d('Pretend to commentate the rest of dinner like a cricket final.'),
  d('Say what you did at ten this morning, in rhyme.'),
  d('Make up a slogan for this family and chant it twice.'),
  d('Lead a guided tour of this room in twenty seconds or less.'),
  d('Read any message in a film-trailer voice, full drama.'),
  d('Imitate a car struggling to start on a cold morning.'),
  d('Speak one full sentence in a language you do not speak, cheerfully.'),
  d('Copy the accent of the person to your right for two rounds.'),
  d('Count from twenty down to one as if the room is about to explode.'),
  d('Describe your day as if it were a nature documentary.'),
  d('Raise your phone above your head and thank the room for the award.'),
  d('Invent a handshake for this family and teach everyone.'),
  d('Recite the days of the week as a wedding toast.'),
  d('Perform a slow-motion replay of yourself sitting down.'),
  d('Say your address in the voice of a train announcement.'),
  d('Name every person here and one dish they are known for.'),
  d('Text one word to a relative and read the reply aloud when it arrives.'),
  d('Deliver tomorrow\'s weather forecast as if it is breaking news.'),
  d('Swap seats with the person across from you for the next three rounds.'),
  d('Tell a forty-second gripping tale about the last time you were late.'),
  d('Hum a song everyone in this family knows and let them guess.'),
  d('Answer the next three questions in a whisper.'),
  d('Design a flag for this family and explain the symbols.'),
  d('Pitch a holiday this family should take, with a full itinerary.'),
  d('Act out a family member opening a difficult jar.'),
  d('Say the name of everyone here in alphabetical order, twice.'),
  d('Lecture the room for one minute on a subject you know nothing about.', 2),
  d('Guess the last photo in the gallery of the person on your right.'),
  d('Share the most boring fact you know and make it sound urgent.'),
  d('Narrate the next round as if time is running out.'),
  d('Stand behind the person to your left and mime their reaction for a minute.'),
  d('Review the last thing you ate in exactly five seconds.'),
  d('Call out the next question in a football commentator voice.'),
  d('Hold a plank until your next turn, or until the group laughs.', 2),
  d('Tell the room the plot of a film you have never seen.'),
  d('Spell a family member\'s full name in a singing voice.'),
  d('Improvise a two-line song about the person who just dared you.', 2),
  d('Roast the person to your left, kindly, for exactly three sentences.', 2),
  d('Defend the least popular food on this table for a full minute.', 2),
  d('Argue that Sunday should be cancelled, with real conviction.', 2),
  d('List five uses for a spoon that nobody has tried.'),
  d('Admit what you always pretend not to care about.', 3),
  d('Announce the winner of this round before the round starts.'),
  d('Recount the best day of your year in under twenty seconds.', 3),
  d('Say the next thing you say as if reading a bedtime story.'),
  d('Keep eye contact with the person opposite for ten silent seconds.'),
  d('Improvise a two-sentence excuse for being late, delivered to everyone.'),
  d('Sing the answer to the next question, no talking.', 2),
  d('Explain the rules of this game as if teaching a class of seven-year-olds.'),
  d('Draw a self-portrait in ten seconds with your eyes closed.'),
  d('Deliver a formal thank-you speech to the person who called you out.'),
  d('Count the things on the table and announce the total like a score.'),
  d('Choose one word that describes the room and repeat it louder each round.'),
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
