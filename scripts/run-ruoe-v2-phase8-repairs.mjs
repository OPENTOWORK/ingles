/**
 * Phase 8 focused rerun: Cases 1 and 3 only.
 * Local files and OpenAI gpt-4o-mini only. No persistence or Supabase access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  applyTeacherRepairPlan,
  buildPart1DistractorOnlyPatch,
  createTeacherRepairPlan,
  judgePart1Substitutions,
  judgePart3Derivation,
} from '../src/lib/ruoeNaturalnessFirstV2/index.js';
import {
  teacherPart1DistractorRepairPrompt,
  teacherPart3TargetReplacementPrompt,
} from '../src/lib/ruoeNaturalnessFirstV2/prompts.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'scripts', 'generated', 'b2-exams');
const outDir = path.join(root, 'local-teacher-repairs', 'ruoe-v2-phase8');

loadEnvLocal();
const apiKey = process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is required.');
const fallback = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const models = {
  generator: process.env.RUOE_V2_GENERATOR_MODEL || fallback,
  blindSolver: process.env.RUOE_V2_BLIND_SOLVER_MODEL || fallback,
  adversary: process.env.RUOE_V2_ADVERSARIAL_MODEL || fallback,
};
if (Object.values(models).some((model) => model !== 'gpt-4o-mini')) {
  throw new Error(`Phase 8 permits only gpt-4o-mini: ${JSON.stringify(models)}`);
}

const openai = new OpenAI({ apiKey });
const calls = [];
const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };

function parseJson(raw) {
  const text = String(raw || '').trim();
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model returned no JSON object.');
    return JSON.parse(match[0]);
  }
}

async function complete(role, stage, user) {
  const response = await openai.chat.completions.create({
    model: models[role],
    temperature: role === 'generator' ? 0.15 : 0,
    max_tokens: 1800,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Return JSON only. Use ordinary British English. Evaluate the complete supplied context. Never call an option contextually defensible if your own reason says that it contradicts the passage.',
      },
      { role: 'user', content: `${user}\nReturn JSON.` },
    ],
  });
  const u = response.usage || {};
  usage.promptTokens += Number(u.prompt_tokens || 0);
  usage.completionTokens += Number(u.completion_tokens || 0);
  usage.totalTokens += Number(u.total_tokens || 0);
  const output = parseJson(response.choices?.[0]?.message?.content);
  calls.push({ role, stage, model: models[role], usage: u, output });
  return output;
}

function source(exam, part) {
  const file = path.join(sourceRoot, `exam-${exam}`, `part-${String(part).padStart(2, '0')}.json`);
  const audit = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    path: path.relative(root, file),
    exam: {
      ...audit.generated,
      id: `exam-${exam}-part-${part}`,
      version: `pre-teacher-patch-${audit.generatedAt}`,
    },
  };
}

function optionWord(option) {
  return String(option).replace(/^[A-D]\)\s*/i, '').trim();
}

function survivorLetters(judgements) {
  return (judgements || []).filter((row) =>
    row.grammatical &&
    row.naturalBritishEnglish &&
    row.semanticallyDefensible &&
    (row.collocationallyValid ?? row.collocationalFit) &&
    (row.contextuallyDefensible ?? true))
    .map((row) => String(row.letter || row.option || '').toUpperCase());
}

async function evaluatePart1(passage, sentence, options, suffix) {
  const adversary = await complete('adversary', `case-1-independent-substitution${suffix}`, [
    'Substitute A, B, C and D independently. The boolean fields are authoritative.',
    'Contextually defensible means compatible with the claims made by this passage, not merely imaginable in another situation.',
    `PASSAGE:\n${passage}`,
    `SENTENCE:\n${sentence}`,
    `OPTIONS:\n${JSON.stringify(options)}`,
    'Return {"judgements":[{"letter":"A","grammatical":true,"naturalBritishEnglish":true,"semanticallyDefensible":true,"collocationallyValid":true,"contextuallyDefensible":true,"reason":"..."}]} with exactly A-D.',
  ].join('\n\n'));
  return { adversary, judgement: judgePart1Substitutions(adversary.judgements) };
}

