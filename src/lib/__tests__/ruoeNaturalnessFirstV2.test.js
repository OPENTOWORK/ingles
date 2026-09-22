import test from 'node:test';
import assert from 'node:assert/strict';
import { countCambridgeKeyWordWords } from '../countCambridgeKeyWordWords.js';
import {
  RUOE_GENERATION_VERSION_V1,
  resolveRuoeGenerationVersion,
} from '../ruoeNaturalnessFirstV2/contract.js';
import {
  judgePart1Substitutions,
  judgePart2Gap,
  judgePart2Structure,
  judgePart3Derivation,
  judgePart4Item,
} from '../ruoeNaturalnessFirstV2/judgements.js';
import { canonicalisePart4Item, rebuildCompletedS2 } from '../ruoeNaturalnessFirstV2/part4Canonical.js';
import { validateStagePayload } from '../ruoeNaturalnessFirstV2/schema.js';
import { nextPart1Repair, nextPart2Repair, nextPart4Repair } from '../ruoeNaturalnessFirstV2/repair.js';
import {
  buildPart1CompletedOptions,
  generatePart1NaturalnessFirst,
  generatePart2NaturalnessFirst,
  generatePart3NaturalnessFirst,
  generatePart4NaturalnessFirst,
  normalisePart1Distractors,
} from '../ruoeNaturalnessFirstV2/generate.js';
import { createRepairBudget, spendSchemaRepair } from '../ruoeNaturalnessFirstV2/layers.js';
import { part1StagePrompt } from '../ruoeNaturalnessFirstV2/prompts.js';

function surviving(letter, extra = {}) {
  return {
    letter,
    grammatical: true,
    naturalBritishEnglish: true,
    semanticallyDefensible: true,
    collocationalFit: true,
    contextuallyDefensible: true,
    reason: 'This option fits.',
    ...extra,
  };
}

function dead(letter) {
  return {
    letter,
    grammatical: true,
    naturalBritishEnglish: false,
    semanticallyDefensible: false,
    collocationalFit: false,
    contextuallyDefensible: false,
    reason: 'This option does not fit naturally.',
  };
}

test('v2 is not the default generation version', () => {
  assert.equal(resolveRuoeGenerationVersion(undefined), RUOE_GENERATION_VERSION_V1);
  assert.equal(resolveRuoeGenerationVersion('v1'), RUOE_GENERATION_VERSION_V1);
  assert.equal(resolveRuoeGenerationVersion('naturalness-first-v2'), 'naturalness-first-v2');
});

test('Part 1 rejects effect and impact in the same frame', () => {
  const result = judgePart1Substitutions([
    surviving('A', { word: 'effect', isKey: true, moreIdiomaticThanKey: true }),
    surviving('B', { word: 'impact' }),
    dead('C'),
    dead('D'),
  ]);
  assert.equal(result.verdict, 'QUALITY_FAIL');
  assert.match(result.reason, /more idiomatic/i);
  assert.equal(result.candidateAlternative, 'B');
});

test('Part 1 rejects cope and deal when both options survive', () => {
  const result = judgePart1Substitutions([
    surviving('A', { word: 'cope', isKey: true, moreIdiomaticThanKey: true }),
    surviving('B', { word: 'deal' }),
    dead('C'),
    dead('D'),
  ]);
  assert.equal(result.verdict, 'QUALITY_FAIL');
  assert.match(result.repairRecommendation, /more idiomatic/i);
});

test('Part 1 performs four independent substitutions and fails closed if one is missing', () => {
  const prompt = part1StagePrompt('independent-substitution', { direction: 'libraries' });
  assert.match(prompt, /Do not choose the best answer/);
  assert.match(prompt, /independently for A, then B, then C, then D/);
  const result = judgePart1Substitutions([surviving('A'), dead('B'), dead('C')]);
  assert.equal(result.verdict, 'HARD_FAIL');
  assert.match(result.reason, /A, B, C and D/);
});

