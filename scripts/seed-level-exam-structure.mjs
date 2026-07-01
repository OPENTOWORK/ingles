/**
 * Crea partes Cambridge y fila Examen 1 para A2, B1, C1 y C2 (no toca B2).
 * Uso: node scripts/seed-level-exam-structure.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const LEVELS = [
  { slug: 'a2', partCount: 14, label: 'A2' },
  { slug: 'b1', partCount: 16, label: 'B1' },
  { slug: 'c1', partCount: 18, label: 'C1' },
  { slug: 'c2', partCount: 16, label: 'C2' },
];

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function parteName(label, partNumber) {
  return `Parte ${partNumber} ${label}`;
}

function examenName(label, slot) {
  return `Examen ${slot} ${label}`;
}

async function ensurePart(db, nombre) {
  const { data: existing } = await db.from('levels_partes').select('id').eq('nombre_parte', nombre).maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await db.from('levels_partes').insert({ nombre_parte: nombre }).select('id').single();
  if (error) throw new Error(`levels_partes ${nombre}: ${error.message}`);
  return data.id;
}

async function ensureExam(db, levelId, nombre) {
  const { data: existing } = await db
    .from('levels_examenes')
    .select('id')
    .eq('level_id', levelId)
    .ilike('nombre', nombre)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await db
    .from('levels_examenes')
    .insert({ level_id: levelId, nombre })
    .select('id')
    .single();
  if (error) throw new Error(`levels_examenes ${nombre}: ${error.message}`);
  return data.id;
}

for (const level of LEVELS) {
  const { data: row, error } = await admin.from('levels').select('id, nombre').ilike('nombre', level.slug).single();
  if (error || !row?.id) {
    console.error(`Nivel ${level.slug} no encontrado`);
    process.exit(1);
  }

  for (let p = 1; p <= level.partCount; p += 1) {
    await ensurePart(admin, parteName(level.label, p));
  }

  const examId = await ensureExam(admin, row.id, examenName(level.label, 1));
  console.log(`${level.label}: ${level.partCount} partes, Examen 1 → ${examId}`);
}

console.log('Estructura Cambridge A2/B1/C1/C2 lista (B2 sin cambios).');
