/**
 * Regenera un examen A2 completo (14 partes) con DRALO AI.
 * Uso: node scripts/regen-a2-exam-parts.mjs 1
 * Requiere OPENAI_API_KEY y SUPABASE_SERVICE_ROLE_KEY en .env.local
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const slot = Number(process.argv[2] || 1);

if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { generateAndPersistA2Exam } = await import('../src/lib/levelsA2ExamGenerator.js');
const { getCachedLevelBySlug } = await import('../src/utils/levelsLevelCache.js');

if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await getCachedLevelBySlug(admin, 'a2');
if (!level?.id) {
  console.error('Nivel a2 no encontrado');
  process.exit(1);
}

console.log(`Regenerando Examen ${slot} A2 (14 partes, puede tardar varios minutos)…`);

const result = await generateAndPersistA2Exam(admin, {
  levelId: level.id,
  examSlot: slot,
  force: true,
  skipAudio: true,
  skipImages: true,
  onProgress: ({ step, total, part }) => console.log(`  [${step}/${total}] Part ${part}`),
});

console.log(
  'Nota: audios e imágenes omitidos en CLI (skipAudio, skipImages). Regenera desde admin con dev server para TTS e imágenes (partes 7, 8, 14).',
);

console.log('OK', result.message);
