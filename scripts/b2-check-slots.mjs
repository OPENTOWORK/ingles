/**
 * Read-only: confirm the B2 exam slots the practice UI and the skills section will list.
 *
 * Both surfaces derive their slot list from `B2_EXAM_SLOT_MAX` and then look up an
 * `levels_examenes` row per slot, so a missing or duplicated row shows up as a dead card
 * rather than an error. This checks the rows exist exactly once and carry content.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/b2-check-slots.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { B2_EXAM_SLOT_MAX } = await import('../src/lib/b2ExamCatalog.js');
const { resolveSkillPracticeExamSlots } = await import('../src/utils/skillPracticeNavigation.js').catch(
  () => ({ resolveSkillPracticeExamSlots: null }),
);

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id);
const { data: partes } = await admin.from('levels_partes').select('id, nombre_parte');

const parteIds = new Map();
for (const p of partes || []) {
  const m = String(p.nombre_parte).match(/Parte\s+(\d+)\s+B2/i);
  if (m) parteIds.set(Number(m[1]), p.id);
}

const bySlot = new Map();
for (const e of examenes || []) {
  const slot = Number(String(e.nombre).match(/\d+/)?.[0]);
  if (!Number.isFinite(slot)) continue;
  if (!bySlot.has(slot)) bySlot.set(slot, []);
  bySlot.get(slot).push(e);
}

console.log(`B2_EXAM_SLOT_MAX = ${B2_EXAM_SLOT_MAX}`);
console.log(`levels_examenes rows for B2: ${(examenes || []).length}`);
if (resolveSkillPracticeExamSlots) {
  console.log(`skills section would list ${resolveSkillPracticeExamSlots({}).length} slots`);
}

let problems = 0;
const ruoeParts = [1, 2, 3, 4, 5, 6, 7];
const writingParts = [8, 9];

for (let slot = 1; slot <= B2_EXAM_SLOT_MAX; slot += 1) {
  const rows = bySlot.get(slot) || [];
  if (rows.length === 0) {
    console.log(`Slot ${String(slot).padStart(2)}: NO ROW`);
    problems += 1;
    continue;
  }
  if (rows.length > 1) {
    console.log(`Slot ${String(slot).padStart(2)}: ${rows.length} DUPLICATE ROWS (${rows.map((r) => r.nombre).join(' / ')})`);
    problems += 1;
  }

  const examenId = rows[0].id;
  let ruoe = 0;
  let writing = 0;
  for (const part of [...ruoeParts, ...writingParts]) {
    const { count } = await admin
      .from('levels_preguntas')
      .select('id', { count: 'exact', head: true })
      .eq('examen_id', examenId)
      .eq('parte_id', parteIds.get(part));
    if ((count || 0) > 0) {
      if (part <= 7) ruoe += 1;
      else writing += 1;
    }
  }
  const ok = ruoe === 7 && writing === 2;
  if (!ok) problems += 1;
  console.log(
    `Slot ${String(slot).padStart(2)}: "${rows[0].nombre.trim()}" · RUOE ${ruoe}/7 · Writing ${writing}/2 ${ok ? '' : '<-- INCOMPLETE'}`,
  );
}

console.log(problems ? `\n${problems} slot(s) with problems.` : '\nAll slots present, unique and complete.');
