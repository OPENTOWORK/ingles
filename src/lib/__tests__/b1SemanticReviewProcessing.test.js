import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { part5RejectionIsSubstantive } from '@/lib/b1Part5DoubleKey.js';
import {
  b1ReviewApproval,
  part3EvidenceProblems,
  part5EvidenceProblems,
  part5OptionDecision,
  part6AlternativeReview,
  part6EvidenceProblems,
} from '@/lib/b1ReadingRules/reviewEvidence.js';

const confidence = {
  questions: [{
    number: 25,
    options: ['A) boost', 'B) raise', 'C) increase', 'D) lift'],
  }],
};

function option(letter, fits, defect, reason) {
  return { letter, fits, defect, reason };
}

const bank = [{ id: 'quantifier', type: 'quantifier', words: ['many', 'several', 'some'] }];
const cloze = {
  questions: [{ number: 27, grammarTarget: 'quantifier' }],
  modelAnswers: [{ number: 27, answer: 'many' }],
};

function judged(word, source, accept, overrides = {}) {
  const flags = accept
    ? { grammatical: true, sameMeaning: true, fitsContext: true, b1Appropriate: true }
    : { grammatical: true, sameMeaning: false, fitsContext: true, b1Appropriate: true };
  return {
    word,
    source,
    ...flags,
    accept,
    certainty: 'certain',
    reason: accept ? `${word} is natural here` : `${word} changes the meaning`,
    ...overrides,
  };
}

describe('Part 5 review fields', () => {
  it('trusts fits and defect and keeps the reason for audit', () => {
    const decision = part5OptionDecision(option('C', false, 'preference', 'less common collocation with confidence'));
    assert.equal(decision.status, 'preference');
    assert.equal(decision.reason, 'less common collocation with confidence');
    assert.equal(part5RejectionIsSubstantive({ defect: 'preference', reason: decision.reason }), false);
    assert.equal(part5RejectionIsSubstantive({ defect: 'context', reason: 'incorrect preposition' }), true);

    const problems = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'none', 'natural in this sentence'),
          option('B', false, 'context', 'incorrect preposition'),
          option('C', false, 'preference', 'less common collocation with confidence'),
          option('D', false, 'meaning', 'this changes what the writer did'),
        ],
      }],
    });
    assert.match(problems.join(' '), /more than one natural answer: A \/ C/);
    assert.equal(problems.some((error) => /incorrect preposition|collocation/.test(error) && /more than one/.test(error) && /B|D/.test(error)), false);
  });

  it('accepts one explicit fit and three explicit rejections', () => {
    const problems = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'none', 'the only natural completion'),
          option('B', false, 'context', 'raise does not fit this noun'),
          option('C', false, 'meaning', 'increase changes the claim'),
          option('D', false, 'grammar', 'lift does not fit this pattern'),
        ],
      }],
    });
    assert.deepEqual(problems, []);
  });

  it('makes a missing or contradictory field inconclusive instead of guessing', () => {
    const missingDefect = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'none', 'natural'),
          option('B', false, 'context', 'does not fit'),
          { letter: 'C', fits: false, reason: 'unidiomatic in this context' },
          option('D', false, 'meaning', 'different event'),
        ],
      }],
    });
    assert.match(missingDefect.join(' '), /review is inconclusive/);
    assert.equal(missingDefect.some((error) => /more than one natural answer/.test(error)), false);

    const contradictory = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'grammar', 'natural but marked as grammar'),
          option('B', false, 'context', 'does not fit'),
          option('C', false, 'meaning', 'different event'),
          option('D', false, 'context', 'does not fit'),
        ],
      }],
    });
    assert.match(contradictory.join(' '), /contradictory/);
    assert.equal(contradictory.some((error) => /more than one natural answer/.test(error)), false);

    const uncertain = part5OptionDecision(option('C', false, 'uncertain', 'I am not sure this is natural'));
    assert.equal(uncertain.status, 'uncertain');
  });

  it('reports independent reviews that disagree', () => {
    const problems = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'none', 'natural'),
          option('B', false, 'context', 'does not fit'),
          option('C', false, 'meaning', 'different event'),
          option('D', false, 'context', 'does not fit'),
        ],
      }],
      crossFit: { fits: [{ number: 25, letters: ['A', 'C'] }] },
    });
    assert.match(problems.join(' '), /independent reviews disagree/);
    const agreed = part5EvidenceProblems(confidence, {
      optionJudgements: [{
        number: 25,
        options: [
          option('A', true, 'none', 'natural'),
          option('B', false, 'context', 'does not fit'),
          option('C', false, 'preference', 'less common'),
          option('D', false, 'context', 'does not fit'),
        ],
      }],
      crossFit: { fits: [{ number: 25, letters: ['A', 'C'] }] },
    });
    assert.equal(agreed.some((error) => /disagree|omitted/.test(error)), false);
    assert.match(agreed.join(' '), /A \/ C/);
  });
});

