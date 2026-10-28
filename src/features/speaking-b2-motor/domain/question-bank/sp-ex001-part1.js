/** SP-EX001 — B2 First Speaking Part 1 (Interview). British English. Versioned bank. */

export const SPEAKING_B2_EXAM_CODE = 'SP-EX001';
export const SPEAKING_B2_EXAM_VERSION = 1;
export const SPEAKING_B2_PART = 1;
export const SPEAKING_B2_TARGET_DURATION_SEC = 120;

export const SPEAKING_B2_INTRODUCTION = {
  id: 'SP-EX001-P1-INTRO',
  spokenText: 'Good morning. My name is Emma. And what is your name?',
  closingText: 'Thank you. That is the end of Part 1.',
};

export const SPEAKING_B2_EX001_QUESTIONS = [
  {
    id: 'SP-EX001-P1-Q01',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Education',
    topic: 'studies',
    level: 'B2',
    question: 'What do you enjoy most about studying English?',
    communicativeAims: ['express preference', 'give reasons', 'talk about learning'],
    allowedFollowUps: ['Why is that?', 'Can you tell me a bit more?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 1,
  },
  {
    id: 'SP-EX001-P1-Q02',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Free time',
    topic: 'free-time',
    level: 'B2',
    question: 'How do you usually spend your weekends?',
    communicativeAims: ['describe routines', 'talk about leisure', 'use present simple'],
    allowedFollowUps: ['Why do you enjoy that?', 'Do you do the same things every weekend?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 2,
  },
  {
    id: 'SP-EX001-P1-Q03',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Travel',
    topic: 'travel',
    level: 'B2',
    question: 'Do you prefer visiting new places or returning to places you know? Why?',
    communicativeAims: ['compare options', 'justify a preference'],
    allowedFollowUps: ['Can you give me an example?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 3,
  },
  {
    id: 'SP-EX001-P1-Q04',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Technology',
    topic: 'technology',
    level: 'B2',
    question: 'How has technology changed the way you communicate with your friends?',
    communicativeAims: ['describe change', 'use present perfect', 'give an opinion'],
    allowedFollowUps: ['Is that a good change, in your view?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 4,
  },
  {
    id: 'SP-EX001-P1-Q05',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Future plans',
    topic: 'future',
    level: 'B2',
    question: 'Is there a new skill you would like to learn in the future?',
    communicativeAims: ['talk about future hopes', 'give reasons'],
    allowedFollowUps: ['Why would you like to learn that?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 5,
  },
];

export const SPEAKING_B2_EX001_EXAM = {
  code: SPEAKING_B2_EXAM_CODE,
  title: 'SP-EX001 — Part 1 Interview',
  part: SPEAKING_B2_PART,
  cefr: 'B2',
  version: SPEAKING_B2_EXAM_VERSION,
  reviewStatus: 'approved',
  durationTargetSec: SPEAKING_B2_TARGET_DURATION_SEC,
  questions: SPEAKING_B2_EX001_QUESTIONS,
  introduction: SPEAKING_B2_INTRODUCTION,
};

function topicQuestion(id, topic, theme, question, allowedFollowUps, communicativeAims, extra = {}) {
  return {
    id,
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme,
    topic,
    level: 'B2',
    question,
    communicativeAims,
    allowedFollowUps,
    reviewStatus: 'approved',
    version: 1,
    ...extra,
  };
}

/**
 * Live sessions draw from this pool plus the five SP-EX001 paper questions.
 * `opener` questions are asked straight after the candidate's name; `excludesTopics`
 * keeps the rest of the interview from repeating the opener.
 */
export const SPEAKING_B2_PART1_TOPIC_BANK = [
  topicQuestion('SP-EX001-P1-OPEN-01', 'personal', 'Personal', 'Where are you from?',
    ['What is it like there?', 'Do you enjoy living there?'],
    ['give personal information', 'describe a place'],
    { opener: true, excludesTopics: ['home'] }),
  topicQuestion('SP-EX001-P1-OPEN-02', 'personal', 'Personal', 'Where do you live at the moment?',
    ['What do you like about the area?', 'How long have you lived there?'],
    ['give personal information', 'describe a place'],
    { opener: true, excludesTopics: ['home'] }),
  topicQuestion('SP-EX001-P1-OPEN-03', 'personal', 'Personal', 'Do you work or are you a student?',
    ['What do you enjoy most about it?', 'Why did you choose that?'],
    ['give personal information', 'give reasons'],
    { opener: true, excludesTopics: ['studies'] }),

  topicQuestion('SP-EX001-P1-HOME-01', 'home', 'Home and neighbourhood', 'What do you like most about the area where you live?',
    ['Is there anything you would change about it?'], ['describe a place', 'express preference']),
  topicQuestion('SP-EX001-P1-HOME-02', 'home', 'Home and neighbourhood', 'Would you like to live somewhere different in the future?',
    ['Where would you like to live, and why?'], ['talk about future hopes', 'give reasons']),
  topicQuestion('SP-EX001-P1-HOME-03', 'home', 'Home and neighbourhood', 'Is your town or city a good place for young people?',
    ['Why do you think that?'], ['give an opinion', 'give reasons']),
  topicQuestion('SP-EX001-P1-HOME-04', 'home', 'Home and neighbourhood', 'Which room in your home do you like spending time in most?',
    ['What do you usually do there?'], ['describe a place', 'express preference']),

  topicQuestion('SP-EX001-P1-STUDY-01', 'studies', 'Work and studies', 'What do you enjoy most about your work or your studies?',
    ['Why is that?'], ['express preference', 'give reasons']),
  topicQuestion('SP-EX001-P1-STUDY-02', 'studies', 'Work and studies', 'Is there a subject you would like to learn more about?',
    ['What interests you about it?'], ['talk about interests', 'give reasons']),
  topicQuestion('SP-EX001-P1-STUDY-03', 'studies', 'Work and studies', 'How useful do you think English will be for your future?',
    ['Can you give me an example?'], ['give an opinion', 'talk about the future']),
  topicQuestion('SP-EX001-P1-STUDY-04', 'studies', 'Work and studies', 'Do you prefer studying on your own or with other people?',
    ['Why do you prefer that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-STUDY-05', 'studies', 'Work and studies', 'What would you like to improve about your English?',
    ['How are you going to work on that?'], ['talk about learning', 'talk about plans']),

  topicQuestion('SP-EX001-P1-FREE-01', 'free-time', 'Free time', 'What do you enjoy doing in your free time?',
    ['How did you get interested in that?'], ['talk about leisure', 'give reasons']),
  topicQuestion('SP-EX001-P1-FREE-02', 'free-time', 'Free time', 'Do you prefer relaxing at home or going out?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-FREE-03', 'free-time', 'Free time', 'Has the way you spend your free time changed in recent years?',
    ['Why do you think that is?'], ['describe change', 'use present perfect']),
  topicQuestion('SP-EX001-P1-FREE-04', 'free-time', 'Free time', 'What did you do last weekend?',
    ['Did you enjoy it?'], ['narrate past events', 'use past simple']),

  topicQuestion('SP-EX001-P1-SPORT-01', 'sport-health', 'Sport and health', 'Do you enjoy doing sport?',
    ['Why or why not?'], ['express preference', 'give reasons']),
  topicQuestion('SP-EX001-P1-SPORT-02', 'sport-health', 'Sport and health', 'How important is it for you to stay active?',
    ['What do you do to keep fit?'], ['give an opinion', 'describe routines']),
  topicQuestion('SP-EX001-P1-SPORT-03', 'sport-health', 'Sport and health', 'Do you prefer team sports or individual sports?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-SPORT-04', 'sport-health', 'Sport and health', 'Did you do much sport when you were younger?',
    ['Do you still do it now?'], ['talk about past habits', 'use used to']),

  topicQuestion('SP-EX001-P1-TECH-01', 'technology', 'Technology', 'How much time do you spend on your phone every day?',
    ['Would you like to spend less time on it?'], ['describe routines', 'give an opinion']),
  topicQuestion('SP-EX001-P1-TECH-02', 'technology', 'Technology', 'What app or website do you find most useful?',
    ['Why is it so useful for you?'], ['describe', 'give reasons']),
  topicQuestion('SP-EX001-P1-TECH-03', 'technology', 'Technology', 'Do you think technology makes our lives easier?',
    ['Can you give me an example?'], ['give an opinion', 'give examples']),

  topicQuestion('SP-EX001-P1-TRAVEL-01', 'travel', 'Travel and places', 'Tell me about a place you would like to visit in the future.',
    ['Why would you like to go there?'], ['talk about future hopes', 'describe a place']),
  topicQuestion('SP-EX001-P1-TRAVEL-02', 'travel', 'Travel and places', 'Would you rather have a holiday in a city or in the countryside?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-TRAVEL-03', 'travel', 'Travel and places', 'What is the best trip you have ever been on?',
    ['What made it so special?'], ['narrate past events', 'use present perfect']),
  topicQuestion('SP-EX001-P1-TRAVEL-04', 'travel', 'Travel and places', 'Tell me about a day out that you really enjoyed.',
    ['Who did you go with?'], ['narrate past events', 'describe feelings']),

  topicQuestion('SP-EX001-P1-FOOD-01', 'food', 'Food', 'Do you enjoy cooking?',
    ['Who usually does the cooking in your home?'], ['express preference', 'describe routines']),
  topicQuestion('SP-EX001-P1-FOOD-02', 'food', 'Food', 'Do you prefer eating at home or eating out?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-FOOD-03', 'food', 'Food', 'Is there any food from another country that you would like to try?',
    ['What makes you curious about it?'], ['talk about future hopes', 'give reasons']),
  topicQuestion('SP-EX001-P1-FOOD-04', 'food', 'Food', 'What is a typical meal in your country?',
    ['How often do you eat it?'], ['describe', 'give personal information']),

  topicQuestion('SP-EX001-P1-PEOPLE-01', 'people', 'Friends and family', 'Do you spend much time with your family?',
    ['What do you like doing together?'], ['describe routines', 'talk about relationships']),
  topicQuestion('SP-EX001-P1-PEOPLE-02', 'people', 'Friends and family', 'What qualities are important in a good friend?',
    ['Why do you think that is important?'], ['give an opinion', 'describe people']),
  topicQuestion('SP-EX001-P1-PEOPLE-03', 'people', 'Friends and family', 'Tell me about a friend who is important to you.',
    ['How did you meet?'], ['describe people', 'narrate past events']),
  topicQuestion('SP-EX001-P1-PEOPLE-04', 'people', 'Friends and family', 'Do you prefer having a few close friends or lots of friends?',
    ['Why is that?'], ['compare options', 'justify a preference']),

  topicQuestion('SP-EX001-P1-ENT-01', 'entertainment', 'Entertainment', 'Do you enjoy watching films or series?',
    ['What kind do you like best?'], ['express preference', 'talk about leisure']),
  topicQuestion('SP-EX001-P1-ENT-02', 'entertainment', 'Entertainment', 'What kind of music do you like?',
    ['When do you usually listen to it?'], ['express preference', 'describe routines']),
  topicQuestion('SP-EX001-P1-ENT-03', 'entertainment', 'Entertainment', 'Do you prefer reading books or watching videos?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-ENT-04', 'entertainment', 'Entertainment', 'Tell me about a film or series you have enjoyed recently.',
    ['What did you like about it?'], ['describe', 'give an opinion']),

  topicQuestion('SP-EX001-P1-FUT-01', 'future', 'Future plans', 'What are your plans for the next few months?',
    ['What are you most looking forward to?'], ['talk about plans', 'use future forms']),
  topicQuestion('SP-EX001-P1-FUT-02', 'future', 'Future plans', 'What is something you are looking forward to this year?',
    ['Why are you looking forward to it?'], ['talk about plans', 'describe feelings']),
  topicQuestion('SP-EX001-P1-FUT-03', 'future', 'Future plans', "Where would you like to be in five years' time?",
    ['What will you need to do to get there?'], ['talk about future hopes', 'use future forms']),

  topicQuestion('SP-EX001-P1-ROUT-01', 'routine', 'Daily life', 'What does a typical day look like for you?',
    ['Which part of the day do you enjoy most?'], ['describe routines', 'use present simple']),
  topicQuestion('SP-EX001-P1-ROUT-02', 'routine', 'Daily life', 'Are you a morning person or an evening person?',
    ['Why do you think that is?'], ['describe yourself', 'give reasons']),
  topicQuestion('SP-EX001-P1-ROUT-03', 'routine', 'Daily life', 'How do you usually get to work or to your classes?',
    ['How long does it take you?'], ['describe routines', 'give details']),

  topicQuestion('SP-EX001-P1-SHOP-01', 'shopping', 'Shopping', 'Do you enjoy going shopping?',
    ['Why or why not?'], ['express preference', 'give reasons']),
  topicQuestion('SP-EX001-P1-SHOP-02', 'shopping', 'Shopping', 'Do you prefer shopping online or in shops?',
    ['Why is that?'], ['compare options', 'justify a preference']),
  topicQuestion('SP-EX001-P1-SHOP-03', 'shopping', 'Shopping', 'What was the last thing you bought for someone else?',
    ['Why did you choose it?'], ['narrate past events', 'give reasons']),

  topicQuestion('SP-EX001-P1-SEASON-01', 'seasons', 'Weather and seasons', 'What is your favourite time of year?',
    ['Why do you like it so much?'], ['express preference', 'give reasons']),
  topicQuestion('SP-EX001-P1-SEASON-02', 'seasons', 'Weather and seasons', 'How does the weather affect the way you feel?',
    ['Can you give me an example?'], ['describe feelings', 'give examples']),
  topicQuestion('SP-EX001-P1-SEASON-03', 'seasons', 'Weather and seasons', 'Do you prefer hot weather or cold weather?',
    ['Why is that?'], ['compare options', 'justify a preference']),
];

/** One fixed voice per examiner for the whole session. `legacyOpenaiVoice` must work on tts-1. */
export const SPEAKING_B2_EXAMINERS = [
  { id: 'emma', name: 'Emma', gender: 'female', openaiVoice: 'marin', legacyOpenaiVoice: 'shimmer', edgeVoice: 'en-GB-SoniaNeural' },
  { id: 'sarah', name: 'Sarah', gender: 'female', openaiVoice: 'coral', legacyOpenaiVoice: 'coral', edgeVoice: 'en-GB-LibbyNeural' },
  { id: 'helen', name: 'Helen', gender: 'female', openaiVoice: 'sage', legacyOpenaiVoice: 'sage', edgeVoice: 'en-GB-SoniaNeural' },
  { id: 'kate', name: 'Kate', gender: 'female', openaiVoice: 'shimmer', legacyOpenaiVoice: 'shimmer', edgeVoice: 'en-GB-LibbyNeural' },
  { id: 'james', name: 'James', gender: 'male', openaiVoice: 'cedar', legacyOpenaiVoice: 'ash', edgeVoice: 'en-GB-RyanNeural' },
  { id: 'daniel', name: 'Daniel', gender: 'male', openaiVoice: 'ash', legacyOpenaiVoice: 'ash', edgeVoice: 'en-GB-ThomasNeural' },
  { id: 'oliver', name: 'Oliver', gender: 'male', openaiVoice: 'ballad', legacyOpenaiVoice: 'fable', edgeVoice: 'en-GB-RyanNeural' },
  { id: 'tom', name: 'Tom', gender: 'male', openaiVoice: 'verse', legacyOpenaiVoice: 'echo', edgeVoice: 'en-GB-ThomasNeural' },
];

export const SPEAKING_B2_DEFAULT_EXAMINER_ID = 'emma';

const EXAMINER_BY_ID = new Map(SPEAKING_B2_EXAMINERS.map((examiner) => [examiner.id, examiner]));

export function getSpeakingB2Examiner(examinerId) {
  return EXAMINER_BY_ID.get(examinerId) || EXAMINER_BY_ID.get(SPEAKING_B2_DEFAULT_EXAMINER_ID);
}

const QUESTION_BY_ID = new Map(
  [...SPEAKING_B2_EX001_QUESTIONS, ...SPEAKING_B2_PART1_TOPIC_BANK].map((q) => [q.id, q]),
);

export function getSpeakingB2Exam(code = SPEAKING_B2_EXAM_CODE) {
  if (code !== SPEAKING_B2_EXAM_CODE) return null;
  return SPEAKING_B2_EX001_EXAM;
}

export function getSpeakingB2Question(questionId) {
  return QUESTION_BY_ID.get(questionId) || null;
}

/** The fixed five-question paper (fixtures, human pilot, sessions without a plan). */
export function listApprovedSpeakingB2Questions(code = SPEAKING_B2_EXAM_CODE) {
  const exam = getSpeakingB2Exam(code);
  if (!exam) return [];
  return exam.questions.filter((q) => q.reviewStatus === 'approved');
}

export function listSpeakingB2LiveQuestionPool(code = SPEAKING_B2_EXAM_CODE) {
  if (!getSpeakingB2Exam(code)) return [];
  return [...SPEAKING_B2_EX001_QUESTIONS, ...SPEAKING_B2_PART1_TOPIC_BANK].filter(
    (q) => q.reviewStatus === 'approved',
  );
}

export function isAuthorisedFollowUp(questionId, followUp) {
  const question = getSpeakingB2Question(questionId);
  if (!question) return false;
  const target = String(followUp || '').trim().toLowerCase();
  return question.allowedFollowUps.some((item) => item.trim().toLowerCase() === target);
}
