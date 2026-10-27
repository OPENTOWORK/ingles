import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  beginIntroduction,
  createSpeakingB2SessionState,
  examinerLineIsAuthorised,
  resolveSpeakingB2Turn,
  startAudioCheck,
} from '../services/coordinator.js';
import { SPEAKING_B2_EXAM_CODE } from '../domain/question-bank/sp-ex001-part1.js';

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
});
