/**
 * Compatibilidad: delega en levelsCambridgeExamGenerator (nivel B2).
 */
import {
  generateAndPersistLevelExam,
  generateAndPersistLevelExamPart,
  resetLevelExamContent,
  deleteLevelExam,
  ensureLevelExamenRow,
  ensureLevelParteRow,
  persistCambridgeGeneratedPart,
} from '@/lib/levelsCambridgeExamGenerator';

export async function ensureB2ExamenRow(db, levelId, slot) {
  return ensureLevelExamenRow(db, 'b2', levelId, slot);
}

export async function ensureB2ParteRow(db, partNumber) {
  return ensureLevelParteRow(db, 'b2', partNumber);
}

export const persistB2GeneratedPart = persistCambridgeGeneratedPart;

export async function resetB2ExamContent(adminDb, { levelId, examSlot }) {
  return resetLevelExamContent(adminDb, 'b2', { levelId, examSlot });
}

export async function deleteB2Exam(adminDb, { levelId, examSlot }) {
  return deleteLevelExam(adminDb, 'b2', { levelId, examSlot });
}

export async function generateAndPersistB2ExamPart(adminDb, options = {}) {
  return generateAndPersistLevelExamPart(adminDb, {
    levelSlug: 'b2',
    preserveExistingParts: true,
    replacePartContent: false,
    ...options,
  });
}

export async function generateAndPersistB2Exam(adminDb, options = {}) {
  return generateAndPersistLevelExam(adminDb, {
    levelSlug: 'b2',
    preserveExistingParts: !options.force,
    replacePartContent: Boolean(options.force),
    ...options,
  });
}
