import { assessB2Part1AnswerLanguage } from '../domain/language-check.js';
import { isTerminalSpeakingB2State, transitionSpeakingB2 } from '../domain/exam-state-machine.js';
import {
  SPEAKING_B2_INTRODUCTION,
  SPEAKING_B2_TARGET_DURATION_SEC,
  getSpeakingB2Question,
  listApprovedSpeakingB2Questions,
  listSpeakingB2LiveQuestionPool,
} from '../domain/question-bank/sp-ex001-part1.js';
import {
  SPEAKING_B2_CLOSINGS,
  SPEAKING_B2_LEAD_INS,
  SPEAKING_B2_SILENCE_NUDGES,
  listSpeakingB2IntroLines,
  normaliseSpeakingB2Line,
} from '../domain/examiner-script.js';
import { speakingB2LineQuestion } from '../domain/contextual-follow-up.js';

const MIN_WORDS_FOR_DEVELOPED_ANSWER = 8;
const MAX_LEAD_INS = 3;
const FOLLOW_UP_HISTORY_TURNS = 8;
/** One recovery per question: a nudge, or one reminder to answer in English. */
const NO_RESPONSE_RECOVERY = 1;
/** Two follow-ups keep Part 1 near two minutes. The planned questions stay in place. */
export const SPEAKING_B2_MAX_FOLLOW_UPS = 2;
const MAX_COUNTED_TURN_MS = 45000;

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function planSteps(session) {
  const steps = session?.plan?.steps;
  return Array.isArray(steps) && steps.length ? steps : null;
}

/** Sessions without a plan keep the fixed five-question paper. */
function questionStep(session, index) {
  const steps = planSteps(session);
  if (steps) {
    const step = steps[index];
    const question = step ? getSpeakingB2Question(step.questionId) : null;
    if (!question) return null;
    return { question, line: step.line || `Thank you. ${question.question}` };
  }
  const question = listApprovedSpeakingB2Questions(session.examCode)[index];
  return question ? { question, line: `Thank you. ${question.question}` } : null;
}

function followUpFor(session, question) {
  const allowed = question?.allowedFollowUps || [];
  if (!allowed.length) return null;
  const planned = planSteps(session)?.find((step) => step.questionId === question.id)?.followUp;
  return planned && allowed.includes(planned) ? planned : allowed[0];
}

function closingLine(session) {
  const planned = session?.plan?.closing;
  return planned && SPEAKING_B2_CLOSINGS.includes(planned) ? planned : SPEAKING_B2_INTRODUCTION.closingText;
}

export function speakingB2IntroLine(session) {
  const planned = session?.plan?.intro;
  return planned && examinerLineIsAuthorised(session.examCode, planned)
    ? planned
    : SPEAKING_B2_INTRODUCTION.spokenText;
}

export function createSpeakingB2SessionState({ examCode, userId = null } = {}) {
  return {
    examCode,
    userId,
    state: 'READY',
    introAsked: false,
    questionIndex: 0,
    currentQuestionId: null,
    followUpUsed: {},
    followUpPrompt: null,
    followUpGenerated: false,
    reaskCount: 0,
    silenceNudges: 0,
    candidateSpeakingMs: 0,
    turns: [],
  };
}

const CLEARED_FOLLOW_UP = { followUpPrompt: null, followUpGenerated: false };

function followUpsAsked(session) {
  return Object.values(session.followUpUsed || {}).filter(Boolean).length;
}

/**
 * Time credited to the candidate. A wait, a silence or a stuck timer adds nothing.
 * A reported duration cannot exceed what the length of the answer makes plausible,
 * so an open turn left idle cannot close the part.
 */
export function countedSpeakingB2TurnMs({ speakingMs = 0, transcript = '', silence = false } = {}) {
  const answer = String(transcript || '').trim();
  if (silence || !answer) return 0;
  const plausible = Math.min(MAX_COUNTED_TURN_MS, 4000 + wordCount(answer) * 3500);
  return Math.min(plausible, Math.max(0, Number(speakingMs) || 0));
}

