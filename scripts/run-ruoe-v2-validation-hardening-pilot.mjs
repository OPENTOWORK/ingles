/**
 * Second local naturalness-first v2 pilot.
 * Code prompts only. Does not read or write Supabase.
 * Generator, blind solver, and adversary are separate roles.
 * Models come from the environment. gpt-4o-mini is not hardcoded.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { runNaturalnessFirstGeneration } from '../src/lib/ruoeNaturalnessFirstV2/generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'local-pilots', 'ruoe-v2-validation-hardening');

function loadEnvLocal() {
  const envPath = path.join(root, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const BRIEFS = [
  { partNumber: 1, id: 'P1-C', direction: 'A village that reopened its outdoor pool with volunteer lifeguards' },
  { partNumber: 1, id: 'P1-D', direction: 'Why the Saturday bus to the next town now stops at the hospital' },
  { partNumber: 1, id: 'P1-E', direction: 'How a school orchestra raised money for new music stands' },
  { partNumber: 2, id: 'P2-C', direction: 'The person who winds the town hall clock every Monday' },
  { partNumber: 2, id: 'P2-D', direction: 'A harbour office that posts the tide times by hand' },
  { partNumber: 2, id: 'P2-E', direction: 'Learning to prune apple trees in a shared orchard' },
  { partNumber: 3, id: 'P3-C', direction: 'Cataloguing a collection of old theatre programmes' },
  { partNumber: 3, id: 'P3-D', direction: 'Replacing the glass in a Victorian greenhouse' },
  { partNumber: 3, id: 'P3-E', direction: 'Teaching adults to read a paper map' },
  { partNumber: 4, id: 'P4-C', direction: 'Forgetting a neighbour’s spare key', preferredFamily: 'TF-03' },
  { partNumber: 4, id: 'P4-D', direction: 'A parcel that arrived a day early', preferredFamily: 'TF-07' },
  { partNumber: 4, id: 'P4-E', direction: 'Choosing the quieter train', preferredFamily: 'TF-04' },
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

const openai = new OpenAI({ apiKey });
fs.mkdirSync(outDir, { recursive: true });

async function complete({ role, stage, system, user, model }) {
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.3,
    max_tokens: role === 'generator' ? 4000 : 1800,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return parseJson(completion.choices?.[0]?.message?.content || '{}');
}

const index = [];
for (const brief of BRIEFS) {
  const stageLog = [];
  const caller = (role) => async (payload) => {
    stageLog.push({ role, stage: payload.stage, model: models[role] });
    return complete({
      role,
      stage: payload.stage,
      system: payload.system,
      user: payload.user,
      model: models[role],
    });
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
    const passage = result.outputs?.passage?.passage || result.outputs?.prose?.passage || '';
    const record = {
      brief,
      savedAt: new Date().toISOString(),
      models,
      stageLog,
      naturalSourceText: passage,
      candidateItem: result.answerKey,
      generatorOutput: result.outputs,
      deterministicValidation: result.adversarial,
      blindSolve: result.layers?.blind || null,
      adversarialValidation: result.layers?.adversary || null,
      repairHistory: result.repairs,
      finalVerdict: result.finalVerdict || result.adversarial?.verdict,
      trace: result.trace,
      layers: result.layers,
    };
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
    index.push({
      id: brief.id,
      ok: true,
      verdict: record.finalVerdict,
      repairs: (result.repairs || []).length,
      file: path.relative(root, file),
    });
    console.log(`ok ${brief.id} ${record.finalVerdict} repairs=${(result.repairs || []).length}`);
  } catch (error) {
    const record = {
      brief,
      savedAt: new Date().toISOString(),
      models,
      stageLog,
      error: String(error?.message || error),
      finalVerdict: 'ERROR',
    };
    fs.writeFileSync(file, JSON.stringify(record, null, 2));
    index.push({ id: brief.id, ok: false, verdict: 'ERROR', error: record.error, file: path.relative(root, file) });
    console.log(`fail ${brief.id}: ${record.error}`);
  }
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ models, index }, null, 2));
console.log(`pilot files: ${index.filter((row) => row.ok).length}/${index.length}`);
