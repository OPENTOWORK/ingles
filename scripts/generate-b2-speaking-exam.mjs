/**
 * Generate B2 Speaking parts 14–17 for one exam slot and save to Supabase.
 * Uses OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS when configured.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/generate-b2-speaking-exam.mjs [slot] [topic...]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

loadEnvLocal();

const slot = Number(process.argv[2] || 1);
const topic = process.argv.slice(3).join(' ').trim() || 'urban life and technology';
const speakingParts = [14, 15, 16, 17];

const { previewLevelExamPartGeneration, saveLevelExamPartFromPreview } = await import(
  '../src/lib/levelsCambridgeExamGenerator.js'
);

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

const assistantId = process.env.OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS?.trim();
console.error(
  assistantId
    ? `Using Cambridge assistant: ${assistantId.slice(0, 12)}…`
    : 'No OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS — using Chat Completions + Cambridge system prompt',
);

const admin =
  url && key
    ? createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

let levelId = null;
if (admin) {
  const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
  levelId = level?.id ?? null;
}

const results = [];

for (const partNumber of speakingParts) {
  const seed = Date.now() + slot * 10000 + partNumber * 137;
  console.error(`\nGenerating Exam ${slot} — Speaking part ${partNumber} (seed ${seed})…`);

  const preview = await previewLevelExamPartGeneration({
    levelSlug: 'b2',
    examSlot: slot,
    partNumber,
    varietySeed: seed,
    topic,
  });

  const outPath = path.join(outDir, `preview-exam${slot}-part${partNumber}-b2-speaking.json`);
  writeFileSync(outPath, JSON.stringify(preview, null, 2), 'utf8');

  const summary = {
    partNumber,
    ok: preview.validation.ok,
    errors: preview.validation.errors,
    warnings: preview.validation.warnings,
    previewPath: outPath,
    saved: false,
  };

  if (!preview.validation.ok) {
    console.error(JSON.stringify(summary, null, 2));
    results.push(summary);
    continue;
  }

  if (admin && levelId) {
    const saved = await saveLevelExamPartFromPreview(admin, {
      levelSlug: 'b2',
      levelId,
      examSlot: slot,
      partNumber,
      generated: preview.generated,
      skipAudio: true,
      replacePartContent: true,
    });
    summary.saved = true;
    summary.preguntaId = saved.preguntaId;
  }

  console.log(JSON.stringify(summary, null, 2));
  results.push(summary);
}

const failed = results.filter((r) => !r.ok || !r.saved);
process.exit(failed.length ? 1 : 0);
