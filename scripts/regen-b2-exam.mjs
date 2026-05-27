/**
 * Regenera un examen B2 completo (17 partes) con DRALO AI.
 * Uso: node scripts/regen-b2-exam.mjs 6
 *      node scripts/regen-b2-exam.mjs 6 --skip-audio
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const slot = Number(process.argv[2] || 6);
const skipAudio = process.argv.includes('--skip-audio');

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY en .env.local');
  process.exit(1);
}

const { generateAndPersistB2Exam } = await import('../src/lib/levelsB2ExamGenerator.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel b2 no encontrado');
  process.exit(1);
}

console.log(`Regenerando Examen ${slot} B2 (17 partes, skipAudio=${skipAudio})…`);

const result = await generateAndPersistB2Exam(admin, {
  levelId: level.id,
  examSlot: slot,
  force: true,
  skipAudio,
  onProgress: ({ step, total, part }) => console.log(`  [${step}/${total}] Part ${part}`),
});

console.log('OK', result.message);
