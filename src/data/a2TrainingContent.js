/**
 * Training A2 · Basic — elementary vocabulary and grammar (KET-style).
 */

export const A2_BASICO_TOPICS = [
  'Colors',
  'Numbers',
  'Days of the week',
  'Months of the year',
  'Nouns: the classroom',
  'Nouns: family',
  'Personal pronouns',
  'Verb to be',
  'Articles a / an / the',
  'Plurals',
  'Possessive adjectives',
  'There is / there are',
  'Prepositions of place',
  'Present simple',
  'Adverbs of frequency',
  'Can / cannot',
  'Like + -ing',
  'Food and drink',
  'Clothes',
  'Jobs',
  'Places in town',
  'Past: was / were',
  'WH- questions',
  'Basic review',
];

/** @type {Record<string, Array<{ question: string, text?: string, word?: string, options: string[], correct: string, explanation: string }>>} */
const BANK = {
  Colors: [
    {
      question: 'What colour is the sky on a sunny day?',
      text: 'Look at the picture in your mind: ☀️ + sky',
      options: ['Blue', 'Green', 'Red', 'Yellow'],
      correct: 'Blue',
      explanation: 'The sky is usually blue on a clear day.',
    },
    {
      question: 'Choose the correct word: Grass is ____.',
      options: ['green', 'purple', 'orange', 'pink'],
      correct: 'green',
      explanation: 'Grass is typically green.',
    },
    {
      question: 'A banana is usually ____.',
      options: ['yellow', 'blue', 'grey', 'black'],
      correct: 'yellow',
      explanation: 'Ripe bananas are yellow.',
    },
    {
      question: 'Snow is ____.',
      options: ['white', 'brown', 'red', 'green'],
      correct: 'white',
      explanation: 'Snow is white.',
    },
    {
      question: 'Complete: Tomatoes are often ____.',
      options: ['red', 'blue', 'silver', 'yellow'],
      correct: 'red',
      explanation: 'Many tomatoes are red when ripe.',
    },
    {
      question: 'The night sky without clouds is ____.',
      options: ['dark / black', 'pink', 'orange', 'light blue'],
      correct: 'dark / black',
      explanation: 'At night the sky looks dark.',
    },
    {
      question: 'An orange (fruit) is ____.',
      options: ['orange', 'violet', 'white', 'grey'],
      correct: 'orange',
      explanation: 'The colour and the fruit share the name orange.',
    },
    {
      question: 'Coffee without milk is ____.',
      options: ['brown', 'green', 'yellow', 'pink'],
      correct: 'brown',
      explanation: 'Black coffee looks brown.',
    },
    {
      question: 'Which colour is NOT a primary colour in art (red, blue, yellow)?',
      options: ['Purple', 'Red', 'Blue', 'Yellow'],
      correct: 'Purple',
      explanation: 'Purple is made by mixing red and blue.',
    },
    {
      question: 'Complete: The sun is ____.',
      options: ['yellow', 'grey', 'brown', 'black'],
      correct: 'yellow',
      explanation: 'We often describe the sun as yellow.',
    },
  ],
  Numbers: [
    {
      question: 'How do you write 15 in English?',
      options: ['fifteen', 'fiveteen', 'fifty', 'five'],
      correct: 'fifteen',
      explanation: '15 = fifteen.',
    },
    {
      question: 'What comes after twelve?',
      options: ['thirteen', 'fourteen', 'twenty', 'thirty'],
      correct: 'thirteen',
      explanation: '12 → 13 (thirteen).',
    },
    {
      question: 'Choose the correct number word: 7',
      options: ['seven', 'seventy', 'seventeen', 'second'],
      correct: 'seven',
      explanation: '7 = seven.',
    },
    {
      question: 'I have ____ fingers on one hand (usually).',
      options: ['five', 'ten', 'two', 'twelve'],
      correct: 'five',
      explanation: 'One hand has five fingers.',
    },
    {
      question: 'A week has ____ days.',
      options: ['seven', 'five', 'ten', 'twelve'],
      correct: 'seven',
      explanation: '7 days in a week.',
    },
    {
      question: 'Write 20 in English:',
      options: ['twenty', 'twelve', 'two', 'two hundred'],
      correct: 'twenty',
      explanation: '20 = twenty.',
    },
    {
      question: '3 + 4 = ____',
      options: ['seven', 'six', 'eight', 'twelve'],
      correct: 'seven',
      explanation: '3 + 4 = 7 (seven).',
    },
    {
      question: 'Which is the smallest?',
      options: ['one', 'ten', 'hundred', 'thousand'],
      correct: 'one',
      explanation: '1 is the smallest in the list.',
    },
    {
      question: 'There are ____ months in a year.',
      options: ['twelve', 'seven', 'ten', 'four'],
      correct: 'twelve',
      explanation: '12 months in a year.',
    },
    {
      question: '100 in English is ____.',
      options: ['one hundred', 'one thousand', 'ten', 'hundredly'],
      correct: 'one hundred',
      explanation: '100 = one hundred.',
    },
  ],
  'Days of the week': [
    {
      question: 'What is the first day of the week in many calendars (Monday-start)?',
      options: ['Monday', 'Sunday', 'Friday', 'Wednesday'],
      correct: 'Monday',
      explanation: 'In many countries the week starts on Monday.',
    },
    {
      question: 'The day after Tuesday is ____.',
      options: ['Wednesday', 'Thursday', 'Monday', 'Sunday'],
      correct: 'Wednesday',
      explanation: 'Tuesday → Wednesday.',
    },
    {
      question: 'Saturday and Sunday are often called the ____.',
      options: ['weekend', 'weekday', 'month', 'morning'],
      correct: 'weekend',
      explanation: 'Saturday and Sunday = the weekend.',
    },
    {
      question: 'Which day is NOT a weekday (for many people)?',
      options: ['Sunday', 'Tuesday', 'Wednesday', 'Thursday'],
      correct: 'Sunday',
      explanation: 'Sunday is part of the weekend.',
    },
    {
      question: 'Complete: Today is Friday. Tomorrow is ____.',
      options: ['Saturday', 'Thursday', 'Sunday', 'Monday'],
      correct: 'Saturday',
      explanation: 'Friday → Saturday.',
    },
    {
      question: 'The day before Monday is ____.',
      options: ['Sunday', 'Saturday', 'Tuesday', 'Friday'],
      correct: 'Sunday',
      explanation: 'Monday comes after Sunday.',
    },
    {
      question: 'How many days are in a week?',
      options: ['7', '5', '12', '30'],
      correct: '7',
      explanation: 'A week has seven days.',
    },
    {
      question: 'I go to school from Monday to ____.',
      options: ['Friday', 'Sunday', 'Saturday only', 'January'],
      correct: 'Friday',
      explanation: 'School is usually Monday–Friday.',
    },
    {
      question: 'Which spelling is correct?',
      options: ['Wednesday', 'Wensday', 'Wendsday', 'Wednsday'],
      correct: 'Wednesday',
      explanation: 'Wednesday is the correct spelling.',
    },
    {
      question: 'Complete: ____ is the day after Thursday.',
      options: ['Friday', 'Tuesday', 'Monday', 'Sunday'],
      correct: 'Friday',
      explanation: 'Thursday → Friday.',
    },
  ],
  'Months of the year': [
    {
      question: 'The first month of the year is ____.',
      options: ['January', 'March', 'December', 'June'],
      correct: 'January',
      explanation: 'January is month 1.',
    },
    {
      question: 'Christmas is usually in ____.',
      options: ['December', 'July', 'April', 'September'],
      correct: 'December',
      explanation: 'Christmas is in December.',
    },
    {
      question: 'The month after March is ____.',
      options: ['April', 'May', 'February', 'August'],
      correct: 'April',
      explanation: 'March → April.',
    },
    {
      question: 'Summer (in Europe) often includes ____.',
      options: ['June, July, August', 'January, February', 'only December', 'only Monday'],
      correct: 'June, July, August',
      explanation: 'Summer months are often June–August in Europe.',
    },
    {
      question: 'How many months are in a year?',
      options: ['12', '7', '30', '52'],
      correct: '12',
      explanation: '12 months in a year.',
    },
    {
      question: 'Which month comes before October?',
      options: ['September', 'November', 'August', 'March'],
      correct: 'September',
      explanation: 'September is before October.',
    },
    {
      question: 'My birthday is in ____. (example: spring month)',
      options: ['May', 'Monday', 'morning', 'seven'],
      correct: 'May',
      explanation: 'May is a month; the others are not.',
    },
    {
      question: 'Choose the correct spelling:',
      options: ['February', 'Febuary', 'Febrary', 'Febreuary'],
      correct: 'February',
      explanation: 'February is the correct spelling.',
    },
    {
      question: 'The last month of the year is ____.',
      options: ['December', 'January', 'June', 'March'],
      correct: 'December',
      explanation: 'December is month 12.',
    },
    {
      question: 'Halloween is in ____.',
      options: ['October', 'April', 'July', 'February'],
      correct: 'October',
      explanation: 'Halloween is on 31 October.',
    },
  ],
  'Nouns: the classroom': [
    {
      question: 'You write with a ____.',
      options: ['pen', 'chair', 'window', 'floor'],
      correct: 'pen',
      explanation: 'A pen is for writing.',
    },
    {
      question: 'Students sit at a ____.',
      options: ['desk', 'door', 'wall', 'sky'],
      correct: 'desk',
      explanation: 'A desk is a table for working.',
    },
    {
      question: 'The teacher writes on the ____.',
      options: ['board', 'bag', 'shoe', 'cloud'],
      correct: 'board',
      explanation: 'A board (whiteboard/blackboard) is in classrooms.',
    },
    {
      question: 'You carry books in a ____.',
      options: ['bag', 'clock', 'light', 'rain'],
      correct: 'bag',
      explanation: 'A bag holds books.',
    },
    {
      question: 'A ____ tells you the time.',
      options: ['clock', 'book', 'pencil', 'teacher'],
      correct: 'clock',
      explanation: 'A clock shows the time.',
    },
    {
      question: 'We read a ____.',
      options: ['book', 'door', 'floor', 'pen'],
      correct: 'book',
      explanation: 'A book is for reading.',
    },
    {
      question: 'You enter the room through the ____.',
      options: ['door', 'desk', 'ruler', 'homework'],
      correct: 'door',
      explanation: 'You use the door to enter.',
    },
    {
      question: 'A ____ is a long tool to measure lines.',
      options: ['ruler', 'apple', 'teacher', 'holiday'],
      correct: 'ruler',
      explanation: 'A ruler measures length.',
    },
    {
      question: 'Light comes through the ____.',
      options: ['window', 'notebook', 'eraser', 'student'],
      correct: 'window',
      explanation: 'Windows let in light.',
    },
    {
      question: 'An ____ removes pencil marks.',
      options: ['eraser', 'ruler', 'board', 'month'],
      correct: 'eraser',
      explanation: 'An eraser rubs out pencil.',
    },
  ],
  'Nouns: family': [
    {
      question: 'Your mother’s mother is your ____.',
      options: ['grandmother', 'uncle', 'cousin', 'brother'],
      correct: 'grandmother',
      explanation: 'Mother’s mother = grandmother.',
    },
    {
      question: 'A boy child in the family is a ____.',
      options: ['son', 'daughter', 'aunt', 'parent'],
      correct: 'son',
      explanation: 'A male child = son.',
    },
    {
      question: 'Your father’s brother is your ____.',
      options: ['uncle', 'niece', 'sister', 'grandfather'],
      correct: 'uncle',
      explanation: 'Father’s brother = uncle.',
    },
    {
      question: 'A female child is a ____.',
      options: ['daughter', 'son', 'uncle', 'cousin'],
      correct: 'daughter',
      explanation: 'A female child = daughter.',
    },
    {
      question: 'Your brother’s son is your ____.',
      options: ['nephew', 'aunt', 'mother', 'wife'],
      correct: 'nephew',
      explanation: 'Brother’s son = nephew.',
    },
    {
      question: 'Mother and father together are your ____.',
      options: ['parents', 'cousins', 'neighbours', 'teachers'],
      correct: 'parents',
      explanation: 'Parents = mother + father.',
    },
    {
      question: 'Your sister’s daughter is your ____.',
      options: ['niece', 'uncle', 'grandfather', 'husband'],
      correct: 'niece',
      explanation: 'Sister’s daughter = niece.',
    },
    {
      question: 'A man you are married to is your ____.',
      options: ['husband', 'brother', 'son', 'cousin'],
      correct: 'husband',
      explanation: 'Husband = married man.',
    },
    {
      question: 'A woman you are married to is your ____.',
      options: ['wife', 'uncle', 'nephew', 'student'],
      correct: 'wife',
      explanation: 'Wife = married woman.',
    },
    {
      question: 'Your parents’ child (you or your sibling) is a ____.',
      options: ['sibling / brother or sister', 'uncle only', 'grandmother', 'teacher'],
      correct: 'sibling / brother or sister',
      explanation: 'Brothers and sisters are siblings.',
    },
  ],
};

