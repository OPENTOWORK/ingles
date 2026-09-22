/**
 * Fourth local RUOE v2 pilot: pipeline reliability.
 * Local code only. Does not read or write Supabase.
 * Aborts unless generator, blind solver, and adversary all resolve to gpt-4o-mini.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { runNaturalnessFirstGeneration } from '../src/lib/ruoeNaturalnessFirstV2/generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'local-pilots', 'ruoe-v2-pipeline-reliability');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match || process.env[match[1].trim()]) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"'))
      || (value.startsWith("'") && value.endsWith("'"))
    ) value = value.slice(1, -1);
    process.env[match[1].trim()] = value;
  }
}

const BRIEFS = [
  { partNumber: 1, id: 'P1-F', direction: 'How residents restored the noticeboard outside a village hall' },
  { partNumber: 1, id: 'P1-G', direction: 'Why a local cinema introduced relaxed Sunday screenings' },
  { partNumber: 1, id: 'P1-H', direction: 'A repair café that teaches people to mend small appliances' },
  { partNumber: 2, id: 'P2-F', direction: 'The volunteer who checks nesting boxes in a country park' },
  { partNumber: 2, id: 'P2-G', direction: 'A bookshop that delivers orders by cargo bicycle' },
  { partNumber: 2, id: 'P2-H', direction: 'Learning to identify trees during a winter walk' },
  { partNumber: 3, id: 'P3-F', direction: 'Restoring painted signs at an old railway station' },
  { partNumber: 3, id: 'P3-G', direction: 'Organising donated tools in a community workshop' },
  { partNumber: 3, id: 'P3-H', direction: 'Recording the memories of retired fishing crews' },
  { partNumber: 4, id: 'P4-F', direction: 'Missing the last bus after an evening class', preferredFamily: 'TF-03' },
  { partNumber: 4, id: 'P4-G', direction: 'A neighbour lending someone a ladder', preferredFamily: 'TF-05' },
  { partNumber: 4, id: 'P4-H', direction: 'Choosing a cheaper ticket bought in advance', preferredFamily: 'TF-07' },
];

function parseJson(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON.');
    return JSON.parse(match[0]);
  }
}

function addUsage(total, usage = {}) {
  total.promptTokens += Number(usage.prompt_tokens || 0);
  total.completionTokens += Number(usage.completion_tokens || 0);
  total.totalTokens += Number(usage.total_tokens || 0);
}

loadEnvLocal();
const apiKey = process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY;
if (!apiKey) {
  console.error('No OpenAI key available. Pilot not run.');
  process.exit(1);
}

const fallback = process.env.OPENAI_MODEL || 'gpt-4o';
const models = {
  generator: process.env.RUOE_V2_GENERATOR_MODEL || fallback,
  'blind-solver': process.env.RUOE_V2_BLIND_SOLVER_MODEL || fallback,
  adversary: process.env.RUOE_V2_ADVERSARIAL_MODEL
    || process.env.RUOE_V2_ADVERSARY_MODEL
    || fallback,
};
const unexpected = Object.entries(models).filter(([, model]) => model !== 'gpt-4o-mini');
if (unexpected.length) {
  throw new Error(`This pilot is restricted to gpt-4o-mini. Refusing: ${unexpected.map(([role, model]) => `${role}=${model}`).join(', ')}`);
}

const openai = new OpenAI({ apiKey });
fs.mkdirSync(outDir, { recursive: true });

async function complete({ system, user, model, usageTotal }) {
  const response = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  addUsage(usageTotal, response.usage);
  return parseJson(response.choices?.[0]?.message?.content || '{}');
}

const index = [];
const pilotUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
for (const brief of BRIEFS) {
  const stageLog = [];
  const taskUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
  const caller = (role) => async (payload) => {
    const before = { ...taskUsage };
    const result = await complete({
      system: payload.system,
      user: payload.user,
      model: models[role],
      usageTotal: taskUsage,
    });
    stageLog.push({
      role,
      stage: payload.stage,
      model: models[role],
      usage: {
        promptTokens: taskUsage.promptTokens - before.promptTokens,
        completionTokens: taskUsage.completionTokens - before.completionTokens,
        totalTokens: taskUsage.totalTokens - before.totalTokens,
      },
    });
    return result;
  };
  const file = path.join(outDir, `${brief.id}.json`);
  try {
    const result = await runNaturalnessFirstGeneration({
      partNumber: brief.partNumber,
      brief,
      complete: caller('generator'),
      blindSolve: caller('blind-solver'),
      adversary: caller('adversary'),
    });
    addUsage(pilotUsage, {
      prompt_tokens: taskUsage.promptTokens,
      completion_tokens: taskUsage.completionTokens,
      total_tokens: taskUsage.totalTokens,
    });
    const finalVerdict = result.finalVerdict || result.adversarial?.verdict || 'PIPELINE_FAIL';
    const record = {
      brief,
      savedAt: new Date().toISOString(),
      models,
      tokenUsage: taskUsage,
      stageLog,
      naturalSourceText: result.outputs?.passage?.passage || result.outputs?.prose?.passage || '',
      candidateItem: result.answerKey,
      generatorOutput: result.outputs,
      deterministicValidation: result.adversarial,
      blindSolve: result.layers?.blind || null,
      adversarialValidation: result.layers?.adversary || null,
      repairHistory: result.repairs,
      finalVerdict,
      trace: result.trace,
      stageRecords: result.stageRecords,
      layers: result.layers,
    };
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
    index.push({
      id: brief.id,
      ok: true,
      verdict: finalVerdict,
      repairs: (result.repairs || []).length,
      tokenUsage: taskUsage,
      file: path.relative(root, file),
    });
    console.log(`ok ${brief.id} ${finalVerdict} repairs=${(result.repairs || []).length} tokens=${taskUsage.totalTokens}`);
  } catch (error) {
    const record = {
      brief,
      savedAt: new Date().toISOString(),
      models,
      tokenUsage: taskUsage,
      stageLog,
      error: String(error?.message || error),
      finalVerdict: 'PIPELINE_FAIL',
    };
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
    index.push({
      id: brief.id,
      ok: false,
      verdict: 'PIPELINE_FAIL',
      repairs: 0,
      tokenUsage: taskUsage,
      error: record.error,
      file: path.relative(root, file),
    });
    console.log(`fail ${brief.id}: ${record.error}`);
  }
}

const counts = Object.fromEntries(
  ['PASS', 'PIPELINE_FAIL', 'HARD_FAIL', 'QUALITY_FAIL'].map((verdict) => [
    verdict,
    index.filter((row) => row.verdict === verdict).length,
  ]),
);
fs.writeFileSync(
  path.join(outDir, 'index.json'),
  JSON.stringify({ models, tokenUsage: pilotUsage, counts, index }, null, 2),
);
console.log(`pilot files: ${index.filter((row) => row.ok).length}/${index.length}`);
console.log(`verdicts: ${JSON.stringify(counts)}`);
console.log(`tokens: ${JSON.stringify(pilotUsage)}`);
