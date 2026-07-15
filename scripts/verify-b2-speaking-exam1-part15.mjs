/**
 * Verify B2 Exam 1 Speaking Part 15 content in Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/verify-b2-speaking-exam1-part15.mjs
 */
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getB2LongTurnPhotoUrls } from '../src/data/b2-speaking-long-turn-photos.js';

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_PREGUNTA_ID = '577d77d9-7f10-4b8d-805e-492a3739171c';

const UNTOUCHED = {
  14: '56d1d428-8b51-4773-abf8-ffe15341355a',
  16: '40aabf02-cae3-4471-908d-5c87b44ee886',
  17: '0350ef08-ee0f-46f9-933b-b1ac2f8c2ded',
};

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');

const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('nombre_parte', 'Parte 15 B2')
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

const photoUrls = getB2LongTurnPhotoUrls(1);
const photos = {
  configUrls: photoUrls,
  fileA: 'public/b2-speaking/exam-1/photo-a.png',
  fileB: 'public/b2-speaking/exam-1/photo-b.png',
  fileAExists: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-a.png')),
  fileBExists: existsSync(path.join(publicDir, 'b2-speaking/exam-1/photo-b.png')),
};

const report = {
  preguntaId: pregunta?.id,
  descripcionParte: descripcion,
  enunciado,
  photos,
  untouched: untouchedStatus,
  checks: [
    { name: 'Expected preguntaId', ok: pregunta?.id === EXPECTED_PREGUNTA_ID },
    { name: 'Description compare photographs', ok: /compare two photographs/i.test(descripcion) },
    { name: 'Simplified enunciado intro', ok: /You will see two photographs/i.test(enunciado) },
    { name: 'No Candidate A/B wording', ok: !/Candidate A:/i.test(enunciado) },
    { name: 'Theme Studying', ok: /Theme: Studying/i.test(enunciado) },
    { name: 'Follow-up question', ok: /studying alone or with other people/i.test(enunciado) },
    {
      name: 'Photo paths in config',
      ok:
        photoUrls.some((u) => u.includes('/b2-speaking/exam-1/photo-a.png')) &&
        photoUrls.some((u) => u.includes('/b2-speaking/exam-1/photo-b.png')),
    },
    { name: 'photo-a.png on disk', ok: photos.fileAExists },
    { name: 'photo-b.png on disk', ok: photos.fileBExists },
    { name: 'Parts 14, 16–17 IDs unchanged', ok: Object.values(untouchedStatus).every(Boolean) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'generated',
  'verify-b2-speaking-exam1-part15-result.json',
);
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
