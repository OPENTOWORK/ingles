/**
 * Post-save verification for B2 Exam 1 Part 10.
 * Usage: npx vercel env run --environment=production -- node scripts/verify-part10.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();

const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_ANON_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_KEY = { 1: 'C', 2: 'B', 3: 'A', 4: 'C', 5: 'B', 6: 'A', 7: 'B', 8: 'C' };
const UNTOUCHED = {
  11: '8dc37fa2-9ea0-4688-8d5e-56bc2eb33b37',
  12: '14b93176-4055-4568-8646-4d52ade7986a',
  13: '8f73881f-b467-4ea1-a68f-8b93dc9384f9',
};

async function fetchDuration(url) {
  const res = await fetch(url);
  if (!res.ok) return 0;
  const buf = Buffer.from(await res.arrayBuffer());
  return await getMp3DurationSec(buf);
}

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, Descripción')
  .eq('nombre_parte', 'Parte 10 B2')
  .single();

const { data: q } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte.id)
  .maybeSingle();

const [mcq, audios] = await Promise.all([
  admin.from('levels_respuestas').select('respuesta, correcta').eq('pregunta_id', q.id),
  admin
    .from('levels_preguntas_audios')
    .select('orden, titulo, audio_url')
    .eq('pregunta_id', q.id)
    .order('orden'),
]);

const mcqRows = mcq.data || [];
const audioRows = audios.data || [];
const key = {};
for (const r of mcqRows) {
  if (!r.correcta) continue;
  const m = String(r.respuesta).match(/^(\d+)\s+([A-C])/i);
  if (m) key[Number(m[1])] = m[2].toUpperCase();
}

const qNums = [...new Set(mcqRows.map((r) => Number(String(r.respuesta).match(/^(\d+)/)?.[1])))].filter(
  Boolean,
);

const letterOnly = mcqRows.filter((r) => /^(\d+)\s+[A-C]\s*$/.test(String(r.respuesta).trim()));
const audioDetails = [];
for (const a of audioRows) {
  const storagePath = a.audio_url.split('/Levels_Listening/')[1];
  const durationSec = await fetchDuration(a.audio_url);
  audioDetails.push({ orden: a.orden, titulo: a.titulo, storagePath, durationSec });
}

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
    .eq('parte_id', p.id)
    .maybeSingle();
  untouchedStatus[`part${pn}`] = pq?.id === expId;
}

const legacyLinked = audioDetails.some((a) => /clip-\d+-v2\.mp3/.test(a.storagePath));

function keyMatch(got, exp) {
  return Object.entries(exp).every(([n, L]) => got[Number(n)] === L);
}

const report = {
  preguntaId: q.id,
  mcqRowCount: mcqRows.length,
  questionNumbers: qNums.sort((a, b) => a - b),
  answerKey: key,
  audioClipCount: audioRows.length,
  audios: audioDetails,
  letterOnlyMcqCount: letterOnly.length,
  descripcionPreview: String(parte['Descripción'] ?? parte.Descripción ?? '').slice(0, 120),
  untouched: untouchedStatus,
  legacyV2StillLinked: legacyLinked,
  checks: [
    { name: 'MCQ rows = 24', ok: mcqRows.length === 24 },
    { name: 'Q1–8', ok: JSON.stringify(qNums.sort((a, b) => a - b)) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]) },
    { name: 'Answer key', ok: keyMatch(key, EXPECTED_KEY) },
    { name: '8 audios', ok: audioRows.length === 8 },
    { name: 'All audios >= 23s', ok: audioDetails.every((a) => a.durationSec >= 23) },
    { name: 'All audios <= 40s', ok: audioDetails.every((a) => a.durationSec <= 40) },
    { name: 'No 0:00 audios', ok: audioDetails.every((a) => a.durationSec > 5) },
    { name: 'Full-text MCQ options', ok: letterOnly.length === 0 },
    { name: 'No legacy -v2 linked', ok: !legacyLinked },
    { name: 'Parts 11–13 untouched', ok: Object.values(untouchedStatus).every(Boolean) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(scriptsDir, 'generated', 'verify-part10-result.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
