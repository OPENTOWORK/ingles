/**
 * Post-save verification for Parts 12 & 13.
 * Usage: npx vercel env run --environment=production -- node scripts/verify-parts-12-13.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvLocal();
const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_ANON_KEY,
  {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';

async function headBytes(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return Number(res.headers.get('content-length') || 0);
  } catch {
    return 0;
  }
}

function estSec(bytes) {
  return bytes ? Math.round((bytes * 8) / (128 * 1000)) : 0;
}

function parseMcqKey(rows) {
  const correct = {};
  for (const r of rows) {
    if (!r.correcta) continue;
    const m = String(r.respuesta).match(/^(\d{1,2})\s+([A-H])/i);
    if (m) correct[Number(m[1])] = m[2].toUpperCase();
  }
  return correct;
}

const report = { parts: [], checks: [] };

for (const pn of [12, 13]) {
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${pn} B2`)
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
  const key = parseMcqKey(mcqRows);
  const qNums = [...new Set(mcqRows.map((r) => Number(String(r.respuesta).match(/^(\d+)/)?.[1])))].filter(
    Boolean,
  );

  const audioDetails = [];
  for (const a of audioRows) {
    const bytes = await headBytes(a.audio_url);
    audioDetails.push({
      orden: a.orden,
      titulo: a.titulo,
      storagePath: a.audio_url.split('/Levels_Listening/')[1],
      bytes,
      estSec: estSec(bytes),
    });
  }

  const poolInEnunciado = (q.enunciado.match(/\n[A-H]\s+\S/g) || []).length;
  const hasSpeakerLabels = /Speaker\s+[1-5]/i.test(q.enunciado);
  const letterOnlyMcq = mcqRows.filter((r) => /^(\d+)\s+[A-H]\s*$/.test(String(r.respuesta).trim()));

  report.parts.push({
    partNumber: pn,
    preguntaId: q.id,
    mcqRowCount: mcqRows.length,
    questionNumbers: qNums.sort((a, b) => a - b),
    answerKey: key,
    audioClipCount: audioRows.length,
    audios: audioDetails,
    poolLinesInEnunciado: poolInEnunciado,
    hasSpeakerLabels,
    letterOnlyMcqCount: letterOnlyMcq.length,
    enunciadoPreview: q.enunciado.slice(0, 200),
  });
}

const p12 = report.parts.find((p) => p.partNumber === 12);
const p13 = report.parts.find((p) => p.partNumber === 13);

const expected12 = { 19: 'C', 20: 'H', 21: 'B', 22: 'E', 23: 'G' };
const expected13 = { 24: 'B', 25: 'C', 26: 'A', 27: 'B', 28: 'C', 29: 'A', 30: 'B' };

function keyMatch(got, exp) {
  return Object.entries(exp).every(([n, L]) => got[Number(n)] === L);
}

report.checks = [
  { name: 'Part 12 MCQ rows = 40', ok: p12.mcqRowCount === 40 },
  { name: 'Part 12 Q19–23', ok: JSON.stringify(p12.questionNumbers) === JSON.stringify([19, 20, 21, 22, 23]) },
  { name: 'Part 12 answer key', ok: keyMatch(p12.answerKey, expected12) },
  { name: 'Part 12 five audios', ok: p12.audioClipCount === 5 },
  { name: 'Part 12 all audios > 20s est', ok: p12.audios.every((a) => a.estSec >= 20) },
  { name: 'Part 12 pool A–H in enunciado (8 lines)', ok: p12.poolLinesInEnunciado >= 8 },
  { name: 'Part 12 speaker labels', ok: p12.hasSpeakerLabels },
  { name: 'Part 12 no letter-only MCQ text', ok: p12.letterOnlyMcqCount === 0 },
  { name: 'Part 13 MCQ rows = 21', ok: p13.mcqRowCount === 21 },
  { name: 'Part 13 Q24–30', ok: JSON.stringify(p13.questionNumbers) === JSON.stringify([24, 25, 26, 27, 28, 29, 30]) },
  { name: 'Part 13 answer key', ok: keyMatch(p13.answerKey, expected13) },
  { name: 'Part 13 one audio', ok: p13.audioClipCount === 1 },
  { name: 'Part 13 audio >= 180s est', ok: p13.audios[0]?.estSec >= 180 },
  { name: 'Part 13 no letter-only MCQ', ok: p13.letterOnlyMcqCount === 0 },
  { name: 'Part 13 no speaker labels in enunciado', ok: !p13.hasSpeakerLabels },
];

report.allOk = report.checks.every((c) => c.ok);

const outPath = path.join(scriptsDir, 'generated', 'verify-parts-12-13-result.json');
writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (!report.allOk) process.exit(1);