async function runCase1() {
  const loaded = source(16, 1);
  const originalQuestion = loaded.exam.questions.find((row) => row.number === 6);
  const sentence = 'Although unpaid, this kind of work can have a very ___ effect on job prospects.';
  let options = [...originalQuestion.options];
  let evaluated = await evaluatePart1(loaded.exam.passage, sentence, options, '-original');
  const attempts = [{ kind: 'original-validation', options, ...evaluated }];

  for (let attempt = 1; attempt <= 3 && evaluated.judgement.verdict !== 'PASS'; attempt += 1) {
    const alternatives = survivorLetters(evaluated.adversary.judgements).filter((letter) => letter !== 'D');
    if (!alternatives.length) break;
    const targetLetter = alternatives[0];
    let proposed;
    let patch;
    for (let candidateAttempt = 1; candidateAttempt <= 2; candidateAttempt += 1) {
      proposed = await complete('generator', `case-1-repair-${attempt}-candidate-${candidateAttempt}`, teacherPart1DistractorRepairPrompt({
        passage: loaded.exam.passage,
        sentence,
        options,
        judgements: evaluated.adversary.judgements,
        keyLetter: 'D',
        targetLetter,
      }));
      patch = buildPart1DistractorOnlyPatch({
        options,
        judgements: evaluated.adversary.judgements,
        keyLetter: 'D',
        targetLetter,
        replacementWord: proposed.word,
      });
      if (patch.status === 'PASS') break;
    }
    if (patch.status !== 'PASS') throw new Error(`Case 1 local patch failed: ${patch.reason}`);
    options = patch.proposedQuestion.options;
    evaluated = await evaluatePart1(loaded.exam.passage, sentence, options, `-repair-${attempt}`);
    attempts.push({ kind: 'distractor-repair', targetLetter, proposed, options, ...evaluated });
  }

  const blind = await complete('blindSolver', 'case-1-blind-final', [
    'Solve this Part 1 item without seeing the key or repair history.',
    `PASSAGE:\n${loaded.exam.passage}`,
    `SENTENCE:\n${sentence}`,
    `OPTIONS:\n${JSON.stringify(options)}`,
    'Return {"answer":"one label A-D","reason":"..."}.',
  ].join('\n\n'));
  const blindVerdict = /^[A-D]$/.test(String(blind.answer || ''))
    ? blind.answer === 'D'
      ? { verdict: 'PASS', reason: 'Blind solver selected D.' }
      : { verdict: 'QUALITY_FAIL', reason: `Blind solver selected ${blind.answer}, not D.` }
    : { verdict: 'PIPELINE_FAIL', reason: 'Blind solver did not return exactly one label.' };
  const optionWords = options.map(optionWord);
  const optionStructureVerdict = new Set(optionWords).size === 4
    ? { verdict: 'PASS', reason: 'All four option words are distinct.' }
    : { verdict: 'HARD_FAIL', reason: 'Part 1 options contain a duplicate word.' };
  const plan = createTeacherRepairPlan({
    exam: loaded.exam,
    examId: 'exam-16',
    sourceVersion: loaded.exam.version,
    partNumber: 1,
    questionNumber: 6,
    teacherComment: 'strong is another natural and defensible option; the distractor set is ambiguous.',
    currentAnswer: 'D',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { options },
    newVersion: 'exam-16-part-1-v2-phase8-case-1',
    validatorsByPart: {
      1: [
        async () => optionStructureVerdict,
        async () => evaluated.judgement,
        async () => blindVerdict,
        async () => evaluated.judgement.verdict === 'PASS'
          ? { verdict: 'PASS', reason: 'Adversarial A-D substitution found exactly one survivor.' }
          : evaluated.judgement,
      ],
    },
  });
  return {
    caseId: 1,
    source: loaded.path,
    original: { sentence, options: originalQuestion.options, key: 'D) positive' },
    previousPhase7Attempts: [
      ['significant', 'influential', 'beneficial', 'positive'],
      ['feeble', 'detrimental', 'inconsequential', 'positive'],
    ],
    attempts,
    finalOptions: options,
    blindSolve: blind,
    repairResult: result,
    preservation: {
      unchangedQuestions: loaded.exam.questions
        .filter((row) => row.number !== 6)
        .every((row) => JSON.stringify(row) === JSON.stringify(result.candidateExam.questions.find((item) => item.number === row.number))),
    },
  };
}

