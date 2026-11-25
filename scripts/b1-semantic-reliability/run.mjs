/**
 * Standalone B1 semantic reliability evaluation.
 * --measure counts prompts locally. --execute makes the paid review calls.
 * The ledger below is the only spending guard for this script.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { estimateAiCost } from '../../src/lib/aiPricing.js';
import { scrubString } from '../../src/lib/b1ReadingMotorGuard.js';
import { validateB1ReadingQuality } from '../../src/lib/b1ReadingQualityValidator.js';
import { loadEnvLocal } from '../load-env-local.mjs';
import { RELIABILITY_CASES, reliabilityCallPlan } from './cases.mjs';
import { scoreCase } from './score.mjs';
import {
  EVAL_BUDGET_USD,
  EVAL_MAX_CALLS,
  EVAL_MODEL,
  EvaluationStop,
  conservativeCallEstimate,
  createEvaluationLedger,
} from './spendGuard.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const execute = process.argv.includes('--execute');
const measure = process.argv.includes('--measure');

function charsOf(options) {
  const system = String(options?.system || '');
  const user = (options?.messages || []).map((message) => String(message?.content || '')).join('\n');
  return system.length + user.length;
}

function localTransport(testCase, calls) {
  return async (options) => {
    calls.push({ id: testCase.id, chars: charsOf(options), maxTokens: options?.max_tokens || 0 });
    const system = String(options?.system || '');
    if (/chief Cambridge/.test(system)) return { text: JSON.stringify({ confirmed: [], issues: [] }) };
    if (/second independent Cambridge B1 Preliminary Part 5/.test(system)) {
      const dispute = testCase.outcome === 'fail';
      return { text: JSON.stringify({ fits: dispute ? [{ number: 24, letters: ['B', 'C'] }, { number: 25, letters: ['A', 'C'] }] : [], issues: [] }) };
    }
    if (/Part 5/.test(system)) {
      const dispute = testCase.outcome === 'fail';
      return { text: JSON.stringify({ answers: [], optionJudgements: [], alternativeFits: dispute ? [{ number: 24, letters: ['B', 'C'] }, { number: 25, letters: ['A', 'C'] }] : [], verdict: dispute ? 'revise' : 'pass' }) };
    }
    if (/lexical-level/.test(system)) return { text: JSON.stringify({ levelIssues: [], overall: 'b1', issues: [] }) };
    if (/second Cambridge B1 Preliminary Part 4/.test(system)) return { text: JSON.stringify({ sequenceIssues: [], overall: 'coherent', issues: [] }) };
    return { text: JSON.stringify({ answers: [], verdict: 'revise', issues: [] }) };
  };
}

function paidTransport(ledger, testCase) {
  return (options) => {
    const request = {
      ...options,
      model: EVAL_MODEL,
      useAssistant: false,
    };
    return ledger.guardedCall(request, async () => {
      const { cambridgeChatCompletion } = await import('../../src/lib/draloAiEngine.js');
      return cambridgeChatCompletion(request);
    }, { caseId: testCase.id });
  };
}

function summarise(scores) {
  const falseNegatives = [];
  const falsePositives = [];
  for (const score of scores) {
    for (const item of score.falseNegatives || []) falseNegatives.push({ id: score.id, item });
    for (const item of score.falsePositives || []) falsePositives.push({ id: score.id, error: item });
  }
  const statuses = scores.map((score) => score.status);
  const reliable = statuses.length === RELIABILITY_CASES.length
    && statuses.every((status) => status === 'PASS');
  return { falseNegatives, falsePositives, reliable };
}

if (!execute) {
  const plan = reliabilityCallPlan();
  console.log(JSON.stringify({
    model: EVAL_MODEL,
    budgetUsd: EVAL_BUDGET_USD,
    maxCalls: EVAL_MAX_CALLS,
    retries: 0,
    ...plan,
  }, null, 2));
}

if (measure && !execute) {
  const calls = [];
  for (const testCase of RELIABILITY_CASES) {
    await validateB1ReadingQuality(testCase.partNumber, testCase.generated, {
      transport: localTransport(testCase, calls),
    });
  }
  const inputTokens = calls.reduce((sum, call) => sum + Math.ceil(call.chars / 3), 0);
  const ceiling = estimateAiCost(EVAL_MODEL, inputTokens, calls.length * 4096);
  console.log(JSON.stringify({
    measuredCalls: calls.length,
    conservativeCostUsd: ceiling.costUsd,
  }, null, 2));
}

if (!execute) process.exit(0);

loadEnvLocal();
const configuredModel = String(process.env.DRALO_OPENAI_MODEL_VALIDATOR || '').trim();
if (configuredModel && configuredModel !== EVAL_MODEL) {
  console.error(`The validator model is set to ${configuredModel}. This run is priced for ${EVAL_MODEL} and will not start.`);
  process.exit(2);
}
if (!String(process.env.OPENAI_API_KEY || '').trim()) {
  console.error('OPENAI_API_KEY is missing. No call was made.');
  process.exit(2);
}

const ledger = createEvaluationLedger();
const firstEstimate = conservativeCallEstimate({
  system: 'B1 semantic review',
  messages: [{ content: 'prepared case' }],
  max_tokens: 4096,
});
if (firstEstimate.costUsd > EVAL_BUDGET_USD) {
  console.error(`One capped call is estimated at USD ${firstEstimate.costUsd}. That already exceeds USD ${EVAL_BUDGET_USD}. No call was made.`);
  process.exit(2);
}

const scores = [];
const evidence = [];
let halt = null;

for (const testCase of RELIABILITY_CASES) {
  if (halt) {
    scores.push({
      id: testCase.id,
      partNumber: testCase.partNumber,
      expected: testCase.outcome,
      status: 'NOT_RUN',
      reason: halt.detail,
      detected: [],
      missed: testCase.mustDetect,
      falseNegatives: [],
      falsePositives: [],
      errors: [],
    });
    continue;
  }
  const callsBefore = ledger.state.paidCalls;
  try {
    const result = await validateB1ReadingQuality(testCase.partNumber, testCase.generated, {
      transport: paidTransport(ledger, testCase),
    });
    const score = scoreCase(testCase, result);
    scores.push(score);
    evidence.push({ id: testCase.id, result });
  } catch (error) {
    const paidForCase = ledger.state.paidCalls > callsBefore;
    const stop = error instanceof EvaluationStop || error?.code === 'budget' || error?.code === 'call_limit';
    if (stop && !paidForCase) {
      halt = { code: error.code, detail: scrubString(error.message) };
      scores.push({
        id: testCase.id,
        partNumber: testCase.partNumber,
        expected: testCase.outcome,
        status: 'NOT_RUN',
        reason: halt.detail,
        detected: [],
        missed: testCase.mustDetect,
        falseNegatives: [],
        falsePositives: [],
        errors: [],
      });
      continue;
    }
    if (stop) halt = { code: error.code, detail: scrubString(error.message) };
    const malformed = /invalid json/i.test(String(error?.message || ''));
    const score = scoreCase(testCase, {
      ok: false,
      errors: [`B1 review evidence is missing. ${scrubString(error?.message || error)}`],
      warnings: [],
      rubric: null,
      approval: null,
      malformed: malformed || !stop,
      notRun: false,
    });
    if (stop) {
      score.status = 'INCONCLUSIVE';
      score.reason = 'The case stopped when the next call would exceed the evaluation limit.';
    }
    scores.push(score);
    evidence.push({ id: testCase.id, error: scrubString(error?.message || String(error)) });
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const directory = path.join(root, 'diagnostics', 'b1-semantic-reliability');
fs.mkdirSync(directory, { recursive: true });
const filePath = path.join(directory, `run-${stamp}.json`);
const report = {
  model: EVAL_MODEL,
  useAssistant: false,
  retries: 0,
  budgetUsd: EVAL_BUDGET_USD,
  maxCalls: EVAL_MAX_CALLS,
  ledger: ledger.snapshot(),
  summary: summarise(scores),
  scores,
  evidence,
};
fs.writeFileSync(filePath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  saved: filePath,
  paidCalls: report.ledger.paidCalls,
  spentUsd: report.ledger.spentUsd,
  actualInputTokens: report.ledger.actualInputTokens,
  actualOutputTokens: report.ledger.actualOutputTokens,
  estimatedInputTokens: report.ledger.estimatedInputTokens,
  estimatedOutputTokens: report.ledger.estimatedOutputTokens,
  stopped: report.ledger.stopped,
  results: scores.map((score) => ({ id: score.id, status: score.status, reason: score.reason })),
  reliable: report.summary.reliable,
}, null, 2));
