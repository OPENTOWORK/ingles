'use client';

import B2ExamPaperPracticePage from '@/components/b2/B2ExamPaperPracticePage';
import { getExamSkillPartRange, getExamSkillSectionTitle } from '@/data/levelExamPartMap';
import { getLevelExamSkillRoute, getNivelesLevelHub } from '@/data/nivelesLevelHub';

function formatPartsLabelEn(partMin, partMax) {
  if (partMin === partMax) return `Part ${partMin}`;
  return `Parts ${partMin} to ${partMax}`;
}

/**
 * Práctica por skill con formato Cambridge (partes oficiales por nivel).
 * Reutiliza B2ExamPaperPracticePage; no modifica rutas ni lógica B2.
 */
export default function LevelExamPaperPracticePage({ slug, skillRoute }) {
  const levelSlug = String(slug || '').toLowerCase();
  const config = getNivelesLevelHub(levelSlug);
  const routeMeta = getLevelExamSkillRoute(levelSlug, skillRoute);
  const { partMin, partMax } = getExamSkillPartRange(levelSlug, skillRoute);
  const sectionTitle = getExamSkillSectionTitle(levelSlug, skillRoute) || routeMeta?.section || 'Practice';
  const title = routeMeta?.practiceTitle
    ? `${config.cefr} ${routeMeta.practiceTitle}`
    : `${config.cefr} ${sectionTitle} Practice`;
  const subtitle = formatPartsLabelEn(partMin, partMax);
  const isListening = skillRoute === 'exam-listening';
  const isWriting = skillRoute === 'exam-writing';
  const isA2Rw =
    levelSlug === 'a2' &&
    (skillRoute === 'exam-reading' || skillRoute === 'exam-useofenglish');

  return (
    <B2ExamPaperPracticePage
      slug={levelSlug}
      skillRoute={skillRoute}
      title={title}
      subtitle={subtitle}
      partMin={partMin}
      partMax={partMax}
      emptyErrorMessage={`No questions available for ${config.cefr} ${sectionTitle}. An admin must generate the exam first.`}
      loadingLabel={`Loading ${sectionTitle} (${subtitle})…`}
      refreshLabel={`Refresh ${sectionTitle} (${partMin}–${partMax})`}
      preferOpenInputs={isA2Rw}
      showAudioFromEnunciado={isListening}
      longFormWritingWithAi={isWriting || isA2Rw}
      writingWordMin={levelSlug === 'a2' ? 25 : 140}
      writingWordMax={levelSlug === 'a2' ? 80 : 190}
      lang="en"
    />
  );
}
