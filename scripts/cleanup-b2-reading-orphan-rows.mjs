/**
 * Controlled cleanup of known orphan B2 Reading Part 5/7 rows (0 answers only).
 * Creates JSON backup before delete. Refuses if IDs or answer counts do not match.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/cleanup-b2-reading-orphan-rows.mjs [--dry-run]
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dryRun = process.argv.includes('--dry-run');

/** Full UUIDs resolved at runtime from short-id prefix match. */
const ORPHAN_SHORT_IDS = ['4a624b0f', '8fec0825', 'c4260d37'];

const PROTECTED_SHORT_IDS = new Set([
  '3c8a7acc',
  'b49e0fad',
  '09bb9bdd',
  'cd0b2a0a',
  '65bdae29',
  '06f21bb2',
]);

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function shortId(id) {
  return String(id || '').slice(0, 8);
}

async function fetchRowBackup(preguntaId) {
  const { data: pregunta, error } = await admin
    .from('levels_preguntas')
    .select('id, examen_id, level_id, parte_id, enunciado')
    .eq('id', preguntaId)
    .maybeSingle();
  if (error) throw new Error(`levels_preguntas ${preguntaId}: ${error.message}`);
  if (!pregunta) return null;

  const [{ data: mcq }, { data: open }, { data: audios }] = await Promise.all([
    admin.from('levels_respuestas').select('*').eq('pregunta_id', preguntaId),
    admin.from('levels_respuestas_abiertas').select('*').eq('pregunta_id_abierta', preguntaId),
    admin.from('levels_preguntas_audios').select('*').eq('pregunta_id', preguntaId),
  ]);

  const { data: parte } = await admin
    .from('levels_partes')
    .select('id, nombre_parte')
    .eq('id', pregunta.parte_id)
    .maybeSingle();

  const { data: examen } = await admin
    .from('levels_examenes')
    .select('id, nombre')
    .eq('id', pregunta.examen_id)
    .maybeSingle();

  return {
    pregunta,
    parte,
    examen,
    levels_respuestas: mcq || [],
    levels_respuestas_abiertas: open || [],
    levels_preguntas_audios: audios || [],
  };
}

async function resolveOrphanIds() {
  const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
  if (!level?.id) throw new Error('B2 level not found');

  const { data: exams } = await admin.from('levels_examenes').select('id').eq('level_id', level.id);
  const examIds = (exams || []).map((e) => e.id);
  if (!examIds.length) throw new Error('No B2 exams');

  const { data: preguntas, error } = await admin
    .from('levels_preguntas')
    .select('id')
    .in('examen_id', examIds);
  if (error) throw new Error(error.message);

  const resolved = [];
  for (const short of ORPHAN_SHORT_IDS) {
    const match = (preguntas || []).find((p) => shortId(p.id) === short);
    if (!match) throw new Error(`Expected orphan id prefix ${short} not found`);
    resolved.push(match.id);
  }
  return resolved;
}

async function assertSafeToDelete(preguntaId) {
  if (PROTECTED_SHORT_IDS.has(shortId(preguntaId))) {
    throw new Error(`Refusing to delete protected row ${preguntaId}`);
  }

  const [{ count: mcq }, { count: open }, { count: audio }, { count: puntuaciones }] = await Promise.all([
    admin.from('levels_respuestas').select('id', { count: 'exact', head: true }).eq('pregunta_id', preguntaId),
    admin
      .from('levels_respuestas_abiertas')
      .select('id', { count: 'exact', head: true })
      .eq('pregunta_id_abierta', preguntaId),
    admin.from('levels_preguntas_audios').select('id', { count: 'exact', head: true }).eq('pregunta_id', preguntaId),
    admin.from('levels_puntuaciones').select('id', { count: 'exact', head: true }).eq('id_pregunta', preguntaId),
  ]);

  if ((mcq || 0) + (open || 0) > 0) {
    throw new Error(`Row ${preguntaId} has ${mcq} MCQ + ${open} open answer keys — aborting`);
  }

  return { mcq: mcq || 0, open: open || 0, audio: audio || 0, puntuaciones: puntuaciones || 0 };
}

async function deletePreguntaRow(preguntaId) {
  const { deletePreguntasByIds } = await import('../src/lib/levelsExamPersist.js');
  await deletePreguntasByIds(admin, [preguntaId]);
}

const orphanIds = await resolveOrphanIds();
const backup = {
  createdAt: new Date().toISOString(),
  dryRun,
  orphanIds,
  rows: [],
};

for (const id of orphanIds) {
  const counts = await assertSafeToDelete(id);
  const rowBackup = await fetchRowBackup(id);
  if (!rowBackup) throw new Error(`Row ${id} disappeared before backup`);
  backup.rows.push({ id, counts, backup: rowBackup });
}

const backupDir = path.join(root, 'scripts', 'generated', 'backups');
mkdirSync(backupDir, { recursive: true });
const backupPath = path.join(
  backupDir,
  `b2-reading-orphan-rows-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
);
writeFileSync(backupPath, JSON.stringify(backup, null, 2), 'utf8');
console.error(`Backup written: ${backupPath}`);

if (dryRun) {
  console.log(JSON.stringify({ dryRun: true, wouldDelete: orphanIds, backupPath }, null, 2));
  process.exit(0);
}

const deleted = [];
for (const id of orphanIds) {
  await deletePreguntaRow(id);
  deleted.push(id);
  console.error(`Deleted ${id} (${shortId(id)})`);
}

console.log(JSON.stringify({ deleted, backupPath }, null, 2));