test('Part 1 passes only when a single option survives', () => {
  const result = judgePart1Substitutions([
    surviving('A', { isKey: true }),
    dead('B'),
    dead('C'),
    dead('D'),
  ]);
  assert.equal(result.verdict, 'PASS');
});

test('Part 1 repair replaces the distractor before the sentence', () => {
  assert.equal(nextPart1Repair({}).action, 'repair-distractor');
  assert.equal(nextPart1Repair({ distractorsRepaired: true }).action, 'repair-sentence');
  assert.equal(
    nextPart1Repair({ distractorsRepaired: true, sentenceRepaired: true }).action,
    'regenerate-item',
  );
});

function eightFunctionGaps(extra = {}) {
  return [9, 10, 11, 12, 13, 14, 15, 16].map((number) => ({
    number,
    word: 'at',
    family: 'preposition',
    sentence: 'The shop opens at six.',
    ...extra,
  }));
}

test('Part 2 writes prose before gap selection and rejects a second function word', () => {
  const calls = [];
  const complete = async ({ stage }) => {
    calls.push(stage);
    if (stage === 'prose') return { title: 'The bakery', passage: 'The shop opens at six.' };
    if (stage === 'gap-discovery') return { sites: [{ word: 'at', family: 'preposition' }] };
    if (stage === 'select-eight') return { gaps: eightFunctionGaps() };
    if (stage === 'uniqueness') {
      return {
        gaps: eightFunctionGaps().map((gap) => ({
          number: gap.number,
          intendedAnswer: 'at',
          intendedAnswerValid: true,
          alternativeSearchPerformed: true,
          plausibleAlternatives: gap.number === 9 ? ['on'] : [],
          uniquenessJustification: 'Only at fits opens at six.',
          confidence: 0.95,
        })),
      };
    }
    return {};
  };
  return generatePart2NaturalnessFirst({ complete, brief: { direction: 'a bakery' } }).then((result) => {
    assert.equal(calls[0], 'prose');
    assert.ok(calls.indexOf('prose') < calls.indexOf('select-eight'));
    assert.equal(result.adversarial.verdict, 'QUALITY_FAIL');
    assert.equal(result.repairs[0].action, 'move-gap');
    assert.equal(nextPart2Repair({ gapMoved: false }).action, 'move-gap');
  });
});

test('Part 2 does not treat an empty alternative list as uniqueness', () => {
  const silent = judgePart2Gap({ keyedWord: 'on', alternatives: [] });
  assert.equal(silent.verdict, 'QUALITY_FAIL');
  assert.match(silent.reason, /not evidence of uniqueness/i);
});

test('Part 3 rejects DECIDE → decision-making and identical stems', () => {
  const compound = judgePart3Derivation({ stem: 'DECIDE', answer: 'decision-making', natural: true });
  assert.equal(compound.verdict, 'HARD_FAIL');
  assert.match(compound.reason, /making/);
  const same = judgePart3Derivation({ stem: 'PERFORM', answer: 'perform' });
  assert.equal(compound.verdict, 'HARD_FAIL');
  assert.equal(same.verdict, 'HARD_FAIL');
});

test('Part 3 accepts a direct derivation and rejects a forced context', () => {
  const direct = judgePart3Derivation({
    stem: 'DECIDE',
    answer: 'decisive',
    natural: true,
    forcedContext: false,
    alternativeFamilyMembers: [],
  });
  assert.equal(direct.verdict, 'PASS');
  const forced = judgePart3Derivation({
    stem: 'POWER',
    answer: 'powerless',
    natural: false,
    forcedContext: true,
  });
  assert.equal(forced.verdict, 'QUALITY_FAIL');
  assert.match(forced.repairRecommendation, /new position|different base/i);
});

