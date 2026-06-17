'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';
import {
  B2_STARS_WAY_COLUMNS,
  getB2StarsWayExerciseFocusId,
  getB2StarsWayExerciseHref,
  getB2StarsWayPartsForColumn,
} from '@/data/b2StarsWayConfig';
import { useB2StarsWayProgress } from '@/hooks/useB2StarsWayProgress';
import {
  countPartAttempts,
  getBestPartStars,
  getExerciseScore,
  getExerciseStars,
} from '@/utils/b2StarsWayProgress';
import styles from './StarsWayToB2Section.module.css';

const PATH_ALIGNS = ['center', 'right', 'center', 'left'];

function getPathAlign(index) {
  return PATH_ALIGNS[index % PATH_ALIGNS.length];
}

function buildPathItems(parts, availableSlots) {
  const items = [];
  parts.forEach((part) => {
    items.push({ type: 'milestone', part });
    availableSlots.forEach((examSlot, index) => {
      items.push({
        type: 'exercise',
        part,
        examSlot,
        exerciseIndex: index + 1,
      });
    });
  });
  return items;
}

function PathConnector({ from, to }) {
  const curveClass =
    from === to
      ? styles.connectorStraight
      : from === 'center' && to === 'right'
        ? styles.connectorCurveRight
        : from === 'center' && to === 'left'
          ? styles.connectorCurveLeft
          : from === 'right' && to === 'center'
            ? styles.connectorCurveLeftIn
            : from === 'left' && to === 'center'
              ? styles.connectorCurveRightIn
              : from === 'right' && to === 'left'
                ? styles.connectorWide
                : styles.connectorWideReverse;

  return (
    <div className={styles.pathConnectorWrap} aria-hidden>
      <div className={`${styles.pathConnector} ${curveClass}`} />
    </div>
  );
}

function ExerciseNode({ exerciseIndex, examSlot, part, column, progressBySlot, align, isFocused = false }) {
  const score = getExerciseScore(progressBySlot, part.globalPartNumber, examSlot);
  const stars = getExerciseStars(progressBySlot, part.globalPartNumber, examSlot);
  const attempted = Boolean(score?.total);
  const href = getB2StarsWayExerciseHref(column, part.globalPartNumber, examSlot);
  const perfect = stars >= 3;
  const started = attempted && !perfect;
  const focusId = getB2StarsWayExerciseFocusId(part.globalPartNumber, examSlot);

  return (
    <div className={`${styles.pathSegment} ${styles[`pathSegmentAlign${align.charAt(0).toUpperCase()}${align.slice(1)}`]}`}>
      <Link
        id={focusId}
        href={href}
        className={`${styles.exerciseNode}${perfect ? ` ${styles.exerciseNodePerfect}` : ''}${
          started ? ` ${styles.exerciseNodeStarted}` : ''
        }${!attempted ? ` ${styles.exerciseNodeLocked}` : ''}${
          isFocused ? ` ${styles.exerciseNodeFocused}` : ''
        }`}
        aria-label={`Exercise ${exerciseIndex}, ${stars} of 3 stars${
          attempted ? `, score ${score.correct} of ${score.total}` : ', not tried yet'
        }`}
      >
        <span className={styles.exerciseNodeCircle}>
          <span className={styles.exerciseNodeNumber}>{exerciseIndex}</span>
        </span>
        <span className={styles.exerciseNodeLabel}>Exercise {exerciseIndex}</span>
        <TheoryLevelStars stars={stars} size="sm" />
        <span className={styles.exerciseNodeScore}>
          {attempted ? (
            <>
              {score.correct}/{score.total}
              {score.passed ? ' ✓' : ''}
            </>
          ) : (
            'Not tried'
          )}
        </span>
      </Link>
    </div>
  );
}

