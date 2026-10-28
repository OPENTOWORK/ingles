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
  listSpeakingB2IntroLines,
  normaliseSpeakingB2Line,
} from '../domain/examiner-script.js';

const MIN_WORDS_FOR_DEVELOPED_ANSWER = 8;
const MAX_LEAD_INS = 3;

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
    reaskCount: 0,
    candidateSpeakingMs: 0,
    turns: [],
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

export function resolveSpeakingB2Turn({ session, transcript, speakingMs = 0, silence = false }) {
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
    candidateSpeakingMs: (session.candidateSpeakingMs || 0) + Math.max(0, speakingMs),
    reaskCount: session.reaskCount || 0,
    followUpUsed: { ...(session.followUpUsed || {}) },
  };

  const answer = String(transcript || '').trim();
  const language = assessB2Part1AnswerLanguage(answer);

  if (working.currentQuestionId === SPEAKING_B2_INTRODUCTION.id) {
    return advanceAfterIntro(working);
  }

  if (!answer || silence) {
    if (working.reaskCount < 1 && working.currentQuestionId) {
      const question = getSpeakingB2Question(working.currentQuestionId);
      return {
        session: {
          ...working,
          state: transitionSpeakingB2(working.state, 'ASKING'),
          reaskCount: working.reaskCount + 1,
        },
        examinerText: question
          ? `Could you say that again? ${question.question}`
          : SPEAKING_B2_INTRODUCTION.spokenText,
        questionId: working.currentQuestionId,
        validation: 'silence-reask',
      };
    }
    return nextPaperQuestion(working, 'silence-skip');
  }

  if (language === 'non-english') {
    const question = getSpeakingB2Question(working.currentQuestionId);
    const same = question?.question || 'Please answer in English.';
    return {
      session: {
        ...working,
        state: transitionSpeakingB2(working.state, 'ASKING'),
        reaskCount: working.reaskCount + 1,
      },
      examinerText: `Please answer in English. ${same}`,
      questionId: working.currentQuestionId,
      validation: 'non-english',
    };
  }

  const timeUp = working.candidateSpeakingMs >= SPEAKING_B2_TARGET_DURATION_SEC * 1000;
  const question = getSpeakingB2Question(working.currentQuestionId);
  const followUp = followUpFor(working, question);
  const usedFollowUp = Boolean(working.followUpUsed[working.currentQuestionId]);

  if (
    !timeUp &&
    question &&
    followUp &&
    !usedFollowUp &&
    wordCount(answer) < MIN_WORDS_FOR_DEVELOPED_ANSWER
  ) {
    return {
      session: {
        ...working,
        state: transitionSpeakingB2(working.state, 'ASKING'),
        followUpUsed: { ...working.followUpUsed, [working.currentQuestionId]: true },
        reaskCount: 0,
      },
      examinerText: followUp,
      questionId: working.currentQuestionId,
      validation: 'authorised-follow-up',
      followUp,
    };
  }

  if (timeUp) return finishPart(working);

  return nextPaperQuestion(working, 'accepted');
}

function advanceAfterIntro(session) {
  const first = questionStep(session, 0);
  if (!first) return finishPart(session);
  return {
    session: {
      ...session,
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
