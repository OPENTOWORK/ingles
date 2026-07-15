/**
 * Update B2 Exam 1 Speaking Part 14 (Cambridge Part 1 Interview) only.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/update-b2-speaking-exam1-part14.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBER = 14;
const EXPECTED_PREGUNTA_ID = '56d1d428-8b51-4773-abf8-ffe15341355a';
const PARTE_NOMBRE = `Parte ${PART_NUMBER} B2`;

const NEW_DESCRIPCION =
  'Part 14: In this part of the test, the examiner will ask you some questions about yourself, your daily life, your interests and your opinions. You should answer clearly and try to give reasons or examples where appropriate. This part should last about 2 minutes.';

const NEW_ENUNCIADO = `The examiner will ask you some questions about yourself. Please answer clearly and try to give reasons or examples where appropriate.

About 2 minutes

1. Where are you from, and what do you like about living there?

2. Do you prefer living in a busy city or in a quieter place? Why?

3. How do you usually use technology in your daily life?

4. Do you think people spend too much time on their phones? Why or why not?

5. What do you usually do when you want to relax?

6. Tell me about a place in your area that you enjoy visiting.

7. Is there anything new you would like to learn in the future?

8. Do you prefer spending your free time indoors or outdoors? Why?

The examiner may ask you to explain your answers or give more details.`;

const UNTOUCHED_PARTS = [15, 16, 17];

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

const env = loadEnvLocal();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function fetchPart14Snapshot() {
  const { data: parte, error: parteErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', PARTE_NOMBRE)
    .single();
  if (parteErr || !parte?.id) throw new Error(parteErr?.message || 'Parte 14 not found');

  const { data: pregunta, error: qErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id)
    .maybeSingle();
  if (qErr) throw new Error(qErr.message);
  if (!pregunta?.id) throw new Error('No pregunta for Exam 1 Part 14');

  return { parte, pregunta };
}

async function fetchUntouchedFingerprints() {
  const fingerprints = {};
  for (const pn of UNTOUCHED_PARTS) {
    const { data: parte } = await admin
      .from('levels_partes')
      .select('id, Descripción')
      .eq('nombre_parte', `Parte ${pn} B2`)
      .single();
    const { data: pregunta } = await admin
      .from('levels_preguntas')
      .select('id, enunciado')
      .eq('examen_id', EXAMEN_ID)
      .eq('parte_id', parte?.id)
      .maybeSingle();
    fingerprints[`part${pn}`] = {
      preguntaId: pregunta?.id || null,
      descripcionHash: String(parte?.['Descripción'] ?? parte?.Descripción ?? '').length,
      enunciadoHash: String(pregunta?.enunciado || '').length,
      enunciadoStart: String(pregunta?.enunciado || '').slice(0, 80),
    };
  }
  return fingerprints;
}

console.error('\n=== Update B2 Exam 1 Speaking Part 14 ===\n');

const before = await fetchPart14Snapshot();
if (before.pregunta.id !== EXPECTED_PREGUNTA_ID) {
  console.error(`Expected preguntaId ${EXPECTED_PREGUNTA_ID}, got ${before.pregunta.id}`);
  process.exit(1);
}

const untouchedBefore = await fetchUntouchedFingerprints();

const backup = {
  backedUpAt: new Date().toISOString(),
  examenId: EXAMEN_ID,
  partNumber: PART_NUMBER,
  parteId: before.parte.id,
  preguntaId: before.pregunta.id,
  descripcionParte: before.parte['Descripción'] ?? before.parte.Descripción,
  enunciado: before.pregunta.enunciado,
  untouchedBefore,
};

const backupPath = path.join(outDir, `backup-exam1-b2-speaking-part14-${Date.now()}.json`);
writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
console.error(`Backup: ${backupPath}`);

const { error: parteUpdateErr } = await admin
  .from('levels_partes')
  .update({ Descripción: NEW_DESCRIPCION })
  .eq('id', before.parte.id);
if (parteUpdateErr) {
  console.error('Failed to update parte:', parteUpdateErr.message);
  process.exit(1);
}

const { error: preguntaUpdateErr } = await admin
  .from('levels_preguntas')
  .update({ enunciado: NEW_ENUNCIADO })
  .eq('id', before.pregunta.id);
if (preguntaUpdateErr) {
  console.error('Failed to update pregunta:', preguntaUpdateErr.message);
  process.exit(1);
}

const after = await fetchPart14Snapshot();
const untouchedAfter = await fetchUntouchedFingerprints();

const descripcion = after.parte['Descripción'] ?? after.parte.Descripción ?? '';
const enunciado = String(after.pregunta.enunciado || '');

const checks = [
  { name: 'preguntaId unchanged', ok: after.pregunta.id === EXPECTED_PREGUNTA_ID },
  { name: 'Description mentions daily life and opinions', ok: /daily life.*opinions/i.test(descripcion) },
  { name: 'Description about 2 minutes', ok: /about 2 minutes/i.test(descripcion) },
  { name: 'Enunciado eight numbered questions', ok: (enunciado.match(/^\d+\./gm) || []).length === 8 },
  { name: 'Q1 where are you from', ok: /Where are you from/i.test(enunciado) },
  { name: 'Q8 indoors or outdoors', ok: /indoors or outdoors/i.test(enunciado) },
  { name: 'Examiner follow-up note', ok: /examiner may ask you to explain/i.test(enunciado) },
  {
    name: 'Parts 15–17 untouched',
    ok: UNTOUCHED_PARTS.every((pn) => {
      const key = `part${pn}`;
      return (
        untouchedBefore[key]?.preguntaId === untouchedAfter[key]?.preguntaId &&
        untouchedBefore[key]?.enunciadoHash === untouchedAfter[key]?.enunciadoHash &&
        untouchedBefore[key]?.descripcionHash === untouchedAfter[key]?.descripcionHash
      );
    }),
  },
];

const report = {
  ok: checks.every((c) => c.ok),
  backupPath,
  parteId: after.parte.id,
  preguntaId: after.pregunta.id,
  descripcionParte: descripcion,
  enunciado,
  checks,
};

const reportPath = path.join(outDir, 'update-b2-speaking-exam1-part14-result.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