function PartMilestone({ part, column, progressBySlot, availableSlots }) {
  const partStars = getBestPartStars(progressBySlot, part.globalPartNumber, availableSlots);
  const attempts = countPartAttempts(progressBySlot, part.globalPartNumber, availableSlots);
  const exerciseTotal = availableSlots.length;

  return (
    <div className={`${styles.pathSegment} ${styles.pathSegmentAlignCenter}`}>
      <div className={styles.milestoneNode}>
        <div className={styles.milestoneIcon} aria-hidden>
          <ExamSkillIcon theme={column.key === 'reading' ? 'reading' : column.key} size="md" />
        </div>
        <div className={styles.milestoneBody}>
          <span className={styles.milestoneBadge}>Part {part.localPartNumber}</span>
          {part.topicLabel ? <p className={styles.milestoneTopic}>{part.topicLabel}</p> : null}
          <div className={styles.milestoneProgress}>
            <TheoryLevelStars stars={partStars} size="sm" />
            <span className={styles.milestoneMeta}>
              {attempts}/{exerciseTotal} exercises · best {partStars}/3 ★
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillPath({ column, parts, progressBySlot, availableSlots, focusPart = 0, focusExam = 0 }) {
  const pathItems = useMemo(
    () => buildPathItems(parts, availableSlots),
    [parts, availableSlots],
  );

  return (
    <div
      className={styles.pathTrack}
      style={{
        '--stars-way-accent': column.accent,
        '--stars-way-accent-soft': column.accentSoft,
      }}
    >
      <div className={styles.pathSpine} aria-hidden />
      <div className={styles.pathNodes}>
        {pathItems.map((item, index) => {
          const align = getPathAlign(index);
          const prevAlign = index > 0 ? getPathAlign(index - 1) : null;
          const isFocused =
            item.type === 'exercise' &&
            item.part.globalPartNumber === focusPart &&
            item.examSlot === focusExam;

          return (
            <div key={`${item.type}-${item.part.globalPartNumber}-${item.examSlot ?? 'm'}`} className={styles.pathStep}>
              {index > 0 && prevAlign ? <PathConnector from={prevAlign} to={align} /> : null}
              {item.type === 'milestone' ? (
                <PartMilestone
                  part={item.part}
                  column={column}
                  progressBySlot={progressBySlot}
                  availableSlots={availableSlots}
                />
              ) : (
                <ExerciseNode
                  exerciseIndex={item.exerciseIndex}
                  examSlot={item.examSlot}
                  part={item.part}
                  column={column}
                  progressBySlot={progressBySlot}
                  align={align}
                  isFocused={isFocused}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarsWayToB2SectionInner() {
  const searchParams = useSearchParams();
  const focusSkillKey = searchParams.get('skill');
  const focusPart = Number(searchParams.get('part') || 0);
  const focusExam = Number(searchParams.get('examen') || 0);

  const { progressBySlot, availableSlots, loading } = useB2StarsWayProgress();
  const [activeSkillKey, setActiveSkillKey] = useState(null);

  useEffect(() => {
    if (
      focusSkillKey &&
      B2_STARS_WAY_COLUMNS.some((column) => column.key === focusSkillKey)
    ) {
      setActiveSkillKey(focusSkillKey);
    }
  }, [focusSkillKey]);

  const activeColumn = B2_STARS_WAY_COLUMNS.find((col) => col.key === activeSkillKey) ?? null;
  const activeParts = activeColumn ? getB2StarsWayPartsForColumn(activeColumn) : [];

  useEffect(() => {
    if (loading || !activeColumn || !focusPart || !focusExam) return undefined;
    const id = getB2StarsWayExerciseFocusId(focusPart, focusExam);
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [loading, activeColumn, focusPart, focusExam]);

  return (
    <section className={styles.section} aria-labelledby="stars-way-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Your path to B2</p>
        <h2 id="stars-way-title" className={styles.title}>
          Stars way to B2
        </h2>
        <p className={styles.description}>
          Pick a skill and follow the path. Each circle is an exercise — earn up to 3 stars and see
          what you still need to reach the top.
        </p>
      </div>

      {loading ? (
        <p className={styles.loading} role="status">
          Loading your progress…
        </p>
      ) : null}

      <div className={styles.skillPicker} role="tablist" aria-label="Choose a skill">
        {B2_STARS_WAY_COLUMNS.map((column) => {
          const active = activeSkillKey === column.key;
          return (
            <button
              key={column.key}
              type="button"
              role="tab"
              aria-selected={active}
              className={`${styles.skillTab}${active ? ` ${styles.skillTabActive}` : ''}`}
              style={{ '--stars-way-accent': column.accent }}
              onClick={() => setActiveSkillKey(column.key)}
            >
              <span className={styles.skillTabIcon}>
                <ExamSkillIcon theme={column.key === 'reading' ? 'reading' : column.key} />
              </span>
              <span className={styles.skillTabLabel}>{column.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {!activeColumn ? (
        <p className={styles.pickSkillHint}>Select a skill to start your path.</p>
      ) : (
        <div className={styles.skillPanel} role="tabpanel">
          <h3 className={styles.skillPanelTitle} style={{ color: activeColumn.accent }}>
            {activeColumn.label}
          </h3>
          <SkillPath
            column={activeColumn}
            parts={activeParts}
            progressBySlot={progressBySlot}
            availableSlots={availableSlots}
            focusPart={focusPart}
            focusExam={focusExam}
          />
        </div>
      )}
    </section>
  );
}

export default function StarsWayToB2Section() {
  return (
    <Suspense
      fallback={
        <p className={styles.loading} role="status">
          Loading your progress…
        </p>
      }
    >
      <StarsWayToB2SectionInner />
    </Suspense>
  );
}
