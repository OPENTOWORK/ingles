import {
  beginAsking,
  beginIntroduction,
  beginListening,
  createSpeakingB2SessionState,
  examinerLineIsAuthorised,
  finishPart,
  markCompleted,
  markProcessing,
  resolveSpeakingB2Turn,
  startAudioCheck,
} from '../services/coordinator.js';
import {
  SPEAKING_B2_EXAM_CODE,
  SPEAKING_B2_INTRODUCTION,
  listApprovedSpeakingB2Questions,
} from '../domain/question-bank/sp-ex001-part1.js';
import { runSpeakingB2Complete } from '../services/evaluation/run-complete.js';
import { loadSpeakingB2HumanBank } from './human/bank.js';

export const SPEAKING_B2_SCRIPTED_INTERVIEW_ANSWERS = {
  'SP-EX001-P1-INTRO': 'My name is Alex Rivera.',
  'SP-EX001-P1-Q01':
    'The part I enjoy most is being able to explain my ideas more clearly. For example, I can now talk about my studies and my plans without stopping after every sentence.',
  'SP-EX001-P1-Q02':
    'At the weekend I usually meet a friend for coffee and then I prepare food for the week if I have time.',
  'SP-EX001-P1-Q03':
    'I prefer visiting new places. First, I like the surprise of a different city. Also, I usually learn something practical, like how to ask for directions.',
  'SP-EX001-P1-Q04':
    'Now I send a message or a voice note when I cannot meet my friends. It is faster, but the conversation is often shorter.',
  'SP-EX001-P1-Q05': 'Yes, pottery, because I find it relaxing after a long week.',
};

function recordTurn(session, turn) {
  session.turns = [...(session.turns || []), turn];
  return session;
}

export function playScriptedSpeakingB2Interview({
  answers = SPEAKING_B2_SCRIPTED_INTERVIEW_ANSWERS,
} = {}) {
  let session = createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE });
  session.fixtureMode = true;
  session.persisted = false;
  session.turns = [];
  session = startAudioCheck(session);

  const opened = beginIntroduction(session);
  session = opened.session;
  session = recordTurn(session, {
    role: 'examiner',
    questionId: opened.questionId,
    transcript: opened.examinerText,
    source: 'SCRIPT',
  });

  const paper = listApprovedSpeakingB2Questions(SPEAKING_B2_EXAM_CODE);
  const expectedOrder = [SPEAKING_B2_INTRODUCTION.id, ...paper.map((item) => item.id)];
  const associations = [];
  const asked = [opened.questionId];

  for (const questionId of expectedOrder) {
    const answer = answers[questionId];
    if (answer == null) break;
    if (session.currentQuestionId !== questionId) {
      associations.push({
        expectedQuestionId: questionId,
        recordedQuestionId: session.currentQuestionId,
        matched: false,
      });
      break;
    }
    session = beginListening(session);
    session = recordTurn(session, {
      role: 'candidate',
      questionId: session.currentQuestionId,
      transcript: answer,
      source: 'TYPED',
      hasAudio: false,
      speakingMs: 4500,
    });
    associations.push({
      expectedQuestionId: questionId,
      recordedQuestionId: session.currentQuestionId,
      matched: true,
    });
    const resolved = resolveSpeakingB2Turn({
      session,
      transcript: answer,
      speakingMs: 4500,
    });
    session = resolved.session;
    if (resolved.examinerText) {
      if (!examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, resolved.examinerText)) {
        throw new Error('Unauthorised examiner line in scripted interview');
      }
      session = recordTurn(session, {
        role: 'examiner',
        questionId: resolved.questionId,
        transcript: resolved.examinerText,
        source: 'SCRIPT',
      });
      asked.push(resolved.questionId);
      if (resolved.session.state !== 'FINISHING' && resolved.examinerText) {
        session = beginAsking(session, resolved.examinerText, resolved.questionId);
      }
    }
    if (resolved.done) break;
  }

  if (session.state !== 'FINISHING') {
    const closed = finishPart(session);
    session = closed.session;
    if (closed.examinerText) {
      session = recordTurn(session, {
        role: 'examiner',
        questionId: null,
        transcript: closed.examinerText,
        source: 'SCRIPT',
      });
    }
  }

  const candidateTurns = session.turns.filter((turn) => turn.role === 'candidate');
  const examinerTurns = session.turns.filter((turn) => turn.role === 'examiner');
  const closing = examinerTurns[examinerTurns.length - 1]?.transcript || '';

  return {
    id: 'scripted-sp-ex001-part1',
    authenticity: 'scripted-text',
    humanInterview: false,
    warning: 'Scripted multi-turn using reference text. Not a complete human interview.',
    session,
    expectedQuestionOrder: expectedOrder,
    askedQuestionIds: asked.filter(Boolean),
    associations,
    associationOk: associations.length > 0 && associations.every((item) => item.matched),
    orderOk: asked.filter(Boolean).slice(0, expectedOrder.length).every((id, index) => id === expectedOrder[index]),
    closed: session.state === 'FINISHING',
    closingText: closing,
    closingOk: closing === SPEAKING_B2_INTRODUCTION.closingText,
    candidateTurnCount: candidateTurns.length,
    examinerTurnCount: examinerTurns.length,
  };
}

