/**
 * Examen B2 mashup: cada parte se copia al azar desde exámenes 1–5 (sin OpenAI).
 * Uso: node scripts/clone-b2-exam-random.mjs 6
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const slot = Number(process.argv[2] || 6);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { cloneB2ExamRandomMashup } = await import('../src/lib/levelsB2ExamClone.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel b2 no encontrado');
  process.exit(1);
}

console.log(`Clonando mashup aleatorio → Examen ${slot} B2…`);

const result = await cloneB2ExamRandomMashup(admin, {
  levelId: level.id,
  targetSlot: slot,
});

for (const p of result.parts) {
  console.log(`  Part ${p.partNumber} ← Examen ${p.sourceSlot}`);
}
console.log('OK', result.message);
