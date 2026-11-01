import type { CallOutDare, Dare, Intensity, Question, VibePack } from '../../types'

/**
 * BOYS - the top shelf. 18+.
 *
 * Tone: crude, profane, unhinged. Bro culture at 2 AM: betrayal, lies, failed
 * romance, questionable hygiene, and the kind of confession you only make with
 * four people who already know. This is the pool with no guardrails.
 *
 * What "no guardrails" still does NOT mean - and this line is deliberate, not
 * squeamishness:
 *   - no slurs, no racism, no casteism, no targeting anyone's religion
 *   - no sexual content about anyone who is not in the room and consenting
 *   - no jokes about assault, self-harm, or anybody's body
 *   - nothing that involves a minor in a sexual way, ever
 *   - no dare that would get someone arrested, hurt, or fired
 *
 * Everything else is fair game, including swearing, drinking, exes, and the
 * specific shame of being the guy who cried at a movie.
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
  q('Which of us is most likely to get catfished by someone pretending to be an actor?', 2),
  q('Point at the bro with absolutely zero game who swears he has plenty.', 2),
  q('What is the most pathetic excuse you have used to cancel plans you never intended to attend?'),
  q('Who here would sell out this entire group for one free ticket?', 2),
  q('What is the dumbest thing you have done after midnight that you still defend?', 2),
  q('Which of us has the most unhinged search history right now, honestly?', 2),
  q('Describe the worst hangover you have ever had, and where you woke up.', 3),
  q('Who here would cry if their favourite cricketer retired, and why him?'),
  q('What is the biggest lie you have told a date to seem interesting?', 2),
  q('Which of us would sleep through their own wedding?', 2),
  q('Who here has ghosted someone and then blamed the network?', 2),
  q('What is the most embarrassing thing you have done to impress someone?', 2),
  q('Point at the guy who would lose a fight to his own reflection.'),
  q('Which of us has cried in the shower this year, and why exactly?', 3),
  q('What is the worst thing you have said in a group chat and then deleted?', 2),
  q('Who here would cheat at Monopoly and defend it as strategy?'),
  q('Describe the most disgusting thing you have eaten on a dare.', 2),
  q('Which of us has the worst morning breath in this room right now?', 2),
  q('What is the most embarrassing thing your mother has said in front of your friends?', 2),
  q('Point at whoever would get arrested first for a genuinely stupid crime.', 2),
  q('Who here has pretended to be a gym regular for over a year now?'),
  q('What is the biggest L you have taken in front of a crowd?', 2),
  q('Which of us would last the shortest time in a real fight?', 2),
  q('What is the most unhinged thing you have done for a crush?', 3),
  q('Point at the guy who would betray the group for one pretty face.', 2),
  q('Who here talks the biggest game and delivers absolutely nothing?', 2),
  q('Describe your most regrettable haircut or beard phase.'),
  q('Which of us is one bad day away from a full public breakdown?', 2),
  q('What is the worst dating advice you have ever given a friend?'),
  q('Point at whoever has never won an argument with their mother.'),
  q('Who here has a secret talent that would ruin their reputation?', 2),
  q('What is the most embarrassing song on your playlist right now?'),
  q('Which of us has the worst taste in partners, and what is the pattern?', 2),
  q('What is the dumbest injury you have got while showing off?'),
  q('Point at the guy most likely to marry someone this group cannot stand.', 2),
  q('Who here has lied about their age to get into a club or a movie?', 2),
  q('Describe the worst date you have ever been on.', 2),
  q('Which of us would lose the entire group over one bad opinion?', 2),
  q('What is the most shameless thing you have done to dodge a bill?', 2),
  q('Point at whoever has the most useless talent at this table.'),
  q('Who here would actually survive a week in the wild, honestly?'),
  q('What is the biggest 3 AM confession you have ever made to a group chat?', 3),
  q('Which of us talks the loudest and knows the least?', 2),
  q('Name the most disgusting object living in your room right now.', 2),
  q('Point at the guy who has been in a situationship for over a year.'),
  q('Who here has faked being sick to escape a family function?'),
  q('Describe the most chaotic thing you have ever done at a wedding.', 2),
  q('Which of us would be the worst wingman, and why?'),
  q('What is the most embarrassing thing you have done while drunk?', 3),
  q('Point at whoever would panic hardest if their phone unlocked in public.', 2),
  q('Who here has never finished a book they claimed to have read?'),
  q('What is the most pathetic thing you have done to get someone’s attention?', 2),
  q('Which of us has the worst secret, and how bad is it really?', 3),
  q('Describe the worst thing that has happened to you in a gym changing room.', 2),
  q('Point at the guy who peaked in school and knows it.', 2),
  q('Who here would eat a raw chilli for a dare, and where is the line?'),
  q('Tell us the most disrespectful thing you have done at somebody’s house party.', 2),
  q('Which of us is the biggest hypocrite in this room?', 2),
  q('What is the dumbest reason you have ever started a fight?'),
  q('Point at whoever would lie on a job application without blinking.', 2),
  q('Who here has the most embarrassing tabs open right now?', 2),
  q('What is the worst thing you have done to a friend and never admitted?', 3),
  q('Which of us would sell photos from tonight for a small amount?', 2),
  q('Describe the most unhinged thing you have done to avoid a conversation.'),
  q('Point at the guy who cannot take a joke about himself.'),
  q('Who here has faked gratitude for a gift they hated?'),
  q('What is the most embarrassing thing you have ever done in a public toilet?', 2),
  q('Which of us has the worst luck with timing, and what moment did that ruin?'),
  q('What is the biggest secret you are keeping from your parents right now?', 3),
  q('Point at whoever would snitch under the slightest pressure.', 2),
  q('Who here has cried during a movie and denied it instantly?'),
  q('Describe your worst wardrobe disaster.'),
  q('Which of us would win a fight against the rest of us combined?', 2),
  q('Describe the most unhinged rule you have made for yourself.', 2),
  q('Point at the guy who is secretly the most emotional in this room.', 2),
  q('Who here would end up on a reality show, and what would the edit do to them?'),
  q('What is the worst thing you have done for a free meal?'),
  q('Which of us has the most disturbing childhood memory they now laugh about?', 3),
  q('Describe the most awkward thing that has happened to you in a group photo.'),
  q('Point at whoever is most likely to brag about peaking in their forties.'),
  q('Who here would drop a friend for a promotion without hesitating?', 2),
  q('What is the one habit of yours that would horrify your mother?', 2),
  q('Rank everyone here from most to least likely to survive a week without their mother.'),
  q('Admit the last thing you lied about to somebody in this room.', 2),
  q('Who here would still text their ex at 2 AM and call it closure?', 3),
  q('Which of us is the worst kisser, and how do the rest of us know?', 3),
  q('Who here has dated someone this group secretly hated?', 2),
  q('What is the most desperate thing you have done at 2 AM?', 3),
]

const DARES: Dare[] = [
  d('Read the last five things you searched out loud, in order.', 2),
  d('Let the group pick your next dating-app bio line and save it.', 3),
  d('Text "you up?" to the third person in your recent chats and read the reply out loud.', 3),
  d('Do twenty push-ups or take a Coward point and explain why out loud.', 2),
  d('Show the group the last photo in your camera roll you would never post.', 2),
  d('Call the second person in your call log and sing eight seconds of a song.', 2),
  d('Speak only in swear words and hand gestures until your next turn.'),
  d('Let the group write one message to anyone in your contacts.', 3),
  d('Do your best impression of a drunk uncle at a wedding for thirty seconds.', 2),
  d('Let the group choose your profile picture for the next hour.'),
  d('Say the name of the person you would least like to see right now, out loud.', 2),
  d('Do a lap of the room on all fours, barking.', 3),
  d('Let the person to your left whisper a rumour about you and confirm or deny it.', 2),
  d('Sing the chorus of the most embarrassing song on your playlist.', 2),
  d('Try a one-handed push-up for fifteen seconds, then admit the result out loud.'),
  d('Show the group the last meme you saved and explain why it is funny.'),
  d('Sniff the person to your right and describe them like a wine critic.', 2),
  d('Give a two-minute talk about your worst decision this year.'),
  d('Read your last sent message in a romantic movie voice.'),
  d('Let the group rate your laugh out of ten, then keep laughing for ten seconds.'),
  d('Moan like a Bollywood villain dying dramatically for ten seconds.', 2),
  d('Say the most embarrassing thing you have ever done in one single sentence.', 2),
  d('Let the person to your left set your phone wallpaper for an hour.', 2),
  d('Speak in whatever accent the group picks until your next turn.'),
  d('Tell the group the last lie you told your mother.', 2),
  d('Do a plank for one minute or until you curse out loud.', 2),
  d('Let the group ask you one question you must answer completely honestly.', 3),
  d('Act out how you behave when you are trying to impress someone.', 2),
  d('Show the group the most recent screenshot in your phone.', 2),
  d('Ring someone in this room and have a ten-second conversation as if they are your boss.'),
  d('Let the person to your right give you a new name for the rest of the game.'),
  d('Do your best impression of the person to your left until they get annoyed.', 2),
  d('Say the alphabet backwards while doing a wall sit.', 2),
  d('Read out the last three messages you sent in this group chat.', 2),
  d('Give a sincere compliment to the person you like the least in this room.', 2),
  d('Let the group look at one folder in your camera roll, your choice.', 3),
  d('Dance aggressively to one chorus of a song the group picks.'),
  d('Hold a stare with the person opposite you until someone blinks.'),
  d('Describe your worst fart story in the most cinematic way possible.', 3),
  d('Let the group post one comment on the last reel you shared.', 3),
  d('Do your best impression of a cricket commentator during a last-over thriller.'),
  d('Tell the group the last time you cried and which excuse you used.', 3),
  d('Text a random emoji to your most recent ex-contact and read the reply.', 3),
  d('Stand on one leg and name the first five people you ever kissed.', 3),
  d('Let the group pick a word you must insert into every sentence for two rounds.', 2),
  d('Deliver your worst dad joke and hold eye contact for ten seconds after.'),
  d('Explain cricket to someone from another planet for twenty seconds.'),
  d('Say three things you genuinely like about the person to your left, fast.'),
]

const CALL_OUT_DARES: CallOutDare[] = [
  c('Read out your last five search results to the group, no skipping.', 3),
  c('Let the group read your most recent ten messages in any one chat.', 3),
  c('Do fifteen push-ups before your next turn, or lose the point.', 2),
  c('Speak only in a formal British accent for three rounds.', 2),
  c('Let the group choose a photo from your camera roll and post it as your story.', 3),
  c('Give a five-minute, completely honest review of everyone in this room.', 3),
  c('No phone for the next three rounds.'),
  c('Sit on the floor and call the group "sir" for two rounds.', 2),
  c('Tell the group the most embarrassing thing you have ever been told about yourself.', 2),
  c('Do your next three turns standing at attention.'),
  c('Let the group ask three questions and answer all of them honestly.', 3),
  c('Repeat everything the person to your right says, in a mocking voice, for two rounds.', 2),
  c('Read the last screenshot in your phone out loud, sender’s name included.', 3),
  c('Give a one-minute monologue about why you deserve the Call Out.'),
  c('Do a slow dramatic catwalk around the room while the group rates it.'),
  c('Let the group pick your next profile photo from your camera roll.', 2),
  c('Say "I deserved that" before every sentence for two rounds.', 2),
  c('Call a friend and explain in detail that you were just called out in a party game.', 2),
  c('Do ten squats while listing everyone you have ever ghosted.', 3),
  c('Hold the hand of the person who called you out for one full round.', 2),
  c('Read the last note you typed, or the last thing you wrote, out loud.'),
  c('Imitate the laugh of the person to your left until they ask you to stop.'),
]

export const BOYS: VibePack = {
  questions: QUESTIONS,
  dares: DARES,
  callouts: CALL_OUT_DARES,
}