export async function evaluateScriptedSpeakingB2Interview(options = {}) {
  const played = playScriptedSpeakingB2Interview(options);
  const evaluate = options.evaluate || ((session) => runSpeakingB2Complete({ session, persist: false }));
  let report = null;
  let technicalOk = true;
  try {
    const processing = markProcessing(played.session);
    report = await evaluate(processing);
    played.session = markCompleted({ ...processing, report });
  } catch {
    technicalOk = false;
  }
  return {
    ...played,
    report,
    technicalOk,
    persist: false,
    quotaCharged: false,
    humanInterview: false,
  };
}

export function assessSpeakingB2HumanInterviewCoverage(samples = []) {
  const paper = listApprovedSpeakingB2Questions(SPEAKING_B2_EXAM_CODE).map((item) => item.id);
  const bySpeaker = new Map();
  for (const sample of samples) {
    if (sample.authenticity !== 'human-authorized') continue;
    const key = `${sample.speakerId || 'unknown'}::${sample.sessionId || 'isolated'}`;
    const group = bySpeaker.get(key) || [];
    group.push(sample);
    bySpeaker.set(key, group);
  }
  for (const [key, group] of bySpeaker) {
    const ids = new Set(group.map((sample) => sample.questionId));
    const complete = paper.every((id) => ids.has(id));
    const live = group.every((sample) => sample.captureKind === 'live-interview') && complete;
    if (live) {
      return {
        completeHumanInterview: true,
        assembledFromIsolatedTakes: false,
        speakerKey: key,
        coveredQuestionIds: [...ids],
      };
    }
    if (complete) {
      return {
        completeHumanInterview: false,
        assembledFromIsolatedTakes: true,
        speakerKey: key,
        coveredQuestionIds: [...ids],
      };
    }
  }
  return {
    completeHumanInterview: false,
    assembledFromIsolatedTakes: false,
    speakerKey: null,
    coveredQuestionIds: [...new Set(samples.map((sample) => sample.questionId))],
  };
}

export function describeSpeakingB2HumanInterviewReadiness(options = {}) {
  const bank = loadSpeakingB2HumanBank(options);
  const coverage = assessSpeakingB2HumanInterviewCoverage(bank.samples);
  return {
    ...coverage,
    humanInterview: coverage.completeHumanInterview,
    status: coverage.completeHumanInterview ? 'REVIEW' : 'PENDING',
    reason: coverage.completeHumanInterview
      ? 'authorized_live_interview_present'
      : coverage.assembledFromIsolatedTakes
        ? 'isolated_takes_only'
        : 'no_authorized_human_recordings',
  };
}
