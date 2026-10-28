import {
  SPEAKING_B2_EXAMINERS,
  listSpeakingB2LiveQuestionPool,
} from '../domain/question-bank/sp-ex001-part1.js';
import {
  SPEAKING_B2_ACKNOWLEDGEMENTS,
  SPEAKING_B2_AFTER_NAME_LEADS,
  SPEAKING_B2_CLOSINGS,
  SPEAKING_B2_GREETINGS,
  SPEAKING_B2_INTRO_TEMPLATES,
  SPEAKING_B2_TOPIC_TRANSITIONS,
  composeSpeakingB2Intro,
} from '../domain/examiner-script.js';

export const SPEAKING_B2_PLAN_VERSION = 1;
export const SPEAKING_B2_PLAN_TOPIC_QUESTIONS = 4;
export const SPEAKING_B2_RECENT_EXAMINER_SESSIONS = 2;

const NEUTRAL_GREETING_SHARE = 0.2;
const SPEAKING_B2_TIME_ZONE = 'Europe/Madrid';

function pick(items, random) {
  if (!items?.length) return null;
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

function shuffle(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickFresh(items, isStale, random) {
  const fresh = items.filter((item) => !isStale(item));
  return pick(fresh.length ? fresh : items, random);
}

export function speakingB2HourInTimeZone(date = new Date(), timeZone = SPEAKING_B2_TIME_ZONE) {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone }).format(date),
  );
  return Number.isInteger(hour) ? hour : date.getHours();
}

export function speakingB2GreetingForHour(hour) {
  const h = Number(hour);
  if (!Number.isInteger(h) || h < 0 || h > 23) return SPEAKING_B2_GREETINGS.neutral;
  if (h >= 5 && h < 12) return SPEAKING_B2_GREETINGS.morning;
  if (h >= 12 && h < 18) return SPEAKING_B2_GREETINGS.afternoon;
  return SPEAKING_B2_GREETINGS.evening;
}

/** `rows` are the user's latest sessions, newest first. */
export function summariseRecentSpeakingB2Plans(rows = []) {
  const examinerIds = [];
  const questionIds = [];
  (rows || []).forEach((row, index) => {
    const plan = row?.metadata?.plan || row?.plan;
    if (!plan) return;
    if (index < SPEAKING_B2_RECENT_EXAMINER_SESSIONS && plan.examinerId) examinerIds.push(plan.examinerId);
    for (const step of plan.steps || []) {
      if (step?.questionId) questionIds.push(step.questionId);
    }
  });
  return { examinerIds, questionIds };
}

/**
 * Fixed for the whole session and stored in session metadata, so every instance
 * asks the same lines in the same order and the client can prefetch the next one.
 */
export function buildSpeakingB2SessionPlan({
  examCode,
  localHour,
  recent = {},
  random = Math.random,
  now = new Date(),
} = {}) {
  const pool = listSpeakingB2LiveQuestionPool(examCode);
  const openers = pool.filter((question) => question.opener);
  const topicQuestions = pool.filter((question) => !question.opener);
  if (!openers.length || !topicQuestions.length) return null;

  const staleExaminers = new Set(recent.examinerIds || []);
  const staleQuestions = new Set(recent.questionIds || []);
  const isStaleQuestion = (question) => staleQuestions.has(question.id);

  const examiner = pickFresh(SPEAKING_B2_EXAMINERS, (item) => staleExaminers.has(item.id), random);
  const hour = Number.isInteger(localHour) && localHour >= 0 && localHour <= 23
    ? localHour
    : speakingB2HourInTimeZone(now);
  const greeting = random() < NEUTRAL_GREETING_SHARE
    ? SPEAKING_B2_GREETINGS.neutral
    : speakingB2GreetingForHour(hour);
  const intro = composeSpeakingB2Intro(pick(SPEAKING_B2_INTRO_TEMPLATES, random), greeting, examiner.name);

  const opener = pickFresh(openers, isStaleQuestion, random);
  const blockedTopics = new Set([opener.topic, ...(opener.excludesTopics || [])]);
  const byTopic = new Map();
  for (const question of topicQuestions) {
    if (blockedTopics.has(question.topic)) continue;
    if (!byTopic.has(question.topic)) byTopic.set(question.topic, []);
    byTopic.get(question.topic).push(question);
  }
  const hasFresh = (topic) => byTopic.get(topic).some((question) => !isStaleQuestion(question));
  const shuffledTopics = shuffle([...byTopic.keys()], random);
  const chosenTopics = shuffle(
    [
      ...shuffledTopics.filter(hasFresh),
      ...shuffledTopics.filter((topic) => !hasFresh(topic)),
    ].slice(0, SPEAKING_B2_PLAN_TOPIC_QUESTIONS),
    random,
  );
  const chosen = chosenTopics.map((topic) => pickFresh(byTopic.get(topic), isStaleQuestion, random));

  let previousLead = null;
  const steps = [opener, ...chosen].map((question, index) => {
    let lead;
    if (index === 0) {
      lead = pick(SPEAKING_B2_AFTER_NAME_LEADS, random);
      previousLead = lead;
    } else {
      const ack = pick(SPEAKING_B2_ACKNOWLEDGEMENTS.filter((item) => item !== previousLead), random);
      previousLead = ack;
      lead = index === 1 ? `${ack} ${pick(SPEAKING_B2_TOPIC_TRANSITIONS, random)}` : ack;
    }
    return {
      questionId: question.id,
      line: `${lead} ${question.question}`,
      followUp: pick(question.allowedFollowUps, random),
    };
  });

  return {
    version: SPEAKING_B2_PLAN_VERSION,
    examinerId: examiner.id,
    intro,
    steps,
    closing: pick(SPEAKING_B2_CLOSINGS, random),
  };
}