test('Part 3 pipeline discovers families only after the prose exists', () => {
  const calls = [];
  const complete = async ({ stage }) => {
    calls.push(stage);
    if (stage === 'prose') return { passage: 'She made a decisive start.' };
    if (stage === 'family-discovery') return { words: [{ word: 'decisive' }] };
    if (stage === 'base-assignment' || stage === 'derivation-check') {
      return {
        items: [{
          stem: 'DECIDE',
          answer: 'decisive',
          natural: true,
          forcedContext: false,
          alternativeFamilyMembers: [],
          lexicalFamilyValidation: {
            sameLexicalFamily: true,
            extraLexicalRootIntroduced: false,
            directDerivation: true,
            legitimateBase: true,
            reason: 'Decisive belongs to the DECIDE family.',
          },
        }],
      };
    }
    return {};
  };
  return generatePart3NaturalnessFirst({ complete, brief: { direction: 'a start' } }).then((result) => {
    assert.ok(calls.indexOf('prose') < calls.indexOf('base-assignment'));
    assert.equal(result.adversarial.verdict, 'PASS');
    assert.equal(result.repairs.length, 0);
  });
});

test('Part 4 enforces 2–5 words and fails a lost referent even when mechanics pass', () => {
  assert.equal(countCambridgeKeyWordWords('late'), 1);
  const short = judgePart4Item({
    mechanicalOk: true,
    wordCountOk: countCambridgeKeyWordWords('late') >= 2 && countCambridgeKeyWordWords('late') <= 5,
    keywordOk: false,
  });
  assert.equal(short.verdict, 'HARD_FAIL');

  const lost = judgePart4Item({
    mechanicalOk: true,
    wordCountOk: true,
    keywordOk: true,
    referencePreserved: false,
    natural: true,
  });
  assert.equal(lost.verdict, 'QUALITY_FAIL');
  assert.match(lost.reason, /mechanical pass does not override/i);
  assert.match(lost.reason, /referent/i);
  assert.equal(nextPart4Repair().action, 'replace-family');
});

test('Part 4 fails a widened comparison and passes a fully equivalent pair', () => {
  const widened = judgePart4Item({
    mechanicalOk: true,
    wordCountOk: true,
    keywordOk: true,
    comparisonScopePreserved: false,
  });
  assert.equal(widened.verdict, 'QUALITY_FAIL');
  assert.match(widened.reason, /comparison/i);

  const ok = judgePart4Item({
    mechanicalOk: true,
    wordCountOk: countCambridgeKeyWordWords('not as easy as') >= 2,
    keywordOk: true,
  });
  assert.equal(ok.verdict, 'PASS');
});

test('Part 1 generation asks for the passage before distractors', () => {
  const calls = [];
  const complete = async ({ stage, user }) => {
    calls.push(stage);
    if (stage === 'independent-substitution') {
      const number = Number(String(user).match(/number (\d+)/)?.[1] || 1);
      return {
        items: [{
          number,
          options: [surviving('A'), dead('B'), dead('C'), dead('D')],
        }],
      };
    }
    if (stage === 'keys') {
      return {
        items: [
          { number: 1, sentence: 'The train was delayed again.', key: 'delayed', knowledgeType: 'collocation', obviousChunk: false },
          { number: 2, sentence: 'She depends on the train.', key: 'on', knowledgeType: 'dependent-preposition', obviousChunk: false },
          { number: 3, sentence: 'They give the tickets back.', key: 'give', knowledgeType: 'phrasal-verb', obviousChunk: false },
          { number: 4, sentence: 'He would rather wait.', key: 'rather', knowledgeType: 'fixed-expression', obviousChunk: false },
          { number: 5, sentence: 'The trip was postponed.', key: 'postponed', knowledgeType: 'semantic-distinction', obviousChunk: false },
          { number: 6, sentence: 'Seats were scarce.', key: 'scarce', knowledgeType: 'lexical-precision', obviousChunk: false },
          { number: 7, sentence: 'The meaning was clear.', key: 'meaning', knowledgeType: 'lexical-meaning', obviousChunk: false },
          { number: 8, sentence: 'The train set left.', key: 'set', knowledgeType: 'collocation', obviousChunk: false },
        ],
      };
    }
    if (stage === 'distractors') {
      return {
        items: [1, 2, 3, 4, 5, 6, 7, 8].map((number) => ({
          number,
          options: [
            { letter: 'A', word: ['delayed', 'on', 'give', 'rather', 'postponed', 'scarce', 'meaning', 'set'][number - 1], isKey: true },
            { letter: 'B', word: 'wrong', isKey: false },
            { letter: 'C', word: 'false', isKey: false },
            { letter: 'D', word: 'other', isKey: false },
          ],
        })),
      };
    }
    return { title: 'Trains', passage: 'The 8.15 was delayed.', candidates: [], items: [] };
  };
  return generatePart1NaturalnessFirst({ complete, brief: { direction: 'trains' } }).then((result) => {
    assert.ok(calls.indexOf('passage') < calls.indexOf('distractors'));
    assert.ok(calls.indexOf('distractors') < calls.indexOf('independent-substitution'));
    assert.equal(result.adversarial.verdict, 'PASS');
    assert.equal(result.variety.ok, true);
  });
});

