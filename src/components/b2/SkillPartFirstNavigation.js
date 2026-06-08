'use client';

import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import {
  aggregatePartProgress,
  filterProgressByPart,
  getSkillPracticeThemeKey,
  starsFromPartExerciseScore,
} from '@/utils/skillPartFirstProgress';
import styles from './SkillPartFirstNavigation.module.css';

function StepIndicator({ step, lang }) {
  const en = lang === 'en';
  const steps = [
    { n: 1, label: en ? 'Choose part' : 'Elige parte' },
    { n: 2, label: en ? 'Exercise practice' : 'Práctica' },
  ];

  return (
    <div className={styles.stepper} aria-label={en ? 'Practice steps' : 'Pasos de práctica'}>
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <span key={s.n} style={{ display: 'contents' }}>
            {i > 0 ? (
              <span
                className={`${styles.stepLine}${done || active ? ` ${styles['stepLine--done']}` : ''}`}
                aria-hidden
              />
            ) : null}
            <span
              className={`${styles.step}${active ? ` ${styles['step--active']}` : ''}${
                done ? ` ${styles['step--done']}` : ''
              }`}
            >
              <span className={styles.stepDot}>{done ? '✓' : s.n}</span>
              {s.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function ExercisePracticeGrid({
  slots,
  selectedPartNumber,
  examProgress,
  examSlot,
  examLabelsBySlot = {},
  lang,
  onSelectExam,
}) {
  const en = lang === 'en';

  return (
    <ul className={styles.exerciseGrid} aria-label={en ? 'Exercise practice list' : 'Lista de ejercicios'}>
      {slots.map((slot, index) => {
        const partScore = examProgress[slot]?.parts?.[selectedPartNumber];
        const stars = starsFromPartExerciseScore(partScore);
        const attempted = Boolean(partScore?.total);
        const isActive = examSlot === slot;
        const examLabel = examLabelsBySlot[slot];

        return (
          <li key={slot}>
            <button
              type="button"
              className={`${styles.exerciseCard}${isActive ? ` ${styles['exerciseCard--active']}` : ''}${
                attempted ? ` ${styles['exerciseCard--attempted']}` : ''
              }`}
              onClick={() => onSelectExam(slot)}
            >
              <div className={styles.exerciseCardTop}>
                <span className={styles.exerciseIndex}>{String(index + 1).padStart(2, '0')}</span>
                <span className={styles.exerciseTitle}>
                  {en ? 'Exercise practice' : 'Práctica'}
                </span>
              </div>
              {examLabel ? <span className={styles.exerciseMeta}>{examLabel}</span> : null}
              <TheoryLevelStars stars={stars} size="sm" />
              {attempted ? (
                <span className={styles.exerciseScore}>
                  {partScore.correct}/{partScore.total}
                  {partScore.passed ? ' ✓' : ''}
                </span>
              ) : (
                <span className={styles.exerciseScoreMuted}>
                  {en ? 'Not tried yet' : 'Sin intentar'}
                </span>
              )}
              <span className={styles.exerciseAction} aria-hidden>
                {en ? 'Start' : 'Empezar'} →
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function SkillPartFirstNavigation({
  partMin,
  partMax,
  partTopics = [],
  selectedPartNumber,
  onSelectPart,
  onBackToParts,
  examSlot,
  onSelectExam,
  progressBySlot = {},
  examLabelsBySlot = {},
  availableSlots,
  skillRoute = null,
  lang = 'en',
}) {
  const en = lang === 'en';
  const skillTheme = getSkillPracticeThemeKey(skillRoute);
  const slots =
    availableSlots ??
    Object.keys(examLabelsBySlot)
      .map(Number)
      .filter((n) => n > 0)
      .sort((a, b) => a - b);

  const topicByPart = Object.fromEntries(
    partTopics.map((t) => [t.partNumber, t.shortLabel || t.displayName]),
  );

  if (!selectedPartNumber) {
    return (
      <section
        className={styles.shell}
        data-skill-theme={skillTheme}
        aria-label={en ? 'Choose a part to practice' : 'Elige una parte'}
      >
        <p className={styles.eyebrow}>{en ? 'Skill practice' : 'Práctica por skill'}</p>
        <h2 className={styles.title}>{en ? 'Pick a part' : 'Elige una parte'}</h2>
        <p className={styles.subtitle}>
          {en
            ? 'Select one exam part, then work through six exercise variants at your own pace.'
            : 'Elige una parte y practica sus seis variantes de ejercicio.'}
        </p>

        <StepIndicator step={1} lang={lang} />

        <ul className={styles.partList}>
          {Array.from({ length: partMax - partMin + 1 }, (_, i) => partMin + i).map((n) => {
            const { attempted, examCount } = aggregatePartProgress(progressBySlot, n, slots);
            const label = topicByPart[n];
            const started = attempted > 0;

            return (
              <li key={n}>
                <button type="button" className={styles.partCard} onClick={() => onSelectPart(n)}>
                  <span className={styles.partBadge}>{String(n).padStart(2, '0')}</span>
                  <span className={styles.partBody}>
                    <p className={styles.partName}>{en ? `Part ${n}` : `Parte ${n}`}</p>
                    {label ? <p className={styles.partDesc}>{label}</p> : null}
                    <span
                      className={`${styles.partMeta}${started ? ` ${styles['partMeta--started']}` : ''}`}
                    >
                      {started
                        ? en
                          ? `${attempted}/${examCount} exercises`
                          : `${attempted}/${examCount} ejercicios`
                        : en
                          ? `${examCount} exercises`
                          : `${examCount} ejercicios`}
                    </span>
                  </span>
                  <span className={styles.partArrow} aria-hidden>
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  const examProgress = filterProgressByPart(progressBySlot, selectedPartNumber);
  const partTopic = topicByPart[selectedPartNumber];

  return (
    <section
      className={styles.shell}
      data-skill-theme={skillTheme}
      aria-label={en ? 'Exercise practice' : 'Práctica de ejercicios'}
    >
      <div className={styles.headerRow}>
        <button type="button" className={styles.backBtn} onClick={onBackToParts}>
          ← {en ? 'All parts' : 'Todas las partes'}
        </button>
        <p className={styles.partContext}>
          {en ? `Part ${selectedPartNumber}` : `Parte ${selectedPartNumber}`}
          {partTopic ? ` · ${partTopic}` : ''}
        </p>
      </div>

      <p className={styles.eyebrow}>{en ? 'Skill practice' : 'Práctica por skill'}</p>
      <h2 className={styles.title}>{en ? 'Exercise practice' : 'Práctica de ejercicios'}</h2>
      <p className={styles.subtitle}>
        {en
          ? `${slots.length} exercises for this part. Stars reflect your saved scores.`
          : `${slots.length} ejercicios para esta parte. Las estrellas reflejan tu puntuación guardada.`}
      </p>

      <StepIndicator step={2} lang={lang} />

      {slots.length === 0 ? (
        <p className={styles.empty}>
          {en ? 'No exercises available yet.' : 'Aún no hay ejercicios disponibles.'}
        </p>
      ) : (
        <ExercisePracticeGrid
          slots={slots}
          selectedPartNumber={selectedPartNumber}
          examProgress={examProgress}
          examSlot={examSlot}
          examLabelsBySlot={examLabelsBySlot}
          lang={lang}
          onSelectExam={onSelectExam}
        />
      )}
    </section>
  );
}
