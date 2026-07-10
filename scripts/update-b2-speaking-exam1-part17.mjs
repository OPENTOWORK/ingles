/**
 * Update B2 Exam 1 Speaking Part 17 (Cambridge Part 4 Discussion) only.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/update-b2-speaking-exam1-part17.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBER = 17;
const EXPECTED_PREGUNTA_ID = '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded';
const PARTE_NOMBRE = `Parte ${PART_NUMBER} B2`;

const NEW_DESCRIPCION =
  'Part 17: In this part of the test, you will discuss broader questions related to the topic from Part 3. You should give your opinion, explain your reasons, respond to your partner\'s ideas, and develop your answers with examples. The discussion should last about 4 minutes.';

const NEW_ENUNCIADO = `Now, let's discuss some broader questions about technology and city life.

In Part 3, you talked about different ways cities could use technology to improve residents' daily lives. Now I'd like you to discuss this topic in more depth.

1. How has technology changed the way people live in cities?

2. Do you think technology always makes city life better? Why or why not?

3. What problems can appear when cities depend too much on technology?

4. How could technology help make cities safer without affecting people's privacy too much?

5. Do you think cities should invest more in environmental technology or in technology that makes daily life more convenient?

6. In the future, do you think technology will make cities more human or less human? Why?`;

const UNTOUCHED_PARTS = [14, 15, 16];

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

async function fetchPart17Snapshot() {
  const { data: parte, error: parteErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', PARTE_NOMBRE)
    .single();
  if (parteErr || !parte?.id) throw new Error(parteErr?.message || 'Parte 17 not found');

  const { data: pregunta, error: qErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id)
    .maybeSingle();
  if (qErr) throw new Error(qErr.message);
  if (!pregunta?.id) throw new Error('No pregunta for Exam 1 Part 17');

  return { parte, pregunta };
}

async function fetchUntouchedFingerprints() {
  const fingerprints = {};
  for (const pn of UNTOUCHED_PARTS) {
    const { data: parte } = await admin
      .from('levels_partes')
      .select('id')
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
      enunciadoHash: String(pregunta?.enunciado || '').length,
      enunciadoStart: String(pregunta?.enunciado || '').slice(0, 80),
    };
  }
  return fingerprints;
}

console.error('\n=== Update B2 Exam 1 Speaking Part 17 ===\n');

const before = await fetchPart17Snapshot();
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

const backupPath = path.join(outDir, `backup-exam1-b2-speaking-part17-${Date.now()}.json`);
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

const after = await fetchPart17Snapshot();
const untouchedAfter = await fetchUntouchedFingerprints();

const descripcion = after.parte['Descripción'] ?? after.parte.Descripción ?? '';
const enunciado = String(after.pregunta.enunciado || '');

const checks = [
  { name: 'preguntaId unchanged', ok: after.pregunta.id === EXPECTED_PREGUNTA_ID },
  { name: 'No "image shown below"', ok: !/image shown below/i.test(descripcion) && !/image shown below/i.test(enunciado) },
  { name: 'Description links to Part 3', ok: /topic from Part 3/i.test(descripcion) },
  { name: 'Enunciado technology and city life', ok: /technology and city life/i.test(enunciado) },
  { name: 'Enunciado links to Part 3', ok: /In Part 3, you talked about different ways cities could use technology/i.test(enunciado) },
  { name: 'Six discussion questions', ok: (enunciado.match(/^\d+\./gm) || []).length === 6 },
  { name: 'Parts 14–16 untouched', ok: UNTOUCHED_PARTS.every((pn) => {
    const key = `part${pn}`;
    return (
      untouchedBefore[key]?.preguntaId === untouchedAfter[key]?.preguntaId &&
      untouchedBefore[key]?.enunciadoHash === untouchedAfter[key]?.enunciadoHash
    );
  }) },
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

const reportPath = path.join(outDir, 'update-b2-speaking-exam1-part17-result.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