test('Part 1 later stages receive the finished passage', () => {
  let positionsUser = '';
  const complete = async ({ stage, user }) => {
    if (stage === 'positions') positionsUser = user;
    if (stage === 'passage') return { passage: 'UNIQUE_LIBRARY_GRANT_SENTENCE stays open.' };
    if (stage === 'independent-substitution') {
      return { items: [{ number: 1, options: [surviving('A'), dead('B'), dead('C'), dead('D')] }] };
    }
    return { candidates: [], items: [] };
  };
  return generatePart1NaturalnessFirst({ complete, brief: { direction: 'a library' } }).then(() => {
    assert.match(positionsUser, /UNIQUE_LIBRARY_GRANT_SENTENCE/);
  });
});

test('Part 2 rejects a placeholder key and a content-word gap', () => {
  const placeholder = judgePart2Gap({ keyedWord: '...', alternatives: [] });
  assert.equal(placeholder.verdict, 'HARD_FAIL');

  const passage = 'The garden was filled with delightful flowers near the gate.';
  const words = [
    ['the', 'article'],
    ['was', 'auxiliary'],
    ['with', 'preposition'],
    ['delightful', 'adjective'],
    ['near', 'preposition'],
    ['the', 'article'],
    ['gate', 'article'],
    ['the', 'article'],
  ];
  const complete = async ({ stage }) => {
    if (stage === 'prose') return { passage };
    if (stage === 'select-eight') {
      return {
        gaps: words.map(([word, family], index) => ({
          number: index + 9,
          word,
          family,
          sentence: passage,
        })),
      };
    }
    if (stage === 'uniqueness') {
      return {
        gaps: words.map(([word], index) => ({
          number: index + 9,
          intendedAnswer: word,
          intendedAnswerValid: true,
          alternativeSearchPerformed: true,
          plausibleAlternatives: [],
          uniquenessJustification: 'Checked nearby function words.',
          confidence: 0.95,
        })),
      };
    }
    return { sites: [] };
  };
  return generatePart2NaturalnessFirst({ complete, brief: { direction: 'a garden' } }).then((result) => {
    assert.equal(result.adversarial.verdict, 'QUALITY_FAIL');
    const reasons = result.adversarial.items.map((item) => item.judgement.reason).join(' ');
    assert.match(reasons, /function|adjective/i);
  });
});

test('Part 4 semantic check receives the written sentence pair', () => {
  let semanticUser = '';
  const complete = async ({ stage, user }) => {
    if (stage === 'semantic') semanticUser = user;
    if (stage === 'family-candidate') return { familyId: 'TF-02', keyword: 'USED', kept: true };
    if (stage === 'sentence-pair') {
      return {
        sentence1: 'People rarely use the old path.',
        sentence2: 'The old path is not used much.',
        keyword: 'USED',
        answer: 'not used much',
        abandonFamily: false,
      };
    }
    if (stage === 'semantic') {
      return {
        propositionsPreserved: true,
        agencyPreserved: true,
        referencePreserved: true,
        tenseAspectPreserved: true,
        modalityPreserved: true,
        comparisonScopePreserved: true,
        informationLost: false,
        informationAdded: false,
        natural: true,
      };
    }
    if (stage === 'naturalness') return { natural: true };
    return {};
  };
  return generatePart4NaturalnessFirst({
    complete,
    brief: { direction: 'coastal paths', preferredFamily: 'TF-02' },
  }).then((result) => {
    assert.match(semanticUser, /People rarely use the old path/);
    assert.match(semanticUser, /COMPLETED S2/);
    assert.equal(result.adversarial.verdict, 'PASS');
    assert.equal(result.answerKey.answer, 'not used much');
  });
});

