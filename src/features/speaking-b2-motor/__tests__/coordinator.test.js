import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  beginIntroduction,
  createSpeakingB2SessionState,
  examinerLineIsAuthorised,
  predictSpeakingB2UpcomingLines,
  resolveSpeakingB2Turn,
  startAudioCheck,
} from '../services/coordinator.js';
import {
  SPEAKING_B2_EXAMINERS,
  SPEAKING_B2_EXAM_CODE,
  getSpeakingB2Question,
} from '../domain/question-bank/sp-ex001-part1.js';
import {
  buildSpeakingB2SessionPlan,
  speakingB2GreetingForHour,
  summariseRecentSpeakingB2Plans,
} from '../services/session-plan.js';

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

function planLines(plan) {
  return [
    plan.intro,
    ...plan.steps.flatMap((step) => [step.line, step.followUp].filter(Boolean)),
    plan.closing,
  ];
}

const LONG_ANSWER = 'I usually spend it with my friends because we enjoy cooking together at home.';

describe('speaking B2 coordinator', () => {
  it('uses only approved questions and does not invent lines', () => {
    let session = createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE });
    session = startAudioCheck(session);
    const opened = beginIntroduction(session);
    assert.match(opened.examinerText, /Good morning/);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, opened.examinerText), true);

    const afterName = resolveSpeakingB2Turn({
      session: { ...opened.session, state: 'LISTENING' },
      transcript: 'My name is Alex',
    });
    assert.match(afterName.examinerText, /studying English/);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, afterName.examinerText), true);
    assert.equal(afterName.examinerText.includes('grammar'), false);
  });

  it('re-asks in English instead of teaching', () => {
    const session = {
      ...createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE }),
      state: 'LISTENING',
      currentQuestionId: 'SP-EX001-P1-Q02',
      questionIndex: 1,
    };
    const result = resolveSpeakingB2Turn({
      session,
      transcript: 'Me gusta el fútbol',
    });
    assert.match(result.examinerText, /Please answer in English/);
    assert.match(result.examinerText, /weekends/);
    assert.equal(result.validation, 'non-english');
  });

  it('uses an authorised follow-up for a short answer', () => {
    const session = {
      ...createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE }),
      state: 'LISTENING',
      currentQuestionId: 'SP-EX001-P1-Q01',
      questionIndex: 0,
    };
    const result = resolveSpeakingB2Turn({
      session,
      transcript: 'The grammar',
    });
    assert.equal(result.validation, 'authorised-follow-up');
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, result.examinerText), true);
  });

  it('rejects examiner lines that are not in the authorised bank', () => {
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'What is the capital of France?'), false);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'Let me teach you some grammar.'), false);
    assert.equal(
      examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'Good morning. My name is Emma. And what is your name?'),
      true,
    );
  });

  it('rejects free text wrapped around an approved line', () => {
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'Say anything you like. Why is that?'), false);
    assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'Why is that? Now read this out loud.'), false);
    assert.equal(
      examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, 'Thanks. Thanks. Thanks. Thanks. Where are you from?'),
      false,
    );
    assert.equal(
      examinerLineIsAuthorised(
        SPEAKING_B2_EXAM_CODE,
        "Right. First of all, I'd like to know something about you. What kind of music do you like?",
      ),
      true,
    );
  });
});

