import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';
import { loadExamModeSession } from '@/utils/examModeSession';
import {
  persistRescoredExamModeSnapshots,
  rescoreExamModeSessionFromDrafts,
} from '@/utils/examModeRescoreFromDrafts';

/**
 * Persist completed exam-mode sessions from localStorage to Supabase
 * (levels_puntuaciones + levels_stars via persistExamModeSectionScores).
 */
export async function syncExamModeLocalSessionsToSupabase(userId, slug = 'b2') {
  if (!userId || typeof window === 'undefined') {
    return { sectionsPersisted: 0 };
  }

  let sectionsPersisted = 0;

  for (let slot = 1; slot <= B2_EXAM_SLOT_MAX; slot += 1) {
    const session = loadExamModeSession(slug, slot, userId);
    if (!session?.sections?.some((s) => s.status === 'completed')) continue;

    const { snapshotsBySection } = await rescoreExamModeSessionFromDrafts(session, slug, slot);
    const sectionCount = Object.keys(snapshotsBySection || {}).length;
    if (!sectionCount) continue;

    await persistRescoredExamModeSnapshots(userId, slug, slot, snapshotsBySection);
    sectionsPersisted += sectionCount;
  }

  return { sectionsPersisted };
}