test('Part 1 missing, duplicate, and unknown option labels are hard failures', () => {
  const missing = judgePart1Substitutions([surviving('A'), dead('C'), dead('D')]);
  assert.equal(missing.verdict, 'HARD_FAIL');
  assert.match(missing.reason, /missing B/);

  const duplicate = judgePart1Substitutions([surviving('A'), surviving('A'), dead('B'), dead('C')]);
  assert.equal(duplicate.verdict, 'HARD_FAIL');
  assert.match(duplicate.reason, /Duplicate option label/);

  const unknown = judgePart1Substitutions([surviving('A'), dead('B'), dead('C'), dead('E')]);
  assert.equal(unknown.verdict, 'HARD_FAIL');
  assert.match(unknown.reason, /Unknown option label/);

  const objectShape = validateStagePayload('independent-substitution', {
    items: [{ number: 1, options: { letter: 'A', grammatical: true } }],
  });
  assert.equal(objectShape.ok, false);
});

test('Part 1 two surviving options fail and one surviving option passes', () => {
  const both = judgePart1Substitutions([
    surviving('A', { option: 'A', collocationallyValid: true }),
    surviving('B', { option: 'B', collocationallyValid: true }),
    dead('C'),
    dead('D'),
  ]);
  assert.equal(both.verdict, 'QUALITY_FAIL');
  const one = judgePart1Substitutions([surviving('A'), dead('B'), dead('C'), dead('D')]);
  assert.equal(one.verdict, 'PASS');
});

test('Part 2 gap count and positive uniqueness evidence', () => {
  assert.equal(judgePart2Structure([9, 10, 11, 12, 13, 14].map((number) => ({ number, word: 'at' }))).verdict, 'HARD_FAIL');
  assert.equal(judgePart2Structure([9, 10, 11, 12, 13, 14, 15, 16, 17].map((number) => ({ number, word: 'at' }))).verdict, 'HARD_FAIL');
  assert.equal(judgePart2Structure([9, 10, 11, 12, 13, 14, 15, 16].map((number) => ({ number, word: 'at' }))).verdict, 'PASS');

  const silent = judgePart2Gap({
    gap: 9,
    intendedAnswer: 'at',
    intendedAnswerValid: true,
    alternativeSearchPerformed: false,
    plausibleAlternatives: [],
    uniquenessJustification: '',
    confidence: 0.2,
  });
  assert.equal(silent.verdict, 'QUALITY_FAIL');

  const searched = judgePart2Gap({
    gap: 9,
    intendedAnswer: 'at',
    intendedAnswerValid: true,
    alternativeSearchPerformed: true,
    plausibleAlternatives: [],
    uniquenessJustification: 'on, in, and by were tried and do not fit opens at six.',
    confidence: 0.92,
  });
  assert.equal(searched.verdict, 'PASS');
});

test('Part 3 accepts real family members and rejects pseudo stems and extra roots', () => {
  assert.equal(judgePart3Derivation({ stem: 'DECIDE', answer: 'decision' }).verdict, 'PASS');
  assert.equal(judgePart3Derivation({ stem: 'DECIDE', answer: 'decisions', pluralRequired: true }).verdict, 'PASS');
  const compound = judgePart3Derivation({ stem: 'DECIDE', answer: 'decision-making' });
  assert.equal(compound.verdict, 'HARD_FAIL');
  assert.equal(compound.lexicalFamily.extraLexicalRootIntroduced, true);
  const pseudo = judgePart3Derivation({ stem: 'BEEKEEP', answer: 'beekeeping' });
  assert.equal(pseudo.verdict, 'HARD_FAIL');
  assert.equal(pseudo.lexicalFamily.directDerivation, false);
  const truncated = judgePart3Derivation({ stem: 'decis', answer: 'decision' });
  assert.equal(truncated.verdict, 'HARD_FAIL');
  assert.equal(truncated.lexicalFamily.artificialBase, true);
});

