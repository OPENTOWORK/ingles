import { getB2ExamPracticeNavState } from '@/data/b2ExamModuleNav';
import { buildExamModePracticeHref } from '@/utils/examModeSession';

/**
 * Exam-mode href for the next module when leaving the last part of a paper section.
 */
export function buildExamModeContinueModuleHref({
  partNumber,
  pagePartMax,
  examSlot,
  slug = 'b2',
}) {
  const nav = getB2ExamPracticeNavState({
    partNumber,
    pagePartMax,
    examSlot,
    slug,
  });
  if (nav.continueMode !== 'link' || !nav.continueHref) return null;
  const basePath = nav.continueHref.split('?')[0];
  return buildExamModePracticeHref(basePath, examSlot, {
    part: nav.nextPartNumber ?? undefined,
  });
}
