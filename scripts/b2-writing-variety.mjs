/**
 * Read-only: report the Writing Part 2 task types offered across the 20 B2 exams, plus the
 * outstanding human-review queue left by the generation runs.
 *
 * Cambridge Part 2 lets the candidate choose between different task types, so each exam must
 * offer four distinct ones and the set as a whole should not lean on a single format.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/b2-writing-variety.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { parseB2WritingPart2Task } = await import('../src/data/b2WritingTasks.js');

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin.from('levels_examenes').select('id, nombre').eq('level_id', level.id);
const { data: parte9 } = await admin
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', 'Parte 9 B2')
  .maybeSingle();

const bySlot = new Map();
for (const e of examenes || []) {
  const slot = Number(String(e.nombre).match(/\d+/)?.[0]);
  if (Number.isFinite(slot)) bySlot.set(slot, e.id);
}

const totals = new Map();
console.log('Exam  Writing Part 2 task types');

for (let slot = 1; slot <= 20; slot += 1) {
  const { data: preguntas } = await admin
    .from('levels_preguntas')
    .select('enunciado')
    .eq('examen_id', bySlot.get(slot))
    .eq('parte_id', parte9.id);

  const task = parseB2WritingPart2Task(preguntas?.[0]?.enunciado || '');
  const types = (task.options || []).map((o) => o.writingType);
  for (const t of types) totals.set(t, (totals.get(t) || 0) + 1);
  const distinct = new Set(types.map((t) => (t === 'letter' ? 'email' : t))).size;
  console.log(`${String(slot).padStart(4)}  ${types.join(', ')}${distinct === types.length ? '' : '  <-- NOT DISTINCT'}`);
}

console.log('\nTotals across the 20 exams:');
for (const [type, n] of [...totals].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${type.padEnd(8)} ${n}`);
}

const queue = [];
for (let slot = 1; slot <= 20; slot += 1) {
  const file = path.join(
    root,
    'scripts',
    'generated',
    'b2-exams',
    `exam-${String(slot).padStart(2, '0')}`,
    'human-review.json',
  );
  if (!existsSync(file)) continue;
  const report = JSON.parse(readFileSync(file, 'utf8'));
  for (const part of report.parts || []) {
    // A part regenerated later may no longer carry findings; the audit file is the source of truth.
    const audit = path.join(
      root,
      'scripts',
      'generated',
      'b2-exams',
      `exam-${String(slot).padStart(2, '0')}`,
      `part-${String(part.part).padStart(2, '0')}.json`,
    );
    const stillFlagged = existsSync(audit)
      ? JSON.parse(readFileSync(audit, 'utf8')).humanReviewRequired
      : true;
    if (stillFlagged) queue.push({ slot, part: part.part, findings: part.reviewFindings || [] });
  }
}

console.log(`\nHuman review queue: ${queue.length} part(s)`);
for (const item of queue) {
  console.log(`  Exam ${item.slot} Part ${item.part} (${item.findings.length} finding(s))`);
  for (const f of item.findings) {
    console.log(`      ${f.itemNumber ? `Q${f.itemNumber}: ` : ''}${(f.detail || f.type).slice(0, 150)}`);
  }
}