const SIMPLE_TEMPLATES = {
  'Personal pronouns': [
    { q: '____ am a student.', opts: ['I', 'He', 'They', 'Her'], c: 'I', e: 'Use I with am.' },
    { q: 'Maria is my friend. ____ is kind.', opts: ['She', 'He', 'It', 'We'], c: 'She', e: 'Maria = she.' },
    { q: 'Tom and I are friends. ____ study together.', opts: ['We', 'She', 'It', 'He'], c: 'We', e: 'Tom and I = we.' },
    { q: 'The book is on the table. ____ is new.', opts: ['It', 'They', 'We', 'You'], c: 'It', e: 'A book = it.' },
    { q: '____ are my classmates.', opts: ['They', 'He', 'She', 'I'], c: 'They', e: 'Plural people = they.' },
    { q: 'Is this your pen? Yes, it is ____.', opts: ['mine', 'my', 'me', 'I'], c: 'mine', e: 'Mine = my pen.' },
    { q: 'Can ____ help me, please?', opts: ['you', 'she', 'it', 'I'], c: 'you', e: 'Direct question to the listener.' },
    { q: 'My parents are at home. ____ are cooking.', opts: ['They', 'He', 'It', 'You'], c: 'They', e: 'Parents = they.' },
    { q: 'David? ____ is in the garden.', opts: ['He', 'She', 'It', 'We'], c: 'He', e: 'David = he.' },
    { q: 'Choose the object pronoun: I see ____.', opts: ['him', 'he', 'his', 'she'], c: 'him', e: 'After see we use him (object).' },
  ],
  'Verb to be': [
    { q: 'I ____ happy today.', opts: ['am', 'is', 'are', 'be'], c: 'am', e: 'I + am.' },
    { q: 'She ____ a doctor.', opts: ['is', 'am', 'are', 'be'], c: 'is', e: 'She + is.' },
    { q: 'We ____ from Spain.', opts: ['are', 'is', 'am', 'be'], c: 'are', e: 'We + are.' },
    { q: 'It ____ cold outside.', opts: ['is', 'are', 'am', 'be'], c: 'is', e: 'It + is.' },
    { q: 'They ____ not at school. (negative)', opts: ['are', 'is', 'am', 'be'], c: 'are', e: 'They + are not.' },
    { q: '____ you tired?', opts: ['Are', 'Is', 'Am', 'Be'], c: 'Are', e: 'Question with you → Are.' },
    { q: 'He ____ not my brother.', opts: ['is', 'are', 'am', 'be'], c: 'is', e: 'He + is not.' },
    { q: 'I ____ not angry.', opts: ['am', 'is', 'are', 'be'], c: 'am', e: 'I + am not.' },
    { q: 'The children ____ in the park.', opts: ['are', 'is', 'am', 'be'], c: 'are', e: 'Children = plural → are.' },
    { q: 'My name ____ Anna.', opts: ['is', 'are', 'am', 'be'], c: 'is', e: 'Name = it/she/he → is.' },
  ],
  'Articles a / an / the': [
    { q: 'I have ____ apple.', opts: ['an', 'a', 'the', '—'], c: 'an', e: 'Apple starts with a vowel sound → an.' },
    { q: 'She is ____ teacher.', opts: ['a', 'an', 'the', '—'], c: 'a', e: 'One job → a teacher.' },
    { q: '____ sun is bright today.', opts: ['The', 'A', 'An', '—'], c: 'The', e: 'Unique things often use the.' },
    { q: 'I need ____ hour to finish.', opts: ['an', 'a', 'the', '—'], c: 'an', e: 'Hour sounds like “our” → an hour.' },
    { q: 'This is ____ book I told you about.', opts: ['the', 'a', 'an', '—'], c: 'the', e: 'Specific book → the.' },
    { q: 'He has ____ dog and ____ cat.', opts: ['a / a', 'an / an', 'the / the', '— / —'], c: 'a / a', e: 'First mention → a.' },
    { q: 'We live in ____ small house.', opts: ['a', 'an', 'the', '—'], c: 'a', e: 'One of many houses → a.' },
    { q: 'Can you open ____ window, please?', opts: ['the', 'a', 'an', '—'], c: 'the', e: 'Specific window in the room.' },
    { q: 'I ate ____ orange for lunch.', opts: ['an', 'a', 'the', '—'], c: 'an', e: 'Orange → an.' },
    { q: '____ United Kingdom is in Europe.', opts: ['The', 'A', 'An', '—'], c: 'The', e: 'Country names with Kingdom often use the.' },
  ],
};

