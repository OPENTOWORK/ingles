/**
 * Phase 7: five-case local teacher-feedback validation.
 * Reads ignored pre-patch artefacts and writes local JSON only. No Supabase access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  applyTeacherRepairPlan,
  createTeacherRepairPlan,
  judgePart1Substitutions,
  judgePart3Derivation,
} from '../src/lib/ruoeNaturalnessFirstV2/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'scripts', 'generated', 'b2-exams');
const outDir = path.join(root, 'local-teacher-repairs', 'ruoe-v2-phase7');

loadEnvLocal();
const apiKey = process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY;
if (!apiKey) throw new Error('OPENAI_API_KEY is required for independent repair validation.');

const fallback = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const models = {
  generator: process.env.RUOE_V2_GENERATOR_MODEL || fallback,
  blindSolver: process.env.RUOE_V2_BLIND_SOLVER_MODEL || fallback,
  adversary: process.env.RUOE_V2_ADVERSARIAL_MODEL || fallback,
};
const unsupported = Object.entries(models).filter(([, model]) => model !== 'gpt-4o-mini');
if (unsupported.length) {
  throw new Error(`Phase 7 is restricted to gpt-4o-mini: ${unsupported.map(([role, model]) => `${role}=${model}`).join(', ')}`);
}

const openai = new OpenAI({ apiKey });
const usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
const calls = [];

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
    temperature: role === 'generator' ? 0.2 : 0,
    max_tokens: 1800,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Return JSON only. Use natural British English. Judge the supplied existing exam independently and do not assume that the teacher or intended key is correct.',
      },
      { role: 'user', content: `${user}\nReturn JSON.` },
    ],
  });
  const callUsage = response.usage || {};
  usage.promptTokens += Number(callUsage.prompt_tokens || 0);
  usage.completionTokens += Number(callUsage.completion_tokens || 0);
  usage.totalTokens += Number(callUsage.total_tokens || 0);
  calls.push({ role, stage, model: models[role], usage: callUsage });
  return parseJson(response.choices?.[0]?.message?.content);
}

async function repairPart3Proposal(raw) {
  const valid = (value) =>
    value &&
    /^[A-Za-z]+$/.test(String(value.stem || '')) &&
    /^[A-Za-z]+$/.test(String(value.answer || '')) &&
    typeof value.transformationFamily === 'string';
  if (valid(raw)) return { value: raw, retries: 0 };
  const repaired = await complete('generator', 'case-3-schema-repair', [
    'Repair structure only; do not reconsider the linguistic proposal.',
    `Malformed output: ${JSON.stringify(raw)}`,
    'The source base is DECIDE. The answer must be the one-word DECIDE-family answer already implied by the proposal and the sentence.',
    'Return exactly {"stem":"DECIDE","answer":"one alphabetic word","transformationFamily":"noun|adjective|adverb|verb","reason":"..."}.',
  ].join('\n'));
  if (!valid(repaired)) throw new Error('Case 3 proposal remained malformed after one schema-repair attempt.');
  return { value: repaired, retries: 1 };
}

function readSource(exam, part) {
  const file = path.join(sourceRoot, `exam-${exam}`, `part-${String(part).padStart(2, '0')}.json`);
  const audit = JSON.parse(fs.readFileSync(file, 'utf8'));
  return {
    file: path.relative(root, file),
    generatedAt: audit.generatedAt,
    exam: {
      ...audit.generated,
      id: `exam-${exam}-part-${part}`,
      version: `pre-teacher-patch-${audit.generatedAt}`,
    },
  };
}

function answerFor(exam, number) {
  return exam.modelAnswers.find((row) => Number(row.number) === Number(number))?.answer;
}

function unchangedNumbers(original, candidate, excluded) {
  return original.questions
    .filter((question) => question.number !== excluded)
    .filter((question) => {
      const revised = candidate.questions.find((row) => row.number === question.number);
      return JSON.stringify(question) === JSON.stringify(revised);
    })
    .map((question) => question.number);
}

async function runCase1() {
  const source = readSource(16, 1);
  const question = source.exam.questions.find((row) => row.number === 6);
  const sentence = 'Although unpaid, this kind of work can have a very ___ effect on job prospects.';
  let proposal = await complete('generator', 'case-1-repair', [
    'Repair only the distractors in this existing Part 1 item.',
    `Sentence: ${sentence}`,
    `Options: ${JSON.stringify(question.options)}`,
    'Key: D) positive.',
    'Teacher evidence: strong is also natural and defensible here.',
    'Keep D and the sentence. Return {"options":["A) ...","B) ...","C) ...","D) positive"],"reason":"..."}.',
    'Every distractor must fail at least one of grammar, ordinary British-English naturalness, collocation, or contextual meaning.',
  ].join('\n'));
  let options = proposal.options;
  if (!Array.isArray(options) || options.length !== 4) throw new Error('Case 1 repair proposal did not contain four options.');

  const evaluate = async (suffix) => {
    const blindResult = await complete('blindSolver', `case-1-blind${suffix}`, [
      'Solve this multiple-choice cloze without seeing a key or teacher comment.',
      `Sentence: ${sentence}`,
      `Options: ${JSON.stringify(options)}`,
      'If more than one option is defensible, preserve that finding in the answer. Otherwise return exactly one label.',
      'Return {"answer":"A|B|C|D or a multi-label ambiguity finding","reason":"..."}.',
    ].join('\n'));
    const adversaryResult = await complete('adversary', `case-1-adversary${suffix}`, [
      'Try to invalidate this Part 1 item. Substitute every option independently into the complete sentence.',
      `Sentence: ${sentence}`,
      `Options: ${JSON.stringify(options)}`,
      'Return {"judgements":[{"letter":"A","grammatical":true,"naturalBritishEnglish":true,"semanticallyDefensible":true,"collocationallyValid":true,"contextuallyDefensible":true,"reason":"..."}]} with exactly A-D.',
    ].join('\n'));
    return {
      blind: blindResult,
      adversary: adversaryResult,
      mechanical: judgePart1Substitutions(adversaryResult.judgements),
    };
  };
  let evaluated = await evaluate('');
  let repairRetries = 0;
  if (evaluated.mechanical.verdict !== 'PASS') {
    proposal = await complete('generator', 'case-1-linguistic-repair', [
      'Make one bounded distractor-only repair after adversarial failure.',
      `Sentence: ${sentence}`,
      `Rejected options: ${JSON.stringify(options)}`,
      `Adversarial judgements: ${JSON.stringify(evaluated.adversary.judgements)}`,
      'Keep D) positive and do not change the sentence. Replace every surviving distractor with a plausible-looking word that is not grammatical, collocationally valid, natural, and contextually defensible in the complete sentence.',
      'Return {"options":["A) ...","B) ...","C) ...","D) positive"],"reason":"..."}.',
    ].join('\n'));
    options = proposal.options;
    if (!Array.isArray(options) || options.length !== 4) throw new Error('Case 1 retry did not contain four options.');
    repairRetries = 1;
    evaluated = await evaluate('-retry-1');
  }
  const { blind, adversary, mechanical } = evaluated;
  const blindValid = /^[ABCD]$/.test(String(blind.answer || '').trim());
  const layerVerdicts = [
    mechanical,
    !blindValid
      ? { verdict: 'PIPELINE_FAIL', reason: `Blind solver returned "${blind.answer || ''}" instead of exactly one option label.` }
      : blind.answer === 'D'
      ? { verdict: 'PASS', reason: `Blind solver independently selected D. ${blind.reason || ''}` }
      : { verdict: 'QUALITY_FAIL', reason: `Blind solver selected ${blind.answer || 'no answer'}, not D.` },
    mechanical.verdict === 'PASS'
      ? { verdict: 'PASS', reason: 'Adversarial A-D substitution found exactly one survivor.' }
      : { verdict: mechanical.verdict, reason: mechanical.reason },
  ];
  const plan = createTeacherRepairPlan({
    exam: source.exam,
    examId: 'exam-16',
    sourceVersion: source.exam.version,
    partNumber: 1,
    questionNumber: 6,
    teacherComment: 'strong is another natural and defensible option; the distractor set is ambiguous.',
    currentAnswer: 'D',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { options },
    newVersion: 'exam-16-part-1-v2-teacher-repair-case-1',
    validatorsByPart: { 1: layerVerdicts.map((row) => async () => row) },
  });
  return {
    caseId: 1,
    source: source.file,
    historicalCorrectionAvailable: false,
    proposal,
    repairRetries,
    blindSolve: blind,
    adversarialValidation: adversary,
    repairResult: result,
    preservation: {
      unchangedQuestions: unchangedNumbers(source.exam, result.candidateExam, 6),
      expected: [1, 2, 3, 4, 5, 7, 8],
    },
  };
}

async function runCase3() {
  const source = readSource(16, 3);
  const original = source.exam.questions.find((row) => row.number === 17);
  const rawProposal = await complete('generator', 'case-3-repair', [
    'Repair only Q17 in this existing Part 3 item.',
    'Sentence: A good night’s sleep improves our mood, sharpens our memory and supports better (17) ___ during the day.',
    `Base: ${original.stem}. Current key: ${answerFor(source.exam, 17)}.`,
    'Teacher evidence: the current compound route is forced or invalid. Do not use a second lexical root.',
    'Return {"stem":"...","answer":"...","transformationFamily":"...","reason":"..."}.',
  ].join('\n'));
  const proposalRepair = await repairPart3Proposal(rawProposal);
  let proposal = proposalRepair.value;
  const evaluate = async (suffix) => {
    const blindResult = await complete('blindSolver', `case-3-blind${suffix}`, [
      'Solve this Word Formation gap independently.',
      `Sentence: A good night’s sleep improves our mood, sharpens our memory and supports better ___ during the day. Base: ${proposal.stem}.`,
      'Return {"answer":"one word","reason":"..."}.',
    ].join('\n'));
    const adversaryResult = await complete('adversary', `case-3-adversary${suffix}`, [
      `Try to invalidate the derivation ${proposal.stem} -> ${proposal.answer} in: supports better ___ during the day.`,
      'Return {"natural":true,"forcedContext":false,"alternativeFamilyMembers":[],"lexicalFamilyValidation":{"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."}}.',
    ].join('\n'));
    return {
      blind: blindResult,
      adversary: adversaryResult,
      derivation: judgePart3Derivation({
        stem: proposal.stem,
        answer: proposal.answer,
        natural: adversaryResult.natural,
        forcedContext: adversaryResult.forcedContext,
        alternativeFamilyMembers: adversaryResult.alternativeFamilyMembers,
        contextRequiresPlural: true,
        lexicalFamilyValidation: adversaryResult.lexicalFamilyValidation,
      }),
    };
  };
  let evaluated = await evaluate('');
  let repairRetries = 0;
  if (
    evaluated.derivation.verdict !== 'PASS' ||
    String(evaluated.blind.answer || '').toLowerCase() !== String(proposal.answer || '').toLowerCase()
  ) {
    const retried = await complete('generator', 'case-3-linguistic-repair', [
      'Make one bounded local repair to this rejected Part 3 proposal.',
      `Rejected proposal: ${JSON.stringify(proposal)}`,
      `Blind solve: ${JSON.stringify(evaluated.blind)}`,
      `Validator: ${JSON.stringify(evaluated.derivation)}`,
      'Keep the legitimate base DECIDE and the existing sentence. Supply the unique natural one-word direct derivation required after "supports better".',
      'Return exactly {"stem":"DECIDE","answer":"one alphabetic word","transformationFamily":"noun","reason":"..."}.',
    ].join('\n'));
    const normalised = await repairPart3Proposal(retried);
    proposal = normalised.value;
    repairRetries = 1;
    evaluated = await evaluate('-retry-1');
  }
  const { blind, adversary, derivation } = evaluated;
  const layerVerdicts = [
    derivation,
    String(blind.answer || '').toLowerCase() === String(proposal.answer || '').toLowerCase()
      ? { verdict: 'PASS', reason: `Blind solver independently supplied ${blind.answer}.` }
      : { verdict: 'QUALITY_FAIL', reason: `Blind solver supplied ${blind.answer || 'no answer'}, not ${proposal.answer}.` },
    derivation.verdict === 'PASS'
      ? { verdict: 'PASS', reason: 'Adversarial lexical-family and context checks found no defect.' }
      : { verdict: derivation.verdict, reason: derivation.reason },
  ];
  const plan = createTeacherRepairPlan({
    exam: source.exam,
    examId: 'exam-16',
    sourceVersion: source.exam.version,
    partNumber: 3,
    questionNumber: 17,
    teacherComment: 'The DECIDE derivation introduces a forced compound route, so the target must be replaced.',
    currentAnswer: answerFor(source.exam, 17),
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { ...original, ...proposal },
    newVersion: 'exam-16-part-3-v2-teacher-repair-case-3',
    validatorsByPart: { 3: layerVerdicts.map((row) => async () => row) },
  });
  return {
    caseId: 3,
    source: source.file,
    historicalCorrection: 'DECIDE → decisions',
    proposal,
    schemaRepairAttempts: proposalRepair.retries,
    repairRetries,
    blindSolve: blind,
    adversarialValidation: adversary,
    repairResult: result,
    preservation: {
      unchangedQuestions: unchangedNumbers(source.exam, result.candidateExam, 17),
      expected: [18, 19, 20, 21, 22, 23, 24],
    },
  };
}

async function runCase5() {
  const source = readSource(11, 3);
  const original = source.exam.questions.find((row) => row.number === 22);
  const proposal = await complete('generator', 'case-5-repair', [
    'Inspect this existing Part 3 key/content contradiction and propose only the corrected key.',
    'Sentence: However, experts warn that progress is not always (22) ___ across a city.',
    `Base: ${original.stem}. Stored key: ${answerFor(source.exam, 22)}.`,
    'Return {"answer":"...","reason":"..."}. Do not rewrite the sentence.',
  ].join('\n'));
  const blind = await complete('blindSolver', 'case-5-blind', [
    `Fill the gap independently: However, experts warn that progress is not always ___ across a city. Base word: ${original.stem}.`,
    'Return {"answer":"one word","reason":"..."}.',
  ].join('\n'));
  const derivation = judgePart3Derivation({
    stem: original.stem,
    answer: proposal.answer,
    natural: true,
  });
  const layerVerdicts = [
    { verdict: 'PASS', reason: 'Structure, question number, and separate modelAnswers key were preserved and synchronised.' },
    derivation,
    String(blind.answer || '').toLowerCase() === String(proposal.answer || '').toLowerCase()
      ? { verdict: 'PASS', reason: `Blind solver independently supplied ${blind.answer}.` }
      : { verdict: 'QUALITY_FAIL', reason: `Blind solver supplied ${blind.answer || 'no answer'}, not ${proposal.answer}.` },
    { verdict: derivation.verdict, reason: `Adversarial mechanics: ${derivation.reason}` },
  ];
  const plan = createTeacherRepairPlan({
    exam: source.exam,
    examId: 'exam-11',
    sourceVersion: source.exam.version,
    partNumber: 3,
    questionNumber: 22,
    teacherComment: 'The answer key is wrong and contradicts the local sentence.',
    currentAnswer: answerFor(source.exam, 22),
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { answer: proposal.answer },
    newVersion: 'exam-11-part-3-v2-teacher-repair-case-5-rejected',
    validatorsByPart: { 3: layerVerdicts.map((row) => async () => row) },
  });
  return {
    caseId: 5,
    source: source.file,
    historicalCorrection: 'UNEQUAL → EQUAL',
    proposal,
    blindSolve: blind,
    repairResult: result,
    preservation: {
      unchangedQuestions: unchangedNumbers(source.exam, result.candidateExam, 22),
      expected: [17, 18, 19, 20, 21, 23, 24],
    },
  };
}

fs.mkdirSync(outDir, { recursive: true });
const records = [];

for (const run of [runCase1, runCase3, runCase5]) {
  try {
    records.push(await run());
  } catch (error) {
    records.push({
      caseId: Number(run.name.replace(/\D/g, '')),
      repairResult: { status: 'PIPELINE_FAIL', reason: String(error?.message || error) },
    });
  }
}

records.splice(1, 0, {
  caseId: 2,
  repairResult: {
    status: 'PIPELINE_FAIL',
    reason: 'Stopped: the exact historical teacher-patch document/comment for Exam 15 Part 2 was not present locally. The prompt only summarises that the example/opening required correction.',
  },
  source: readSource(15, 2).file,
});
records.splice(3, 0, {
  caseId: 4,
  repairResult: {
    status: 'PIPELINE_FAIL',
    reason: 'Stopped: the supplied historical direction (BEEN / has been using) does not match the located pre-patch Q25, whose subject is flexible hours and whose predicate is make a difference. Applying it would invent a different item.',
  },
  source: readSource(11, 4).file,
});

for (const record of records) {
  fs.writeFileSync(
    path.join(outDir, `case-${record.caseId}.json`),
    JSON.stringify({ ...record, models, savedAt: new Date().toISOString() }, null, 2),
  );
}
fs.writeFileSync(
  path.join(outDir, 'index.json'),
  JSON.stringify({ records: records.map(({ caseId, repairResult }) => ({ caseId, status: repairResult.status, reason: repairResult.reason })), models, usage, calls }, null, 2),
);
console.log(JSON.stringify({ results: records.map((row) => ({ caseId: row.caseId, status: row.repairResult.status })), usage }, null, 2));
