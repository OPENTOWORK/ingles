import test from 'node:test';
import assert from 'node:assert/strict';

import { buildB1TwentyExamAllocation, validateB1TwentyExamAllocation } from '@/lib/b1PreliminaryReadingSpec';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';
import {
  findB1AboveLevelTerms,
  markedAnswerMismatches,
  part4CohesionProblems,
  part6TargetProblems,
} from '@/lib/b1ReadingConstruction';

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

test('B1 Part 3 requires the four comprehension types and ordinary language', () => {
  const questions = [
    ['detail', 'What did Maya do first?'],
    ['inference', 'Why did Maya leave early?'],
    ['attitude', 'How did Maya feel about the class?'],
    ['gist', 'What is the text mainly about?'],
    ['detail', 'Where did the class meet?'],
  ].map(([questionType, prompt], index) => ({
    id: `q${index + 1}`,
    number: 11 + index,
    type: 'mcq',
    questionType,
    prompt,
    options: ['A) She joined the evening class.', 'B) She stayed at home.', 'C) She cancelled the trip.', 'D) She forgot the time.'],
  }));
  const generated = {
    directions: 'Read the text and choose the correct answer.',
    title: 'Evening class',
    passage: 'Maya started an evening class because she wanted to speak more confidently at work. The first meeting was in a small room above a bookshop.',
    questions,
    modelAnswers: ['A', 'A', 'A', 'A', 'A'].map((answer, index) => ({
      id: `q${index + 1}`,
      number: 11 + index,
      answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 3, generated);
  assert.equal(result.ok, true, result.errors.join('\n'));

  generated.passage = 'Maya is a polyglot with unparalleled cognitive abilities.';
  const tooHigh = validateGeneratedExamPart('b1', 3, generated);
  assert.equal(tooHigh.ok, false);
  assert.ok(tooHigh.errors.some((error) => error.includes('above B1')));
});

test('B1 Part 6 rejects a repeated answer word', () => {
  const generated = {
    directions: 'Write one word for each gap.',
    title: 'Message',
    passage: '(27) ___ a (28) ___ b (29) ___ c (30) ___ d (31) ___ e (32) ___',
    questions: Array.from({ length: 6 }, (_, i) => ({ id: `q${i + 1}`, number: 27 + i, type: 'short' })),
    modelAnswers: ['the', 'the', 'if', 'of', 'your', 'and'].map((answer, i) => ({
      id: `q${i + 1}`, number: 27 + i, answer,
    })),
  };
  const result = validateGeneratedExamPart('b1', 6, generated);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('six different one-word answers')));
});

test('B1 construction guards keep cohesion, keys and grammar targets fail-closed', () => {
  assert.deepEqual(findB1AboveLevelTerms('a normal class'), []);
  assert.ok(findB1AboveLevelTerms('The nuance was too small to notice.').includes('nuance'));

  const sharedAnchor = part4CohesionProblems({
    chunks: ['before the evening train', 'after', 'x', 'y', 'z', 'end'],
    removed: [
      { number: 16, sentence: 'We caught the evening train.', anchor: 'evening train' },
      { number: 17, sentence: 'We caught the evening train again.', anchor: 'evening train' },
    ],
    extras: [],
  });
  assert.ok(sharedAnchor.some((error) => error.includes('share the cohesion anchor')));

  const mismatches = markedAnswerMismatches('The trip was [[21:cancelled]] today.', [
    { number: 21, answer: 'delayed' },
  ]);
  assert.equal(mismatches.length, 1);

  const grammar = part6TargetProblems([
    { number: 27, answer: 'the', targetType: 'article/determiner' },
    { number: 28, answer: 'for', targetType: 'preposition' },
    { number: 29, answer: 'who', targetType: 'pronoun/relative' },
    { number: 30, answer: 'was', targetType: 'auxiliary/modal' },
    { number: 31, answer: 'because', targetType: 'linking word' },
    { number: 32, answer: 'idea', targetType: 'phrasal particle/fixed phrase' },
  ]);
  assert.ok(grammar.some((error) => error.includes('Q32')));
});
