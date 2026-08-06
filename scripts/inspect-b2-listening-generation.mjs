/**
 * Diagnóstico: genera una parte de listening B2 SIN persistir y muestra la forma del JSON
 * (longitud de scripts, modelAnswers, audioAssembly) para depurar prompts y duraciones.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/inspect-b2-listening-generation.mjs 10 [examSlot]
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const partNumber = Number(process.argv[2] || 10);
const examSlot = Number(process.argv[3] || 2);

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { previewLevelExamPartGeneration } = await import('../src/lib/levelsCambridgeExamGenerator.js');

const result = await previewLevelExamPartGeneration({
  levelSlug: 'b2',
  examSlot,
  partNumber,
  varietySeed: Date.now(),
  adminDb: admin,
});

const gen = result.generated || {};
const words = (t) => String(t || '').trim().split(/\s+/).filter(Boolean).length;

console.error(`\n=== Part ${partNumber} — Examen ${examSlot} ===`);
console.error('claves:', Object.keys(gen).join(', '));
console.error('validation.ok:', result.validation?.ok, result.validation?.errors || '');
console.error('listeningIntro:', gen.listeningIntro ? `sí (${words(gen.listeningIntro.text)} palabras)` : 'NO');
console.error('audioAssembly:', gen.audioAssembly ? JSON.stringify(gen.audioAssembly) : 'NO');
console.error('script global:', words(gen.script), 'palabras');

const questions = Array.isArray(gen.questions) ? gen.questions : [];
console.error(`questions: ${questions.length}`);
for (const q of questions) {
  console.error(
    `  q${q.number}: script=${words(q.script)}w situation=${q.situation ? 'sí' : 'NO'} options=${
      Array.isArray(q.options) ? q.options.length : 0
    }`,
  );
}

const clips = Array.isArray(gen.audioClips) ? gen.audioClips : [];
if (clips.length) {
  console.error(`audioClips: ${clips.length}`);
  for (const c of clips) console.error(`  clip${c.orden}: ${words(c.text)}w`);
}

console.error('modelAnswers:', JSON.stringify(gen.modelAnswers));
if (gen.matchingAnswers) console.error('matchingAnswers:', JSON.stringify(gen.matchingAnswers));

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'generated');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `inspect-exam${examSlot}-part${partNumber}-b2.json`);
writeFileSync(out, JSON.stringify(result, null, 2), 'utf8');
console.error(`\nJSON completo: ${out}`);