test('Part 4 repair output normalises nested answers and rebuilds sentence 2', () => {
  const flat = canonicalisePart4Item({
    s1: 'People rarely use the old path.',
    keyword: 'USED',
    s2WithGap: 'The old path is __________________ .',
    answer: 'not used much',
    completedS2: 'The old path is not used much.',
    transformationFamily: 'TF-02',
    acceptedVariants: [],
  });
  assert.equal(flat.ok, true);
  assert.equal(flat.item.answer, 'not used much');
  assert.equal(flat.item.transformationFamily, 'TF-02');

  const nested = canonicalisePart4Item({
    family: { familyId: 'TF-02', keyword: 'USED' },
    pair: {
      sentence1: 'People rarely use the old path.',
      sentence2: 'The old path is not used much.',
      keyword: 'USED',
      answer: 'not used much',
    },
  });
  assert.equal(nested.ok, true);
  assert.equal(nested.item.completedS2, 'The old path is not used much.');

  const embedded = canonicalisePart4Item({
    replacement: {
      family: { familyId: 'TF-06', keyword: 'DELAYED' },
      pair: {
        sentence1: 'The bus was late.',
        sentence2: 'The bus had been delayed by traffic.',
        keyword: 'DELAYED',
        answer: 'been delayed by',
      },
    },
  });
  assert.equal(embedded.ok, true);
  assert.equal(embedded.item.answer, 'been delayed by');
  assert.equal(embedded.item.transformationFamily, 'TF-06');

  const missing = canonicalisePart4Item({
    pair: { sentence1: 'The bus was late.', sentence2: 'The bus had been delayed by traffic.' },
  });
  assert.equal(missing.ok, false);

  assert.equal(
    rebuildCompletedS2('She was late __________________ the traffic.', 'due to'),
    'She was late due to the traffic.',
  );
});

test('Part 1 constructs all four completed sentences in code', () => {
  const completed = buildPart1CompletedOptions(
    { items: [{ number: 1, sentence: 'The change had an effect on staff.', key: 'effect' }] },
    {
      items: [{
        number: 1,
        options: [
          { letter: 'A', word: 'effect', isKey: true },
          { letter: 'B', word: 'impact' },
          { letter: 'C', word: 'result' },
          { letter: 'D', word: 'outcome' },
        ],
      }],
    },
  );
  assert.equal(completed.ok, true);
  assert.deepEqual(
    completed.items[0].options.map((option) => option.completedSentence),
    [
      'The change had an effect on staff.',
      'The change had an impact on staff.',
      'The change had an result on staff.',
      'The change had an outcome on staff.',
    ],
  );
});

test('Malformed Part 1 judge output becomes PIPELINE_FAIL after one schema repair', async () => {
  const calls = [];
  const complete = async ({ stage, user }) => {
    calls.push({ stage, user });
    if (stage === 'passage') return { passage: 'The train was delayed again.' };
    if (stage === 'positions') return { candidates: [] };
    if (stage === 'keys') {
      return {
        items: [1, 2, 3, 4, 5, 6, 7, 8].map((number) => ({
          number,
          sentence: `The train was delayed again on route ${number}.`,
          key: 'delayed',
          knowledgeType: 'collocation',
        })),
      };
    }
    if (stage === 'distractors') {
      return {
        items: [1, 2, 3, 4, 5, 6, 7, 8].map((number) => ({
          number,
          options: [
            { letter: 'A', word: 'delayed', isKey: true },
            { letter: 'B', word: 'slow' },
            { letter: 'C', word: 'late' },
            { letter: 'D', word: 'held' },
          ],
        })),
      };
    }
    if (stage === 'independent-substitution' || stage === 'schema-repair') {
      return { items: [{ number: 1, options: [{ option: 'A' }] }] };
    }
    return {};
  };
  const result = await generatePart1NaturalnessFirst({ complete, brief: { direction: 'trains' } });
  assert.equal(result.adversarial.verdict, 'PIPELINE_FAIL');
  assert.equal(calls.filter((call) => call.stage === 'schema-repair').length, 1);
  assert.match(calls.find((call) => call.stage === 'schema-repair').user, /structure repair only/i);
  assert.match(calls.find((call) => call.stage === 'schema-repair').user, /MALFORMED JSON TO RESTRUCTURE/i);
});

