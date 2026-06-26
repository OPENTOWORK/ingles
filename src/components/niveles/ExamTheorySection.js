'use client';

import PageHero from '@/components/PageHero';
import ExamSkillHubCard, { getExamSkillKindFromSlug } from '@/components/exam/ExamSkillHubCard';
import ExamSkillHubCardStyles from '@/components/exam/ExamSkillHubCardStyles';
import { EXAM_THEORY_CATALOG } from '@/data/teoriaSections';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import { getExamTheoryUnlockStates } from '@/lib/examTheoryUnlock';
import ExamTheoryProgressBar from '@/components/niveles/ExamTheoryProgressBar';
import { examStrategiesSkillPath } from '@/config/appRoutes';
import { MASCOT_EXAM_STRATEGIES_VARIANT } from '@/config/mascotAssets';

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

      <div className="exam-skill-hub exam-theory-skills-hub">
        <div className="exam-practice-hub__skills-grid">
          {EXAM_THEORY_CATALOG.map((area) => {
            const unlock = unlockBySlug[area.slug];
            const isLocked = Boolean(unlock?.locked);
            const kind = getExamSkillKindFromSlug(area.slug);

            return (
              <ExamSkillHubCard
                key={area.slug}
                href={isLocked ? null : examStrategiesSkillPath(area.slug)}
                kind={kind}
                label={area.key}
                hint="Strategies"
                badge={isLocked ? 'Blocked' : null}
                disabled={isLocked}
              />
            );
          })}
        </div>
      </div>

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

      <ExamSkillHubCardStyles />
    </section>
  );
}
