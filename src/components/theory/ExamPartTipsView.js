'use client';

import { useState } from 'react';
import ExamStrategiesArticle from '@/components/theory/ExamStrategiesArticle';
import { getLevelPartNavLinks } from '@/data/levelExamPartMap';
import { useUserRole } from '@/context/UserRoleContext';
import { getExamStrategiesPartContent } from '@/data/examStrategiesPartContent';
import { buildTeoriaExamPartTipsHref } from '@/lib/examPartTipsHref';
import { examTheoryBackHrefFromPartTipsPath } from '@/lib/nivelesPartTipsRoutes';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import GuestRegisterTeaser from '@/components/auth/GuestRegisterTeaser';
import { useGuestPreview } from '@/hooks/useGuestPreview';
import {
  getGuestRegisterHref,
  isGuestExamStrategiesChapterAllowed,
} from '@/lib/guestPreviewAccess';

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
  const { userRole, session } = useUserRole();
  const { isGuest } = useGuestPreview();
  const isStudent = usesStudentContentRestrictions(userRole);
  const guestLocked = !session && !isGuestExamStrategiesChapterAllowed(pathname);

  const partNum = parseInt(String(partParam).replace(/^part-/, ''), 10);
  const title = info.title || `Part ${partNum}`;
  const levelLabel = String(levelSlug || '').toUpperCase();
  const sectionBackHref = examTheoryBackHrefFromPartTipsPath(pathname);

  const nav = getLevelPartNavLinks(levelSlug, skillFolder, partNum);
  const prevHrefRaw = nav.showPrev
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum - 1)
    : null;
  const nextHrefRaw = nav.showNext
    ? buildTeoriaExamPartTipsHref(levelSlug, skillFolder, partNum + 1)
    : null;
  const prevHref =
    prevHrefRaw && isGuest && !isGuestExamStrategiesChapterAllowed(prevHrefRaw)
      ? getGuestRegisterHref(prevHrefRaw)
      : prevHrefRaw;
  const nextHref =
    nextHrefRaw && isGuest && !isGuestExamStrategiesChapterAllowed(nextHrefRaw)
      ? getGuestRegisterHref(nextHrefRaw)
      : nextHrefRaw;

  const content =
    getExamStrategiesPartContent(levelSlug, skillFolder, partNum) || buildFallbackContent(info);

  const numExercises = exercisesConfig?.[`part-${partNum}`] || 12;
  const [selected, setSelected] = useState(0);
  const exercise = getExercise?.(partNum, selected + 1);
  const showExercises = !isStudent && Boolean(getExercise && exercise);

  if (guestLocked) {
    return (
      <main className="shell content-hub-shell teoria-page exam-strategies-chapter-page">
        <GuestRegisterTeaser
          nextHref={pathname}
          message="Create a free account to read the rest of Exam Strategies."
        />
      </main>
    );
  }

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
