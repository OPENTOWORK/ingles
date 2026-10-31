import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import {
  SPEAKING_B2_FOLLOW_UP_SYSTEM,
  buildSpeakingB2FollowUpMessage,
  checkSpeakingB2GeneratedLine,
  readSpeakingB2FollowUpMove,
  speakingB2GeneratedLineIsSafe,
} from '../domain/contextual-follow-up.js';
import { pairSpeakingB2Answers } from '../domain/issue-validator.js';
import {
  SPEAKING_B2_EXAM_CODE,
  SPEAKING_B2_INTRODUCTION,
  getSpeakingB2Question,
} from '../domain/question-bank/sp-ex001-part1.js';
import {
  beginIntroduction,
  countedSpeakingB2TurnMs,
  createSpeakingB2SessionState,
  examinerLineIsAuthorised,
  resolveSpeakingB2Turn,
  speakingB2FollowUpContext,
  speakingB2MeasuredAnswerMs,
  startAudioCheck,
} from '../services/coordinator.js';
import {
  composeSpeakingB2ExaminerMove,
  speakingB2ContextualFollowUpsEnabled,
} from '../services/contextual-follow-up.js';
import { buildSessionWritePayload, hydrateSpeakingB2Session } from '../services/session-persistence.js';
import { buildSpeakingB2SessionPlan } from '../services/session-plan.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A live session where the examiner has just asked the planned opener. */
function sessionAtOpener(seed = 42) {
  const plan = buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, localHour: 11, random: seeded(seed) });
  const opened = beginIntroduction(
    startAudioCheck({ ...createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE }), plan }),
  );
  const named = resolveSpeakingB2Turn({
    session: { ...opened.session, state: 'LISTENING' },
    transcript: 'My name is Alex.',
  });
  const turns = [
    { role: 'examiner', questionId: opened.questionId, transcript: opened.examinerText },
    { role: 'candidate', questionId: opened.questionId, transcript: 'My name is Alex.' },
    { role: 'examiner', questionId: named.questionId, transcript: named.examinerText },
  ];
  return { plan, session: { ...named.session, state: 'LISTENING', turns } };
}

const BEACH_ANSWER = 'I live in Valencia, near the beach.';
const BEACH_FOLLOW_UP = 'You mentioned the beach. How often do you go there?';

function answering(result) {
  return { ...result.session, state: 'LISTENING' };
}

