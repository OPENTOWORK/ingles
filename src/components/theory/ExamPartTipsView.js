'use client';

import { useState } from 'react';
import ExamStrategiesArticle from '@/components/theory/ExamStrategiesArticle';
import { getLevelPartNavLinks } from '@/data/levelExamPartMap';
import { useUserRole } from '@/context/UserRoleContext';
import { getExamStrategiesPartContent } from '@/data/examStrategiesPartContent';
import { buildTeoriaExamPartTipsHref } from '@/lib/examPartTipsHref';
import { examTheoryBackHrefFromPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';

/** Fallback para niveles sin ficha redactada: reusa el texto plano de part-info. */
function buildFallbackContent(info) {
  if (!info?.description && !info?.tips && !info?.commonErrors) return null;
  return {
    overviewTitle: 'What is this part?',
    overview: info.description || '',
    approachTitle: 'Tips for success',
    approach: info.tips ? [info.tips] : [],
    mistakes: info.commonErrors ? [info.commonErrors] : [],
  };
}

export default function ExamPartTipsView({
  levelSlug,
  skillFolder,
  partParam,
  info,
  pathname,
  exercisesConfig,
  getExercise,
}) {
  const { userRole } = useUserRole();
  const isStudent = usesStudentContentRestrictions(userRole);

  const partNum = parseInt(String(partParam).replace(/^part-/, ''), 10);
  const title = info.title || `Part ${partNum}`;
  const levelLabel = String(levelSlug || '').toUpperCase();
  const sectionBackHref = examTheoryBackHrefFromPartTipsPath(pathname);

  const nav = getLevelPartNavLinks(levelSlug, skillFolder, partNum);
  const prevHref = nav.showPrev
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum - 1)
    : null;
  const nextHref = nav.showNext
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum + 1)
    : null;

  const content =
    getExamStrategiesPartContent(levelSlug, skillFolder, partNum) || buildFallbackContent(info);

  const numExercises = exercisesConfig?.[`part-${partNum}`] || 12;
  const [selected, setSelected] = useState(0);
  const exercise = getExercise?.(partNum, selected + 1);
  const showExercises = !isStudent && Boolean(getExercise && exercise);

  return (
    <ExamStrategiesArticle
      skillSlug={skillFolder}
      title={title}
      intro={`Strategy, tips and common mistakes for this part at ${levelLabel}.`}
      content={content}
      backHref={sectionBackHref}
      backLabel="Back"
      prevHref={prevHref}
      nextHref={nextHref}
    >
      {showExercises ? (
        <section className="exam-strategies-chapter-card">
          <header className="exam-strategies-chapter-card__head">
            <span className="exam-strategies-chapter-card__icon" aria-hidden>
              ✏️
            </span>
            <h2 className="exam-strategies-chapter-card__title">Practice exercises</h2>
          </header>
          <div className="exam-strategies-chapter-chips">
            {[...Array(numExercises)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`exam-strategies-chapter-chip${
                  selected === i ? ' exam-strategies-chapter-chip--active' : ''
                }`}
              >
                Ejercicio {i + 1}
              </button>
            ))}
          </div>
          <ul className="exam-strategies-chapter-list">
            <li>
              <strong>{exercise.title}</strong>
            </li>
            <li>
              <strong>Question:</strong> {exercise.question}
            </li>
            <li>
              <strong>Answer:</strong> {exercise.answer}
            </li>
          </ul>
        </section>
      ) : null}
    </ExamStrategiesArticle>
  );
}