function part3ProposalValid(proposal) {
  return Boolean(
    proposal &&
    typeof proposal.revisedSentence === 'string' &&
    proposal.revisedSentence.includes('(17)') &&
    /^[A-Za-z]+$/.test(String(proposal.stem || '')) &&
    /^[A-Za-z]+$/.test(String(proposal.answer || '')) &&
    typeof proposal.transformationFamily === 'string',
  );
}

function canonicalisePart3Proposal(proposal, originalSentence) {
  const stem = String(proposal?.stem || '').trim().toUpperCase();
  const answer = String(proposal?.answer || '').trim().toLowerCase();
  let revisedSentence = String(proposal?.revisedSentence || '');
  revisedSentence = revisedSentence.replace(
    /(\(17\)\s*_{3,}\s*)\([A-Za-z]+\)/,
    `$1(${stem})`,
  );
  return {
    ...proposal,
    originalSentence,
    revisedSentence,
    stem,
    answer,
  };
}

async function evaluatePart3(proposal, suffix) {
  const blind = await complete('blindSolver', `case-3-blind${suffix}`, [
    'Solve this Part 3 gap independently.',
    `Sentence: ${proposal.revisedSentence}`,
    `Base: ${proposal.stem}`,
    'Return {"answer":"one word","reason":"..."}.',
  ].join('\n'));
  const adversary = await complete('adversary', `case-3-adversary${suffix}`, [
    `Try to invalidate ${proposal.stem} -> ${proposal.answer}.`,
    `Completed context: ${proposal.revisedSentence.replace(/_{3,}/, proposal.answer)}`,
    'Return {"natural":true,"forcedContext":false,"contextRequiresPlural":true,"alternativeFamilyMembers":[],"lexicalFamilyValidation":{"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."}}.',
  ].join('\n'));
  const derivation = judgePart3Derivation({
    stem: proposal.stem,
    answer: proposal.answer,
    natural: adversary.natural,
    forcedContext: adversary.forcedContext,
    contextRequiresPlural: adversary.contextRequiresPlural,
    alternativeFamilyMembers: adversary.alternativeFamilyMembers,
    lexicalFamilyValidation: adversary.lexicalFamilyValidation,
  });
  const blindVerdict = String(blind.answer || '').toLowerCase() === String(proposal.answer || '').toLowerCase()
    ? { verdict: 'PASS', reason: `Blind solver supplied ${blind.answer}.` }
    : { verdict: 'QUALITY_FAIL', reason: `Blind solver supplied ${blind.answer || 'no answer'}, not ${proposal.answer}.` };
  return { blind, adversary, derivation, blindVerdict };
}

