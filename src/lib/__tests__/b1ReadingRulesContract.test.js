import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildExamGeneratePrompt } from '@/lib/draloAiExamPrompts';
import { part4CohesionProblems } from '@/lib/b1ReadingConstruction';
import { B1_PART5_LEXICAL_BANK } from '@/lib/b1ReadingConstruction';
import {
  B1_PART3_PASSAGE_LIMITS,
  B1_PART5_PASSAGE_LIMITS,
  B1_READING_RULES_VERSION,
  applyB1MotorTransport,
  assessB1CacheReuse,
  b1Part4PlanExample,
  b1Part5PlanExample,
  b1Part6PlanExample,
  b1SemanticCriteria,
  b1SharedRuleBlock,
} from '@/lib/b1ReadingRules';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const generatorSource = fs.readFileSync(path.join(root, 'src/lib/levelsCambridgeExamGenerator.js'), 'utf8');
const reviewSource = fs.readFileSync(path.join(root, 'src/lib/b1ReadingQualityValidator.js'), 'utf8');

test('Part 4, 5 and 6 examples follow the shared plan instead of a pinned template', () => {
  const part4 = JSON.stringify(b1Part4PlanExample());
  assert.equal(part4.includes('"cohesion":"chronology"'), false);
  assert.equal(part4.includes('logical-progression'), false);
  const devices = b1Part4PlanExample().removedSentences.map((row) => row.cohesion);
  assert.equal(new Set(devices).size, 1);
  assert.match(devices[0], /device this sentence actually uses/);

  const part5 = b1Part5PlanExample([
    { number: 21, type: 'adjective-noun collocation' },
    { number: 22, type: 'phrasal verb' },
  ]);
  assert.deepEqual(part5.items.map((item) => item.targetType), [
    'adjective-noun collocation',
    'phrasal verb',
  ]);
  assert.equal(JSON.stringify(part5).includes('|'), false);
  assert.equal(B1_PART5_LEXICAL_BANK.includes('adjective-noun collocation'), true);

  const part6 = b1Part6PlanExample([
    { number: 27, type: 'article', words: ['the', 'a'] },
  ]);
  assert.equal(part6.items[0].answer, '<one allowed word>');
  assert.notEqual(part6.items[0].answer, 'the');
});

test('active B1 prompts and reviews carry the same rules version and limits', () => {
  const activities = [
    ['reading', 'notice-mcq', 1],
    ['reading', 'multiple-matching', 2],
    ['reading', 'multiple-choice', 3],
    ['reading', 'gapped-text', 4],
    ['use-of-english', 'multiple-choice-cloze', 5],
    ['use-of-english', 'open-cloze', 6],
  ];
  for (const [mode, activity] of activities) {
    const prompt = buildExamGeneratePrompt(mode, activity, 'B1');
    assert.match(prompt, new RegExp(B1_READING_RULES_VERSION));
  }
  assert.equal(buildExamGeneratePrompt('use-of-english', 'key-word', 'B2').includes(B1_READING_RULES_VERSION), false);
  assert.match(b1SharedRuleBlock(3), new RegExp(String(B1_PART3_PASSAGE_LIMITS.min)));
  assert.match(b1SharedRuleBlock(3), new RegExp(String(B1_PART3_PASSAGE_LIMITS.targetMin)));
  assert.match(b1SharedRuleBlock(5), new RegExp(String(B1_PART5_PASSAGE_LIMITS.hardMin)));
  assert.match(b1SharedRuleBlock(5), new RegExp(String(B1_PART5_PASSAGE_LIMITS.targetMin)));
  assert.match(generatorSource, /b1Part4PlanExample\(\)/);
  assert.match(generatorSource, /b1Part5PlanExample\(lexicalPlan\)/);
  assert.match(generatorSource, /b1Part6PlanExample\(selectedTargets\)/);
  assert.equal(generatorSource.includes('"cohesion":"chronology"'), false);
  assert.equal(generatorSource.includes('target.words[0]'), false);
  for (const part of [1, 2, 3, 4, 5, 6]) {
    assert.match(reviewSource, new RegExp(`b1SemanticCriteria\\(${part}\\)`));
    assert.match(b1SemanticCriteria(part), new RegExp(B1_READING_RULES_VERSION));
  }
});

test('Part 4 rejects copied anchors and unknown labels, and accepts a device without a keyword', () => {
  const flexible = part4CohesionProblems({
    chunks: [
      'The walk started in the village. ',
      ' The path became steep. ',
      ' They stopped for water. ',
      ' The sky cleared. ',
      ' Everyone sat down. ',
      ' The day ended quietly.',
    ],
    removed: [{ number: 16, sentence: 'The group kept a steady pace.', cohesion: 'chronology' }],
    extras: [{ sentence: 'The village shop sold maps.', rejectionReason: 'The walk has already left the village.' }],
  });
  assert.deepEqual(flexible, []);

  const copied = part4CohesionProblems({
    chunks: ['She checked the breakfast list. ', ' Then they left. ', '', '', '', ''],
    removed: [{ number: 16, sentence: 'The breakfast list was ready.', cohesion: 'lexical-link' }],
    extras: [],
  });
  assert.match(copied.join(' '), /breakfast list/);

  const unknown = part4CohesionProblems({
    chunks: ['The walk started. ', ' The path became steep. ', '', '', '', ''],
    removed: [{ number: 16, sentence: 'The group kept a steady pace.', cohesion: 'sequence-magic' }],
    extras: [],
  });
  assert.match(unknown.join(' '), /unknown cohesion name/);
});

test('cache reuse is explicit for validated Parts 1 to 3 and closed for later unversioned parts', () => {
  const current = assessB1CacheReuse({ rulesVersion: B1_READING_RULES_VERSION }, 4);
  assert.equal(current.reuse, true);
  assert.equal(current.explicit, false);

  const legacyPart = assessB1CacheReuse({ validation: { ok: true } }, 2);
  assert.equal(legacyPart.reuse, true);
  assert.equal(legacyPart.explicit, true);
  assert.match(legacyPart.reason, /explicit/);

  const legacyLater = assessB1CacheReuse({}, 4);
  assert.equal(legacyLater.reuse, false);

  const otherVersion = assessB1CacheReuse({ rulesVersion: 'b1-reading-rules-v0' }, 1);
  assert.equal(otherVersion.reuse, false);
});

test('a B1 motor session forces Chat Completions and other callers keep their transport', () => {
  const plain = { model: 'gpt-4o', useAssistant: true };
  assert.equal(applyB1MotorTransport(plain, null).useAssistant, true);
  assert.equal(applyB1MotorTransport(plain, { id: 'b1-session' }).useAssistant, false);
  assert.equal(plain.useAssistant, true);
});