describe('speaking B2 contextual follow-ups', () => {
  it('follows up on what the candidate said and then returns to the plan', async () => {
    const { plan, session } = sessionAtOpener();
    const context = speakingB2FollowUpContext(session, { transcript: BEACH_ANSWER, speakingMs: 4000 });
    assert.ok(context);
    assert.equal(context.answer, BEACH_ANSWER);
    assert.equal(context.question, getSpeakingB2Question(plan.steps[0].questionId).question);
    assert.equal(context.nextQuestion, getSpeakingB2Question(plan.steps[1].questionId).question);
    assert.ok(context.askedLines.includes(plan.steps[0].line));

    const move = await composeSpeakingB2ExaminerMove(context, {
      enabled: true,
      complete: async ({ system, user }) => {
        assert.equal(system, SPEAKING_B2_FOLLOW_UP_SYSTEM);
        assert.match(user, /Candidate: I live in Valencia, near the beach\./);
        assert.match(user, /Next planned question \(keep its topic for later\)/);
        return JSON.stringify({ action: 'follow_up', line: BEACH_FOLLOW_UP });
      },
    });
    assert.deepEqual(move, { action: 'follow_up', line: BEACH_FOLLOW_UP });

    const followed = resolveSpeakingB2Turn({ session, transcript: BEACH_ANSWER, speakingMs: 4000, examinerMove: move });
    assert.equal(followed.examinerText, BEACH_FOLLOW_UP);
    assert.equal(followed.validation, 'contextual-follow-up');
    assert.equal(followed.generated, true);
    assert.equal(followed.questionId, plan.steps[0].questionId);
    assert.equal(followed.session.followUpPrompt, 'How often do you go there?');
    assert.equal(speakingB2GeneratedLineIsSafe(followed.examinerText), true);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, followed.examinerText), false);

    const reply = 'About twice a week in summer, usually with my friends.';
    assert.equal(speakingB2FollowUpContext(answering(followed), { transcript: reply }), null);
    const next = resolveSpeakingB2Turn({ session: answering(followed), transcript: reply, speakingMs: 4000 });
    assert.equal(next.examinerText, plan.steps[1].line);
    assert.equal(Boolean(next.generated), false);
    assert.equal(next.session.followUpPrompt, null);
  });

  it('nudges once after silence, then moves on, and reminds once about English', () => {
    const { plan, session } = sessionAtOpener();
    const move = { action: 'follow_up', line: BEACH_FOLLOW_UP };
    const followed = resolveSpeakingB2Turn({ session, transcript: BEACH_ANSWER, examinerMove: move });

    const silent = resolveSpeakingB2Turn({ session: answering(followed), transcript: '', silence: true, speakingMs: 20000 });
    assert.equal(silent.validation, 'silence-nudge');
    assert.equal(silent.examinerText, 'Take your time. How often do you go there?');
    assert.equal(silent.generated, true);
    assert.equal(silent.session.candidateSpeakingMs, followed.session.candidateSpeakingMs);
    assert.equal(speakingB2GeneratedLineIsSafe(silent.examinerText), true);

    const moved = resolveSpeakingB2Turn({ session: answering(silent), transcript: '', silence: true });
    assert.equal(moved.validation, 'silence-skip');
    assert.equal(moved.examinerText, plan.steps[1].line);
    assert.equal(moved.examinerText.includes('How often do you go there?'), false);

    const spanish = resolveSpeakingB2Turn({ session: answering(followed), transcript: 'Voy mucho porque me gusta.' });
    assert.equal(spanish.examinerText, 'Please answer in English. How often do you go there?');
    assert.equal(spanish.generated, true);
    assert.equal(speakingB2GeneratedLineIsSafe(spanish.examinerText), true);
    const spanishAgain = resolveSpeakingB2Turn({
      session: answering(spanish),
      transcript: 'Sigo en español porque me gusta.',
    });
    assert.equal(spanishAgain.validation, 'non-english-skip');
    assert.equal(spanishAgain.examinerText, plan.steps[1].line);
  });

  it('lets the model move on and keeps the script when the model gives nothing', () => {
    const { plan, session } = sessionAtOpener();
    const moved = resolveSpeakingB2Turn({ session, transcript: 'Valencia.', examinerMove: { action: 'move_on' } });
    assert.equal(moved.examinerText, plan.steps[1].line);

    const scripted = resolveSpeakingB2Turn({ session, transcript: 'Valencia.', examinerMove: null });
    assert.equal(scripted.validation, 'authorised-follow-up');
    assert.equal(scripted.examinerText, plan.steps[0].followUp);
    assert.equal(Boolean(scripted.generated), false);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, scripted.examinerText), true);

    const again = resolveSpeakingB2Turn({ session: answering(scripted), transcript: '', silence: true });
    assert.equal(again.validation, 'silence-nudge');
    assert.equal(again.examinerText, `Take your time. ${plan.steps[0].followUp}`);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, again.examinerText), true);
    const skipped = resolveSpeakingB2Turn({ session: answering(again), transcript: '', silence: true });
    assert.equal(skipped.examinerText, plan.steps[1].line);
  });

  it('leaves the name, silence, Spanish, unclear audio, time up and fixture sessions to the script', () => {
    const { session } = sessionAtOpener();
    const answer = { transcript: BEACH_ANSWER };
    assert.equal(speakingB2FollowUpContext(session, { transcript: '' }), null);
    assert.equal(speakingB2FollowUpContext(session, { ...answer, silence: true }), null);
    assert.equal(speakingB2FollowUpContext(session, { transcript: 'Vivo en Valencia, me gusta mucho.' }), null);
    assert.equal(speakingB2FollowUpContext(session, { ...answer, uncertain: true }), null);
    assert.equal(
      speakingB2FollowUpContext({ ...session, candidateSpeakingMs: 119000 }, { ...answer, speakingMs: 2000 }),
      null,
    );
    assert.equal(speakingB2FollowUpContext({ ...session, plan: null }, answer), null);
    assert.equal(
      speakingB2FollowUpContext({ ...session, currentQuestionId: SPEAKING_B2_INTRODUCTION.id }, answer),
      null,
    );
  });

  it('falls back to the script when the model is off, slow, failing or unsafe', async () => {
    const { session } = sessionAtOpener();
    const context = speakingB2FollowUpContext(session, { transcript: BEACH_ANSWER });
    const never = () => new Promise(() => {});
    assert.equal(await composeSpeakingB2ExaminerMove(context, { enabled: true, timeoutMs: 20, complete: never }), null);
    assert.equal(
      await composeSpeakingB2ExaminerMove(context, {
        enabled: true,
        complete: async () => {
          throw new Error('down');
        },
      }),
      null,
    );
    assert.equal(
      await composeSpeakingB2ExaminerMove(context, {
        enabled: true,
        complete: async () => '{"action":"follow_up","line":"Great answer! Your grammar is excellent. Why?"}',
      }),
      null,
    );
    let called = false;
    const spy = async () => {
      called = true;
      return '{"action":"move_on"}';
    };
    assert.equal(await composeSpeakingB2ExaminerMove(context, { enabled: false, complete: spy }), null);
    assert.equal(await composeSpeakingB2ExaminerMove(null, { enabled: true, complete: spy }), null);
    assert.equal(called, false);
    assert.deepEqual(await composeSpeakingB2ExaminerMove(context, { enabled: true, complete: spy }), { action: 'move_on' });

    assert.equal(speakingB2ContextualFollowUpsEnabled({ OPENAI_API_KEY: 'key' }), true);
    assert.equal(
      speakingB2ContextualFollowUpsEnabled({ OPENAI_API_KEY: 'key', SPEAKING_B2_CONTEXTUAL_FOLLOW_UPS: 'off' }),
      false,
    );
    assert.equal(speakingB2ContextualFollowUpsEnabled({}), false);
  });

  it('speaks only one short, neutral question in English', () => {
    for (const line of [
      'What do you like most about living in Valencia?',
      BEACH_FOLLOW_UP,
      'I see. Who taught you to cook like that?',
      'Right. What is it like living in Málaga?',
    ]) {
      assert.equal(checkSpeakingB2GeneratedLine(line).ok, true, line);
    }
    const rejected = {
      'Great! Why do you like it?': 'characters',
      'Your grammar is very good. Why do you like it?': 'blocked-word',
      'Why? And how often do you go there?': 'not-one-question',
      'Tell me more about that.': 'not-one-question',
      '¿Qué te gusta hacer?': 'characters',
      'Te gusta vivir en Valencia?': 'language',
      'Do you have a girlfriend there?': 'blocked-word',
      'I think the beach is the best part. Do you agree?': 'blocked-phrase',
      'Which do you think matters more to you at the moment, your family, your friends or your studies, and why do you feel that way?':
        'length',
      'Right. I see. You mentioned it. Why do you like it?': 'sentences',
      '你喜欢什么?': 'characters',
    };
    for (const [line, reason] of Object.entries(rejected)) {
      assert.equal(checkSpeakingB2GeneratedLine(line).reason, reason, line);
    }
    assert.equal(
      checkSpeakingB2GeneratedLine('Thanks. Where are you from?', { askedLines: ['Thank you. Where are you from?'] }).reason,
      'repeated',
    );
    assert.equal(
      checkSpeakingB2GeneratedLine('What kind of music do you like?', { nextQuestion: 'What kind of music do you like?' })
        .reason,
      'repeated',
    );
    assert.equal(
      checkSpeakingB2GeneratedLine('What do you enjoy most about the beach?', {
        askedLines: ['Thanks. What do you enjoy most about your free time?'],
      }).reason,
      'repeated',
    );
    assert.equal(
      checkSpeakingB2GeneratedLine('Examiner: "How long have you lived there?"').line,
      'How long have you lived there?',
    );
    assert.equal(speakingB2GeneratedLineIsSafe('Could you say that again? Your grammar is excellent. Why?'), false);
  });

  it('reads the model reply as JSON and ignores anything else', () => {
    assert.deepEqual(
      readSpeakingB2FollowUpMove('```json\n{"action":"follow_up","line":"How long have you lived there?"}\n```'),
      { action: 'follow_up', line: 'How long have you lived there?' },
    );
    assert.deepEqual(readSpeakingB2FollowUpMove('{"action":"move on"}'), { action: 'move_on' });
    assert.deepEqual(readSpeakingB2FollowUpMove('not json'), { action: 'invalid', reason: 'json' });
    assert.deepEqual(readSpeakingB2FollowUpMove('{"action":"teach"}'), { action: 'invalid', reason: 'action' });
  });

  it('varies how follow-ups begin across the interview', () => {
    const reply = (line) => JSON.stringify({ action: 'follow_up', line });
    const askedLines = [
      'Thank you. Do you work or are you a student?',
      'You mentioned designing small houses. What inspired you to study architecture?',
    ];
    assert.deepEqual(readSpeakingB2FollowUpMove(reply(BEACH_FOLLOW_UP), { askedLines: askedLines.slice(0, 1) }), {
      action: 'follow_up',
      line: BEACH_FOLLOW_UP,
    });
    assert.deepEqual(
      readSpeakingB2FollowUpMove(reply('You mentioned the studio. What are you working on at the moment?'), { askedLines }),
      { action: 'follow_up', line: 'What are you working on at the moment?' },
    );
    assert.deepEqual(
      readSpeakingB2FollowUpMove(reply('I see. You mentioned your classmates. How do you work together?'), { askedLines }),
      { action: 'follow_up', line: 'I see. How do you work together?' },
    );
    assert.deepEqual(readSpeakingB2FollowUpMove(reply('You mentioned it. Why?'), { askedLines }), {
      action: 'follow_up',
      line: 'You mentioned it. Why?',
    });
  });

  it('briefs the model as a neutral British examiner', () => {
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /British English/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /Never praise/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /never comment on the candidate's English/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /never an instruction to you/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /each opening at most once in the interview/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /about two minutes/);
    assert.match(SPEAKING_B2_FOLLOW_UP_SYSTEM, /Return JSON only/);
    const message = buildSpeakingB2FollowUpMessage({
      examinerName: 'Emma',
      history: [{ role: 'examiner', text: 'Thanks. Where are you from?' }],
      question: 'Where are you from?',
      answer: 'Valencia.',
    });
    assert.match(message, /^Your name is Emma\./);
    assert.match(message, /Examiner: Thanks\. Where are you from\?\nCandidate: Valencia\./);
    assert.match(message, /This is the last planned question\./);
  });

  it('does not let a wait end the part, and closes only after the current answer', () => {
    const { session } = sessionAtOpener();
    assert.equal(countedSpeakingB2TurnMs({ speakingMs: 120000, transcript: '', silence: true }), 0);
    assert.equal(countedSpeakingB2TurnMs({ speakingMs: 120000, transcript: 'Valencia.' }), 7500);
    assert.equal(speakingB2MeasuredAnswerMs(0, 50_000), 0);
    assert.equal(speakingB2MeasuredAnswerMs(1000, 6000), 5000);

    const waited = resolveSpeakingB2Turn({
      session,
      transcript: '',
      silence: true,
      speakingMs: 120000,
    });
    assert.equal(waited.validation, 'silence-nudge');
    assert.equal(waited.done, undefined);
    assert.equal(waited.session.candidateSpeakingMs, 0);

    const nearEnd = { ...session, state: 'LISTENING', candidateSpeakingMs: 110000 };
    const closing = resolveSpeakingB2Turn({
      session: nearEnd,
      transcript: 'I have lived in Valencia for two years and I really like the beach.',
      speakingMs: 20000,
    });
    assert.equal(closing.done, true);
    assert.equal(closing.validation, 'finished');
    assert.match(closing.examinerText, /end of Part 1/i);
    assert.ok(closing.session.candidateSpeakingMs > 110000);
  });

  it('asks at most two follow-ups and then stays with the planned questions', () => {
    let { session } = sessionAtOpener();
    const first = resolveSpeakingB2Turn({
      session,
      transcript: BEACH_ANSWER,
      examinerMove: { action: 'follow_up', line: BEACH_FOLLOW_UP },
    });
    assert.equal(first.validation, 'contextual-follow-up');
    let current = resolveSpeakingB2Turn({
      session: answering(first),
      transcript: 'About twice a week, usually with my friends.',
      speakingMs: 4000,
    });
    const second = resolveSpeakingB2Turn({
      session: answering(current),
      transcript: BEACH_ANSWER,
      examinerMove: { action: 'follow_up', line: 'How long have you lived there?' },
    });
    assert.equal(second.validation, 'contextual-follow-up');
    current = resolveSpeakingB2Turn({
      session: answering(second),
      transcript: 'I have lived there for two years with my family.',
      speakingMs: 4000,
    });
    assert.equal(speakingB2FollowUpContext(answering(current), { transcript: BEACH_ANSWER, speakingMs: 4000 }), null);
    const blocked = resolveSpeakingB2Turn({
      session: answering(current),
      transcript: BEACH_ANSWER,
      speakingMs: 4000,
      examinerMove: { action: 'follow_up', line: 'Who do you usually go there with?' },
    });
    assert.notEqual(blocked.validation, 'contextual-follow-up');
    assert.equal(Boolean(blocked.done), false);
  });

  it('judges each answer against the examiner line just before it', () => {
    const turns = [
      { role: 'examiner', questionId: 'Q', transcript: 'Thanks. Where are you from?' },
      { role: 'candidate', questionId: 'Q', transcript: 'Valencia.' },
      { role: 'examiner', questionId: 'Q', transcript: 'What do you like most about living there?' },
      { role: 'candidate', questionId: 'Q', transcript: 'The beach.' },
    ];
    assert.deepEqual(
      pairSpeakingB2Answers(turns, () => null).map((turn) => turn.question),
      ['Thanks. Where are you from?', 'What do you like most about living there?'],
    );
  });

  it('keeps a pending follow-up through a metadata round trip', () => {
    const { metadata } = buildSessionWritePayload({
      id: 'sess-1',
      state: 'ASKING',
      followUpPrompt: 'How often do you go there?',
      followUpGenerated: true,
    }).v2;
    const hydrated = hydrateSpeakingB2Session({ id: 'sess-1', state: 'ASKING', metadata }, []);
    assert.equal(hydrated.followUpPrompt, 'How often do you go there?');
    assert.equal(hydrated.followUpGenerated, true);
    const nudged = buildSessionWritePayload({ id: 'sess-1', state: 'ASKING', silenceNudges: 2 }).v2;
    assert.equal(hydrateSpeakingB2Session({ id: 'sess-1', state: 'ASKING', metadata: nudged.metadata }, []).silenceNudges, 2);
  });

  it('voices a generated line only for the session that said it', () => {
    const tts = readFileSync(path.join(root, 'src/app/api/speaking-b2/tts/route.js'), 'utf8');
    assert.match(tts, /examinerSaidLineInSession/);
    assert.match(tts, /authorizeSpeakingSession/);
    const turn = readFileSync(path.join(root, 'src/app/api/speaking-b2/turn/route.js'), 'utf8');
    assert.match(turn, /composeSpeakingB2ExaminerMove/);
    assert.match(turn, /speakingB2GeneratedLineIsSafe/);
    assert.match(turn, /SPEAKING_B2_FOLLOW_UP_VALIDATION/);
    assert.match(turn, /examinerAudio/);
    const motor = readFileSync(path.join(root, 'src/features/speaking-b2-motor/ui/SpeakingMotorV1.js'), 'utf8');
    assert.match(motor, /prefetchSpeakingB2Line\(line, exam\.code, examinerIdRef\.current, ttsSession\(\)\)/);
    assert.match(motor, /primeSpeakingB2Line\(data\.examinerText, examinerIdRef\.current, data\.examinerAudio\)/);
  });
});
