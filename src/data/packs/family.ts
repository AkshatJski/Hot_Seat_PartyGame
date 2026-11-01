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
  q('Which family member here would survive longest in a zombie apocalypse, and what is their whole strategy?'),
  q('Point at the person most likely to cry during a movie about a dog.'),
  q('What was your most dramatic tantrum as a child, and who was it aimed at?', 2),
  q('Name the relative here who takes the longest to say goodbye at the door.'),
  q('Who here would lose a fight with a mosquito?'),
  q('Describe the worst haircut you were ever forced to sit through.', 2),
  q('Which relative says "back in our day" in the middle of an argument?'),
  q('What is the strangest excuse you have used to escape a family function?', 2),
  q('Point at whoever cannot keep a secret for more than a day.'),
  q('Who is the pickiest eater at this table, and what exactly do they refuse to touch?'),
  q('What is the silliest excuse you gave a teacher that actually worked?', 2),
  q('Rank everyone here from most to least likely to survive a week without Wi-Fi.'),
  q('Which family member has the most dramatic sneeze?'),
  q('What is one chore you pretended not to hear being asked of you?'),
  q('Point at the person who would absolutely eat the last slice without asking.', 2),
  q('Who here has the most chaotic handwriting?'),
  q('Tell us about the bravest thing you did before you turned twelve.', 2),
  q('What is the most useless fact you know by heart?'),
  q('Which of us would be the worst passenger on a long road trip, and why?'),
  q('Point at the person who takes the longest to get ready before leaving the house.'),
  q('What is the weirdest household habit you thought was normal until you saw another family?', 2),
  q('Who here is most likely to fall asleep with the TV still on?'),
  q('Describe your most embarrassing school assembly moment.', 2),
  q('Point at whoever forgets names and pretends they remember.'),
  q('What is the first object you would buy if you woke up suddenly rich?'),
  q('Who here is the loudest laugher in the building?'),
  q('What game do you always lose but keep playing anyway?'),
  q('Point at the person most likely to win a staring contest against a cat.'),
  q('Which of us has the worst phone battery habits?'),
  q('What is the most pointless argument you have ever won?', 2),
  q('Who here talks to themselves when they think nobody is listening?', 2),
  q('Describe the dumbest way you have ever hurt yourself.', 2),
  q('Point at whoever would eat dessert first at every single meal.'),
  q('What is the funniest thing a pet has ever done to you?'),
  q('Which family member tells the same story at every single gathering?'),
  q('Who here would be the most annoying person to sit next to on a flight?'),
  q('What is a family rule of yours that makes no sense to outsiders?'),
  q('Rank these from best to worst: waking up early, homework, family calls, Mondays.'),
  q('Point at the person most likely to leave their phone somewhere stupid.'),
  q('What is the silliest thing you were scared of as a kid?'),
  q('Who here is secretly a neat freak?'),
  q('Describe the most dramatic exit you have ever made from a room.', 2),
  q('Which of us would be worst at pretending to like a boring gift?'),
  q('What is the best comeback you have ever used in an argument?', 2),
  q('Point at whoever gets cranky first when they are hungry.'),
  q('Who here overpacks for every trip, even an overnight one?'),
  q('What is the longest you have ever hidden a bad report card?', 3),
  q('Name the relative who could win a talent show with zero effort.'),
  q('Who here would somehow set off the smoke alarm boiling water?'),
  q('What is the weirdest object you have carried in your pocket for a whole day?', 2),
  q('Point at the person most likely to laugh at their own joke before finishing it.'),
  q('Which of us checks their phone the most in a single hour?'),
  q('What is the dumbest thing you believed as a child for far too long?', 2),
  q('Describe the best prank you have pulled on a sibling or a cousin.', 2),
  q('Who here takes the longest to answer a simple yes or no question?'),
  q('What is the most specific dream you can still remember?'),
  q('Point at whoever would complain about the weather first on a beach holiday.'),
  q('What is your go-to excuse for leaving a party early?'),
  q('Which family member could win an argument with a shopkeeper?'),
  q('Who here would survive being grounded for a month without complaining once?', 2),
  q('What is the most random skill you have?'),
  q('Rank everyone here by how likely they are to become famous one day.'),
  q('Tell us about the last time you tried to fix a broken object and made it worse.', 2),
  q('Who here has the strangest hobby that nobody else understands?'),
  q('What smell instantly reminds you of your childhood?'),
  q('Point at the person who would forget the lyrics to their own favourite song.'),
  q('Which of us talks through the entire movie?'),
  q('What is the funniest misunderstanding you have had with a stranger?', 2),
  q('Who here has the worst sense of direction, even with a map open?'),
  q('Tell us the most out-of-pocket thing you have seen in a school corridor.', 2),
  q('What do you and your best friend argue about the most?'),
  q('Rank everyone here by how good they are at keeping a straight face.'),
  q('Who here panics first when the Wi-Fi drops?'),
  q('What is the one object you would never let your family borrow?'),
  q('Invent a new house rule that would end every argument in this family.', 2),
  q('Guess what the person to your left was thinking about ten seconds ago.'),
  q('Rate the outfit of the person to your right out of ten, out loud.', 2),
  q('Choose one person here as your emergency contact for every possible situation.'),
  q('Admit the pettiest reason you have ever been annoyed at a sibling.', 2),
  q('What is the most childish thing you still do without noticing?'),
  q('Point at whoever would fall for a fake prize message the fastest.'),
  q('Which of us would be the worst at hiding a surprise party?'),
  q('What is the longest you have ever stayed awake, and why?'),
  q('Describe the single most embarrassing thing your parents have said in public.', 3),
]

