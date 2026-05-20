/**
 * Bloqueo secuencial para estudiantes (Exam theory + hub Theory).
 * Desactivado de momento: todas las partes y temas visibles.
 */
export const SEQUENTIAL_LOCK_FOR_STUDENTS = false;

export function shouldApplySequentialLock(isStudent) {
  return Boolean(isStudent && SEQUENTIAL_LOCK_FOR_STUDENTS);
}
