/**
 * Phase 9 focused retest: real Case 5 only.
 * Local files and gpt-4o-mini only. No Supabase or production access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  applyTeacherRepairPlan,
  createTeacherRepairPlan,
  judgePart3Derivation,
} from '../src/lib/ruoeNaturalnessFirstV2/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceFile = path.join(root, 'scripts', 'generated', 'b2-exams', 'exam-11', 'part-03.json');
const outDir = path.join(root, 'local-teacher-repairs', 'ruoe-v2-phase9');
const originalSentence = 'However, experts warn that progress is not always (22) ___ (EQUAL) across a city.';

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
  throw new Error(`Phase 9 permits only gpt-4o-mini: ${JSON.stringify(models)}`);
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
    max_tokens: 1400,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'Return JSON only. Use natural British English. Do not copy an invalid historical correction. Preserve Cambridge Word Formation mechanics.',
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

const sourceAudit = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const exam = {
  ...sourceAudit.generated,
  id: 'exam-11-part-3',
  version: `pre-teacher-patch-${sourceAudit.generatedAt}`,
};
const question = exam.questions.find((row) => row.number === 22);
const originalAnswer = exam.modelAnswers.find((row) => row.number === 22).answer;

const proposal = await complete('generator', 'case-5-local-context-repair', [
  'Repair only the immediate sentence around Q22.',
  `PASSAGE:\n${exam.passage}`,
  `ORIGINAL SENTENCE:\n${originalSentence}`,
  `BASE: ${question.stem}`,
  `CURRENT ANSWER: ${originalAnswer}`,
  'Problem: the current answer is a valid derivation, but the words "not always" make the completed proposition contradict the intended inequality described by the following sentence.',
  'Keep the base EQUAL and answer unequal. Do not use EQUAL as the answer. Preserve marker (22) and printed base (EQUAL).',
  'Return {"originalSentence":"exact original","revisedSentence":"one minimally revised sentence","stem":"EQUAL","answer":"unequal","transformationFamily":"prefix","reason":"..."}.',
].join('\n\n'));

const proposalValid = proposal.originalSentence === originalSentence
  && typeof proposal.revisedSentence === 'string'
  && proposal.revisedSentence.includes('(22)')
  && proposal.revisedSentence.includes('(EQUAL)')
  && proposal.stem === 'EQUAL'
  && String(proposal.answer).toLowerCase() === 'unequal';
if (!proposalValid) throw new Error('Case 5 local-context proposal was malformed or changed the valid target.');

const blind = await complete('blindSolver', 'case-5-blind', [
  'Solve this Part 3 item independently.',
  `Sentence: ${proposal.revisedSentence}`,
  'Base: EQUAL',
  'Return {"answer":"one word","reason":"..."}.',
].join('\n'));
const adversary = await complete('adversary', 'case-5-adversary', [
  'Try to invalidate this completed Part 3 item.',
  `Sentence: ${proposal.revisedSentence}`,
  'Base: EQUAL',
  'Candidate answer: unequal',
  'Return {"natural":true,"forcedContext":false,"alternativeFamilyMembers":[],"lexicalFamilyValidation":{"sameLexicalFamily":true,"extraLexicalRootIntroduced":false,"directDerivation":true,"legitimateBase":true,"reason":"..."}}.',
].join('\n'));

const derivation = judgePart3Derivation({
  stem: 'EQUAL',
  answer: 'unequal',
  natural: adversary.natural,
  forcedContext: adversary.forcedContext,
  alternativeFamilyMembers: adversary.alternativeFamilyMembers,
  lexicalFamilyValidation: adversary.lexicalFamilyValidation,
});
const blindVerdict = String(blind.answer || '').toLowerCase() === 'unequal'
  ? { verdict: 'PASS', reason: 'Blind solver independently supplied unequal.' }
  : { verdict: 'QUALITY_FAIL', reason: `Blind solver supplied ${blind.answer || 'no answer'}, not unequal.` };
const structureVerdict = proposal.revisedSentence !== originalSentence
  ? { verdict: 'PASS', reason: 'One local sentence changed; marker, base, and answer identity were preserved.' }
  : { verdict: 'QUALITY_FAIL', reason: 'The defective local context was not changed.' };

const plan = createTeacherRepairPlan({
  exam,
  examId: 'exam-11',
  sourceVersion: exam.version,
  partNumber: 3,
  questionNumber: 22,
  teacherComment: 'The stored answer contradicts the sentence because the local negative framing reverses the intended inequality.',
  currentAnswer: originalAnswer,
});
const result = await applyTeacherRepairPlan({
  plan,
  proposedQuestion: { answer: 'unequal' },
  localPassageEdit: {
    original: originalSentence,
    revised: proposal.revisedSentence,
  },
  newVersion: 'exam-11-part-3-v2-phase9-case-5',
  validatorsByPart: {
    3: [
      async () => structureVerdict,
      async () => derivation,
      async () => blindVerdict,
      async () => derivation.verdict === 'PASS'
        ? { verdict: 'PASS', reason: 'Adversarial lexical-family and contextual-uniqueness checks found no defect.' }
        : derivation,
    ],
  },
});

const record = {
  caseId: 5,
  source: path.relative(root, sourceFile),
  original: {
    sentence: originalSentence,
    stem: question.stem,
    answer: originalAnswer,
  },
  historicalPatch: {
    answer: 'equal',
    classification: 'INVALID UNDER CURRENT RULES',
  },
  scope: plan.classification.scope,
  proposal,
  blindSolve: blind,
  adversarialValidation: adversary,
  repairResult: result,
  preservation: {
    unchangedQuestions: exam.questions
      .filter((row) => row.number !== 22)
      .every((row) => JSON.stringify(row) === JSON.stringify(result.candidateExam.questions.find((item) => item.number === row.number))),
    unchangedAnswers: exam.modelAnswers
      .filter((row) => row.number !== 22)
      .every((row) => JSON.stringify(row) === JSON.stringify(result.candidateExam.modelAnswers.find((item) => item.number === row.number))),
  },
  models,
  usage,
  calls,
  savedAt: new Date().toISOString(),
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'case-5.json'), JSON.stringify(record, null, 2));
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({
  casesRun: [5],
  results: [{ caseId: 5, status: result.status }],
  models,
  usage,
}, null, 2));
console.log(JSON.stringify({ caseId: 5, status: result.status, revisedSentence: proposal.revisedSentence, usage }, null, 2));
