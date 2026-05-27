/**
 * Regenera una sola parte del examen A2 (con imágenes en partes 1, 7, 8, 14).
 * Uso: node scripts/regen-a2-part.mjs 1 1
 *      (examen slot 1, parte 1)
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
const slot = Number(process.argv[2] || 1);
const partNumber = Number(process.argv[3] || 1);

if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const { generateAndPersistA2ExamPart } = await import('../src/lib/levelsA2ExamGenerator.js');
const { getCachedLevelBySlug } = await import('../src/utils/levelsLevelCache.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await getCachedLevelBySlug(admin, 'a2');
if (!level?.id) {
  console.error('Nivel a2 no encontrado');
  process.exit(1);
}

const skipAudio = partNumber >= 8 && partNumber <= 12;
console.log(`Regenerando Examen ${slot} A2 — Parte ${partNumber} (imágenes: sí, audio: ${skipAudio ? 'omitido' : 'no aplica'})…`);

const result = await generateAndPersistA2ExamPart(admin, {
  levelId: level.id,
  examSlot: slot,
  partNumber,
  reset: false,
  skipAudio,
  skipImages: false,
});

console.log('OK', result);
