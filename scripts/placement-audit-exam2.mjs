/**
 * Audita Test 2 en Supabase. Uso: node scripts/placement-audit-exam2.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  buildPlacementQuestionSet,
  PLACEMENT_EXAM2_TEST_ID,
} from '../src/lib/placementSupabase.js';

const TEST_ID = PLACEMENT_EXAM2_TEST_ID;

function loadEnvLocal() {
  const path = join(process.cwd(), '.env.local');
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
    }
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key || url.includes('tu_supabase')) {
  console.error('Configura NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: test } = await db
  .from('placement_tests')
  .select('*')
  .eq('id', TEST_ID)
  .maybeSingle();

const { data: preguntas, error } = await db
  .from('placement_preguntas')
  .select('id, pregunta, explicacion, test_id, partes_id')
  .eq('test_id', TEST_ID);

if (error) {
  console.error(error.message);
  process.exit(1);
}

const ids = (preguntas || []).map((p) => p.id);
let respuestas = [];
for (let i = 0; i < ids.length; i += 80) {
  const { data } = await db
    .from('placement_respuestas')
    .select('*')
    .in('pregunta_id', ids.slice(i, i + 80));
  respuestas = respuestas.concat(data || []);
}

const byPregunta = new Map();
for (const r of respuestas) {
  if (!byPregunta.has(r.pregunta_id)) byPregunta.set(r.pregunta_id, []);
  byPregunta.get(r.pregunta_id).push(r);
}

const rows = (preguntas || []).map((p) => ({
  ...p,
  placement_respuestas: byPregunta.get(p.id) || [],
}));

const questions = buildPlacementQuestionSet(rows, { test });

console.log('--- Test 2 ---');
console.log('test_id:', TEST_ID);
console.log('label:', test?.nombre || test?.titulo || test?.name);
console.log('Preguntas en BD (este test_id):', rows.length);
console.log('Respuestas en BD:', respuestas.length);
console.log(
  'Cargadas en app:',
  questions.length,
  '| grammar:',
  questions.filter((q) => q.part === 1).length,
  '| reading:',
  questions.filter((q) => q.part === 2).length,
  '| writing:',
  questions.filter((q) => q.part === 3).length,
);

const parteCount = {};
for (const p of rows) {
  const m = String(p.explicacion || '').match(/parte\s*(\d+)/i);
  const k = m ? `parte${m[1]}` : 'sin-parte';
  parteCount[k] = (parteCount[k] || 0) + 1;
}
console.log('Por etiqueta explicacion:', parteCount);

const rango = { '1-50': 0, '51-60': 0, '61+': 0, otras: 0 };
for (const p of rows) {
  const m = String(p.explicacion || '').match(/pregunta\s*(\d+)/i);
  const n = m ? Number(m[1]) : -1;
  if (n >= 1 && n <= 50) rango['1-50']++;
  else if (n >= 51 && n <= 60) rango['51-60']++;
  else if (n >= 61) rango['61+']++;
  else rango.otras++;
}
console.log('Por numero en explicacion:', rango);

const sinResp = rows.filter((p) => (p.placement_respuestas || []).length < 2);
console.log('Preguntas con menos de 2 respuestas:', sinResp.length);
if (sinResp.length) {
  console.log('Ejemplos:', sinResp.slice(0, 5).map((p) => p.explicacion));
}