const DARES: Dare[] = [
  d('Sing the chorus of any song using only the word "la" until someone guesses it.'),
  d('Let the person to your left draw a moustache on your face using one finger.'),
  d('Speak in a movie villain voice until your next turn.', 2),
  d('Do your best impression of a grandparent answering a video call.'),
  d('Balance an empty cup on your head for thirty seconds without touching it.', 2),
  d('Say the alphabet backwards. Every mistake costs you three jumping jacks.', 2),
  d('Give a thirty-second speech in praise of the person to your right.'),
  d('Walk across the room like a supermodel, then bow like royalty.'),
  d('Narrate everything you do out loud until your next turn.', 2),
  d('Do five squats while reciting your own name dramatically.'),
  d('Pretend to be a sports commentator describing this room for twenty seconds.'),
  d('Hold a plank for as long as you can while the group counts out loud.', 2),
  d('Make up a rap about the person to your left in ten seconds.', 2),
  d('Speak only in questions until your next turn.', 2),
  d('Do your best animal impression and let the group guess which animal.'),
  d('Act out brushing your teeth in slow motion for fifteen seconds.'),
  d('Let the group choose a new nickname for you until the end of the game.'),
  d('Try to lick your elbow for ten seconds, then admit defeat out loud.'),
  d('Sing your next sentence like an opera singer.'),
  d('Hop on one leg around the room once while humming a tune.'),
  d('Do a dramatic reading of the last message you sent someone.', 2),
  d('Give everyone in the room a silly compliment in under fifteen seconds.'),
  d('Pretend to be a news anchor reporting from this room for twenty seconds.'),
  d('Do your best impression of a cat that has been asked to pay taxes.'),
  d('Say a tongue twister three times fast. Failure means one more attempt.'),
  d('Freeze in a silly pose for the length of the next turn.', 2),
  d('Invent a dance move and teach it to everyone in ten seconds.'),
  d('Speak in a posh accent until your next turn.', 2),
  d('Pretend to be a waiter taking the table order, fully in character.'),
  d('Draw a portrait of the person opposite you in under twenty seconds.', 2),
  d('Do your best robot impression, complete with sound effects.'),
  d('Recite a poem about snacks in a serious, emotional voice.'),
  d('Let the person to your right style your hair using their hands only.'),
  d('Act out a conversation with an imaginary friend for twenty seconds.', 2),
  d('Say the name of every person here in a different accent each time.'),
  d('Try to touch your nose with your tongue while the group watches.'),
  d('Do three push-ups, or ten if the group votes for it.', 2),
  d('Stand up and give a ten-second weather report about this room.'),
  d('Speak in rhymes for the rest of this turn.', 3),
  d('Mime your morning routine from bed to door in twenty seconds.'),
  d('Give the group a forty-second lecture on a completely made-up animal.', 2),
  d('Do your best baby impression and stay in character for one round.'),
  d('Balance on one leg with your eyes closed for fifteen seconds.'),
  d('Pretend to sell the object nearest to you with a dramatic sales pitch.'),
  d('Let the group pick a word you must use in every sentence until your next turn.', 3),
  d('Act out the last dream you can remember for fifteen seconds.', 2),
  d('Clap a rhythm and make everyone repeat it back correctly.'),
  d('Do an impression of the person to your left until they guess it.', 2),
]

const CALL_OUT_DARES: CallOutDare[] = [
  c('Lead the group in a thirty-second dance break before anyone else may speak.'),
  c('Speak only in a whisper until your next turn.'),
  c('Compliment every player here in one sentence each.'),
  c('Hold an empty cup on your head for two full rounds.', 3),
  c('Sing every answer you give for the rest of the round.'),
  c('Let the person who called you out choose your nickname for three rounds.'),
  c('Sit on the floor for the next two rounds.'),
  c('Explain what you did, step by step, in a baby voice.'),
  c('Do ten star jumps before your next turn begins.'),
  c('Tell the room a made-up fact about yourself and keep a straight face.'),
  c('Say "I take it back" before every single line you speak for two rounds.', 3),
  c('Wear whatever the group hands you for the next two rounds.'),
  c('Give a sincere speech about why the person who called you out is wonderful.'),
  c('Re-enact your answer using only mime.'),
  c('Say the alphabet backwards before the group may continue.', 2),
  c('Let the group set a ridiculous nickname for one of your contacts for an hour.', 2),
  c('Hold your ears and hum for twenty seconds while the group speaks.'),
  c('Thank everyone here for one specific reason, one by one.'),
  c('Do your next turn standing up with your arms in the air.'),
  c('Repeat the question in a dramatic movie trailer voice before answering.'),
  c('Let the group take one silly photo of you and show it around.', 3),
  c('Copy the accent of the person who called you out for two rounds.'),
]

export const FAMILY: VibePack = {
  questions: QUESTIONS,
  dares: DARES,
  callouts: CALL_OUT_DARES,
}
