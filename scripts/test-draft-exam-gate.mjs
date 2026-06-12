/**
 * Tests del gate de exámenes draft (Fase 0).
 * Uso: node --loader ./scripts/alias-loader.mjs scripts/test-draft-exam-gate.mjs
 *
 * 1) Unit tests puros de levelsExamVisibility y findNextEmptyExamSlot.
 * 2) Simulación con las filas reales de Supabase (solo lectura): marca
 *    exam 5/6 como draft EN MEMORIA y comprueba la renumeración de slots.
 */
import assert from 'assert';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  isDraftExamRow,
  filterVisibleExamenes,
  findDraftExamSlots,
  fetchDraftSlotSet,
} from '../src/utils/levelsExamVisibility.js';
import { findNextEmptyExamSlot } from '../src/hooks/useLevelsExamAdminFlow.js';
import { sortLevelsExamenesRows } from '../src/utils/b2ResolveExam.js';

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  OK  ${name}`);
  } catch (e) {
    console.error(`FAIL  ${name}: ${e.message}`);
    process.exitCode = 1;
  }
}

console.log('--- Unit tests (sin flag) ---');
delete process.env.NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS;

check('isDraftExamRow detecta modelo=draft (con espacios/mayúsculas)', () => {
  assert.equal(isDraftExamRow({ modelo: 'draft' }), true);
  assert.equal(isDraftExamRow({ modelo: ' DRAFT ' }), true);
});
check('isDraftExamRow ignora tipo y modelo null/otros', () => {
  assert.equal(isDraftExamRow({ tipo: 'draft', modelo: null }), false);
  assert.equal(isDraftExamRow({ modelo: null }), false);
  assert.equal(isDraftExamRow({ modelo: 'gpt-4o' }), false);
  assert.equal(isDraftExamRow({}), false);
});

const fakeRows = [
  { id: 'a', nombre: 'Examen 1 B2', tipo: 'B2', modelo: null },
  { id: 'b', nombre: 'Examen 2 B2', tipo: 'B2', modelo: null },
  { id: 'c', nombre: 'Examen 3 B2', tipo: 'B2', modelo: null },
  { id: 'd', nombre: 'Examen 4 B2', tipo: 'B2', modelo: null },
  { id: 'e', nombre: 'Examen 5 B2', tipo: 'B2', modelo: 'draft' },
  { id: 'f', nombre: 'Examen 6 B2', tipo: 'B2', modelo: 'draft' },
];

check('filterVisibleExamenes sin flag oculta drafts', () => {
  const visible = filterVisibleExamenes(fakeRows);
  assert.equal(visible.length, 4);
  assert.deepEqual(visible.map((r) => r.id), ['a', 'b', 'c', 'd']);
});
check('slots públicos 1-4 mantienen su examen tras filtrar', () => {
  const ordered = sortLevelsExamenesRows(filterVisibleExamenes(fakeRows));
  assert.equal(ordered[0].id, 'a');
  assert.equal(ordered[3].id, 'd');
  assert.equal(ordered.length, 4);
});
check('findDraftExamSlots sobre lista completa → {5,6}', () => {
  const slots = findDraftExamSlots(sortLevelsExamenesRows(fakeRows));
  assert.deepEqual([...slots].sort(), [5, 6]);
});
check('findNextEmptyExamSlot NO da slot draft como libre', () => {
  // Catálogo filtrado: admin solo ve exámenes 1-4 → slots 5 y 6 parecen vacíos
  const idsBySlot = { 1: 'a', 2: 'b', 3: 'c', 4: 'd' };
  const draftSlots = new Set([5, 6]);
  assert.equal(findNextEmptyExamSlot(idsBySlot, 6, draftSlots), null);
  // Sin protección sí lo daría (comprobación de contraste)
  assert.equal(findNextEmptyExamSlot(idsBySlot, 6), 5);
});

console.log('--- Unit tests (con flag) ---');
process.env.NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS = 'true';

check('filterVisibleExamenes con flag muestra los 6', () => {
  assert.equal(filterVisibleExamenes(fakeRows).length, 6);
});
check('con flag, slot 5 y 6 resuelven a los drafts', () => {
  const ordered = sortLevelsExamenesRows(filterVisibleExamenes(fakeRows));
  assert.equal(ordered[4].id, 'e');
  assert.equal(ordered[5].id, 'f');
});

delete process.env.NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS;

console.log('--- Contra Supabase real (solo lectura) ---');
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL || 'https://qnazrzvwvkwhkfbqsbmr.supabase.co';
const anon =
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuYXpyenZ3dmt3aGtmYnFzYm1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MzE4ODYsImV4cCI6MjA2NTIwNzg4Nn0.mzlYtCtvK8tUYJz52yN24zpcDhBfPzsTtDE0w5Hrteg';
const db = createClient(url, anon, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: level } = await db.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: realRows } = await db
  .from('levels_examenes')
  .select('id, nombre, tipo, modelo')
  .eq('level_id', level.id);

console.log(
  'Filas reales:',
  sortLevelsExamenesRows(realRows)
    .map((r) => `${r.nombre} [tipo=${r.tipo}, modelo=${r.modelo}]`)
    .join(' | '),
);

check('estado actual: ningún examen marcado draft todavía', () => {
  assert.equal(realRows.filter(isDraftExamRow).length, 0);
});

const realDraftSlots = await fetchDraftSlotSet(db, level.id);
check('fetchDraftSlotSet (real) devuelve vacío mientras no haya drafts', () => {
  assert.equal(realDraftSlots.size, 0);
});

// Simulación: cómo quedaría tras marcar exam 5/6
const simulated = sortLevelsExamenesRows(realRows).map((r, i) =>
  i >= 4 ? { ...r, modelo: 'draft' } : { ...r },
);
check('simulación sin flag: alumnos verían solo exámenes 1-4', () => {
  const visible = sortLevelsExamenesRows(filterVisibleExamenes(simulated));
  assert.equal(visible.length, 4);
  assert.ok(visible.every((r) => !/Examen [56]/.test(r.nombre)));
});
check('simulación: slots draft reales serían {5,6}', () => {
  assert.deepEqual([...findDraftExamSlots(simulated)].sort(), [5, 6]);
});
process.env.NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS = 'true';
check('simulación con flag: ?examen=5 y ?examen=6 resolverían', () => {
  const visible = sortLevelsExamenesRows(filterVisibleExamenes(simulated));
  assert.equal(visible.length, 6);
  assert.ok(/Examen 5/.test(visible[4].nombre));
  assert.ok(/Examen 6/.test(visible[5].nombre));
});

console.log(`\n${passed} checks OK${process.exitCode ? ' (con fallos)' : ''}`);
