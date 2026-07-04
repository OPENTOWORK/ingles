/**
 * Post-save verification for B2 Exam 1 Part 11.
 * Usage: npx vercel env run --environment=production -- node scripts/verify-part11.mjs
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
const EXPECTED_KEY = {
  9: 'fitness',
  10: 'navigation',
  11: 'whistle',
  12: 'first aid',
  13: 'waterproof',
  14: 'helicopter',
  15: 'voluntary',
  16: 'steep',
  17: 'visibility',
  18: 'confidence',
};

const UNTOUCHED = {
  1: '539220ad-e7ad-40ef-8303-f0c0712485a0',
  8: '4bc7fe3e-be54-4897-bfd9-63cac9093113',
  10: 'c736e635-128b-4d9f-a186-27833ef677bd',
  12: '14b93176-4055-4568-8646-4d52ade7986a',
  13: '8f73881f-b467-4ea1-a68f-8b93dc9384f9',
  14: 'a909437e-dd62-4874-a7da-2055b2e9f8da',
};

const MIN_DURATION_SEC = 150;
const MAX_DURATION_SEC = 210;

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
  .select('id, Descripción')
  .eq('nombre_parte', 'Parte 11 B2')
  .single();

const { data: q } = await admin
  .from('levels_preguntas')
  .select('id, enunciado')
  .eq('examen_id', EXAMEN_ID)
  .eq('parte_id', parte.id)
  .maybeSingle();

const [mcq, open, audios] = await Promise.all([
  admin.from('levels_respuestas').select('respuesta, correcta').eq('pregunta_id', q.id),
  admin.from('levels_respuestas_abiertas').select('respuesta_texto').eq('pregunta_id_abierta', q.id),
  admin
    .from('levels_preguntas_audios')
    .select('orden, titulo, audio_url')
    .eq('pregunta_id', q.id)
    .order('orden'),
]);

const mcqRows = mcq.data || [];
const openRows = open.data || [];
const audioRows = audios.data || [];

const key = {};
for (const r of openRows) {
  const m = String(r.respuesta_texto).match(/^(\d+)\s+(.+)$/);
  if (m) key[Number(m[1])] = m[2].trim().toLowerCase();
}

const qNums = [...new Set(openRows.map((r) => Number(String(r.respuesta_texto).match(/^(\d+)/)?.[1])))].filter(
  Boolean,
);

const audioDetails = [];
for (const a of audioRows) {
  const storagePath = a.audio_url.split('/Levels_Listening/')[1];
  const durationSec = await fetchDuration(a.audio_url);
  audioDetails.push({ orden: a.orden, titulo: a.titulo, storagePath, durationSec });
}

const legacyLinked = audioDetails.some((a) => /clip-01-v2\.mp3/.test(a.storagePath || ''));
const hasClip01 = audioDetails.some((a) => /part-11\/clip-01-v6\.mp3/.test(a.storagePath || ''));

const enunciado = String(q.enunciado || '');
const hasGapLines = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18].every((n) =>
  enunciado.includes(`(${n})`),
);
const hasMountainTheme =
  /mountain rescue|fitness test|navigation|whistle|waterproof|helicopter/i.test(enunciado);

const untouchedStatus = {};
for (const [pn, expId] of Object.entries(UNTOUCHED)) {
  const got = await getPartPreguntaId(Number(pn));
  untouchedStatus[`part${pn}`] = got === expId;
}

function keyMatch(got, exp) {
  return Object.entries(exp).every(([n, ans]) => got[Number(n)] === ans.toLowerCase());
}

const report = {
  preguntaId: q.id,
  mcqRowCount: mcqRows.length,
  openAnswerCount: openRows.length,
  questionNumbers: qNums.sort((a, b) => a - b),
  answerKey: key,
  audioClipCount: audioRows.length,
  audios: audioDetails,
  descripcionPreview: String(parte['Descripción'] ?? parte.Descripción ?? '').slice(0, 160),
  enunciadoHasQ9to18: hasGapLines,
  enunciadoMountainTheme: hasMountainTheme,
  untouched: untouchedStatus,
  legacyV2StillLinked: legacyLinked,
  checks: [
    { name: 'MCQ rows = 0', ok: mcqRows.length === 0 },
    { name: 'Open answers = 10', ok: openRows.length === 10 },
    { name: 'Q9–18', ok: JSON.stringify(qNums.sort((a, b) => a - b)) === JSON.stringify([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]) },
    { name: 'Answer key', ok: keyMatch(key, EXPECTED_KEY) },
    { name: '1 audio clip', ok: audioRows.length === 1 },
    { name: 'clip-01-v6.mp3 linked', ok: hasClip01 },
    { name: 'No legacy clip-01-v2 linked', ok: !legacyLinked },
    { name: 'Audio >= 2:30', ok: audioDetails.every((a) => a.durationSec >= MIN_DURATION_SEC) },
    { name: 'Audio <= 3:30', ok: audioDetails.every((a) => a.durationSec <= MAX_DURATION_SEC) },
    { name: 'No 0:00 audios', ok: audioDetails.every((a) => a.durationSec > 5) },
    { name: 'Enunciado Q9–18 gaps', ok: hasGapLines },
    { name: 'Parts 1,8,10,12,13,14 untouched', ok: Object.values(untouchedStatus).every(Boolean) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(scriptsDir, 'generated', 'verify-part11-result.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
