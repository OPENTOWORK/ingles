'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { EXAM_THEORY_CATALOG } from '@/data/teoriaSections';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import { getExamTheoryUnlockStates } from '@/lib/examTheoryUnlock';
import ExamTheoryProgressBar from '@/components/niveles/ExamTheoryProgressBar';
import { examStrategiesSkillPath } from '@/config/appRoutes';
import { MASCOT_EXAM_STRATEGIES_VARIANT } from '@/config/mascotAssets';

function ExamTheoryCardContent({ area, initial, percent, showProgress = true }) {
  return (
    <>
      <div className="area-card__head">
        <span className="area-card__icon" style={{ background: area.accent }} aria-hidden>
          {initial}
        </span>
        <span className="area-card__title">{area.key}</span>
      </div>
      <span className="area-card__desc">{area.description}</span>
      {showProgress ? (
        <ExamTheoryProgressBar
          percent={percent}
          label={area.key}
          size="sm"
          accentColor={area.accent}
        />
      ) : null}
    </>
  );
}

export default function ExamTheorySection({ userId, accessToken, isStudent = false }) {
  const { globalPercent, units } = useExamTheoryProgress(userId, accessToken);
  const unlockStates = getExamTheoryUnlockStates(units, isStudent);
  const unlockBySlug = Object.fromEntries(unlockStates.map((state) => [state.slug, state]));

  const introDescription =
    'Tips and strategies to improve your results and pass with flying colours!';

  return (
    <section className="section exam-theory-section" id="exam-theory" data-tour="exam-theory-hub">
      <div className="exam-theory-section__hero" data-tour="exam-theory-hub-hero">
        <PageHero
          eyebrow="Reading · Writing · Listening · Speaking"
          title="Exam Strategies"
          description={introDescription}
          showMascot
          mascotVariant={MASCOT_EXAM_STRATEGIES_VARIANT}
          mascotWidth={152}
          accent="violet"
          stats={[
            {
              value: String(EXAM_THEORY_CATALOG.length),
              label: 'Exam skills',
            },
          ]}
        />
      </div>

      <ul className="area-grid exam-theory-grid">
        {EXAM_THEORY_CATALOG.map((area) => {
          const unitProgress = units.find((unit) => unit.slug === area.slug);
          const percent = unitProgress?.percent ?? 0;
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
                    style={{ '--exam-theory-accent': area.accent }}
                  >
                    <ExamTheoryCardContent
                      area={area}
                      initial={initial}
                      percent={percent}
                      showProgress={!isStudent}
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
                <Link
                  href={examStrategiesSkillPath(area.slug)}
                  className="area-card exam-theory-card"
                  style={{ '--exam-theory-accent': area.accent }}
                >
                  <ExamTheoryCardContent
                    area={area}
                    initial={initial}
                    percent={percent}
                    showProgress={!isStudent}
                  />
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      {!isStudent ? (
        <div className="exam-theory-global-progress">
          <ExamTheoryProgressBar
            percent={globalPercent}
            label="Progreso total Exam Strategies"
            size="md"
            accentColor="#1cb0f6"
          />
          <p className="exam-theory-global-hint">
            Media de las 4 unidades según temas completados.
          </p>
        </div>
      ) : null}
    </section>
  );
}