async function runCase3() {
  const loaded = source(16, 3);
  const originalQuestion = loaded.exam.questions.find((row) => row.number === 17);
  const originalAnswer = loaded.exam.modelAnswers.find((row) => row.number === 17).answer;
  const originalSentence = "A good night's sleep improves our mood, sharpens our memory and supports better (17) ___ (DECIDE) during the day.";
  let feedback = 'The compound answer introduces the extra lexical root MAKING and is not a direct one-word derivation.';
  const attempts = [];
  let proposal;
  let evaluated;

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const rawProposal = await complete('generator', `case-3-target-replacement-${attempt}`, teacherPart3TargetReplacementPrompt({
      passage: loaded.exam.passage,
      sentence: originalSentence,
      base: originalQuestion.stem,
      answer: originalAnswer,
      validatorFeedback: feedback,
    }));
    proposal = canonicalisePart3Proposal(rawProposal, originalSentence);
    if (!part3ProposalValid(proposal)) {
      const repaired = await complete('generator', `case-3-schema-repair-${attempt}`, [
        'Repair structure only. Preserve the proposed stem, answer, revised sentence, family, and linguistic decision.',
        `Malformed output: ${JSON.stringify(rawProposal)}`,
        `The exact originalSentence field must be: ${JSON.stringify(originalSentence)}`,
        'revisedSentence must contain the unchanged marker (17) and a blank written as ___.',
        'Return exactly {"originalSentence":"...","revisedSentence":"...","stem":"one lexical base","answer":"one derived word","transformationFamily":"...","reason":"..."}.',
      ].join('\n'));
      proposal = canonicalisePart3Proposal(repaired, originalSentence);
    }
    if (!part3ProposalValid(proposal)) {
      throw new Error('Case 3 target replacement remained malformed after one schema repair.');
    }
    evaluated = await evaluatePart3(proposal, `-${attempt}`);
    attempts.push({ proposal, ...evaluated });
    if (evaluated.derivation.verdict === 'PASS' && evaluated.blindVerdict.verdict === 'PASS') break;
    const blindAnswer = String(evaluated.blind.answer || '').trim().toLowerCase();
    if (/^[a-z]+$/.test(blindAnswer) && blindAnswer !== proposal.answer) {
      const blindDerivation = judgePart3Derivation({
        stem: proposal.stem,
        answer: blindAnswer,
        natural: true,
        forcedContext: false,
        contextRequiresPlural: evaluated.adversary.contextRequiresPlural,
        alternativeFamilyMembers: [],
        lexicalFamilyValidation: evaluated.adversary.lexicalFamilyValidation,
      });
      if (blindDerivation.verdict === 'PASS') {
        proposal = {
          ...proposal,
          answer: blindAnswer,
          reason: `Blind-supported number correction from ${proposal.answer} to ${blindAnswer}; morphology was revalidated.`,
        };
        evaluated = await evaluatePart3(proposal, `-${attempt}-blind-supported-repair`);
        attempts.push({ kind: 'blind-supported-number-repair', proposal, ...evaluated });
        if (evaluated.derivation.verdict === 'PASS' && evaluated.blindVerdict.verdict === 'PASS') break;
      }
    }
    feedback = `${evaluated.derivation.reason} ${evaluated.blindVerdict.reason}`;
  }

  const plan = createTeacherRepairPlan({
    exam: loaded.exam,
    examId: 'exam-16',
    sourceVersion: loaded.exam.version,
    partNumber: 3,
    questionNumber: 17,
    teacherComment: 'The original DECIDE target forces an invalid compound derivation; replace the target if necessary.',
    currentAnswer: originalAnswer,
  });
  const revisedQuestion = {
    ...originalQuestion,
    stem: proposal.stem.toUpperCase(),
    answer: proposal.answer,
    transformationFamily: proposal.transformationFamily,
  };
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: revisedQuestion,
    localPassageEdit: proposal.revisedSentence === originalSentence
      ? undefined
      : { original: originalSentence, revised: proposal.revisedSentence },
    newVersion: 'exam-16-part-3-v2-phase8-case-3',
    validatorsByPart: {
      3: [
        async () => evaluated.derivation,
        async () => evaluated.blindVerdict,
        async () => evaluated.derivation.verdict === 'PASS'
          ? { verdict: 'PASS', reason: 'Adversarial lexical-family validation found no defect.' }
          : evaluated.derivation,
      ],
    },
  });
  return {
    caseId: 3,
    source: loaded.path,
    original: { sentence: originalSentence, stem: originalQuestion.stem, answer: originalAnswer },
    previousPhase7Attempts: [
      { malformedStem: 'full sentence', answer: 'deciding' },
      { stem: 'DECIDE', answer: 'decision' },
    ],
    attempts,
    finalProposal: proposal,
    repairResult: result,
    preservation: {
      unchangedQuestions: loaded.exam.questions
        .filter((row) => row.number !== 17)
        .every((row) => JSON.stringify(row) === JSON.stringify(result.candidateExam.questions.find((item) => item.number === row.number))),
      unchangedAnswers: loaded.exam.modelAnswers
        .filter((row) => row.number !== 17)
        .every((row) => JSON.stringify(row) === JSON.stringify(result.candidateExam.modelAnswers.find((item) => item.number === row.number))),
    },
  };
}

fs.mkdirSync(outDir, { recursive: true });
const records = [];
for (const run of [runCase1, runCase3]) {
  try {
    records.push(await run());
  } catch (error) {
    records.push({ caseId: Number(run.name.replace(/\D/g, '')), repairResult: { status: 'PIPELINE_FAIL', reason: String(error?.message || error) } });
  }
}
for (const record of records) {
  fs.writeFileSync(path.join(outDir, `case-${record.caseId}.json`), JSON.stringify({ ...record, models, savedAt: new Date().toISOString() }, null, 2));
}
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({
  casesRun: [1, 3],
  results: records.map((row) => ({ caseId: row.caseId, status: row.repairResult.status })),
  models,
  usage,
  calls,
}, null, 2));
console.log(JSON.stringify({ results: records.map((row) => ({ caseId: row.caseId, status: row.repairResult.status })), usage }, null, 2));
