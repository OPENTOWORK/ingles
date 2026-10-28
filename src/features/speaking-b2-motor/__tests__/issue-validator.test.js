import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isAdequatelyDeveloped,
  isRelevantToQuestion,
  looksLikeArticleError,
  looksLikeCollocationError,
  looksLikePrepositionError,
  looksLikeRepetition,
  looksLikeVerbTenseError,
} from '../domain/issue-evidence.js';
import {
  attachSpeakingB2IssuesToTurns,
  bindSpeakingB2IssueToTurn,
  ensureSpeakingB2DiscourseIssues,
  validateSpeakingB2Issue,
  validateSpeakingB2Issues,
} from '../domain/issue-validator.js';
import { isKnownSpeakingB2ErrorCode, isSpeakingB2MetaIssueCode } from '../domain/error-taxonomy.js';
import { listSpeakingB2TextCases } from '../fixtures/text-bank.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

describe('speaking B2 issue evidence and classification', () => {
  it('does not treat GR-VT as a default for non-verbal problems', () => {
    const article = validateSpeakingB2Issue(
      { code: 'GR-VT', excerpt: 'the my brother', suggestion: 'my brother', confidence: 0.8 },
      { answer: 'I saw the my brother after work.', question: 'How do you usually spend your weekends?' },
    );
    assert.equal(article.code, 'GR-AR');
    assert.equal(article.originalCode, 'GR-VT');

    const prep = validateSpeakingB2Issue(
      { code: 'GR-VT', excerpt: 'stay in home', suggestion: 'stay at home', confidence: 0.8 },
      { answer: 'I stay in home on Sunday and then I go out.', question: 'How do you usually spend your weekends?' },
    );
    assert.equal(prep.code, 'GR-PR');

    const colo = validateSpeakingB2Issue(
      { code: 'GR-VT', excerpt: 'make messages', suggestion: 'send messages', confidence: 0.8 },
      {
        answer: 'I make messages when I cannot call my friends.',
        question: 'How has technology changed the way you communicate with your friends?',
      },
    );
    assert.equal(colo.code, 'VC-CO');
  });

  it('keeps GR-VT only when the excerpt has verbal evidence', () => {
    const tense = validateSpeakingB2Issue(
      { code: 'GR-VT', excerpt: 'Yesterday I go', suggestion: 'Yesterday I went', confidence: 0.9 },
      {
        answer: 'Yesterday I go to a quiet town and I stayed there.',
        question: 'Do you prefer visiting new places or returning to places you know? Why?',
      },
    );
    assert.equal(tense.code, 'GR-VT');
    assert.equal(looksLikeVerbTenseError('Yesterday I go to a quiet town'), true);
  });

  it('marks an off-topic grammatical answer as relevance, not grammar', () => {
    const issue = validateSpeakingB2Issue(
      { code: 'GR-VT', excerpt: 'I really enjoy cooking with my family', suggestion: 'I text them more', confidence: 0.7 },
      {
        answer: 'I really enjoy cooking with my family.',
        question: 'How has technology changed the way you communicate with your friends?',
      },
    );
    assert.equal(issue.code, 'DM-RV');
    assert.equal(
      isRelevantToQuestion(
        'How has technology changed the way you communicate with your friends?',
        'I really enjoy cooking with my family.',
      ),
      false,
    );
  });

  it('does not mark a short but complete Part 1 answer as underdeveloped', () => {
    const answer = 'Yes, photography, because I want better pictures of my city.';
    assert.equal(isAdequatelyDeveloped(answer), true);
    const dropped = validateSpeakingB2Issue(
      { code: 'DM-EL', excerpt: answer, suggestion: 'Say more', confidence: 0.8 },
      { answer, question: 'Is there a new skill you would like to learn in the future?' },
    );
    assert.equal(dropped, null);
  });

  it('keeps insufficient elaboration for a non-answer and drops invented excerpts', () => {
    const short = validateSpeakingB2Issue(
      { code: 'DM-EL', excerpt: 'Not really.', suggestion: 'Name a skill and a reason', confidence: 0.8 },
      { answer: 'Not really.', question: 'Is there a new skill you would like to learn in the future?' },
    );
    assert.equal(short.code, 'DM-EL');

    const invented = validateSpeakingB2Issue(
      { code: 'GR-AR', excerpt: 'a unicorn breakfast', suggestion: 'breakfast', confidence: 0.9 },
      { answer: 'I usually stay at home and read.', question: 'How do you usually spend your weekends?' },
    );
    assert.equal(invented, null);
  });

  it('does not correct acceptable British collocations', () => {
    assert.equal(looksLikeCollocationError('I do sport at the weekend'), false);
    assert.equal(looksLikeCollocationError('I do a decision after lunch'), true);
    assert.equal(looksLikeArticleError('the my sister'), true);
    assert.equal(looksLikePrepositionError('I arrive to the station'), true);
    assert.equal(looksLikeRepetition('I love walking I love walking I love walking I love walking outside'), true);
  });

  it('deduplicates and allows review_required instead of a forced category', () => {
    const issues = validateSpeakingB2Issues(
      [
        { code: 'mystery', excerpt: 'something odd here', suggestion: 'try again', confidence: 0.4 },
        { code: 'mystery', excerpt: 'something odd here', suggestion: 'try again', confidence: 0.4 },
      ],
      { answer: 'I said something odd here after work.', question: 'How do you usually spend your weekends?' },
    );
    assert.equal(issues.length, 1);
    assert.equal(issues[0].code, 'review_required');
    assert.equal(isSpeakingB2MetaIssueCode('review_required'), true);
    assert.equal(isKnownSpeakingB2ErrorCode('review_required'), true);
    assert.equal(isKnownSpeakingB2ErrorCode('XX-99'), false);
  });

  it('keeps develop, regression and the new validate set apart', () => {
    const develop = listSpeakingB2TextCases('develop');
    const regression = listSpeakingB2TextCases('regression');
    const validate = listSpeakingB2TextCases('validate');
    assert.ok(develop.length >= 6);
    assert.ok(regression.length >= 8);
    assert.ok(validate.length >= 8);
    assert.ok(validate.every((item) => item.id.startsWith('blind-')));
    assert.ok(regression.some((item) => item.id.startsWith('val-')));
    assert.ok(regression.some((item) => item.id.startsWith('hold-')));
    const ids = [...develop, ...regression, ...validate].map((item) => item.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it('stops the rubric schema from offering GR-VT as the only example code', () => {
    const rubric = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/evaluation/rubric-engine.js'),
      'utf8',
    );
    assert.match(rubric, /review_required/);
    assert.match(rubric, /Question:/);
    assert.match(rubric, /Never use GR-VT as a default/);
    assert.equal(/"code":"GR-VT"/.test(rubric), false);
  });

  it('resolves a clear preposition problem and adds DM-EL for a hedged non-answer', () => {
    const prep = validateSpeakingB2Issue(
      { code: 'review_required', excerpt: 'wait the train', suggestion: 'wait for the train', confidence: 0.5 },
      {
        answer: 'I wait the train and then I stay in home.',
        question: 'How do you usually spend your weekends?',
      },
    );
    assert.equal(prep.code, 'GR-PR');
    assert.equal(looksLikeCollocationError('I make a decision after lunch'), false);

    const discourse = ensureSpeakingB2DiscourseIssues([], {
      answer: "We'll see.",
      question: 'Is there a new skill you would like to learn in the future?',
      questionId: 'SP-EX001-P1-Q05',
    });
    assert.equal(discourse[0].code, 'DM-EL');
  });

  it('does not attach an unmatched issue to the first question', () => {
    const paired = [
      {
        questionId: 'SP-EX001-P1-Q01',
        question: 'How do you usually spend your weekends?',
        transcript: 'I walk with my family in the park.',
      },
      {
        questionId: 'SP-EX001-P1-Q04',
        question: 'How has technology changed the way you communicate with your friends?',
        transcript: 'I make messages when I cannot call my friends.',
      },
    ];
    const bound = bindSpeakingB2IssueToTurn(
      { code: 'VC-CO', excerpt: 'make messages', questionId: 'SP-EX001-P1-Q99' },
      paired,
    );
    assert.equal(bound.questionId, 'SP-EX001-P1-Q04');
    assert.equal(bound.bound, 'excerpt');

    const unknown = attachSpeakingB2IssuesToTurns(
      [{ code: 'GR-PR', excerpt: 'a phrase that appears nowhere', questionId: '' }],
      paired,
    );
    assert.equal(unknown[0].code, 'review_required');
    assert.equal(unknown[0].questionId, '');
    assert.equal(unknown[0].evidenceCheck, 'question-unbound');

    const rubricSource = readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), '../services/evaluation/rubric-engine.js'),
      'utf8',
    );
    assert.equal(rubricSource.includes('|| paired[0]'), false);
  });

  it('asks for review when the same wording appears in two answers', () => {
    const paired = [
      {
        questionId: 'SP-EX001-P1-Q01',
        question: 'How do you usually spend your weekends?',
        transcript: 'I stay in home and I wait the bus.',
      },
      {
        questionId: 'SP-EX001-P1-Q02',
        question: 'Do you prefer visiting new places or returning to places you know? Why?',
        transcript: 'When I travel I stay in home and I wait the bus.',
      },
    ];
    const bound = bindSpeakingB2IssueToTurn(
      { code: 'GR-PR', excerpt: 'wait the bus', questionId: '' },
      paired,
    );
    assert.equal(bound.bound, 'ambiguous');
    const attached = attachSpeakingB2IssuesToTurns(
      [{ code: 'GR-PR', excerpt: 'wait the bus', questionId: '' }],
      paired,
    );
    assert.equal(attached[0].code, 'review_required');
    assert.equal(attached[0].questionId, '');
    assert.equal(attached[0].evidenceCheck, 'question-ambiguous');
  });
});
