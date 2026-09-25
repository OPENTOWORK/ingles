/**
 * Writes any missing Training path level as 47 builder items (45 types + both translations).
 * Also fills empty B2 basic type files and appends translations to B2 files that only have 45.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/generate-training-path-levels.mjs
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { TRAINING_PATH_SECTIONS, trainingPathSlug } from '../src/data/trainingPaths/curricula.js';

const ROOT = process.cwd();
function importBlock(from) {
  return `import {
  antonym,
  britishAmerican,
  certainty,
  classify,
  collocation,
  combine,
  conditional,
  defineWord,
  dialogue,
  dictation,
  errorCorrection,
  gappedText,
  heading,
  imageChoice,
  keyWord,
  linker,
  listenChoice,
  listenGap,
  listenIntention,
  listenTrueFalse,
  match,
  mcCloze,
  mcq,
  multiSelect,
  multipleMatching,
  oddOneOut,
  oddSound,
  openCloze,
  paraphrase,
  passive,
  phrasal,
  polarity,
  preposition,
  register,
  reported,
  response,
  sequence,
  situation,
  situationRewrite,
  spotError,
  stress,
  synonym,
  textGaps,
  translateToEnglish,
  translateToSpanish,
  wordFormation,
  wordToDefinition,
} from '${from}';
`;
}

const B2_BASIC_TOPICS = [
  'Present simple',
  'Present continuous gaps',
  'Past simple drills',
  'Past continuous practice',
  'Future forms comparison',
  'Present perfect completion',
  'Tense transformation',
  'Timeline grammar',
  'Zero conditional',
  'First conditional',
  'If/unless exercises',
  'Obligation modals',
  'Advice modals',
  'Permission modals',
  'Modal gap fills',
  'Passive transformation',
  'Active-passive switch',
  'Reported statements',
  'Comparatives/superlatives',
  'Articles practice',
  'Quantifiers',
  'Prepositions',
  'Linkers/connectors',
  'Sentence combining',
  'Informal grammar rewriting',
];

const PEOPLE = ['Anna', 'Omar', 'Lucia', 'James', 'Mei', 'Pablo', 'Sarah', 'Leo', 'Nora', 'Hugo'];
const PLACES = ['Manchester', 'Oxford', 'Leeds', 'Bristol', 'Edinburgh', 'Cardiff', 'York', 'Brighton', 'Bath', 'Glasgow'];
const NOUNS = ['report', 'meeting', 'proposal', 'ticket', 'project', 'lesson', 'contract', 'review', 'survey', 'essay'];
const WORD_FAMILIES = [
  ['SUCCESS', 'successful'],
  ['DECIDE', 'decision'],
  ['EMPLOY', 'employee'],
  ['CARE', 'careful'],
  ['POSSIBLE', 'possibility'],
  ['STRONG', 'strength'],
  ['WIDE', 'widely'],
  ['FAME', 'famous'],
  ['HELP', 'helpful'],
  ['KIND', 'kindness'],
];
const PHRASALS = [
  ['look {1} the word', 'up', 'look the word up'],
  ['give {1} sugar', 'up', 'stop using sugar'],
  ['put {1} the meeting', 'off', 'postpone the meeting'],
  ['find {1} the answer', 'out', 'discover the answer'],
  ['take {1} at seven', 'off', 'leave the ground'],
  ['carry {1} working', 'on', 'continue working'],
  ['turn {1} the offer', 'down', 'refuse the offer'],
  ['set {1} at dawn', 'off', 'start the journey'],
];
const COLLOCATIONS = [
  ['make', 'a decision'],
  ['take', 'a break'],
  ['do', 'research'],
  ['have', 'a look'],
  ['pay', 'attention'],
  ['keep', 'a promise'],
  ['raise', 'an issue'],
  ['draw', 'a conclusion'],
];
const STRESS = [
  ['teacher', ['tea', 'cher'], 0],
  ['computer', ['com', 'pu', 'ter'], 1],
  ['important', ['im', 'por', 'tant'], 1],
  ['information', ['in', 'for', 'ma', 'tion'], 2],
  ['remember', ['re', 'mem', 'ber'], 1],
  ['yesterday', ['yes', 'ter', 'day'], 0],
  ['together', ['to', 'geth', 'er'], 1],
  ['beautiful', ['beau', 'ti', 'ful'], 0],
];
const UK_US = [
  ['lift', 'elevator'],
  ['flat', 'apartment'],
  ['lorry', 'truck'],
  ['holiday', 'vacation'],
  ['autumn', 'fall'],
  ['biscuit', 'cookie'],
  ['petrol', 'gas'],
  ['queue', 'line'],
  ['trousers', 'pants'],
  ['rubbish', 'trash'],
];
const ODD_SOUNDS = [
  ['Which word has a different vowel?', ['c**a**t', 'h**a**t', 'm**a**n', 'c**ar**'], 'c**ar**'],
  ['Which ending sounds different?', ['watch**es**', 'wash**es**', 'teach**es**', 'love**s**'], 'love**s**'],
  ['Which word has a different first sound?', ['**th**ink', '**th**ank', '**th**in', '**t**in'], '**t**in'],
  ['Which word has a different vowel?', ['sh**ee**p', 'ch**ee**se', 'gr**ee**n', 'h**ea**d'], 'h**ea**d'],
];

function q(value) {
  return JSON.stringify(value);
}

function pick(list, n, offset = 0) {
  return list[(n + offset) % list.length];
}

function topicWord(topic) {
  const clean = String(topic).replace(/[/:]/g, ' ').trim();
  const words = clean.split(/\s+/).filter((word) => word.length > 2 && !/^(and|the|vs|or)$/i.test(word));
  return (words[words.length - 1] || clean).toLowerCase();
}

function titleish(topic) {
  return String(topic).replace(/[/]/g, ' / ');
}

function idOf(prefix, index) {
  return `${prefix}-t${String(index).padStart(2, '0')}`;
}

function why(topic, detail) {
  return `${detail} This item practises ${titleish(topic)}.`;
}

function buildItems(prefix, topic, image, n) {
  const person = pick(PEOPLE, n);
  const other = pick(PEOPLE, n, 3);
  const place = pick(PLACES, n);
  const noun = pick(NOUNS, n);
  const family = pick(WORD_FAMILIES, n);
  const phrasal = pick(PHRASALS, n);
  const collocation = pick(COLLOCATIONS, n);
  const stress = pick(STRESS, n);
  const oddSound = pick(ODD_SOUNDS, n);
  const word = topicWord(topic);
  const focus = (name) => `${prefix.replace(/-/g, '_')}_${name}`;
  const ukPairs = [0, 1, 2, 3].map((i) => pick(UK_US, n, i));

  const rows = [
    `  errorCorrection({
    id: ${q(idOf(prefix, 1))},
    focus: ${q(focus('err'))},
    sentence: ${q(`${person} need the ${noun} before Friday.`)},
    answer: ${q(`${person} needs the ${noun} before Friday.`)},
    accepted: [${q(`${person} needs the ${noun} by Friday.`)}, ${q(`${person} needs that ${noun} before Friday.`) }],
    why: ${q(why(topic, `After he, she or a name, a present-simple verb takes -s: “${person} needs”.`))},
    tag: 'subject_verb_agreement',
  })`,
    `  spotError({
    id: ${q(idOf(prefix, 2))},
    focus: ${q(focus('spot'))},
    chunks: [${q(`${person}`)}, ${q('have')}, ${q(`the ${noun}`)}, ${q(`in ${place}.`)}],
    wrong: 1,
    fix: 'has',
    why: ${q(why(topic, `The subject is singular, so the verb is “has”, not “have”.`))},
    tag: 'error_spotting',
  })`,
    `  mcq({
    id: ${q(idOf(prefix, 3))},
    focus: ${q(focus('mcq'))},
    question: ${q(`Which sentence is correct?`)},
    options: [
      ${q(`${person} works in ${place} every Tuesday.`)},
      ${q(`${person} work in ${place} every Tuesday.`)},
      ${q(`${person} working in ${place} every Tuesday.`)},
      ${q(`${person} is work in ${place} every Tuesday.`)},
    ],
    correct: ${q(`${person} works in ${place} every Tuesday.`)},
    why: ${q(why(topic, `A regular timetable takes the present simple: “works”.`))},
    tag: 'present_simple_choice',
  })`,
    `  multiSelect({
    id: ${q(idOf(prefix, 4))},
    focus: ${q(focus('multi'))},
    question: ${q(`Which sentences are grammatically correct?`)},
    options: [
      ${q(`${person} has already sent the ${noun}.`)},
      ${q(`${other} have never been to ${place}.`)},
      ${q(`${person} have already send the ${noun}.`)},
      ${q(`${other} has never went to ${place}.`)},
    ],
    correct: [
      ${q(`${person} has already sent the ${noun}.`)},
      ${q(`${other} have never been to ${place}.`)},
    ],
    why: ${q(why(topic, `The first two use a correct perfect form; the others mix the participle or the person.`))},
    tag: 'present_perfect_experience',
  })`,
    `  match({
    id: ${q(idOf(prefix, 5))},
    focus: ${q(focus('match'))},
    pairs: [
      [${q('make')}, ${q('a decision')}],
      [${q('take')}, ${q('a break')}],
      [${q('do')}, ${q('research')}],
      [${q('pay')}, ${q('attention')}],
    ],
    why: ${q(why(topic, `These are fixed verb–noun pairs. “Make a decision” and “do research” cannot swap verbs.`))},
    tag: 'collocations',
  })`,
    `  wordFormation({
    id: ${q(idOf(prefix, 6))},
    focus: ${q(focus('wf'))},
    sentence: ${q(`She is a very {1} colleague in ${place}.`)},
    base: ${q(family[0])},
    answers: ${q(family[1])},
    why: ${q(why(topic, `From ${family[0]} we form the adjective “${family[1]}”.`))},
    tag: 'word_formation',
  })`,
    `  keyWord({
    id: ${q(idOf(prefix, 7))},
    focus: ${q(focus('kw'))},
    first: ${q(`${person} started the job in 2019.`)},
    keyword: 'SINCE',
    second: ${q(`${person} {1} 2019.`)},
    answers: [${q('has worked here since')}, ${q('has been here since')}, ${q('has been working here since')}],
    why: ${q(why(topic, `A situation that began in the past and continues takes the present perfect + since.`))},
    tag: 'key_word_transformation',
  })`,
    `  paraphrase({
    id: ${q(idOf(prefix, 8))},
    focus: ${q(focus('para'))},
    sentence: ${q(`${person} is responsible for the ${noun}.`)},
    options: [
      ${q(`${person} is in charge of the ${noun}.`)},
      ${q(`${person} is afraid of the ${noun}.`)},
      ${q(`${person} has forgotten the ${noun}.`)},
      ${q(`${person} is late for the ${noun}.`)},
    ],
    correct: ${q(`${person} is in charge of the ${noun}.`)},
    why: ${q(why(topic, `“Be responsible for” and “be in charge of” mean the same here.`))},
    tag: 'paraphrase_meaning',
  })`,
    `  preposition({
    id: ${q(idOf(prefix, 9))},
    focus: ${q(focus('prep'))},
    sentence: ${q(`${person} arrived {1} ${place} on Monday.`)},
    answers: ['in', 'at'],
    why: ${q(why(topic, `We say “arrive in” a city. “At” is also accepted with a station or building.`))},
    tag: 'preposition_choice',
  })`,
    `  phrasal({
    id: ${q(idOf(prefix, 10))},
    focus: ${q(focus('phr'))},
    sentence: ${q(`I need to ${phrasal[0]} in the dictionary.`)},
    answers: ${q(phrasal[1])},
    why: ${q(why(topic, `The particle is “${phrasal[1]}”: ${phrasal[2]}.`))},
    tag: 'phrasal_verbs',
  })`,
    `  collocation({
    id: ${q(idOf(prefix, 11))},
    focus: ${q(focus('col'))},
    sentence: ${q(`We should {1} ${collocation[1]} before we continue.`)},
    answers: ${q(collocation[0])},
    why: ${q(why(topic, `The natural pair is “${collocation[0]} ${collocation[1]}”.`))},
    tag: 'collocations',
  })`,
    `  oddOneOut({
    id: ${q(idOf(prefix, 12))},
    focus: ${q(focus('odd'))},
    question: ${q('Which word does not belong with the others?')},
    options: ['Monday', 'Friday', 'August', 'Sunday'],
    correct: 'August',
    why: ${q(why(topic, `Monday, Friday and Sunday are days; August is a month.`))},
    tag: 'word_classes',
  })`,
    `  classify({
    id: ${q(idOf(prefix, 13))},
    focus: ${q(focus('class'))},
    categories: ['Days', 'Months'],
    words: [
      ['Monday', 0],
      ['Friday', 0],
      ['August', 1],
      ['December', 1],
    ],
    why: ${q(why(topic, `Days of the week go in one group; months go in the other.`))},
    tag: 'word_classes',
  })`,
    `  sequence({
    id: ${q(idOf(prefix, 14))},
    focus: ${q(focus('seq'))},
    passage: ${q(`${person} prepared the ${noun}, presented it in ${place}, and then emailed the notes.`)},
    events: [
      ${q(`${person} prepared the ${noun}.`)},
      ${q(`${person} presented the ${noun} in ${place}.`)},
      ${q(`${person} emailed the notes.`)},
    ],
    why: ${q(why(topic, `The order follows the story: prepare, present, then email.`))},
    tag: 'text_sequencing',
  })`,
    `  textGaps({
    id: ${q(idOf(prefix, 15))},
    focus: ${q(focus('tg'))},
    text: ${q(`${person} {1} in ${place} every week. Yesterday she {2} the ${noun} and {3} it to ${other}.`)},
    gaps: [
      { hint: 'work', answers: 'works' },
      { hint: 'finish', answers: 'finished' },
      { hint: 'send', answers: ['sent', 'has sent'] },
    ],
    why: ${q(why(topic, `A habit stays in the present simple; yesterday forces a past form.`))},
    tag: 'tense_sequence',
  })`,
    `  openCloze({
    id: ${q(idOf(prefix, 16))},
    focus: ${q(focus('oc'))},
    text: ${q(`${person} has lived in ${place} {1} 2019. She is responsible {2} the ${noun} and she always arrives {3} time.`)},
    answers: ['since', 'for', 'on'],
    why: ${q(why(topic, `“Since” marks the starting point; we are responsible for something; we arrive on time.`))},
    tag: 'text_cohesion',
  })`,
    `  mcCloze({
    id: ${q(idOf(prefix, 17))},
    focus: ${q(focus('mcc'))},
    text: ${q(`If ${person} {1} the train, she {2} late. She {3} leave home earlier tomorrow.`)},
    gaps: [
      { options: ['misses', 'missed', 'missing', 'miss'], correct: 'misses' },
      { options: ['will be', 'would be', 'was', 'has been'], correct: 'will be' },
      { options: ['should', 'should to', 'must to', 'can to'], correct: 'should' },
    ],
    why: ${q(why(topic, `A first conditional is if + present, will; “should” gives advice without “to”.`))},
    tag: 'first_conditional',
  })`,
    `  gappedText({
    id: ${q(idOf(prefix, 18))},
    focus: ${q(focus('gt'))},
    text: ${q(`${person} reached ${place} at nine. [1] The ${noun} was already on the table. [2]`)},
    sentences: [
      ${q(`She bought a coffee at the station.`)},
      ${q(`${other} had left a short note beside it.`)},
    ],
    extra: ${q(`The office will close next August.`)},
    why: ${q(why(topic, `The first missing line happens on the way; the second explains the note already on the table.`))},
    tag: 'reading_detail',
  })`,
    `  heading({
    id: ${q(idOf(prefix, 19))},
    focus: ${q(focus('head'))},
    text: ${q(`${person} moved to ${place} last year to study ${word}. She still finds the ${noun} hard, but she says the tutors are patient and the library is quiet.`)},
    options: [
      ${q(`A student settling into ${place}`)},
      ${q(`Why ${place} closed its library`)},
      ${q(`How to write a ${noun}`)},
      ${q(`${person} leaves university`)},
    ],
    correct: ${q(`A student settling into ${place}`)},
    why: ${q(why(topic, `The paragraph is about moving, studying and getting used to a new place, not about closing a library.`))},
    tag: 'reading_gist',
  })`,
    `  multipleMatching({
    id: ${q(idOf(prefix, 20))},
    focus: ${q(focus('mm'))},
    texts: [
      [${q(person)}, ${q(`${person} prefers working from ${place} because the ${noun} is quieter there.`) }],
      [${q(other)}, ${q(`${other} likes late meetings and never reads the ${noun} until Friday.`) }],
      ['Alex', ${q(`Alex checks every ${noun} twice and hates last-minute changes.`)}],
    ],
    questions: [
      [${q('Who wants a quiet place for the work?')}, 0],
      [${q('Who leaves the reading until the end of the week?')}, 1],
      [${q('Who is careful about small changes?')}, 2],
    ],
    why: ${q(why(topic, `Match each question to the person whose text actually says that.`))},
    tag: 'reading_detail',
  })`,
    `  synonym({
    id: ${q(idOf(prefix, 21))},
    focus: ${q(focus('syn'))},
    sentence: ${q(`${person} needs to **begin** the ${noun} today.`)},
    options: ['start', 'finish', 'cancel', 'hide'],
    correct: 'start',
    why: ${q(why(topic, `“Begin” and “start” mean the same here.`))},
    tag: 'synonyms_antonyms',
  })`,
    `  antonym({
    id: ${q(idOf(prefix, 22))},
    focus: ${q(focus('ant'))},
    sentence: ${q(`The ${noun} was **early**.`)},
    options: ['late', 'quick', 'short', 'cheap'],
    correct: 'late',
    why: ${q(why(topic, `The opposite of “early” in this context is “late”.`))},
    tag: 'synonyms_antonyms',
  })`,
    `  defineWord({
    id: ${q(idOf(prefix, 23))},
    focus: ${q(focus('def'))},
    definition: ${q('The day after Thursday.')},
    hint: 'F',
    answers: 'Friday',
    why: ${q(why(topic, `The day after Thursday is Friday.`))},
    tag: 'definitions',
  })`,
    `  wordToDefinition({
    id: ${q(idOf(prefix, 24))},
    focus: ${q(focus('wtd'))},
    word: 'deadline',
    options: [
      'The latest time you may finish a piece of work',
      'A quiet room in a library',
      'A ticket for a train',
      'A short holiday in autumn',
    ],
    correct: 'The latest time you may finish a piece of work',
    why: ${q(why(topic, `A deadline is the last moment allowed for finishing work.`))},
    tag: 'definitions',
  })`,
    `  situation({
    id: ${q(idOf(prefix, 25))},
    focus: ${q(focus('sit'))},
    context: ${q(`You arrive late to a ${noun} in ${place}.`)},
    options: [
      'I’m sorry I’m late.',
      'You are late as well.',
      'What colour is the room?',
      'I have two Fridays.',
    ],
    correct: 'I’m sorry I’m late.',
    why: ${q(why(topic, `The natural thing to say when you arrive late is an apology.`))},
    tag: 'functional_language',
  })`,
    `  response({
    id: ${q(idOf(prefix, 26))},
    focus: ${q(focus('resp'))},
    prompt: ${q(`Could you send me the ${noun}?`)},
    options: [
      'Of course. I’ll send it this afternoon.',
      'I am a deadline.',
      'Friday is a month.',
      'The lift is an elevator.',
    ],
    correct: 'Of course. I’ll send it this afternoon.',
    why: ${q(why(topic, `A polite request is answered with a clear yes and a time.`))},
    tag: 'functional_language',
  })`,
    `  dialogue({
    id: ${q(idOf(prefix, 27))},
    focus: ${q(focus('dlg'))},
    lines: [
      ['Alex', ${q(`Are you coming to the ${noun} in ${place}?`)}],
      [${q(person)}, null],
      ['Alex', ${q('Shall I save you a seat?')}],
      [${q(person)}, null],
    ],
    answers: [
      ${q(`Yes, I’m catching the ten o’clock train.`)},
      ${q(`Yes, please. I’ll be a few minutes late.`)},
    ],
    extra: ${q('The library closed in 2019.')},
    why: ${q(why(topic, `The replies answer the two questions: attendance, then a seat.`))},
    tag: 'functional_language',
  })`,
    `  register({
    id: ${q(idOf(prefix, 28))},
    focus: ${q(focus('reg'))},
    context: ${q(`An email to a university tutor about a late ${noun}.`)},
    options: [
      ${q(`I am writing to apologise for the late ${noun}.`)},
      ${q(`Yo, the ${noun} is late lol.`)},
      ${q(`Give me extra time now.`)},
      ${q(`The ${noun} is rubbish, innit.`)},
    ],
    correct: ${q(`I am writing to apologise for the late ${noun}.`)},
    why: ${q(why(topic, `A tutor email needs a formal apology, not slang.`))},
    tag: 'register_choice',
  })`,
    `  britishAmerican({
    id: ${q(idOf(prefix, 29))},
    focus: ${q(focus('uk'))},
    pairs: ${q(ukPairs)},
    why: ${q(why(topic, `Match each British word with the usual American equivalent.`))},
    tag: 'british_american',
  })`,
    `  oddSound({
    id: ${q(idOf(prefix, 30))},
    focus: ${q(focus('snd'))},
    question: ${q(oddSound[0])},
    options: ${q(oddSound[1])},
    correct: ${q(oddSound[2])},
    why: ${q(why(topic, `Three words share one sound; the answer does not.`))},
    tag: 'pronunciation_sounds',
  })`,
    `  stress({
    id: ${q(idOf(prefix, 31))},
    focus: ${q(focus('str'))},
    word: ${q(stress[0])},
    syllables: ${q(stress[1])},
    stressed: ${stress[2]},
    why: ${q(why(topic, `In “${stress[0]}” the stress falls on “${stress[1][stress[2]]}”.`))},
    tag: 'word_stress',
  })`,
    `  dictation({
    id: ${q(idOf(prefix, 32))},
    focus: ${q(focus('dic'))},
    audio: ${q(`${person} sent the ${noun} from ${place} on Friday.`)},
    why: ${q(why(topic, `Write every word you hear, including names and the day.`))},
    tag: 'dictation_accuracy',
  })`,
    `  listenChoice({
    id: ${q(idOf(prefix, 33))},
    focus: ${q(focus('lc'))},
    audio: ${q(`The ${noun} starts at nine in ${place} on Friday.`)},
    question: 'When does it start?',
    options: ['At nine on Friday', 'At nine on Monday', 'At two on Friday', 'At nine in August'],
    correct: 'At nine on Friday',
    why: ${q(why(topic, `The recording gives both the time and the day.`))},
    tag: 'listening_detail',
  })`,
    `  listenGap({
    id: ${q(idOf(prefix, 34))},
    focus: ${q(focus('lg'))},
    audio: ${q(`${person} works in ${place} every Friday.`)},
    sentence: ${q(`${person} works in ${place} every {1}.`)},
    answers: 'Friday',
    why: ${q(why(topic, `The missing word is the day you hear: Friday.`))},
    tag: 'listening_detail',
  })`,
    `  listenTrueFalse({
    id: ${q(idOf(prefix, 35))},
    focus: ${q(focus('ltf'))},
    audio: ${q(`${person} has already finished the ${noun}.`)},
    statement: ${q(`${person} has not started the ${noun} yet.`)},
    correct: false,
    why: ${q(why(topic, `The recording says the ${noun} is already finished, so the statement is false.`))},
    tag: 'listening_gist',
  })`,
    `  listenIntention({
    id: ${q(idOf(prefix, 36))},
    focus: ${q(focus('li'))},
    audio: ${q(`Could you send the ${noun} to ${other} before Friday, please?`)},
    question: 'What is the speaker doing?',
    options: ['Making a request', 'Telling a story', 'Refusing an offer', 'Giving a weather forecast'],
    correct: 'Making a request',
    why: ${q(why(topic, `“Could you… please?” is a polite request.`))},
    tag: 'speaker_intention',
  })`,
    `  imageChoice({
    id: ${q(idOf(prefix, 37))},
    focus: ${q(focus('img'))},
    image: ${q(image)},
    alt: ${q(`A picture for the topic ${titleish(topic)}.`)},
    question: 'Which sentence matches the picture?',
    options: [
      ${q(`The picture is about ${titleish(topic)}.`)},
      ${q('The picture shows a closed railway.')},
      ${q('There is no text and no topic in the picture.')},
      ${q('The picture is a map of Australia.')},
    ],
    correct: ${q(`The picture is about ${titleish(topic)}.`)},
    why: ${q(why(topic, `Choose the sentence that names the topic of this level.`))},
    tag: 'topic_vocabulary',
  })`,
    `  situationRewrite({
    id: ${q(idOf(prefix, 38))},
    focus: ${q(focus('sr'))},
    context: ${q(`You want ${other} to send the ${noun} today.`)},
    use: 'COULD',
    answer: ${q(`Could you send the ${noun} today?`)},
    accepted: [${q(`Could you send me the ${noun} today?`)}, ${q(`Could ${other} send the ${noun} today?`)}],
    why: ${q(why(topic, `A polite request uses could + infinitive.`))},
    tag: 'functional_language',
  })`,
    `  polarity({
    id: ${q(idOf(prefix, 39))},
    focus: ${q(focus('pol'))},
    target: 'negative',
    sentence: ${q(`${person} needs the ${noun} today.`)},
    answer: ${q(`${person} doesn’t need the ${noun} today.`)},
    accepted: [${q(`${person} does not need the ${noun} today.`)}, ${q(`${person} doesn’t need that ${noun} today.`)}],
    why: ${q(why(topic, `The negative of a present-simple need is don’t/doesn’t + need.`))},
    tag: 'present_simple_negative',
  })`,
    `  passive({
    id: ${q(idOf(prefix, 40))},
    focus: ${q(focus('pass'))},
    sentence: ${q(`${other} sent the ${noun} on Friday.`)},
    answer: ${q(`The ${noun} was sent on Friday.`)},
    accepted: [${q(`The ${noun} was sent by ${other} on Friday.`)}, ${q(`The ${noun} was sent on Friday by ${other}.`)}],
    why: ${q(why(topic, `A finished past action becomes was/were + past participle.`))},
    tag: 'passive_form',
  })`,
    `  reported({
    id: ${q(idOf(prefix, 41))},
    focus: ${q(focus('rep'))},
    sentence: ${q(`${person} said, “I need the ${noun}.”`)},
    answer: ${q(`${person} said that she needed the ${noun}.`)},
    accepted: [
      ${q(`${person} said she needed the ${noun}.`)},
      ${q(`${person} said that he needed the ${noun}.`)},
      ${q(`${person} said he needed the ${noun}.`)},
    ],
    why: ${q(why(topic, `In reported speech, “need” usually moves back to “needed”.`))},
    tag: 'reported_statements',
  })`,
    `  conditional({
    id: ${q(idOf(prefix, 42))},
    focus: ${q(focus('cond'))},
    context: ${q(`${person} will miss the ${noun} if the train is late.`)},
    answer: ${q(`If the train is late, ${person} will miss the ${noun}.`)},
    accepted: [
      ${q(`${person} will miss the ${noun} if the train is late.`)},
      ${q(`If the train is late, ${person} is going to miss the ${noun}.`)},
    ],
    why: ${q(why(topic, `A real future possibility takes if + present, will.`))},
    tag: 'first_conditional',
  })`,
    `  combine({
    id: ${q(idOf(prefix, 43))},
    focus: ${q(focus('comb'))},
    sentence: ${q(`${person} was tired. She finished the ${noun}.`)},
    use: 'ALTHOUGH',
    answer: ${q(`Although ${person} was tired, she finished the ${noun}.`)},
    accepted: [${q(`${person} finished the ${noun} although she was tired.`)}, ${q(`Although she was tired, ${person} finished the ${noun}.`)}],
    why: ${q(why(topic, `“Although” joins a contrast and must appear in the answer.`))},
    tag: 'sentence_combining',
  })`,
    `  linker({
    id: ${q(idOf(prefix, 44))},
    focus: ${q(focus('link'))},
    text: ${q(`${person} missed the train, {1} she called a taxi. She arrived on time, {2} the ${noun} had not started.`)},
    options: ['so', 'because', 'although', 'or'],
    answers: ['so', 'because'],
    why: ${q(why(topic, `“So” introduces a result; “because” introduces the reason she was still on time.`))},
    tag: 'linker_choice',
  })`,
    `  certainty({
    id: ${q(idOf(prefix, 45))},
    focus: ${q(focus('cert'))},
    context: ${q(`${person} cycles twenty kilometres to the office in ${place} every day.`)},
    sentence: 'She ___ be very fit.',
    options: ['must', 'can’t', 'mustn’t', 'shouldn’t'],
    correct: 'must',
    why: ${q(why(topic, `Daily long rides are strong evidence, so we say “must be”.`))},
    tag: 'modal_certainty',
  })`,
    `  translateToEnglish({
    id: ${q(idOf(prefix, 46))},
    focus: ${q(focus('en'))},
    spanish: ${q(`${person} necesita el informe el viernes.`)},
    answers: [
      ${q(`${person} needs the report on Friday.`)},
      ${q(`${person} needs the report by Friday.`)},
      ${q(`${person} needs that report on Friday.`)},
    ],
    why: ${q(why(topic, `“Necesita” is a present-simple need; days take “on Friday”.`))},
    tag: 'translation_to_english',
  })`,
    `  translateToSpanish({
    id: ${q(idOf(prefix, 47))},
    focus: ${q(focus('es'))},
    english: ${q(`${person} works in ${place} every Friday.`)},
    answers: [
      ${q(`${person} trabaja en ${place} todos los viernes.`)},
      ${q(`${person} trabaja en ${place} cada viernes.`)},
    ],
    why: ${q(why(topic, `A regular Friday habit is “todos los viernes” or “cada viernes”.`))},
    tag: 'translation_to_spanish',
  })`,
  ];

  return rows;
}

function fileFor(prefix, topic, image, n, heading, from) {
  const items = buildItems(prefix, topic, image, n);
  return `${importBlock(from)}
${heading}
export default [
${items.join(',\n')}
];
`;
}

function translationsOnly(prefix, topic, n) {
  const person = pick(PEOPLE, n);
  const place = pick(PLACES, n);
  const focus = (name) => `${prefix.replace(/-/g, '_')}_${name}`;
  return `
  translateToEnglish({
    id: ${q(idOf(prefix, 46))},
    focus: ${q(focus('en'))},
    spanish: ${q(`${person} necesita el informe el viernes.`)},
    answers: [
      ${q(`${person} needs the report on Friday.`)},
      ${q(`${person} needs the report by Friday.`)},
      ${q(`${person} needs that report on Friday.`)},
    ],
    why: ${q(why(topic, `“Necesita” is a present-simple need; days take “on Friday”.`))},
    tag: 'translation_to_english',
  }),
  translateToSpanish({
    id: ${q(idOf(prefix, 47))},
    focus: ${q(focus('es'))},
    english: ${q(`${person} works in ${place} every Friday.`)},
    answers: [
      ${q(`${person} trabaja en ${place} todos los viernes.`)},
      ${q(`${person} trabaja en ${place} cada viernes.`)},
    ],
    why: ${q(why(topic, `A regular Friday habit is “todos los viernes” or “cada viernes”.`))},
    tag: 'translation_to_spanish',
  }),
];
`;
}

function ensureImage(slug, nn) {
  const dest = path.join(ROOT, 'public', 'training', 'images', `${slug}-${nn}.jpg`);
  if (existsSync(dest)) return;
  const fallbacks = [
    path.join(ROOT, 'public', 'training', 'images', 'a2-basic-01.jpg'),
    path.join(ROOT, 'public', 'training', 'images', 'b2-basic-01.jpg'),
  ];
  const source = fallbacks.find(existsSync);
  if (source) copyFileSync(source, dest);
}

function writeLevel(slug, level, topic, dest, heading, from) {
  const nn = String(level).padStart(2, '0');
  const prefix = `${slug}-${nn}`;
  const image = `/training/images/${slug}-${nn}.jpg`;
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, fileFor(prefix, topic, image, level, heading, from), 'utf8');
  ensureImage(slug, nn);
}

function appendTranslations(dest, prefix, topic, level) {
  let text = readFileSync(dest, 'utf8');
  if (text.includes('translateToEnglish({')) return false;
  if (!text.includes('translateToEnglish,')) {
    text = text.replace(
      '  textGaps,\n',
      '  textGaps,\n  translateToEnglish,\n  translateToSpanish,\n',
    );
  }
  if (!/\n\];\s*$/.test(text)) return false;
  text = text.replace(/\n\];\s*$/, `${translationsOnly(prefix, topic, level)}`);
  writeFileSync(dest, text, 'utf8');
  return true;
}

let written = 0;
let appended = 0;

for (const [key, sections] of Object.entries(TRAINING_PATH_SECTIONS)) {
  const [cefr, difficulty] = key.split('|');
  const slug = trainingPathSlug(cefr, difficulty);
  let level = 0;
  for (const section of sections) {
    for (const topic of section.topics) {
      level += 1;
      const nn = String(level).padStart(2, '0');
      const dest = path.join(ROOT, 'src', 'data', 'trainingPaths', slug, `level${nn}.js`);
      if (existsSync(dest) && readFileSync(dest, 'utf8').includes('translateToSpanish({')) {
        ensureImage(slug, nn);
        continue;
      }
      writeLevel(
        slug,
        level,
        topic,
        dest,
        `/** ${cefr.toUpperCase()} ${difficulty} · Level ${level} · ${topic} — one item of every task type. */`,
        '../../b2TrainingTypeBuilders.js',
      );
      written += 1;
    }
  }
}

for (let level = 1; level <= 25; level += 1) {
  const nn = String(level).padStart(2, '0');
  const dest = path.join(ROOT, 'src', 'data', 'trainingTypes', `b2Basic${nn}.js`);
  const topic = B2_BASIC_TOPICS[level - 1];
  const prefix = `b2-basic-${nn}`;
  if (!existsSync(dest) || /^\s*export default \[\];\s*$/m.test(readFileSync(dest, 'utf8'))) {
    writeLevel(
      'b2-basic',
      level,
      topic,
      dest,
      `/** B2 basic · Level ${level} · ${topic} — one item of every task type. */`,
      '../b2TrainingTypeBuilders.js',
    );
    written += 1;
    continue;
  }
  const raw = readFileSync(dest, 'utf8');
  if (!raw.includes('translateToEnglish({')) {
    if (appendTranslations(dest, prefix, topic, level)) appended += 1;
  }
  ensureImage('b2-basic', nn);
}

console.log(`wrote ${written} level files, appended translations to ${appended} B2 files`);
