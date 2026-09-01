/**
 * Verify stored B2 exam content against what the practice UI expects.
 *
 * Saving a part only proves the generator's validator was happy; this reads the rows back
 * and runs the same parsers the student-facing pages use, so a part that persists but
 * renders or grades wrong is caught here.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-verify-exam.mjs 1
 *   node --loader ./scripts/alias-loader.mjs scripts/b2-verify-exam.mjs all
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const arg = String(process.argv[2] || 'all').toLowerCase();
const slots = arg === 'all' ? Array.from({ length: 20 }, (_, i) => i + 1) : [Number(arg)];

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const { parseB2WritingPart1Task, parseB2WritingPart2Task } = await import('../src/data/b2WritingTasks.js');

/** Cambridge B2 First expectations per RUOE part. */
const EXPECTED = {
  1: { mcqRows: 32, correct: 8, open: 0 },
  2: { mcqRows: 0, correct: 0, open: 8 },
  3: { mcqRows: 0, correct: 0, open: 8 },
  4: { mcqRows: 0, correct: 0, open: 6 },
  5: { mcqRows: 24, correct: 6, open: 0 },
  6: { mcqRows: 42, correct: 6, open: 0 },
  7: { mcqRows: 40, correct: 10, open: 0 },
};

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id);
const { data: partes } = await admin.from('levels_partes').select('id, nombre_parte');

const parteIdByNumber = new Map();
for (const p of partes || []) {
  const m = String(p.nombre_parte).match(/Parte\s+(\d+)\s+B2/i);
  if (m) parteIdByNumber.set(Number(m[1]), p.id);
}

const examenBySlot = new Map();
for (const e of examenes || []) {
  const n = Number(String(e.nombre).match(/\d+/)?.[0]);
  if (n) examenBySlot.set(n, e.id);
}

let problems = 0;
const rows = [];

for (const slot of slots) {
  const examenId = examenBySlot.get(slot);
  if (!examenId) {
    console.error(`Exam ${slot}: no levels_examenes row`);
    problems += 1;
    continue;
  }

  for (const partNumber of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
    const parteId = parteIdByNumber.get(partNumber);
    const { data: preguntas } = await admin
      .from('levels_preguntas')
      .select('id, enunciado')
      .eq('examen_id', examenId)
      .eq('parte_id', parteId);

    const pregunta = preguntas?.[0];
    if (!pregunta) {
      rows.push({ exam: slot, part: partNumber, status: 'EMPTY', detail: '' });
      continue;
    }

    const issues = [];

    if (partNumber <= 7) {
      const expected = EXPECTED[partNumber];
      const { count: mcqRows } = await admin
        .from('levels_respuestas')
        .select('id', { count: 'exact', head: true })
        .eq('pregunta_id', pregunta.id);
      const { count: correct } = await admin
        .from('levels_respuestas')
        .select('id', { count: 'exact', head: true })
        .eq('pregunta_id', pregunta.id)
        .eq('correcta', true);
      const { count: open } = await admin
        .from('levels_respuestas_abiertas')
        .select('id', { count: 'exact', head: true })
        .eq('pregunta_id_abierta', pregunta.id);

      if ((mcqRows || 0) !== expected.mcqRows) issues.push(`options ${mcqRows} != ${expected.mcqRows}`);
      if ((correct || 0) !== expected.correct) issues.push(`keys ${correct} != ${expected.correct}`);
      if ((open || 0) !== expected.open) issues.push(`open answers ${open} != ${expected.open}`);
    }

    if (partNumber === 8) {
      const task = parseB2WritingPart1Task(pregunta.enunciado || '');
      if (task.fromDefault) issues.push('UI falls back to the default essay (enunciado unparseable)');
      if (!task.question) issues.push('no essay question parsed');
      if ((task.points || []).length < 3) issues.push(`only ${(task.points || []).length} bullet points`);
    }

    if (partNumber === 9) {
      const task = parseB2WritingPart2Task(pregunta.enunciado || '');
      if (task.fromDefault) issues.push('UI falls back to the default task set (enunciado unparseable)');
      const options = task.options || [];
      if (options.length !== 4) issues.push(`${options.length} options, expected 4`);
      const canonical = options.map((o) => (o.writingType === 'letter' ? 'email' : o.writingType));
      if (new Set(canonical).size !== options.length) issues.push(`duplicate task types: ${canonical.join(', ')}`);
      const missingBody = options.filter((o) => !o.task || o.task.length < 30);
      if (missingBody.length) issues.push(`${missingBody.length} option(s) with empty task text`);
    }

    if (issues.length) problems += 1;
    rows.push({
      exam: slot,
      part: partNumber,
      status: issues.length ? 'FAIL' : 'ok',
      detail: issues.join('; '),
    });
  }
}

const failures = rows.filter((r) => r.status === 'FAIL');
const empty = rows.filter((r) => r.status === 'EMPTY');

console.log('\nExam  Part  Status  Detail');
for (const r of rows) {
  if (r.status === 'ok') continue;
  console.log(`${String(r.exam).padStart(4)}  ${String(r.part).padStart(4)}  ${r.status.padEnd(6)}  ${r.detail}`);
}

const okCount = rows.filter((r) => r.status === 'ok').length;
console.log(`\n${okCount}/${rows.length} parts ok · ${failures.length} failing · ${empty.length} empty`);

if (failures.length) process.exit(1);
