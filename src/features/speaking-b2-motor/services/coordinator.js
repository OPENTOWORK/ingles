import { assessB2Part1AnswerLanguage } from '../domain/language-check.js';
import { isTerminalSpeakingB2State, transitionSpeakingB2 } from '../domain/exam-state-machine.js';
import {
  SPEAKING_B2_INTRODUCTION,
  SPEAKING_B2_TARGET_DURATION_SEC,
  getSpeakingB2Question,
  listApprovedSpeakingB2Questions,
} from '../domain/question-bank/sp-ex001-part1.js';

const MIN_WORDS_FOR_DEVELOPED_ANSWER = 8;

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
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
    examinerText: SPEAKING_B2_INTRODUCTION.spokenText,
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

  const questions = listApprovedSpeakingB2Questions(session.examCode);
  const answer = String(transcript || '').trim();
  const language = assessB2Part1AnswerLanguage(answer);

  if (working.currentQuestionId === SPEAKING_B2_INTRODUCTION.id) {
    return advanceAfterIntro(working, questions);
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
    return nextPaperQuestion(working, questions, 'silence-skip');
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
  const followUps = question?.allowedFollowUps || [];
  const usedFollowUp = Boolean(working.followUpUsed[working.currentQuestionId]);

  if (
    !timeUp &&
    question &&
    followUps.length > 0 &&
    !usedFollowUp &&
    wordCount(answer) < MIN_WORDS_FOR_DEVELOPED_ANSWER
  ) {
    const followUp = followUps[0];
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

  return nextPaperQuestion(working, questions, 'accepted');
}

function advanceAfterIntro(session, questions) {
  const first = questions[0];
  if (!first) return finishPart(session);
  return {
    session: {
      ...session,
      state: transitionSpeakingB2(session.state, 'ASKING'),
      questionIndex: 0,
      currentQuestionId: first.id,
      reaskCount: 0,
    },
    examinerText: `Thank you. ${first.question}`,
    questionId: first.id,
    validation: 'intro-accepted',
  };
}

function nextPaperQuestion(session, questions, validation) {
  const nextIndex = (session.questionIndex || 0) + 1;
  const next = questions[nextIndex];
  if (!next) return finishPart({ ...session, validation });
  return {
    session: {
      ...session,
      state: transitionSpeakingB2(session.state, 'ASKING'),
      questionIndex: nextIndex,
      currentQuestionId: next.id,
      reaskCount: 0,
    },
    examinerText: `Thank you. ${next.question}`,
    questionId: next.id,
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
    examinerText: SPEAKING_B2_INTRODUCTION.closingText,
    questionId: null,
    done: true,
    validation: 'finished',
  };
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
  const questions = listApprovedSpeakingB2Questions(examCode);
  const lines = [
    SPEAKING_B2_INTRODUCTION.spokenText,
    SPEAKING_B2_INTRODUCTION.closingText,
    'Please answer in English.',
    'Could you say that again?',
  ];
  for (const question of questions) {
    lines.push(question.question);
    lines.push(...question.allowedFollowUps);
  }
  return lines;
}

export function examinerLineIsAuthorised(examCode, spokenText) {
  const text = String(spokenText || '').trim();
  if (!text) return false;
  const allowed = listAuthorisedExaminerLines(examCode);
  return allowed.some((line) => text === line || text.endsWith(line) || text.includes(line));
}