/** Milliseconds from the first word or keystroke. Time before that is not an answer. */
export function speakingB2MeasuredAnswerMs(speechStartedAt, now = Date.now()) {
  if (!speechStartedAt) return 0;
  return Math.max(0, now - Number(speechStartedAt));
}

function speakingMsAfter(session, extraMs) {
  return (session.candidateSpeakingMs || 0) + Math.max(0, extraMs);
}

/** The question the candidate is answering now: the follow-up if one was asked. */
function currentPrompt(session) {
  const question = getSpeakingB2Question(session.currentQuestionId);
  return {
    text: session.followUpPrompt || question?.question || '',
    generated: Boolean(session.followUpPrompt && session.followUpGenerated),
  };
}

/**
 * What the examiner model needs to follow up this answer, or null when the script picks
 * the next line: no plan, the name, silence, Spanish, an unclear transcript, time up or
 * a follow-up already asked for this question.
 */
export function speakingB2FollowUpContext(
  session,
  { transcript, speakingMs = 0, silence = false, uncertain = false } = {},
) {
  if (!session || isTerminalSpeakingB2State(session.state) || !planSteps(session)) return null;
  if (session.currentQuestionId === SPEAKING_B2_INTRODUCTION.id) return null;
  const answer = String(transcript || '').trim();
  if (!answer || silence || uncertain) return null;
  if (assessB2Part1AnswerLanguage(answer) === 'non-english') return null;
  const credited = countedSpeakingB2TurnMs({ speakingMs, transcript: answer, silence });
  if (speakingMsAfter(session, credited) >= SPEAKING_B2_TARGET_DURATION_SEC * 1000) return null;
  const question = getSpeakingB2Question(session.currentQuestionId);
  if (!question || session.followUpUsed?.[question.id]) return null;
  if (followUpsAsked(session) >= SPEAKING_B2_MAX_FOLLOW_UPS) return null;
  const next = questionStep(session, (session.questionIndex || 0) + 1);
  const spoken = (session.turns || []).filter(
    (turn) => turn?.transcript && (turn.role === 'examiner' || turn.role === 'candidate'),
  );
  return {
    examinerId: session.plan?.examinerId || null,
    question: question.question,
    answer,
    nextQuestion: next?.question.question || '',
    history: spoken
      .slice(-FOLLOW_UP_HISTORY_TURNS)
      .map((turn) => ({ role: turn.role, text: turn.transcript })),
    askedLines: spoken.filter((turn) => turn.role === 'examiner').map((turn) => turn.transcript),
  };
}

export function startAudioCheck(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'AUDIO_CHECK') };
}

export function beginIntroduction(session) {
  const next = {
    ...session,
    state: transitionSpeakingB2(session.state, 'INTRODUCTION'),
    introAsked: true,
    currentQuestionId: SPEAKING_B2_INTRODUCTION.id,
  };
  return {
    session: next,
    examinerText: speakingB2IntroLine(session),
    questionId: SPEAKING_B2_INTRODUCTION.id,
  };
}

export function beginAsking(session, examinerText, questionId) {
  return {
    ...session,
    state: transitionSpeakingB2(session.state, 'ASKING'),
    currentQuestionId: questionId,
    examinerText,
  };
}

export function beginListening(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'LISTENING') };
}

/**
 * `examinerMove` is the examiner model's suggestion for this answer
 * (composeSpeakingB2ExaminerMove). Without it the interview follows the script alone.
 */
