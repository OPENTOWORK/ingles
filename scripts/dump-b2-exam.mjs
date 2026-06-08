/**
 * Dump exam content from Supabase for manual validation.
 * Usage: node scripts/dump-b2-exam.mjs [slot]
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const B2_EXAM_PARTS = [
  { partNumber: 1, section: 'Reading and Use of English', activity: 'multiple-choice-cloze' },
  { partNumber: 2, section: 'Reading and Use of English', activity: 'open-cloze' },
  { partNumber: 3, section: 'Reading and Use of English', activity: 'word-formation' },
  { partNumber: 4, section: 'Reading and Use of English', activity: 'key-word' },
  { partNumber: 5, section: 'Reading and Use of English', activity: 'multiple-choice' },
  { partNumber: 6, section: 'Reading and Use of English', activity: 'gapped-text' },
  { partNumber: 7, section: 'Reading and Use of English', activity: 'multiple-matching' },
  { partNumber: 8, section: 'Writing', activity: 'essay' },
  { partNumber: 9, section: 'Writing', activity: 'part-2' },
  { partNumber: 10, section: 'Listening', activity: 'short-extracts' },
  { partNumber: 11, section: 'Listening', activity: 'sentence-completion' },
  { partNumber: 12, section: 'Listening', activity: 'multiple-matching' },
  { partNumber: 13, section: 'Listening', activity: 'conversation' },
  { partNumber: 14, section: 'Speaking', activity: 'interview' },
  { partNumber: 15, section: 'Speaking', activity: 'long-turn' },
  { partNumber: 16, section: 'Speaking', activity: 'collaborative' },
  { partNumber: 17, section: 'Speaking', activity: 'discussion' },
];

function sortExamRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

async function resolveExamenId(admin, levelId, slot) {
  const { data } = await admin.from('levels_examenes').select('id, nombre').eq('level_id', levelId);
  const ordered = sortExamRows(data);
  const row = ordered[slot - 1];
  return row?.id ?? null;
}

const DEFAULT_SUPABASE_URL = 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';

const slot = Number(process.argv[2] || 1);
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or key');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id, nombre').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('B2 level not found');
  process.exit(1);
}

const examenId = await resolveExamenId(admin, level.id, slot);
if (!examenId) {
  console.error(`Exam slot ${slot} not found`);
  process.exit(1);
}

const { data: examRow } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('id', examenId)
  .single();

const { data: questions, error: qErr } = await admin
  .from('levels_preguntas')
  .select('id, examen_id, level_id, parte_id, enunciado')
  .eq('examen_id', examenId);

if (qErr) {
  console.error(qErr);
  process.exit(1);
}

const partIds = [...new Set((questions || []).map((q) => q.parte_id).filter(Boolean))];
const { data: partes } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .in('id', partIds.length ? partIds : ['00000000-0000-0000-0000-000000000000']);

function partNumFromName(name) {
  const m = String(name || '').match(/Parte\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

const partesById = Object.fromEntries((partes || []).map((p) => [p.id, p]));
const qIds = (questions || []).map((q) => q.id);

let mcq = [];
let open = [];
let audios = [];
if (qIds.length) {
  const r1 = await admin
    .from('levels_respuestas')
    .select('pregunta_id, respuesta, correcta')
    .in('pregunta_id', qIds)
    .order('respuesta');
  mcq = r1.data || [];

  const r2 = await admin
    .from('levels_respuestas_abiertas')
    .select('pregunta_id_abierta, respuesta_texto')
    .in('pregunta_id_abierta', qIds);
  open = r2.data || [];

  const r3 = await admin
    .from('levels_preguntas_audios')
    .select('pregunta_id, audio_url, orden, titulo')
    .in('pregunta_id', qIds)
    .order('orden');
  audios = r3.data || [];
}

const mcqByQ = {};
for (const r of mcq) {
  (mcqByQ[r.pregunta_id] ||= []).push(r);
}
const openByQ = {};
for (const r of open) {
  (openByQ[r.pregunta_id_abierta] ||= []).push(r.respuesta_texto);
}
const audioByQ = {};
for (const a of audios) {
  (audioByQ[a.pregunta_id] ||= []).push({ orden: a.orden, titulo: a.titulo, url: a.audio_url });
}

const byPart = {};
for (const q of questions || []) {
  const parte = partesById[q.parte_id];
  const pn = partNumFromName(parte?.nombre_parte) ?? 0;
  (byPart[pn] ||= []).push({
    preguntaId: q.id,
    parteNombre: parte?.nombre_parte,
    descripcionParte: parte?.['Descripción'] ?? parte?.Descripción ?? null,
    enunciado: q.enunciado,
    respuestasMcq: mcqByQ[q.id] || [],
    respuestasAbiertas: openByQ[q.id] || [],
    audios: audioByQ[q.id] || [],
  });
}

const out = {
  examen: examRow,
  examenId,
  levelId: level.id,
  slot,
  totalPartesConPregunta: Object.keys(byPart).length,
  partes: Object.keys(byPart)
    .sort((a, b) => Number(a) - Number(b))
    .map((pn) => {
      const def = B2_EXAM_PARTS.find((x) => x.partNumber === Number(pn));
      return {
        partNumber: Number(pn),
        section: def?.section,
        activity: def?.activity,
        items: byPart[pn],
      };
    }),
};

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outPath = path.join(root, 'scripts', 'generated', `dump-exam${slot}-b2.json`);
writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log(`Written ${outPath} (${Object.keys(byPart).length} parts, ${questions?.length || 0} questions)`);
