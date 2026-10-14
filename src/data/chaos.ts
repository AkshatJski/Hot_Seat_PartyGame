import type { CallOutDare, Dare, Intensity, Question } from '../types'

/**
 * CHAOS — absurdist comedy, pointed at the people in the room.
 *
 * The lighter, funnier sibling of Unhinged. Where Unhinged is internet-gremlin
 * "cursed energy", Chaos is built around this group: what they would do on an
 * island, who gets voted off first, which of them starts a cult. `sensitive` is
 * false and dares stay tame per the content policy.
 */

let seq = 0
const q = (text: string, intensity: Intensity = 1): Question => ({
  id: `cha-q${++seq}`,
  deck: 'chaos',
  text,
  intensity,
  sensitive: false,
})

let dseq = 0
const d = (text: string, intensity: Intensity = 1): Dare => ({
  id: `cha-d${++dseq}`,
  deck: 'chaos',
  text,
  intensity,
})

let cseq = 0
const c = (text: string, intensity: Intensity = 1): CallOutDare => ({
  id: `cha-c${++cseq}`,
  deck: 'chaos',
  text,
  intensity,
  callOut: true,
})

export const chaosQuestions: Question[] = [
  // ---- This group, reimagined -------------------------------------------------
  q('If your personality was a smell, what would it be?'),
  q('If this group had to fight a bus-sized goose, what is your exact role in the plan?'),
  q('What would your villain origin story be, and who in this room triggered it?'),
  q('Describe the worst possible theme park ride based on someone here.'),
  q('If your life had a laugh track, when would it play the loudest?'),
  q('What is the most useless superpower you would still abuse every single day?'),
  q('If this room was a sitcom, who gets written out first, and why?'),
  q('What is the worst possible slogan for this friend group?'),
  q('If your inner monologue had a theme song, what plays when you make a bad decision?'),
  q('What would your warning label say if you were sold in a shop?'),
  q('If you could only speak in movie quotes for a week, what is your default line?'),
  q('Which cartoon villain quietly runs this group chat, and why is it you?'),
  q('If everyone here was a racing game character, who gets blue-shelled first?'),
  q('Describe your last bad decision as a nature documentary.'),
  q('What would this group be called if we were a band, and what genre?'),
  q('If you had to be haunted by one person here forever, who, and how do they haunt you?'),
  q('If your life was a bad infomercial, what is it selling?'),
  q('What would this group chat look like as an ancient cave painting?'),
  q('Which of us gets voted off a reality show first, and why is it the nicest one?'),
  q('If you were a houseplant, who here would forget to water you?'),
  q('Describe the plot of a horror movie set entirely in this room.'),
  q('What is your strategy for surviving a room full of clones of yourself?'),
  q('If this group was stranded on an island, what useless skill of yours saves the day?'),
  q('What would your autobiography be titled, and who writes the foreword?'),
  q('What single ingredient would you feed this whole group forever?'),
  q('If everyone here got a nickname based on their worst habit, which one would stick?'),
  q('What would this group be arrested for collectively?'),
  q('What is the most absurd excuse you would use to leave this game right now?'),
  q('If this room was a board game, what is the rule everyone breaks?'),
  q('What would your last words be if you knew everyone here was listening?'),
  q('If this group had a secret conspiracy, what would it be plotting?'),
  q('What bad advice would you happily give someone here just to watch what happens?'),
  q('What is the most cursed sandwich you would make for someone here?'),
  q('What is the pettiest supervillain plan you would actually carry out?'),
  q('If this group was a party in a role-playing game, who gets us all killed first?'),
  q('Which one of us would accidentally start a cult, and which of us joins first?'),
  q('What is the most chaotic thing you would happily do if this room never found out?'),
  q('If you could demand one favour from anyone here, what would you claim?'),
  q('What would your personal haunting sound like at 3am?'),
  q('If this room had a national anthem, what would the first line be?'),
  q('What is the most dramatic way you could exit a group chat?'),
  q('If your phone could talk for one minute, what is it revealing first?'),
  q('What is the single worst thing to say in this room right now?'),
  q('If you were a ghost haunting this party, what would you rearrange first?'),
  q('What is the most chaotic thing you would do with one free wish and total immunity?'),
  q('Describe this group as a mismatched superhero team and its fatal flaw.'),
  q('If you had to swap one body part with someone here permanently, what and why?'),
  q('If you had to fight your own reflection in front of this group, who wins?'),
  q('What is the most absurd reason you would cancel on this group?'),
  q('If this group started a religion, who becomes its unwilling prophet?'),
  q('What is the worst possible thing this phone could reveal to the room right now?'),
  q('If you had to be reincarnated as one object in this room, what is your villain arc?'),
  q('What is the silliest way this whole night could end?'),
  q('If you had to choose a scapegoat in this room, who volunteers first?'),
]

export const chaosDares: Dare[] = [
  d('Do your best impression of the person to your right.'),
  d('Speak like a news anchor reporting on this party until your next turn.'),
  d('Invent a useless country, and its national anthem, in ten seconds.'),
  d('Give everyone here a silly nickname based on their vibe.'),
  d('Describe the person opposite you as a movie villain.'),
  d('Do your worst evil laugh and hold it for five seconds.'),
  d('Give a dramatic reading of the last thing on your phone.'),
  d('Pretend to be a weather presenter describing this room.'),
  d('Say your own name as if it is a threat.'),
  d('Pitch an infomercial for the object nearest to you.'),
  d('Do your best robot impression until the next card.'),
  d('Describe the last meal you ate as a crime scene.'),
  d('Ask the group three questions in a character of their choosing.'),
  d('Announce your next birthday like a wrestling entrance.'),
  d('Give a short talk on why your worst habit is actually good.'),
  d('Speak only in questions until someone laughs.'),
  d('Describe your week as a movie trailer.'),
  d('Sing the last thing you said.'),
  d('Do a dramatic reading of a random text from this group.'),
  d('Invent a new handshake and teach it to the person to your left.'),
]

export const chaosCallOuts: CallOutDare[] = [
  c('Do an impression of everyone here in ten seconds.'),
  c('Let the group assign you a character and stay in it for one minute.'),
  c('Narrate everything you do for the rest of your turn.'),
  c('Say your most-used phrase in a cursed accent.'),
  c('Perform the world worst national anthem for your own country.'),
  c('Deliver a villain monologue about leaving this party.'),
  c('Answer everything for one minute in the third person.'),
  c('Let the group name you, and it sticks for the rest of the game.'),
  c('Give an acceptance speech for an award nobody gave you.'),
  c('Say the alphabet backwards, dramatically.'),
  c('Do your worst evil laugh until someone here joins in.'),
  c('Describe this game as a nature documentary.'),
]