export function resolveSpeakingB2Turn({
  session,
  transcript,
  speakingMs = 0,
  silence = false,
  examinerMove = null,
}) {
  if (isTerminalSpeakingB2State(session.state)) {
    return { session, examinerText: null, done: true };
  }

  let fromState = session.state;
  if (fromState === 'INTRODUCTION' || fromState === 'ASKING') {
    fromState = transitionSpeakingB2(fromState, 'LISTENING');
  }
  if (fromState === 'LISTENING') {
    fromState = transitionSpeakingB2('LISTENING', 'TURN_VALIDATION');
  }

  const working = {
    ...session,
    state: fromState,
    candidateSpeakingMs: speakingMsAfter(
      session,
      countedSpeakingB2TurnMs({ speakingMs, transcript, silence }),
    ),
    reaskCount: session.reaskCount || 0,
    silenceNudges: session.silenceNudges || 0,
    followUpUsed: { ...(session.followUpUsed || {}) },
  };

  const answer = String(transcript || '').trim();
  const language = assessB2Part1AnswerLanguage(answer);

  if (working.currentQuestionId === SPEAKING_B2_INTRODUCTION.id) {
    return advanceAfterIntro(working);
  }

  if (!answer || silence) {
    if (working.reaskCount < NO_RESPONSE_RECOVERY && working.currentQuestionId) {
      const prompt = currentPrompt(working);
      const lead = SPEAKING_B2_SILENCE_NUDGES[working.silenceNudges % SPEAKING_B2_SILENCE_NUDGES.length];
      return {
        session: {
          ...working,
          state: transitionSpeakingB2(working.state, 'ASKING'),
          reaskCount: working.reaskCount + 1,
          silenceNudges: working.silenceNudges + 1,
        },
        examinerText: prompt.text ? `${lead} ${prompt.text}` : speakingB2IntroLine(working),
        questionId: working.currentQuestionId,
        validation: 'silence-nudge',
        generated: prompt.generated,
      };
    }
    return nextPaperQuestion(working, 'silence-skip');
  }

  if (language === 'non-english') {
    if (working.reaskCount >= NO_RESPONSE_RECOVERY) {
      return nextPaperQuestion(working, 'non-english-skip');
    }
    const prompt = currentPrompt(working);
    return {
      session: {
        ...working,
        state: transitionSpeakingB2(working.state, 'ASKING'),
        reaskCount: working.reaskCount + 1,
      },
      examinerText: `Please answer in English. ${prompt.text || 'Please answer in English.'}`,
      questionId: working.currentQuestionId,
      validation: 'non-english',
      generated: prompt.generated,
    };
  }

  const timeUp = working.candidateSpeakingMs >= SPEAKING_B2_TARGET_DURATION_SEC * 1000;
  const question = getSpeakingB2Question(working.currentQuestionId);
  const usedFollowUp = Boolean(working.followUpUsed[working.currentQuestionId]);
  const canFollowUp = !timeUp
    && question
    && !usedFollowUp
    && followUpsAsked(working) < SPEAKING_B2_MAX_FOLLOW_UPS;
  const contextualLine = examinerMove?.action === 'follow_up' ? String(examinerMove.line || '').trim() : '';

  if (canFollowUp && contextualLine) {
    return askFollowUp(working, contextualLine, { generated: true, validation: 'contextual-follow-up' });
  }

  const followUp = followUpFor(working, question);
  if (
    canFollowUp &&
    followUp &&
    examinerMove?.action !== 'move_on' &&
    wordCount(answer) < MIN_WORDS_FOR_DEVELOPED_ANSWER
  ) {
    return askFollowUp(working, followUp, { generated: false, validation: 'authorised-follow-up' });
  }

  if (timeUp) return finishPart(working);

  return nextPaperQuestion(working, 'accepted');
}

function askFollowUp(session, line, { generated, validation }) {
  return {
    session: {
      ...session,
      state: transitionSpeakingB2(session.state, 'ASKING'),
      followUpUsed: { ...session.followUpUsed, [session.currentQuestionId]: true },
      followUpPrompt: speakingB2LineQuestion(line),
      followUpGenerated: generated,
      reaskCount: 0,
    },
    examinerText: line,
    questionId: session.currentQuestionId,
    validation,
    followUp: line,
    generated,
  };
}

