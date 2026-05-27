/**
 * Rellena Examen 6 B2 con contenido original (sin clonar otros exámenes).
 * Uso: node scripts/seed-b2-exam6-offline.mjs
 *      node scripts/seed-b2-exam6-offline.mjs --skip-audio
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const skipAudio = process.argv.includes('--skip-audio');
const slot = 6;

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const { B2_EXAM_PARTS } = await import('../src/lib/b2ExamCatalog.js');
const { getB2Exam6GeneratedPart } = await import('../src/lib/b2Exam6ContentBuilder.js');
const {
  ensureB2ExamenRow,
  ensureB2ParteRow,
  persistB2GeneratedPart,
} = await import('../src/lib/levelsB2ExamGenerator.js');
const { deleteExamenContent } = await import('../src/lib/levelsExamPersist.js');

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel b2 no encontrado');
  process.exit(1);
}

console.log(`Sembrando Examen ${slot} B2 (contenido nuevo, skipAudio=${skipAudio})…`);

const examenId = await ensureB2ExamenRow(admin, level.id, slot);
await deleteExamenContent(admin, examenId);

const results = [];
for (const partDef of B2_EXAM_PARTS) {
  const pn = partDef.partNumber;
  const generated = getB2Exam6GeneratedPart(pn);
  const parteId = await ensureB2ParteRow(admin, pn);

  const preguntaId = await persistB2GeneratedPart(admin, {
    levelId: level.id,
    examenId,
    parteId,
    partNumber: pn,
    examSlot: slot,
    generated,
    partDef,
    skipAudio,
  });

  results.push({ part: pn, preguntaId });
  console.log(`  Part ${pn} → ${preguntaId}`);
}

console.log(`OK: Examen ${slot} B2 con ${results.length} partes (contenido original).`);
if (skipAudio) {
  console.log('Nota: audios omitidos. Sin --skip-audio se intenta TTS (requiere crédito OpenAI).');
}
