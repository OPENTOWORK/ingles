/**
 * Verify B2 Exam 1 Speaking Part 14 content in Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/verify-b2-speaking-exam1-part14.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_PREGUNTA_ID = '56d1d428-8b51-4773-abf8-ffe15341355a';

const UNTOUCHED = {
  15: '577d77d9-7f10-4b8d-805e-492a3739171c',
  16: '40aabf02-cae3-4471-908d-5c87b44ee886',
  17: '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded',
};

const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('nombre_parte', 'Parte 14 B2')
  .single();

const { data: pregunta } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte.id)
  .maybeSingle();

const descripcion = String(parte?.['Descripción'] ?? parte?.Descripción ?? '');
const enunciado = String(pregunta?.enunciado || '');

const untouchedStatus = {};
for (const [pn, expId] of Object.entries(UNTOUCHED)) {
  const { data: p } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${pn} B2`)
    .single();
  const { data: pq } = await admin
    .from('levels_preguntas')
    .select('id')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', p?.id)
    .maybeSingle();
  untouchedStatus[`part${pn}`] = pq?.id === expId;
}

const report = {
  preguntaId: pregunta?.id,
  descripcionParte: descripcion,
  enunciado,
  untouched: untouchedStatus,
  checks: [
    { name: 'Expected preguntaId', ok: pregunta?.id === EXPECTED_PREGUNTA_ID },
    { name: 'Description daily life and opinions', ok: /daily life.*opinions/i.test(descripcion) },
    { name: 'Description about 2 minutes', ok: /about 2 minutes/i.test(descripcion) },
    { name: 'Eight numbered questions', ok: (enunciado.match(/^\d+\./gm) || []).length === 8 },
    { name: 'Q1 where are you from', ok: /Where are you from/i.test(enunciado) },
    { name: 'Q4 phones', ok: /too much time on their phones/i.test(enunciado) },
    { name: 'Q7 learn in the future', ok: /like to learn in the future/i.test(enunciado) },
    { name: 'Examiner follow-up note', ok: /examiner may ask you to explain/i.test(enunciado) },
    { name: 'Parts 15–17 IDs unchanged', ok: Object.values(untouchedStatus).every(Boolean) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'generated',
  'verify-b2-speaking-exam1-part14-result.json',
);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
