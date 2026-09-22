/**
 * Local-only naturalness-first v2 pilot.
 * Uses code prompts. Does not read or write Supabase.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { resolveDefaultExamPartGenerationPrompt } from '../src/lib/examPartGenerationPrompt.js';
import { runNaturalnessFirstGeneration } from '../src/lib/ruoeNaturalnessFirstV2/generate.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'local-pilots', 'ruoe-naturalness-first-v2');

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
  { partNumber: 1, id: 'P1-A', direction: 'How a town library stayed open after its main grant was cut' },
  { partNumber: 1, id: 'P1-B', direction: 'Why some coastal paths are closed after winter storms' },
  { partNumber: 2, id: 'P2-A', direction: 'The volunteer who catalogues old photographs for a local museum' },
  { partNumber: 2, id: 'P2-B', direction: 'A bakery that delivers bread by bicycle before dawn' },
  { partNumber: 3, id: 'P3-A', direction: 'Restoring a Victorian bandstand in a public park' },
  { partNumber: 3, id: 'P3-B', direction: 'Learning to keep bees on a city rooftop' },
  { partNumber: 4, id: 'P4-A', direction: 'Everyday misunderstandings about household recycling', preferredFamily: 'TF-02' },
  { partNumber: 4, id: 'P4-B', direction: 'Arriving late for a community meeting', preferredFamily: 'TF-05' },
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

const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const openai = new OpenAI({ apiKey });
fs.mkdirSync(outDir, { recursive: true });

async function complete({ system, user, maxTokens }) {
  const completion = await openai.chat.completions.create({
    model,
    temperature: 0.4,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return parseJson(completion.choices?.[0]?.message?.content || '{}');
}

async function runV2(brief) {
  return runNaturalnessFirstGeneration({
    partNumber: brief.partNumber,
    brief,
    complete: (payload) => complete({ ...payload, maxTokens: 2500 }),
  });
}

async function runV1(brief) {
  const defaults = resolveDefaultExamPartGenerationPrompt({
    levelSlug: 'b2',
    partNumber: brief.partNumber,
    examSlot: 1,
    topic: brief.direction,
    varietySeed: 22092026,
  });
  const generated = await complete({
    system: defaults.system,
    user: defaults.user,
    maxTokens: 7000,
  });
  return {
    version: 'v1-code-prompt',
    partNumber: brief.partNumber,
    note: 'Code prompt only. Database overrides were not read.',
    generated,
  };
}

const index = [];
for (const brief of BRIEFS) {
  for (const arm of ['v2', 'v1']) {
    const file = path.join(outDir, `${brief.id}-${arm}.json`);
    try {
      const result = arm === 'v2' ? await runV2(brief) : await runV1(brief);
      const record = {
        brief,
        arm,
        model,
        savedAt: new Date().toISOString(),
        result,
      };
      fs.writeFileSync(file, JSON.stringify(record, null, 2));
      index.push({ id: brief.id, arm, ok: true, file: path.relative(root, file) });
      console.log(`ok ${brief.id} ${arm}`);
    } catch (error) {
      const record = {
        brief,
        arm,
        model,
        savedAt: new Date().toISOString(),
        error: String(error?.message || error),
      };
      fs.writeFileSync(file, JSON.stringify(record, null, 2));
      index.push({ id: brief.id, arm, ok: false, error: record.error, file: path.relative(root, file) });
      console.log(`fail ${brief.id} ${arm}: ${record.error}`);
    }
  }
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ model, index }, null, 2));
console.log(`pilot files: ${index.filter((row) => row.ok).length}/${index.length}`);
