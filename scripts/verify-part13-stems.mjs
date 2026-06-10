/**
 * Post-save verification for B2 Exam 1 Part 13 stems update.
 * Usage: npx vercel env run --environment=production -- node scripts/verify-part13-stems.mjs
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
const EXPECTED_KEY = { 24: 'B', 25: 'C', 26: 'A', 27: 'B', 28: 'C', 29: 'A', 30: 'B' };
const STEM_MARKERS = [
  'When Nina first saw the building',
  'The project group was able to start work',
  'The first stage of funding',
  'The restoration was delayed most often',
  'Who uses the hall most at present',
  'Since the hall reopened',
  "Nina's advice for other towns",
];

const UNTOUCHED = {
  10: 'c736e635-128b-4d9f-a186-27833ef677bd',
  11: '0c84ac67-cee6-4da2-aff8-cc858b1135d5',
  12: '14b93176-4055-4568-8646-4d52ade7986a',
};

async function fetchDuration(url) {
  const res = await fetch(url);
  if (!res.ok) return 0;
  const buf = Buffer.from(await res.arrayBuffer());
  return await getMp3DurationSec(buf);
}

async function getPartPreguntaId(partNumber) {
  const { data: p } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .single();
  const { data: pq } = await admin
    .from('levels_preguntas')
    .select('id')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', p.id)
    .maybeSingle();
  return pq?.id || null;
}

const { data: parte } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 13 B2')
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
const enunciado = String(q.enunciado || '');

const key = {};
for (const r of mcqRows) {
  if (!r.correcta) continue;
  const m = String(r.respuesta).match(/^(\d+)\s+([A-C])/i);
  if (m) key[Number(m[1])] = m[2].toUpperCase();
}

const qNums = [...new Set(mcqRows.map((r) => Number(String(r.respuesta).match(/^(\d+)/)?.[1])))].filter(
  Boolean,
);

const fullTextOptions = mcqRows.filter((r) => /^\d+\s+[A-C]\)\s+\S/.test(String(r.respuesta).trim()));
const letterOnly = mcqRows.filter((r) => /^(\d+)\s+[A-C]\s*$/.test(String(r.respuesta).trim()));

const audioDetails = [];
for (const a of audioRows) {
  const storagePath = a.audio_url.split('/Levels_Listening/')[1];
  const durationSec = await fetchDuration(a.audio_url);
  audioDetails.push({ orden: a.orden, titulo: a.titulo, storagePath, durationSec });
}

const untouchedStatus = {};
for (const [pn, expId] of Object.entries(UNTOUCHED)) {
  untouchedStatus[`part${pn}`] = (await getPartPreguntaId(Number(pn))) === expId;
}

const report = {
  preguntaId: q.id,
  mcqRowCount: mcqRows.length,
  openAnswerCount: 0,
  questionNumbers: qNums.sort((a, b) => a - b),
  answerKey: key,
  fullTextOptionCount: fullTextOptions.length,
  letterOnlyMcqCount: letterOnly.length,
  audioClipCount: audioRows.length,
  audios: audioDetails,
  enunciadoPreview: enunciado.slice(0, 220),
  stemsPresent: STEM_MARKERS.filter((s) => enunciado.includes(s)),
  untouched: untouchedStatus,
  checks: [
    { name: 'MCQ rows = 21', ok: mcqRows.length === 21 },
    { name: 'Q24–30', ok: JSON.stringify(qNums.sort((a, b) => a - b)) === JSON.stringify([24, 25, 26, 27, 28, 29, 30]) },
    { name: 'Answer key', ok: Object.entries(EXPECTED_KEY).every(([n, L]) => key[Number(n)] === L) },
    { name: 'Full-text options (not letter-only)', ok: fullTextOptions.length === 21 && letterOnly.length === 0 },
    { name: '1 audio clip', ok: audioRows.length === 1 },
    { name: 'clip-01.mp3 linked', ok: audioDetails.some((a) => /part-13\/clip-01\.mp3/.test(a.storagePath || '')) },
    { name: 'Audio not 0:00', ok: audioDetails.every((a) => a.durationSec > 30) },
    { name: 'New stems in enunciado', ok: STEM_MARKERS.every((s) => enunciado.includes(s)) },
    { name: 'Parts 10–12 untouched', ok: Object.values(untouchedStatus).every(Boolean) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(scriptsDir, 'generated', 'verify-part13-stems-result.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