/** Genera ejercicios para temas sin banco detallado. */
function buildGenericA2Set(topic) {
  const tpl = SIMPLE_TEMPLATES[topic];
  if (tpl) {
    return tpl.map((t) => ({
      question: t.q,
      text: `A2 · ${topic}`,
      options: t.opts,
      correct: t.c,
      explanation: t.e,
    }));
  }
  return Array.from({ length: 10 }, (_, i) => ({
    question: `(${topic}) Choose the correct option.`,
    text: `Elementary practice — ${topic}. Question ${i + 1}.`,
    options: ['Option 1 ✓', 'Option 2', 'Option 3', 'Option 4'],
    correct: 'Option 1 ✓',
    explanation: `Basic A2 item for «${topic}». More content coming soon.`,
  }));
}

/**
 * @param {'use_of_english'|'vocabulary'} skill
 * @param {number} levelNum 1–24
 */
export function getA2BasicoExerciseTemplates(skill, levelNum) {
  const idx = Math.max(0, Math.min(levelNum - 1, A2_BASICO_TOPICS.length - 1));
  const topic = A2_BASICO_TOPICS[idx];
  let items = BANK[topic];

  if (!items) {
    items = buildGenericA2Set(topic);
  }

  if (skill === 'vocabulary') {
    return items.map((item, i) => ({
      ...item,
      word: item.word || topic,
      question: item.question.replace(/^.*?:\s*/, '') || `What fits the topic «${topic}»?`,
    }));
  }

  return items;
}

export function isA2BasicoTraining(level, difficulty) {
  return String(level).toLowerCase() === 'a2' && String(difficulty).toLowerCase() === 'basico';
}
