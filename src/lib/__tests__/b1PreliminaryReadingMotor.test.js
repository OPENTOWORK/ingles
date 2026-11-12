import test from 'node:test';
import assert from 'node:assert/strict';

import { buildB1TwentyExamAllocation, validateB1TwentyExamAllocation } from '@/lib/b1PreliminaryReadingSpec';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';

test('B1 20-exam allocation is balanced and has six distinct topics per exam', () => {
  const plan = buildB1TwentyExamAllocation();
  const result = validateB1TwentyExamAllocation(plan);
  assert.equal(plan.length, 20);
  assert.equal(result.ok, true, result.errors.join('\n'));
  const counts = Object.values(result.topicCounts);
  assert.ok(Math.max(...counts) <= 6);
  assert.ok(Math.min(...counts) >= 5);
});

test('B1 Part 1 accepts five short texts with three options', () => {
  const generated = {
    directions: 'For each question, choose the correct answer.',
    questions: Array.from({ length: 5 }, (_, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text: `Message ${i + 1}: Please check the details before Friday.`,
      prompt: 'What should the reader do?',
      options: ['A) Check the information.', 'B) Ignore the message.', 'C) Wait until next month.'],
    })),
    modelAnswers: Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, answer: 'A' })),
  };
  const result = validateGeneratedExamPart('b1', 1, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('B1 Part 4 requires eight sentences and three unused options', () => {
  const generated = {
    directions: 'Five sentences have been removed.',
    title: 'A day out',
    passage: 'Start. (16) ___ More. (17) ___ More. (18) ___ More. (19) ___ More. (20) ___ End.',
    sentencePool: ['A) One.','B) Two.','C) Three.','D) Four.','E) Five.','F) Six.','G) Seven.','H) Eight.'],
    questions: Array.from({ length: 5 }, (_, i) => ({ id: `q${i + 1}`, number: 16 + i })),
    modelAnswers: ['A','B','C','D','E'].map((answer, i) => ({ id: `q${i + 1}`, number: 16 + i, answer })),
  };
  const result = validateGeneratedExamPart('b1', 4, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.sentencePool = generated.sentencePool.slice(0, 6);
  const invalid = validateGeneratedExamPart('b1', 4, generated);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((e) => e.includes('exactly 8 candidate sentences')));
});

test('B1 Part 5 rejects an example gap and wrong numbering', () => {
  const generated = {
    directions: 'For each question, choose the correct answer.',
    title: 'Short text',
    passage: '(0) ___ Intro. (1) ___ (2) ___ (3) ___ (4) ___ (5) ___ (6) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({
      id: `q${i + 1}`, number: i + 1, options: ['A) one','B) two','C) three','D) four'],
    })),
    modelAnswers: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: i + 1, answer: 'A' })),
  };
  const result = validateGeneratedExamPart('b1', 5, generated);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('number must be 21–26')));
  assert.ok(result.errors.some((e) => e.includes('no example gap (0)')));
});

test('B1 Part 6 enforces one-word answers and gaps 27–32', () => {
  const generated = {
    directions: 'Write one word for each gap.',
    title: 'Message',
    passage: '(27) ___ a (28) ___ b (29) ___ c (30) ___ d (31) ___ e (32) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: 27 + i, type: 'short' })),
    modelAnswers: ['the','to','if','of','your','and'].map((answer, i) => ({
      id: `q${i + 1}`, number: 27 + i, answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.modelAnswers[0].answer = 'two words';
  const invalid = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some((e) => e.includes('exactly one word')));
});
