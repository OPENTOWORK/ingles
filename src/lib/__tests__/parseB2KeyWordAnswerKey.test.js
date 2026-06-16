import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  parseB2KeyWordAnswerKeyRows,
  parseKeyWordRespuestaTexto,
  getB2KeyWordParsedKeyForQuestion,
} from '@/lib/parseB2KeyWordAnswerKey';
import { SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE, SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION } from '@/lib/validateB2KeyWordAnswerKey';

describe('parseKeyWordRespuestaTexto', () => {
  it('extracts question number and answer text', () => {
    assert.deepEqual(parseKeyWordRespuestaTexto('25 do not need to use'), {
      questionNumber: 25,
      answerText: 'do not need to use',
    });
  });
});

describe('parseB2KeyWordAnswerKeyRows', () => {
  it('parses legacy rows without grading_metadata', () => {
    const parsed = parseB2KeyWordAnswerKeyRows([
      { respuesta_texto: '25 do not need to use' },
      { respuesta_texto: "25 don't need to use" },
    ]);

    const key = parsed.get(25);
    assert.equal(key?.mode, 'legacy');
    assert.deepEqual(key?.acceptedFullAnswers?.sort(), ["don't need to use", 'do not need to use'].sort());
  });

  it('parses metadata when grading_metadata is present on row', () => {
    const metadata = {
      type: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE,
      version: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION,
      keyword: 'NEED',
      fullAnswers: ['do not need to use', "don't need to use"],
      markingPoints: [
        { id: 1, accepted: ['do not need', "don't need"] },
        { id: 2, accepted: ['to use'] },
      ],
    };

    const parsed = parseB2KeyWordAnswerKeyRows([
      { respuesta_texto: '25 do not need to use', grading_metadata: metadata },
    ]);

    const key = parsed.get(25);
    assert.equal(key?.mode, 'metadata');
    assert.equal(key?.answerKey?.keyword, 'NEED');
  });

  it('ignores invalid metadata and falls back to legacy', () => {
    const parsed = parseB2KeyWordAnswerKeyRows([
      {
        respuesta_texto: '26 did not mean to delete',
        grading_metadata: { type: 'wrong', version: 99 },
      },
    ]);

    const key = parsed.get(26);
    assert.equal(key?.mode, 'legacy');
    assert.deepEqual(key?.acceptedFullAnswers, ['did not mean to delete']);
  });

  it('groups multiple legacy variants for the same question', () => {
    const parsed = parseB2KeyWordAnswerKeyRows([
      { respuesta_texto: '27 foo bar' },
      { respuesta_texto: '27 baz qux' },
    ]);
    assert.deepEqual(parsed.get(27)?.acceptedFullAnswers?.sort(), ['baz qux', 'foo bar'].sort());
  });
});

describe('getB2KeyWordParsedKeyForQuestion', () => {
  it('returns null when question is missing', () => {
    const parsed = parseB2KeyWordAnswerKeyRows([{ respuesta_texto: '25 answer' }]);
    assert.equal(getB2KeyWordParsedKeyForQuestion(parsed, 99), null);
  });
});
