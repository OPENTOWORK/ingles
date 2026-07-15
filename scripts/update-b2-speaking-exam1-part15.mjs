/**
 * Update B2 Exam 1 Speaking Part 15 (Cambridge Part 2 Long turn) only.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/update-b2-speaking-exam1-part15.mjs
 */
import { existsSync } from 'fs';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getB2LongTurnPhotoUrls } from '../src/data/b2-speaking-long-turn-photos.js';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBER = 15;
const EXPECTED_PREGUNTA_ID = '577d77d9-7f10-4b8d-805e-492a3739171c';
const PARTE_NOMBRE = `Parte ${PART_NUMBER} B2`;

const NEW_DESCRIPCION =
  'Part 15: In this part of the test, you will compare two photographs and answer a question about them. You should speak on your own for about one minute. After that, the examiner will ask you a short follow-up question.';

const NEW_ENUNCIADO = `You will see two photographs. Compare them and answer the question.

You should speak for about one minute.

Compare the two photographs and say why the people might prefer each way of studying.

Theme: Studying

Photo A: Students studying together in a library.

Photo B: A student studying alone at home.

Follow-up question:
Do you think studying alone or with other people is more effective for most students? Why?`;

const UNTOUCHED_PARTS = [14, 16, 17];

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

async function fetchPart15Snapshot() {
  const { data: parte, error: parteErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', PARTE_NOMBRE)
    .single();
  if (parteErr || !parte?.id) throw new Error(parteErr?.message || 'Parte 15 not found');

  const { data: pregunta, error: qErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id)
    .maybeSingle();
  if (qErr) throw new Error(qErr.message);
  if (!pregunta?.id) throw new Error('No pregunta for Exam 1 Part 15');

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

function photoChecks() {
  const urls = getB2LongTurnPhotoUrls(1);
  const publicDir = path.join(root, 'public');
  return {
    configUrls: urls,
    pathsMatch:
      urls.some((u) => u.includes('/b2-speaking/exam-1/photo-a.png')) &&
      urls.some((u) => u.includes('/b2-speaking/exam-1/photo-b.png')),
    fileAExists: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-a.png')),
    fileBExists: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-b.png')),
  };
}

console.error('\n=== Update B2 Exam 1 Speaking Part 15 ===\n');

const before = await fetchPart15Snapshot();
if (before.pregunta.id !== EXPECTED_PREGUNTA_ID) {
  console.error(`Expected preguntaId ${EXPECTED_PREGUNTA_ID}, got ${before.pregunta.id}`);
  process.exit(1);
}

const untouchedBefore = await fetchUntouchedFingerprints();
const photos = photoChecks();

const backup = {
  backedUpAt: new Date().toISOString(),
  examenId: EXAMEN_ID,
  partNumber: PART_NUMBER,
  parteId: before.parte.id,
  preguntaId: before.pregunta.id,
  descripcionParte: before.parte['Descripción'] ?? before.parte.Descripción,
  enunciado: before.pregunta.enunciado,
  untouchedBefore,
  photos,
};

const backupPath = path.join(outDir, `backup-exam1-b2-speaking-part15-${Date.now()}.json`);
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

const after = await fetchPart15Snapshot();
const untouchedAfter = await fetchUntouchedFingerprints();

const descripcion = after.parte['Descripción'] ?? after.parte.Descripción ?? '';
const enunciado = String(after.pregunta.enunciado || '');

const checks = [
  { name: 'preguntaId unchanged', ok: after.pregunta.id === EXPECTED_PREGUNTA_ID },
  { name: 'Description compare photographs', ok: /compare two photographs/i.test(descripcion) },
  { name: 'Description about one minute', ok: /about one minute/i.test(descripcion) },
  { name: 'Enunciado simplified intro', ok: /You will see two photographs/i.test(enunciado) },
  { name: 'No Candidate A/B partner wording', ok: !/Candidate A:/i.test(enunciado) && !/Candidate B:/i.test(enunciado) },
  { name: 'Theme Studying', ok: /Theme: Studying/i.test(enunciado) },
  { name: 'Photo A library', ok: /Photo A: Students studying together in a library/i.test(enunciado) },
  { name: 'Photo B home', ok: /Photo B: A student studying alone at home/i.test(enunciado) },
  { name: 'Follow-up question present', ok: /Follow-up question:/i.test(enunciado) },
  { name: 'Photo config paths unchanged', ok: photos.pathsMatch },
  { name: 'photo-a.png exists', ok: photos.fileAExists },
  { name: 'photo-b.png exists', ok: photos.fileBExists },
  {
    name: 'Parts 14, 16–17 untouched',
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
  photos,
  checks,
};

const reportPath = path.join(outDir, 'update-b2-speaking-exam1-part15-result.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
