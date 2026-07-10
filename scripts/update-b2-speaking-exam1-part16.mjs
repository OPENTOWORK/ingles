/**
 * Update B2 Exam 1 Speaking Part 16 (Cambridge Part 3 Collaborative task) only.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/update-b2-speaking-exam1-part16.mjs
 */
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBER = 16;
const EXPECTED_PREGUNTA_ID = '40aabf02-cae3-4471-908d-5c87b44ee886';
const PARTE_NOMBRE = `Parte ${PART_NUMBER} B2`;

const NEW_DESCRIPCION =
  'Part 16: You and your partner will discuss a situation and make a decision together. You should exchange ideas, respond to each other\'s points, give reasons, compare options, and try to reach an agreement. This part tests interactive communication, negotiation and the ability to develop ideas.';

const NEW_ENUNCIADO = `You have 15 seconds to read the task sheet with ideas. Then discuss the topic with your partner for about 2 minutes. Finally, spend about 1 minute trying to reach a decision together.

Central question
How could technology make city life better without creating new problems for residents?

Task prompts
• introduce smart traffic systems to reduce congestion and pollution
• create digital public services for older people and residents who find technology difficult
• use smart lighting and cameras to improve safety in public spaces
• develop apps that let residents report problems such as noise, broken pavements or poor transport
• use real-time environmental data to protect people from pollution and extreme weather

Decision question
Which two ideas would have the biggest positive impact on daily life in the city?`;

const UNTOUCHED_PARTS = [14, 15, 17];
const PART17_PREGUNTA_ID = '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded';

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

async function fetchPart16Snapshot() {
  const { data: parte, error: parteErr } = await admin
    .from('levels_partes')
    .select('id, nombre_parte, Descripción')
    .eq('nombre_parte', PARTE_NOMBRE)
    .single();
  if (parteErr || !parte?.id) throw new Error(parteErr?.message || 'Parte 16 not found');

  const { data: pregunta, error: qErr } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id)
    .maybeSingle();
  if (qErr) throw new Error(qErr.message);
  if (!pregunta?.id) throw new Error('No pregunta for Exam 1 Part 16');

  return { parte, pregunta };
}

async function fetchPart17Snapshot() {
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', 'Parte 17 B2')
    .single();
  const { data: pregunta } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte?.id)
    .maybeSingle();
  return pregunta;
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

console.error('\n=== Update B2 Exam 1 Speaking Part 16 ===\n');

const before = await fetchPart16Snapshot();
if (before.pregunta.id !== EXPECTED_PREGUNTA_ID) {
  console.error(`Expected preguntaId ${EXPECTED_PREGUNTA_ID}, got ${before.pregunta.id}`);
  process.exit(1);
}

const untouchedBefore = await fetchUntouchedFingerprints();
const part17Before = await fetchPart17Snapshot();

const backup = {
  backedUpAt: new Date().toISOString(),
  examenId: EXAMEN_ID,
  partNumber: PART_NUMBER,
  parteId: before.parte.id,
  preguntaId: before.pregunta.id,
  descripcionParte: before.parte['Descripción'] ?? before.parte.Descripción,
  enunciado: before.pregunta.enunciado,
  untouchedBefore,
  part17Before: {
    preguntaId: part17Before?.id,
    enunciado: part17Before?.enunciado,
  },
};

const backupPath = path.join(outDir, `backup-exam1-b2-speaking-part16-${Date.now()}.json`);
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

const after = await fetchPart16Snapshot();
const untouchedAfter = await fetchUntouchedFingerprints();
const part17After = await fetchPart17Snapshot();

const descripcion = after.parte['Descripción'] ?? after.parte.Descripción ?? '';
const enunciado = String(after.pregunta.enunciado || '');
const part17Enunciado = String(part17After?.enunciado || '');

const checks = [
  { name: 'preguntaId unchanged', ok: after.pregunta.id === EXPECTED_PREGUNTA_ID },
  {
    name: 'Description mentions negotiation',
    ok: /negotiation/i.test(descripcion) && /compare options/i.test(descripcion),
  },
  {
    name: 'Central question debatable',
    ok: /without creating new problems for residents/i.test(enunciado),
  },
  {
    name: 'Five task prompts',
    ok: (enunciado.match(/^• /gm) || []).length === 5,
  },
  {
    name: 'Decision question present',
    ok: /Which two ideas would have the biggest positive impact/i.test(enunciado),
  },
  {
    name: 'Technology and city life theme',
    ok: /technology make city life better/i.test(enunciado),
  },
  {
    name: 'Parts 14–15 and 17 untouched',
    ok: UNTOUCHED_PARTS.every((pn) => {
      const key = `part${pn}`;
      return (
        untouchedBefore[key]?.preguntaId === untouchedAfter[key]?.preguntaId &&
        untouchedBefore[key]?.enunciadoHash === untouchedAfter[key]?.enunciadoHash
      );
    }),
  },
  {
    name: 'Part 17 still links to Part 3 technology theme',
    ok:
      part17After?.id === PART17_PREGUNTA_ID &&
      /technology and city life/i.test(part17Enunciado) &&
      /In Part 3, you talked about different ways cities could use technology/i.test(part17Enunciado),
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

const reportPath = path.join(outDir, 'update-b2-speaking-exam1-part16-result.json');
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(1);
