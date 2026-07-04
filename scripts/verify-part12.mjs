/**
 * Post-save verification for B2 Exam 1 Part 12 (Listening Part 3).
 * Usage: node scripts/verify-part12.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const EXPECTED_KEY = { 19: 'C', 20: 'H', 21: 'B', 22: 'E', 23: 'G' };
const CLIP_MIN_SEC = 30;
const CLIP_MAX_SEC = 40;
const TOTAL_MIN_SEC = 180;
const TOTAL_MAX_SEC = 240;

async function fetchDuration(url) {
  const res = await fetch(url);
  if (!res.ok) return 0;
  return getMp3DurationSec(Buffer.from(await res.arrayBuffer()));
}

const { data: parte } = await admin
  .from('levels_partes')
  .select('id, Descripción')
  .eq('nombre_parte', 'Parte 12 B2')
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
  const m = String(r.respuesta).match(/^(\d+)\s+([A-H])/i);
  if (m) key[Number(m[1])] = m[2].toUpperCase();
}

const qNums = [...new Set(mcqRows.map((r) => Number(String(r.respuesta).match(/^(\d+)/)?.[1])))].filter(
  Boolean,
);

const audioDetails = [];
for (const a of audioRows) {
  const storagePath = a.audio_url.split('/Levels_Listening/')[1];
  const durationSec = await fetchDuration(a.audio_url);
  audioDetails.push({ orden: a.orden, titulo: a.titulo, storagePath, durationSec });
}

const hasFullV3 = audioDetails.some((a) => /part-12\/full-v3\.mp3/.test(a.storagePath || ''));
const enunciado = String(q.enunciado || '');
const poolCount = (enunciado.match(/\n[A-H]\)/g) || enunciado.match(/\n[A-H] /g) || []).length;

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
  poolLinesInEnunciado: poolCount,
  checks: [
    { name: 'MCQ rows = 40', ok: mcqRows.length === 40 },
    { name: 'Q19–23', ok: JSON.stringify(qNums.sort((a, b) => a - b)) === JSON.stringify([19, 20, 21, 22, 23]) },
    { name: 'Answer key', ok: keyMatch(key, EXPECTED_KEY) },
    { name: '1 combined audio', ok: audioRows.length === 1 },
    { name: 'full-v3.mp3 linked', ok: hasFullV3 },
    {
      name: 'Combined duration 3:00–4:00',
      ok:
        audioDetails.length === 1 &&
        audioDetails[0].durationSec >= TOTAL_MIN_SEC &&
        audioDetails[0].durationSec <= TOTAL_MAX_SEC,
    },
    { name: '8 options A–H in enunciado', ok: poolCount >= 8 },
    { name: 'Directions mention paid work', ok: /paid work/i.test(enunciado) },
  ],
};

report.allOk = report.checks.every((c) => c.ok);

writeFileSync(path.join(scriptsDir, 'generated', 'verify-part12-result.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (!report.allOk) process.exit(1);
