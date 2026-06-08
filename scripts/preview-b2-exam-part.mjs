/**
 * Preview one B2 exam part with DRALO AI — does NOT persist to Supabase.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/preview-b2-exam-part.mjs [slot] [partNumber] [topic]
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const slot = Number(process.argv[2] || 1);
const partNumber = Number(process.argv[3] || 4);
const topic = process.argv.slice(4).join(' ').trim() || undefined;

if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const { previewLevelExamPartGeneration } = await import('../src/lib/levelsCambridgeExamGenerator.js');

console.error(
  `Generating preview: B2 Examen ${slot} — Part ${partNumber}${topic ? ` — topic: ${topic}` : ''} (no save)…`,
);

const result = await previewLevelExamPartGeneration({
  levelSlug: 'b2',
  examSlot: slot,
  partNumber,
  varietySeed: Date.now(),
  topic,
});

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'scripts', 'generated', `preview-exam${slot}-part${partNumber}-b2.json`);
writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
console.error(`Written ${outPath}`);
console.error(`Validation: ${result.validation.ok ? 'OK' : 'FAILED'}`, result.validation.errors || '');

console.log(JSON.stringify(result, null, 2));
