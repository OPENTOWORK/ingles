/**
 * Backup production content for B2 Exam 1 Parts 12 & 13.
 * Usage: npx vercel env run --environment=production -- node scripts/backup-parts-12-13.mjs
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
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBERS = [12, 13];

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();

const { data: partes } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .in('nombre_parte', PART_NUMBERS.map((n) => `Parte ${n} B2`));

const parteByNum = Object.fromEntries(
  (partes || []).map((p) => [Number(String(p.nombre_parte).match(/\d+/)?.[0]), p]),
);

const backup = {
  backedUpAt: new Date().toISOString(),
  examenId: EXAMEN_ID,
  levelId: level?.id,
  parts: [],
};

for (const pn of PART_NUMBERS) {
  const parte = parteByNum[pn];
  if (!parte?.id) {
    console.error(`Parte ${pn} not found`);
    process.exit(1);
  }

  const { data: preguntas } = await admin
    .from('levels_preguntas')
    .select('id, enunciado, creado_en')
    .eq('examen_id', EXAMEN_ID)
    .eq('parte_id', parte.id);

  const items = [];
  for (const q of preguntas || []) {
    const [mcqRes, openRes, audioRes] = await Promise.all([
      admin.from('levels_respuestas').select('*').eq('pregunta_id', q.id).order('respuesta'),
      admin.from('levels_respuestas_abiertas').select('*').eq('pregunta_id_abierta', q.id),
      admin
        .from('levels_preguntas_audios')
        .select('id, orden, titulo, audio_url')
        .eq('pregunta_id', q.id)
        .order('orden'),
    ]);

    const audios = (audioRes.data || []).map((a) => ({
      ...a,
      storagePath: String(a.audio_url || '').split('/Levels_Listening/')[1] || null,
    }));

    items.push({
      preguntaId: q.id,
      enunciado: q.enunciado,
      creado_en: q.creado_en,
      respuestasMcq: mcqRes.data || [],
      respuestasAbiertas: openRes.data || [],
      audios,
    });
  }

  backup.parts.push({
    partNumber: pn,
    parteId: parte.id,
    parteNombre: parte.nombre_parte,
    descripcionParte: parte['Descripción'] ?? parte.Descripción,
    items,
    mcqRowCount: items.reduce((s, i) => s + i.respuestasMcq.length, 0),
    openRowCount: items.reduce((s, i) => s + i.respuestasAbiertas.length, 0),
    audioClipCount: items.reduce((s, i) => s + i.audios.length, 0),
  });
}

const outPath = path.join(
  scriptsDir,
  'generated',
  `backup-exam1-b2-parts12-13-${Date.now()}.json`,
);
writeFileSync(outPath, JSON.stringify(backup, null, 2), 'utf8');

console.log(`Backup written: ${outPath}`);
for (const p of backup.parts) {
  console.log(
    `Part ${p.partNumber}: preguntaId=${p.items[0]?.preguntaId || 'none'} | MCQ=${p.mcqRowCount} | open=${p.openRowCount} | audios=${p.audioClipCount}`,
  );
  for (const a of p.items[0]?.audios || []) {
    console.log(`  audio orden ${a.orden}: ${a.storagePath || a.audio_url}`);
  }
}