describe('Part 6 alternative handling', () => {
  it('does not compare the keyed answer with itself and deduplicates candidates', () => {
    const review = part6AlternativeReview(cloze.questions[0], {
      alternatives: ['many', 'Many', 'several'],
      tested: [
        judged('many', 'outside-list', true),
        judged('several', 'target-list', true),
        judged('several', 'target-list', true),
        judged('some', 'target-list', false),
        judged('numerous', 'outside-list', false),
      ],
    }, 'many', bank);
    assert.deepEqual(review.selfIgnored, ['many']);
    assert.equal(review.evaluated.filter((item) => item.word === 'several').length, 1);
    assert.deepEqual(review.accepted, ['several']);
    const errors = part6EvidenceProblems(cloze, {
      answers: [{
        number: 27,
        alternatives: ['many', 'several', 'several'],
        tested: [
          judged('many', 'outside-list', true),
          judged('several', 'target-list', true),
          judged('several', 'target-list', true),
          judged('some', 'target-list', false),
          judged('numerous', 'outside-list', false),
        ],
      }],
    }, bank);
    assert.equal(errors.filter((error) => /multiple ordinary/.test(error)).length, 1);
    assert.match(errors.join(' '), /many \/ several/);
    assert.equal(errors.some((error) => /many \/ many/.test(error)), false);
  });

  it('returns an incomplete review when a planned word was not judged', () => {
    const review = part6AlternativeReview(cloze.questions[0], {
      alternatives: ['many'],
      tested: [judged('numerous', 'outside-list', false)],
    }, 'many', bank);
    assert.deepEqual(review.missing, ['several', 'some']);
    assert.deepEqual(review.evaluated.map((item) => item.word), ['numerous']);
    assert.deepEqual(review.accepted, []);
    const errors = part6EvidenceProblems(cloze, {
      answers: [{ number: 27, alternatives: ['many'], tested: [judged('numerous', 'outside-list', false)] }],
    }, bank);
    assert.match(errors.join(' '), /planned words not judged: several, some/);
    assert.match(errors.join(' '), /Evaluated: numerous/);
    assert.equal(errors.some((error) => /multiple ordinary/.test(error)), false);
  });

  it('keeps a genuine second answer and does not turn a contradictory sheet into one', () => {
    const genuine = part6EvidenceProblems(cloze, {
      answers: [{
        number: 27,
        alternatives: [],
        tested: [
          judged('several', 'target-list', true),
          judged('some', 'target-list', false),
          judged('numerous', 'outside-list', false),
        ],
      }],
    }, bank);
    assert.match(genuine.join(' '), /many \/ several/);

    const contradictory = part6EvidenceProblems(cloze, {
      answers: [{
        number: 27,
        alternatives: [],
        tested: [
          judged('several', 'target-list', false, {
            grammatical: true,
            sameMeaning: true,
            fitsContext: true,
            b1Appropriate: true,
            accept: false,
          }),
          judged('some', 'target-list', false),
          judged('numerous', 'outside-list', false),
        ],
      }],
    }, bank);
    assert.match(contradictory.join(' '), /contradicts itself/);
    assert.equal(contradictory.some((error) => /multiple ordinary/.test(error)), false);

    const single = part6EvidenceProblems(cloze, {
      answers: [{
        number: 27,
        alternatives: [],
        tested: [
          judged('several', 'target-list', false),
          judged('some', 'target-list', false),
          judged('numerous', 'outside-list', false),
        ],
      }],
    }, bank);
    assert.deepEqual(single, []);
  });
});

describe('Part 3 certainty', () => {
  const question = {
    questions: [{ number: 12, questionType: 'inference', options: ['A) Relaxed', 'B) Bored'] }],
  };

  it('escalates an uncertain judgement and still catches a stated inference label', () => {
    const uncertain = part3EvidenceProblems(question, {
      itemEvidence: [{
        number: 12,
        statedDirectly: false,
        certainty: 'uncertain',
        reason: 'the feeling may be stated or inferred',
        options: [
          { letter: 'A', grounded: true, reason: 'uses the passage' },
          { letter: 'B', grounded: true, reason: 'uses the passage' },
        ],
      }],
    });
    assert.match(uncertain.join(' '), /review is inconclusive/);
    assert.equal(uncertain.some((error) => /explicit statement/.test(error)), false);

    const stated = part3EvidenceProblems(question, {
      itemEvidence: [{
        number: 12,
        statedDirectly: true,
        certainty: 'certain',
        reason: 'the passage says the writer felt relaxed',
        options: [
          { letter: 'A', grounded: true, reason: 'copies the stated feeling' },
          { letter: 'B', grounded: true, reason: 'reverses it' },
        ],
      }],
    });
    assert.match(stated.join(' '), /explicit statement/);
    const approval = b1ReviewApproval(uncertain);
    assert.equal(approval.structurallyValid, false);
    assert.equal(approval.humanTeacherApproved, false);
  });
});