test('Part 2 runs one second discovery pass on the same prose', async () => {
  const calls = [];
  let selection = 0;
  const complete = async ({ stage, user }) => {
    calls.push({ stage, user });
    if (stage === 'prose') return { passage: 'The shop opens at six and stays open until ten.' };
    if (stage === 'gap-discovery' || stage === 'gap-discovery-2') return { sites: [{ word: 'at', family: 'preposition' }] };
    if (stage === 'select-eight') {
      selection += 1;
      return {
        gaps: selection === 1
          ? [9, 10, 11, 12, 13, 14].map((number) => ({ number, word: 'at', family: 'preposition', sentence: 'The shop opens at six.' }))
          : eightFunctionGaps(),
      };
    }
    if (stage === 'uniqueness') {
      return {
        gaps: eightFunctionGaps().map((gap) => ({
          number: gap.number,
          intendedAnswer: 'at',
          intendedAnswerValid: true,
          alternativeSearchPerformed: true,
          plausibleAlternatives: [],
          uniquenessJustification: 'in, on, and by were tested and do not fit.',
          confidence: 0.95,
        })),
      };
    }
    return {};
  };
  const result = await generatePart2NaturalnessFirst({ complete, brief: { direction: 'a shop' } });
  assert.equal(calls.filter((call) => call.stage === 'gap-discovery-2').length, 1);
  assert.match(calls.find((call) => call.stage === 'gap-discovery-2').user, /same finished article/i);
  assert.equal(result.answerKey.length, 8);
  assert.equal(result.adversarial.verdict, 'PASS');
});

test('Part 3 accepts a complete family judgement for an unlisted real pair', () => {
  const accepted = judgePart3Derivation({
    stem: 'MAINTAIN',
    answer: 'maintenance',
    lexicalFamilyValidation: {
      sameLexicalFamily: true,
      extraLexicalRootIntroduced: false,
      directDerivation: true,
      legitimateBase: true,
      reason: 'Maintenance is the noun in the MAINTAIN lexical family.',
    },
  });
  assert.equal(accepted.verdict, 'PASS');
  assert.equal(accepted.lexicalFamily.validationSource, 'linguistic-family-judgement');

  const missing = judgePart3Derivation({ stem: 'MAINTAIN', answer: 'maintenance' });
  assert.equal(missing.verdict, 'PIPELINE_FAIL');
});

test('Malformed Part 4 semantic booleans are PIPELINE_FAIL, not bad English', async () => {
  const complete = async ({ stage }) => {
    if (stage === 'family-candidate') return { familyId: 'TF-02', keyword: 'USED' };
    if (stage === 'sentence-pair') {
      return {
        s1: 'People rarely use the path.',
        keyword: 'USED',
        s2WithGap: 'The path is __________________ .',
        answer: 'not used much',
        completedS2: 'The path is not used much.',
        transformationFamily: 'TF-02',
      };
    }
    if (stage === 'semantic' || stage === 'schema-repair') {
      return {
        propositionsPreserved: 'yes',
        agencyPreserved: true,
        referencePreserved: true,
      };
    }
    if (stage === 'naturalness') return { natural: true };
    if (stage === 'replace-family') return {};
    return {};
  };
  const result = await generatePart4NaturalnessFirst({ complete, brief: { direction: 'paths' } });
  assert.equal(result.adversarial.verdict, 'PIPELINE_FAIL');
});

