'use client';

import Link from 'next/link';
import { EXAM_THEORY_CATALOG, SECTIONS } from '@/data/teoriaSections';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import { getExamTheoryUnlockStates } from '@/lib/examTheoryUnlock';
import { SEQUENTIAL_LOCK_FOR_STUDENTS } from '@/lib/theoryLockConfig';
import ExamTheoryProgressBar from '@/components/niveles/ExamTheoryProgressBar';

function ExamTheoryCardContent({ area, initial, percent, unitProgress, count }) {
  return (
    <>
      <div className="area-card__head">
        <span className="area-card__icon" style={{ background: area.accent }} aria-hidden>
          {initial}
        </span>
        <span className="area-card__title">{area.key}</span>
      </div>
      <span className="area-card__desc">{area.description}</span>
      <ExamTheoryProgressBar
        percent={percent}
        label={area.key}
        size="sm"
        accentColor={area.accent}
      />
      <span className="area-card__meta">
        {unitProgress?.completedTopics ?? 0}/{count} temas · {count} topic
        {count === 1 ? '' : 's'} →
      </span>
    </>
  );
}

export default function ExamTheorySection({ userId, accessToken, isStudent = false }) {
  const { globalPercent, units } = useExamTheoryProgress(userId, accessToken);
  const unlockStates = getExamTheoryUnlockStates(units, isStudent);
  const unlockBySlug = Object.fromEntries(unlockStates.map((state) => [state.slug, state]));

  return (
    <section className="section exam-theory-section" id="exam-theory">
      <div className="section__head">
        <h2>Exam theory</h2>
        <span className="count">{EXAM_THEORY_CATALOG.length}</span>
      </div>
      <p className="exam-theory-intro">
        Theory for exam skills — reading, writing, listening, speaking, and Use of English.
        {isStudent && SEQUENTIAL_LOCK_FOR_STUDENTS ? (
          <>
            {' '}
            Complete each part at 100% to unlock the next (students only).
          </>
        ) : null}
      </p>

      <ul className="area-grid exam-theory-grid">
        {EXAM_THEORY_CATALOG.map((area) => {
          const unitProgress = units.find((unit) => unit.slug === area.slug);
          const percent = unitProgress?.percent ?? 0;
          const count = SECTIONS[area.key]?.length ?? 0;
          const initial = area.key.charAt(0);
          const unlock = unlockBySlug[area.slug];
          const isLocked = Boolean(unlock?.locked);

          return (
            <li
              key={area.slug}
              className={isLocked ? 'exam-theory-item is-locked' : 'exam-theory-item'}
            >
              {isLocked ? (
                <>
                  <div
                    className="area-card exam-theory-card area-card--disabled"
                    aria-disabled="true"
                  >
                    <ExamTheoryCardContent
                      area={area}
                      initial={initial}
                      percent={percent}
                      unitProgress={unitProgress}
                      count={count}
                    />
                    {unlock?.requiredPrevious ? (
                      <p className="exam-theory-card__lock-hint">
                        Complete {unlock.requiredPrevious} first
                      </p>
                    ) : null}
                  </div>
                  <div className="exam-theory-item__lock">Blocked</div>
                </>
              ) : (
                <Link href={`/teoria/${area.slug}`} className="area-card exam-theory-card">
                  <ExamTheoryCardContent
                    area={area}
                    initial={initial}
                    percent={percent}
                    unitProgress={unitProgress}
                    count={count}
                  />
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="exam-theory-global-progress">
        <ExamTheoryProgressBar
          percent={globalPercent}
          label="Progreso total Exam theory"
          size="md"
          accentColor="#1cb0f6"
        />
        <p className="exam-theory-global-hint">
          Media de las 5 unidades según temas completados en teoría.
        </p>
      </div>
    </section>
  );
}
