import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { listSpeakingB2TextCases, getSpeakingB2TextCase } from '../fixtures/text-bank.js';
import {
  buildSpeakingB2TextSession,
  evaluateSpeakingB2TextCase,
  judgeSpeakingB2TextCase,
} from '../fixtures/text-eval.js';
import { isSpeakingB2FixtureRuntime } from '../fixtures/runtime.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

describe('speaking B2 independent text evaluation', () => {
  it('keeps develop cases out of the held-out validate set', () => {
    const develop = listSpeakingB2TextCases('develop');
    const validate = listSpeakingB2TextCases('validate');
    assert.ok(develop.length >= 3);
    assert.ok(validate.length >= 8);
    const overlap = develop.map((item) => item.id).filter((id) => validate.some((item) => item.id === id));
    assert.deepEqual(overlap, []);
    assert.equal(getSpeakingB2TextCase('val-q02-articles').set, 'regression');
    assert.equal(getSpeakingB2TextCase('hold-q02-articles').set, 'regression');
    assert.equal(getSpeakingB2TextCase('blind-q02-articles').set, 'validate');
    assert.equal(getSpeakingB2TextCase('val-q02-articles').referenceTranscript.includes('a my friends'), true);
  });

  it('does not treat HTTP success or prefixed scores as a pedagogical pass', () => {
    const caseItem = getSpeakingB2TextCase('val-q02-articles');
    const missed = judgeSpeakingB2TextCase({
      caseItem,
      technicalOk: true,
      report: {
        scores: {
          grammarVocabulary: 4,
          discourseManagement: null,
          pronunciation: null,
          interactiveCommunication: null,
          globalAchievement: null,
        },
        summaryEs: 'Has respondido a la pregunta.',
        issues: [],
      },
    });
    assert.equal(missed.status, 'FAIL');
    assert.equal(missed.missedCount, 1);

    const illegal = judgeSpeakingB2TextCase({
      caseItem,
      technicalOk: true,
      report: {
        scores: { pronunciation: 3, interactiveCommunication: 3, globalAchievement: 3 },
        summaryEs: 'Has respondido a la pregunta.',
        issues: [{ code: 'GR-AR', explanation: 'Artículo incorrecto.' }],
      },
    });
    assert.equal(illegal.status, 'FAIL');

    const silent = judgeSpeakingB2TextCase({
      caseItem: getSpeakingB2TextCase('val-q01-clean'),
      technicalOk: true,
      report: {
        evidence: { hasCandidateSpeech: true },
        scores: {
          grammarVocabulary: null,
          discourseManagement: null,
          pronunciation: null,
          interactiveCommunication: null,
          globalAchievement: null,
        },
        summaryEs: 'Has completado la Part 1.',
        issues: [],
      },
    });
    assert.equal(silent.status, 'PASS');

    const silentWeak = judgeSpeakingB2TextCase({
      caseItem: getSpeakingB2TextCase('val-q01-clean'),
      technicalOk: true,
      report: {
        evidence: { hasCandidateSpeech: true },
        scores: {
          grammarVocabulary: null,
          discourseManagement: null,
          pronunciation: null,
          interactiveCommunication: null,
          globalAchievement: null,
        },
        summaryEs: 'Completed Part 1.',
        issues: [],
      },
    });
    assert.equal(silentWeak.status, 'REVIEW');
    assert.equal(silentWeak.feedbackQuality, 'evaluator-silent');
  });

  it('marks review when the evaluator invents extra codes or misses some', () => {
    const caseItem = getSpeakingB2TextCase('val-q04-collocation');
    const review = judgeSpeakingB2TextCase({
      caseItem,
      technicalOk: true,
      report: {
        scores: { pronunciation: null, interactiveCommunication: null, globalAchievement: null },
        summaryEs: 'Has usado vocabulario poco natural. Recomendación: send messages.',
        issues: [{ code: 'VC-CO', explanation: 'make messages no es natural.' }],
      },
    });
    assert.equal(review.status, 'REVIEW');
    assert.deepEqual(review.missed, ['VC-WW']);
  });

  it('builds a fixture text session that never looks like a live student attempt', () => {
    const session = buildSpeakingB2TextSession(getSpeakingB2TextCase('val-q01-clean'));
    assert.equal(session.fixtureMode, true);
    assert.equal(session.persisted, false);
    assert.equal(session.turns.at(-1).source, 'TYPED');
    assert.equal(session.turns.at(-1).hasAudio, false);
  });

  it('skips persistence when the real evaluator is invoked from the text harness', async () => {
    let persistCalls = 0;
    const item = await evaluateSpeakingB2TextCase(getSpeakingB2TextCase('val-q05-short'), {
      evaluate: async (session) => {
        assert.equal(session.fixtureMode, true);
        persistCalls += 1;
        return {
          scores: {
            grammarVocabulary: null,
            discourseManagement: null,
            pronunciation: null,
            interactiveCommunication: null,
            globalAchievement: null,
          },
          summaryEs: 'La respuesta es demasiado breve. Recomendación: desarrolla la idea.',
          issues: [{ code: 'DM-EL', explanation: 'Falta desarrollo.' }],
        };
      },
    });
    assert.equal(item.status, 'PASS');
    assert.equal(persistCalls, 1);
  });

  it('keeps typed oral answers off the public page and production runtime', () => {
    const practice = readFileSync(path.join(root, 'src/components/b2/B2SpeakingExamPractice.js'), 'utf8');
    assert.equal(practice.includes('text-eval'), false);
    assert.equal(practice.includes('candidateText'), false);
    const turn = readFileSync(path.join(root, 'src/app/api/speaking-b2/turn/route.js'), 'utf8');
    assert.match(turn, /TYPED_FORBIDDEN/);
    assert.match(turn, /canSubmitSpeakingB2TypedAnswer/);
    assert.match(turn, /canUseSpeakingB2FixtureAnswer/);
    const complete = readFileSync(
      path.join(root, 'src/features/speaking-b2-motor/services/evaluation/run-complete.js'),
      'utf8',
    );
    assert.match(complete, /if \(persist && !session\.fixtureMode\)/);
    const textEvalApi = readFileSync(path.join(root, 'src/app/api/speaking-b2/fixtures/text-eval/route.js'), 'utf8');
    assert.match(textEvalApi, /isSpeakingB2FixtureRuntime/);
    assert.match(textEvalApi, /persist: false/);
    assert.equal(isSpeakingB2FixtureRuntime({ nodeEnv: 'production', flag: '1' }), false);
  });
});
