/**
 * Gate de exámenes draft (zona de pruebas exam 5/6).
 *
 * Un examen es draft cuando `levels_examenes.modelo === 'draft'`.
 * IMPORTANTE: la columna `tipo` NO se usa para esto — conserva el nivel del
 * examen (p. ej. "B2") y no debe pisarse.
 *
 * Visibilidad:
 * - Producción (sin flag): los drafts se filtran y los alumnos no los ven.
 * - Local: con `NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS=true` en `.env.local`
 *   (y reinicio del dev server) los drafts sí se muestran.
 *   Esta variable NUNCA debe estar activa en Vercel producción.
 */

import { sortLevelsExamenesRows } from '@/utils/b2ResolveExam';

export function showDraftExams() {
  return process.env.NEXT_PUBLIC_DRALO_SHOW_DRAFT_EXAMS === 'true';
}

/** @param {{ modelo?: unknown }} row fila de levels_examenes */
export function isDraftExamRow(row) {
  return String(row?.modelo ?? '').trim().toLowerCase() === 'draft';
}

/**
 * Filtra las filas de levels_examenes visibles para el usuario actual.
 * Las filas deben incluir la columna `modelo` en el select.
 * @param {Array<{ modelo?: unknown }>} rows
 */
export function filterVisibleExamenes(rows) {
  const list = Array.isArray(rows) ? rows : [];
  if (showDraftExams()) return list;
  return list.filter((row) => !isDraftExamRow(row));
}

/**
 * Slots ocupados por drafts, calculados sobre la lista COMPLETA ordenada
 * (sin filtrar), porque los slots son posicionales.
 * @param {Array<{ modelo?: unknown }>} sortedRows filas ya ordenadas por número de examen
 * @returns {Set<number>} slots 1-based con examen draft
 */
export function findDraftExamSlots(sortedRows) {
  const out = new Set();
  (Array.isArray(sortedRows) ? sortedRows : []).forEach((row, index) => {
    if (isDraftExamRow(row)) out.add(index + 1);
  });
  return out;
}

/**
 * Consulta los slots draft de un nivel (server o cliente).
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string} levelId
 * @returns {Promise<Set<number>>}
 */
export async function fetchDraftSlotSet(db, levelId) {
  const { data, error } = await db
    .from('levels_examenes')
    .select('id, nombre, modelo')
    .eq('level_id', levelId);
  if (error || !data?.length) return new Set();
  return findDraftExamSlots(sortLevelsExamenesRows(data));
}