function advanceAfterIntro(session) {
  const first = questionStep(session, 0);
  if (!first) return finishPart(session);
  return {
    session: {
      ...session,
      ...CLEARED_FOLLOW_UP,
      state: transitionSpeakingB2(session.state, 'ASKING'),
      questionIndex: 0,
      currentQuestionId: first.question.id,
      reaskCount: 0,
    },
    examinerText: first.line,
    questionId: first.question.id,
    validation: 'intro-accepted',
  };
}

function nextPaperQuestion(session, validation) {
  const nextIndex = (session.questionIndex || 0) + 1;
  const next = questionStep(session, nextIndex);
  if (!next) return finishPart({ ...session, validation });
  return {
    session: {
      ...session,
      ...CLEARED_FOLLOW_UP,
      state: transitionSpeakingB2(session.state, 'ASKING'),
      questionIndex: nextIndex,
      currentQuestionId: next.question.id,
      reaskCount: 0,
    },
    examinerText: next.line,
    questionId: next.question.id,
    validation,
  };
}

export function finishPart(session) {
  const state = session.state === 'FINISHING'
    ? 'FINISHING'
    : transitionSpeakingB2(session.state, 'FINISHING');
  return {
    session: {
      ...session,
      ...CLEARED_FOLLOW_UP,
      state,
      currentQuestionId: null,
    },
    examinerText: closingLine(session),
    questionId: null,
    done: true,
    validation: 'finished',
  };
}

/**
 * Lines the examiner may say after the current answer: the planned follow-up (if not
 * used yet) and the next planned question or closing. Used only for audio prefetch.
 */
export function predictSpeakingB2UpcomingLines(session) {
  if (!session || isTerminalSpeakingB2State(session.state)) return [];
  if (session.currentQuestionId === SPEAKING_B2_INTRODUCTION.id) {
    const first = questionStep(session, 0);
    return first ? [first.line] : [];
  }
  const question = getSpeakingB2Question(session.currentQuestionId);
  if (!question) return [];
  const lines = [];
  if (!session.followUpUsed?.[question.id]) {
    const followUp = followUpFor(session, question);
    if (followUp) lines.push(followUp);
  }
  const next = questionStep(session, (session.questionIndex || 0) + 1);
  lines.push(next ? next.line : closingLine(session));
  return lines;
}

export function markProcessing(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'PROCESSING') };
}

export function markCompleted(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'COMPLETED') };
}

export function markPausedTechnical(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'PAUSED_TECHNICAL') };
}

export function resumeFromTechnical(session, nextState = 'ASKING') {
  return { ...session, state: transitionSpeakingB2(session.state, nextState) };
}

export function markAborted(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'ABORTED') };
}

export function markFailed(session) {
  return { ...session, state: transitionSpeakingB2(session.state, 'FAILED') };
}

export function listAuthorisedExaminerLines(examCode) {
  const questions = listSpeakingB2LiveQuestionPool(examCode);
  if (!questions.length) return [];
  const lines = [
    ...listSpeakingB2IntroLines(),
    ...SPEAKING_B2_CLOSINGS,
    'Please answer in English.',
    'Could you say that again?',
  ];
  for (const question of questions) {
    lines.push(question.question);
    lines.push(...question.allowedFollowUps);
  }
  return lines;
}

const authorisedLineSets = new Map();

function authorisedLineSet(examCode) {
  if (!authorisedLineSets.has(examCode)) {
    authorisedLineSets.set(
      examCode,
      new Set(listAuthorisedExaminerLines(examCode).map(normaliseSpeakingB2Line)),
    );
  }
  return authorisedLineSets.get(examCode);
}

/** An approved line, optionally preceded by approved lead-ins. Nothing else is spoken. */
export function examinerLineIsAuthorised(examCode, spokenText) {
  const allowed = authorisedLineSet(examCode);
  let text = normaliseSpeakingB2Line(spokenText);
  for (let depth = 0; text && depth <= MAX_LEAD_INS; depth += 1) {
    if (allowed.has(text)) return true;
    const lead = SPEAKING_B2_LEAD_INS.find((item) => text.startsWith(`${item} `));
    if (!lead) return false;
    text = text.slice(lead.length + 1);
  }
  return false;
}