test('schema repair allowance is bounded per stage rather than per whole item', () => {
  const budget = createRepairBudget();
  assert.equal(spendSchemaRepair(budget, 'family-discovery'), true);
  assert.equal(spendSchemaRepair(budget, 'family-discovery'), false);
  assert.equal(spendSchemaRepair(budget, 'base-assignment'), true);
  assert.equal(budget.schema, 2);
});

test('Part 1 normalises shifted distractor IDs by the preserved key', () => {
  const keys = {
    items: [
      { number: 1, key: 'camaraderie' },
      { number: 2, key: 'focal' },
    ],
  };
  const distractors = {
    items: [
      {
        number: 2,
        options: [
          { letter: 'A', word: 'camaraderie', isKey: true },
          { letter: 'B', word: 'friendship' },
          { letter: 'C', word: 'solidarity' },
          { letter: 'D', word: 'companionship' },
        ],
      },
      {
        number: 3,
        options: [
          { letter: 'A', word: 'focal', isKey: true },
          { letter: 'B', word: 'central' },
          { letter: 'C', word: 'main' },
          { letter: 'D', word: 'key' },
        ],
      },
    ],
  };
  const normalised = normalisePart1Distractors(keys, distractors);
  assert.equal(normalised.ok, true);
  assert.deepEqual(normalised.data.items.map((item) => item.number), [1, 2]);
  assert.deepEqual(
    normalised.data.items.map((item) => item.options.find((option) => option.isKey).word),
    ['camaraderie', 'focal'],
  );
});

test('Part 2 blind solve and adversary are called once per gap', async () => {
  const blindCalls = [];
  const adversaryCalls = [];
  const complete = async ({ stage }) => {
    if (stage === 'prose') return { passage: 'The shop opens at six.' };
    if (stage === 'gap-discovery') return { sites: [] };
    if (stage === 'select-eight') return { gaps: eightFunctionGaps() };
    if (stage === 'uniqueness') {
      return {
        gaps: eightFunctionGaps().map((gap) => ({
          number: gap.number,
          intendedAnswer: 'at',
          intendedAnswerValid: true,
          alternativeSearchPerformed: true,
          plausibleAlternatives: [],
          uniquenessJustification: 'on, in, and by were tried.',
          confidence: 0.95,
        })),
      };
    }
    return {};
  };
  const result = await generatePart2NaturalnessFirst({
    complete,
    brief: { direction: 'a shop' },
    blindSolve: async (payload) => {
      blindCalls.push(payload);
      return {
        answer: 'at',
        alternativeSearchPerformed: true,
        plausibleAlternatives: [],
      };
    },
    adversary: async (payload) => {
      adversaryCalls.push(payload);
      return { verdict: 'PASS', reason: 'No alternative survives.' };
    },
  });
  assert.equal(blindCalls.length, 8);
  assert.equal(adversaryCalls.length, 8);
  assert.equal(result.finalVerdict, 'PASS');
});

test('objective Part 4 mechanics fail before semantic, blind, or adversarial calls', async () => {
  const calls = [];
  const complete = async ({ stage }) => {
    calls.push(stage);
    if (stage === 'family-candidate') return { familyId: 'TF-02', keyword: 'LATE' };
    if (stage === 'sentence-pair' || stage === 'replace-family') {
      return {
        s1: 'The bus was late.',
        keyword: 'LATE',
        answer: 'late',
        completedS2: 'The bus was late.',
        transformationFamily: 'TF-02',
      };
    }
    return {};
  };
  let externalCalls = 0;
  const result = await generatePart4NaturalnessFirst({
    complete,
    brief: { direction: 'a late bus' },
    blindSolve: async () => { externalCalls += 1; return { answer: 'late' }; },
    adversary: async () => { externalCalls += 1; return { verdict: 'PASS', reason: 'ok' }; },
  });
  assert.equal(result.finalVerdict, 'HARD_FAIL');
  assert.equal(calls.includes('semantic'), false);
  assert.equal(externalCalls, 0);
});
