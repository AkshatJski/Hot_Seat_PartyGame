import type { CallOutDare, Dare, Intensity, Question, VibePack } from '../../types'

/**
 * FRIENDS - the middle shelf.
 *
 * Tone: roasty, a bit too honest, and safe to play with your own friends without
 * anyone leaving the room. Alcohol and dating are fair game; hard profanity and
 * anything explicit are not.
 *
 * HARD RULES (enforced by `npm run lint:content`):
 *   - no hard profanity, nothing explicit
 *   - nothing about anyone's body, health or money
 *
 * CRAFT RULES (enforced by the mix gate, see `scripts/content-shapes.ts`):
 *   - this shelf was once two thirds "pick a person". The cap is now a quarter,
 *     and every nominate card carries a second clause so the answer is a story
 *     rather than a name.
 *   - six answer shapes: nominate / rank / story / perform / predict / choose.
 *   - tier 3 exists here. It means "honest, uncomfortable, still safe".
 */

let seq = 0
const q = (text: string, intensity: Intensity = 1): Question => ({
  id: `frn-q${++seq}`,
  text,
  intensity,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `frn-d${++dseq}`,
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 2): CallOutDare => ({
  id: `frn-c${++cseq}`,
  text,
  intensity,
  callOut: true,
})

const QUESTIONS: Question[] = [
  // ---- group chat and social media -----------------------------------------
  q('Who here is the worst at replying and then claims the chat never messaged?'),
  q('Point at whoever scrolls through a whole conversation and pretends to listen, then catch them at it.'),
  q('What is the last thing you typed and then deleted, and why?', 2),
  q('Describe the most embarrassing photo of you that is still saved on someone else\'s phone.', 2),
  q('Who here has the most incriminating search history, and which category is worst?', 2),
  q('What would your group chat reveal about you if it leaked tonight?', 3),
  q('Say the caption you would never post.', 2),
  q('What is the worst thing you have sent to the wrong person?', 2),
  q('If the room read your last five messages, what would they think you do all day?', 2),

  // ---- college and hostel ---------------------------------------------------
  q('Describe the mess left in a shared kitchen that nobody would admit to, including what was growing in it.', 2),
  q('Rank everyone here by how well they would handle a shared bathroom.', 2),
  q('Point at the person who copied homework and never got caught, then name the subject.', 2),
  q('Who here would be the worst group-project partner, and what would they contribute?', 2),
  q('Tell us about a presentation that went wrong in front of everyone.', 2),
  q('If you had to redo one year of college, which year and why?', 2),
  q('Describe the worst roommate, and the one habit that broke you.', 2),

  // ---- office ---------------------------------------------------------------
  q('Describe the worst office lunch thief you have encountered.', 2),
  q('Point at the person who would befriend the boss within a week, and name the first thing they would say.', 2),
  q('What is the most dramatic thing you have ever seen happen in a workplace, from start to finish?', 3),
  q('Who here has quit a job in the most dramatic way, and what was the line?', 3),
  q('What would you do if your boss read this whole chat?', 2),
  q('Tell us about the job you were least qualified for, how you got it and how long you lasted.', 2),
  q('Would you rather work from an office every day or never see these people again?', 3),

  // ---- dating and exes ------------------------------------------------------
  q('Who here is most likely to text an ex at 2 AM, and what is the excuse?', 3),
  q('Describe the worst first date you have heard about, including the moment it became unsalvageable.', 2),
  q('What is the pettiest reason you have stopped replying to someone?', 2),
  q('Point at the person who checks a crush\'s profile far too often, then name the last thing they liked.', 2),
  q('What is the most ridiculous lie you have told on a dating app?', 2),
  q('What would you do if your ex walked into this room right now and asked for five minutes?', 3),
  q('Tell us the last message you sent that you now regret.', 3),
  q('What is the biggest red flag you ignored?', 3),
  q('Would you rather date someone exactly like this group or never date again?', 3),
  q('Point at whoever would find out a partner\'s secret and post about it, then guess the caption.', 2),

  // ---- travel ---------------------------------------------------------------
  q('What is the most chaotic thing that has happened to you at an airport?', 2),
  q('Rank everyone here by how well they would behave if the airline cancelled the flight at midnight.', 2),
  q('Point at the person who packs like they are moving house for a weekend, then name the weirdest item.'),
  q('What is the strangest thing you have seen a stranger do on a train?', 2),
  q('Describe a holiday romance or a holiday catastrophe, whichever is funnier.', 2),
  q('Tell us about the cheapest trip you have taken and how far you pushed it.', 2),

  // ---- food and nights out --------------------------------------------------
  q('What is the worst meal you have paid for and then defended?', 2),
  q('Describe the most chaotic group dinner you have had, including the moment the bill arrived.', 2),
  q('What is the strangest thing you have eaten on a dare?', 2),
  q('What is the biggest mess you have left after a night out?', 3),
  q('Describe a night that started fine and ended badly.', 2),
  q('What would you do if the bill came and one person had no way to pay?', 2),

  // ---- bad ideas ------------------------------------------------------------
  q('What is the most irresponsible decision you have made that turned out fine, and who covered for you?', 3),
  q('Describe the worst haircut decision you have made at short notice.', 2),
  q('Point at the person who will do the most for a good story, then name the last thing they did.', 2),
  q('Rank everyone here by how quickly they would join a bad idea.', 2),
  q('Who here would jump into a pool fully dressed first, and what would they shout on the way in?'),
  q('If this group made a heist film, who would drive the getaway car?', 2),
  q('Describe the worst thing you have done on a night that should have ended at least two hours earlier.', 3),
  q('Would you rather have your worst night posted publicly or your best night deleted?', 2),

  // ---- relatives ------------------------------------------------------------
  q('Who here has lied to a relative about work and kept the lie alive, and what is the fake job?', 2),

  // ---- the gym --------------------------------------------------------------
  q('What is the most elaborate excuse you have used to skip a workout?', 2),
  q('Who here talks about the gym most and goes least, and what is their usual excuse?', 2),
  q('Point at whoever would fake an injury to leave early, then demonstrate the limp.', 2),

  // ---- splitting the bill ---------------------------------------------------
  q('Who here is the hardest to split a bill with, and why?', 2),
  q('Describe the most creative excuse you have used to avoid paying.', 2),
  q('What is the longest you have stretched one purchase?', 2),
  q('If this group had to manage one shared budget for a month, who would panic first?', 2),
  q('Would you rather always pay for the group or never be invited again?', 2),
  q('Who here would haggle at a wedding, and how far would they get?', 2),

  // ---- lies and secrets -----------------------------------------------------
  q('What is the biggest lie you have told to get out of plans?', 2),
  q('Describe a secret you kept for someone else for so long that it started to feel like yours.', 3),
  q('Rank everyone here by how well they keep a secret.', 3),
  q('Describe the moment you realised a friend had lied to you.', 3),
  q('What would you do if you found out a friend\'s secret and it changed how the group sees them?', 3),
  q('What is the pettiest grudge you are still holding?', 3),
  q('Tell us about a time you were completely wrong and refused to admit it for weeks afterwards.', 3),
  q('Rank everyone here by how likely they are to snoop through a phone.', 3),
  q('Would you rather know every secret in this room or have yours told to everyone?', 3),

  // ---- fears and quirks -----------------------------------------------------
  q('What is the most irrational fear you have, and what set it off?', 2),
  q('Describe the strangest habit you have when nobody is watching, and when it started.', 2),
  q('What is the smallest thing that ruins your whole day?', 2),
  q('Who here cries at adverts, honestly, and which advert finally got them?', 2),
  q('Describe the weird thing you do before a big day.', 2),
  q('What would you do if your phone died and you had no charger for a day?'),
  q('Who here talks to themselves in the mirror, and what do they say?', 2),
  q('Rank everyone here by how dramatic they are when they are ill.', 2),

  // ---- performance and invention -------------------------------------------
  q('Invent a new rule for this group and explain who breaks it first.', 2),
  q('Give everyone here a one-word reputation and defend each choice.', 2),
  q('Invent a slogan for this group and deliver it like a politician.', 2),

  // ---- ranks ----------------------------------------------------------------
  q('Rank the friends here by how quickly they would betray the group for a free trip.', 3),

  // ---- predictions ----------------------------------------------------------
  q('If this group started a business tomorrow, what would go wrong first?', 3),
  q('What would happen if this group lived together for a month?', 3),
  q('If everyone here had to swap lives for a day, whose day would you take?', 3),

  // ---- either or ------------------------------------------------------------
  q('Would you rather have your search history read aloud or your camera roll projected?', 2),
  q('Would you rather always tell the truth or never be believed?', 2),
  q('Would you rather be the funniest or the most trusted person here?', 2),
  q('Would you rather relive your worst day once or skip your best day forever?', 2),
  q('Would you rather know what people say about you or never find out?', 2),

  // ---- closing, honest ------------------------------------------------------
  q('What is the nicest thing anyone in this room has done for you that you never properly thanked them for?', 3),
  q('Who here would you trust with your phone unlocked for an hour, and why?', 3),
  q('What do you pretend not to care about, but absolutely do?', 3),
  q('Who here has changed the most since you met them, and how?', 3),
  q('What would you change about this group if nobody got upset?', 3),
  q('Who here do you call first when good news lands, and why them?', 3),
  q('What is the best decision you have made since meeting these people?', 3),
  // ---- the parts nobody says out loud ----
  q('What is the last thing you said about someone here when they left the room?', 3),
  q('Who here keeps score in friendships, and what is on the list?', 3),
  q('What is the one favour people ask you for because they know you will not refuse?', 2),
  q('Who here has quietly stopped being friends with someone in this room, and what ended it?', 3),
  q('What is the pettiest excuse you have used to get out of planning?', 1),
  q('Who would take credit for a group idea, and what would they say in the meeting?', 2),
  q('Rank the room by who would show up at 3 AM, then by who would say they were asleep.', 3),
  q('What is the most expensive thing a friend has cost you that you never mentioned?', 2),
  q('Who here would read this group chat to an outsider, and which message would they pick?', 3),
  q('What would you never say to someone here, even if they asked you straight?', 3),
  // ---- warm-ups: the first ten minutes of the night ----
  q('Rank the group by reply speed.', 1),
  q('Rank the group by who is always late.', 1),
  q('Pick one: group holiday or group dinner.', 1),
  q('Would you rather split the bill evenly or never eat out again?', 1),
  q('Would you rather share a room or share a secret?', 1),
  q('What would this group do with a free weekend?', 1),
  q('If this group started a business, what would it sell?', 1),
  q('If you had to swap phones for an hour, whose?', 1),
  q('What happens if nobody plans the next meetup?', 1),
  q('Name the worst group chat offender.', 1),
  q('Say the phrase this group overuses.', 1),
  q('List three things in your bag right now.', 1),
  q('Guess who here has the most unread messages.', 1),
  q('Rank these: brunch, birthday, wedding, funeral.', 1),
  q('Pick the person most likely to be famous.', 1),
  q('Pick the person most likely to disappear for a year.', 1),
  q('Would you rather always be early or always be late?', 1),
  q('What would this group place a bet on?', 1),
  q('Who here would you swap seats with, and why?', 1),
  q('Pick one person to plan your birthday.', 1),
]

const DARES: Dare[] = [
  d('Send the person to your left a compliment you would never say out loud.'),
  d('Let the group choose a new nickname for you until the game ends.'),
  d('Read your last five messages out loud in a monotone.'),
  d('Do your best impression of the person who just dared you.'),
  d('Text the third person in your recent chats a single full stop.'),
  d('Show the group the last photo you saved.'),
  d('Call a friend and ask what they had for lunch, then hang up.'),
  d('Explain your last argument to the group as if it were a court case.', 2),
  d('Say one true thing about everyone here, one sentence each.', 2),
  d('Rank the people here by their fashion, out loud, with reasons.', 2),
  d('Let the person to your right type one word into your search bar.', 3),
  d('Text your most recent contact and ask them to describe you in three words.', 2),
  d('Put your phone on the table, face down, for the rest of the game.', 2),
  d('Show the group the worst photo you have of yourself.', 2),
  d('Say the most embarrassing thing you have searched this month.', 3),
  d('Let the room post one emoji as your status for an hour.', 3),
  d('Give the person to your left a compliment that sounds like an insult.'),
  d('Let the room choose your next profile picture from your gallery.', 3),
  d('Text someone that you need to talk, then put the phone down for a round.', 3),
  d('Do a stand-up set of two jokes, no notes.'),
  d('Say the last thing you cried about, in a funny voice.', 3),
  d('Say what you would never want your boss to know.', 3),
  d('Rank the group by who would survive a zombie film first.'),
  d('Order the group into a group hug and enforce it.'),
  d('Pretend to be an auctioneer selling the person opposite.', 2),
  d('Say one sentence that would end any argument with you.'),
  d('Read the last five words of your last five messages.'),
  d('Say the most overused phrase in your vocabulary, five times.'),
  d('Do a thirty-second workout the group must copy.'),
  d('Trade one accessory with the person opposite for two rounds.'),
  d('Read the last message you sent and let the room rate your personality from it.', 3),
  d('Read out the most unhinged thing in your camera roll.', 3),
  d('Do an impression of someone in this room and let the room guess.', 2),
  d('Say the last thing you said out loud before this game, in a dramatic voice.', 3),
  d('Sing the chorus of the song you would never admit you know.', 3),
  d('Read your most recent notification aloud and defend yourself.', 3),
  d('Mime your whole morning routine.', 2),
  d('Spell your name like you are furious.', 2),
  d('Give the room a weather forecast.', 2),
  d('Hum the song you never admit knowing.', 1),
  d('Recite the alphabet as a breakup speech.', 3),
  d('Narrate your week as a sports highlight reel.', 3),
  d('Perform a five-second review of your neighbour.', 2),
  d('Draw the person opposite, fifteen seconds only.', 2),
  d('Impersonate a teacher or boss everyone here remembers.', 2),
  d('Announce this group\'s next holiday.', 2),
  d('Perform a thirty-second talk on your worst habit.', 3),
  // ---- dares that cost something ----
  d('Text the person you have known longest and tell them the first thing you ever thought of them.', 2),
  d('Call the last person you argued with and apologise for the part you were actually wrong about.', 3),
  d('Say one true thing about every person here, and let them guess which one hurt.', 3),
  d('Show the room the last thing you screenshotted about one of them, and explain it.', 3),
  d('Tell the person to your right what the group says about them when they are not here.', 3),
  d('Name the person here you would swap lives with and the one you would not. Both out loud.', 3),
  d('Tell the room the last thing you lied about in this group.', 3),
  d('Give the person opposite a compliment that costs you pride to say.', 2),
  d('Pick the person here who would be your emergency contact and explain why.', 2),
  d('Admit the last time you were relieved that someone else failed.', 3),
  d('Read out the message you deleted in the last day and explain why.', 2),
  d('Say the thing this group would be better off knowing about you, and do not soften the delivery.', 3),
]

const CALL_OUT_DARES: CallOutDare[] = [
  c('Use the voice of your last boss for this answer.'),
  c('Give the room a title for your answer before you start.'),
  c('Keep eye contact with the person opposite throughout your answer.'),
  c('Stand up and deliver your answer like a press conference.'),
  c('Say one word first, then explain for thirty seconds.'),
  c('Whisper your answer to your left, and let them repeat it.'),
  c('Sound already annoyed before you begin.'),
  c('Pause dramatically in the middle of your answer.'),
  c('Speak about yourself in the third person throughout.'),
  c('Hold a spoon from the table while you answer.'),
  c('Answer in the accent of the person who called you out.'),
  c('Give two answers and refuse to say which is true.'),
  c('Wait for a ten-second countdown from the room first.'),
  c('Read your answer as if it is scripted.'),
  c('Keep a straight face while the room heckles you.'),
  c('Rhyme your answer or take the dare instead.'),
  c('Pretend to be on a phone call while you answer.'),
  c('Rate your own answer out of ten at the end.'),
  c('Describe the moment rather than explaining it.'),
  c('Close your eyes and keep your hands still while you answer.'),
  c('Answer like a sports commentator.'),
  c('Let the person on your right act out your answer.', 2),
  c('Include one detail you have never told anyone.', 3),
  c('Answer as if the whole group already knew.'),
  c('Use the past tense, whatever the question asks.'),
  c('Stand on a chair, if one is nearby, for this answer.'),
  c('Ask a question first, then give the real answer.'),
  c('Whisper the answer and then deny you spoke.'),
  c('Answer as if there is a time limit you just missed.'),
  c('Justify your answer with a film reference.'),
  c('Back away slowly while you answer.'),
  c('Use a fake accent of your choice.'),
  c('Give evidence as if you are in court.'),
  c('Compliment the person who called you out first.'),
  c('Use exactly three sentences, no more.'),
  c('Answer while everyone hums a tune.'),
  c('Confess your answer like you are in a church.'),
  c('Name everyone in the room before you answer.'),
  c('Answer in the style of a weather forecast.'),
  c('Sigh dramatically before and after your answer.'),
]

export const FRIENDS: VibePack = {
  questions: QUESTIONS,
  dares: DARES,
  callouts: CALL_OUT_DARES,
}