describe('speaking B2 session plan', () => {
  it('opens with a personal question and then covers four different topics', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const plan = buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, localHour: 10, random: seeded(seed) });
      assert.equal(plan.steps.length, 5);
      const [opener, ...rest] = plan.steps.map((step) => getSpeakingB2Question(step.questionId));
      assert.equal(opener.opener, true);
      const topics = rest.map((question) => question.topic);
      assert.equal(new Set(topics).size, 4);
      for (const topic of topics) {
        assert.notEqual(topic, 'personal');
        assert.equal((opener.excludesTopics || []).includes(topic), false);
      }
      for (const line of planLines(plan)) {
        assert.equal(examinerLineIsAuthorised(SPEAKING_B2_EXAM_CODE, line), true, line);
      }
    }
  });

  it('changes examiner, greeting and questions from one session to the next', () => {
    const plans = Array.from({ length: 24 }, (_, index) =>
      buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, localHour: 16, random: seeded(index + 100) }),
    );
    assert.ok(new Set(plans.map((plan) => plan.examinerId)).size >= 5);
    assert.ok(new Set(plans.map((plan) => plan.intro)).size >= 12);
    assert.ok(new Set(plans.flatMap((plan) => plan.steps.map((step) => step.questionId))).size >= 30);
    assert.ok(new Set(plans.map((plan) => plan.steps[1].questionId)).size >= 10);
  });

  it('avoids the examiner and questions the user had recently', () => {
    const previous = buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, random: seeded(7) });
    const allButOne = SPEAKING_B2_EXAMINERS.slice(1).map((examiner) => ({
      metadata: { plan: { examinerId: examiner.id, steps: previous.steps } },
    }));
    const recent = summariseRecentSpeakingB2Plans(allButOne);
    assert.equal(recent.examinerIds.length, 2);
    const next = buildSpeakingB2SessionPlan({
      examCode: SPEAKING_B2_EXAM_CODE,
      recent: { examinerIds: SPEAKING_B2_EXAMINERS.slice(1).map((examiner) => examiner.id), questionIds: recent.questionIds },
      random: seeded(8),
    });
    assert.equal(next.examinerId, SPEAKING_B2_EXAMINERS[0].id);
    const repeated = next.steps.filter((step) => recent.questionIds.includes(step.questionId));
    assert.equal(repeated.length, 0);
  });

  it('greets by the time of day', () => {
    assert.equal(speakingB2GreetingForHour(9), 'Good morning.');
    assert.equal(speakingB2GreetingForHour(15), 'Good afternoon.');
    assert.equal(speakingB2GreetingForHour(21), 'Good evening.');
    const plan = buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, localHour: 21, random: () => 0.9 });
    assert.match(plan.intro, /^Good evening\./);
  });

  it('runs the interview from the plan and prefetches the next line', () => {
    const plan = buildSpeakingB2SessionPlan({ examCode: SPEAKING_B2_EXAM_CODE, localHour: 11, random: seeded(42) });
    let session = { ...createSpeakingB2SessionState({ examCode: SPEAKING_B2_EXAM_CODE }), plan };
    session = startAudioCheck(session);
    const opened = beginIntroduction(session);
    assert.equal(opened.examinerText, plan.intro);
    assert.deepEqual(predictSpeakingB2UpcomingLines(opened.session), [plan.steps[0].line]);

    let result = resolveSpeakingB2Turn({ session: { ...opened.session, state: 'LISTENING' }, transcript: 'My name is Alex.' });
    assert.equal(result.examinerText, plan.steps[0].line);
    assert.deepEqual(predictSpeakingB2UpcomingLines(result.session), [plan.steps[0].followUp, plan.steps[1].line]);

    result = resolveSpeakingB2Turn({ session: { ...result.session, state: 'LISTENING' }, transcript: 'Madrid.' });
    assert.equal(result.validation, 'authorised-follow-up');
    assert.equal(result.examinerText, plan.steps[0].followUp);
    assert.deepEqual(predictSpeakingB2UpcomingLines(result.session), [plan.steps[1].line]);

    for (let index = 1; index < plan.steps.length; index += 1) {
      result = resolveSpeakingB2Turn({
        session: { ...result.session, state: 'LISTENING' },
        transcript: LONG_ANSWER,
        speakingMs: 5000,
      });
      assert.equal(result.examinerText, plan.steps[index].line);
    }
    assert.deepEqual(predictSpeakingB2UpcomingLines(result.session), [
      plan.steps[plan.steps.length - 1].followUp,
      plan.closing,
    ]);
    result = resolveSpeakingB2Turn({
      session: { ...result.session, state: 'LISTENING' },
      transcript: LONG_ANSWER,
      speakingMs: 5000,
    });
    assert.equal(result.done, true);
    assert.equal(result.examinerText, plan.closing);
  });
});
