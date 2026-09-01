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
  isB2StarsWayColumnLockedForUser,
} from '@/data/b2StarsWayConfig';
import { useB2StarsWayProgress } from '@/hooks/useB2StarsWayProgress';
import {
  countPartAttempts,
  getBestPartStars,
  getExerciseScore,
  getExerciseStars,
  isExerciseSlotUnlocked,
} from '@/utils/b2StarsWayProgress';
import { formatSkillExerciseLabel } from '@/utils/skillPartFirstProgress';
import { useExamStarGatingBypass } from '@/hooks/useExamStarGatingBypass';
import { useUserRole } from '@/context/UserRoleContext';
import styles from './StarsWayToB2Section.module.css';

function SkillLockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

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

function getPathLink(from, to) {
  if (from === to) return 'straight';
  return `${from}-${to}`;
}

function PathConnector({ from, to }) {
  const link = getPathLink(from, to);

  if (link === 'straight') {
    return (
      <div className={styles.pathConnectorWrap} data-link={link} aria-hidden>
        <span className={styles.pathLeg} />
      </div>
    );
  }

  return (
    <div className={styles.pathConnectorWrap} data-link={link} aria-hidden>
      <span className={`${styles.pathLeg} ${styles.pathLegA}`} />
      <span className={`${styles.pathLeg} ${styles.pathLegB}`} />
      <span className={`${styles.pathLeg} ${styles.pathLegC}`} />
    </div>
  );
}

function ExerciseNode({
  exerciseIndex,
  examSlot,
  part,
  column,
  progressBySlot,
  availableSlots,
  align,
  isFocused = false,
}) {
  const bypassStarGating = useExamStarGatingBypass();
  const score = getExerciseScore(progressBySlot, part.globalPartNumber, examSlot);
  const stars = getExerciseStars(progressBySlot, part.globalPartNumber, examSlot);
  const attempted = Boolean(score?.total);
  const href = getB2StarsWayExerciseHref(column, part.globalPartNumber, examSlot);
  const perfect = stars >= 3;
  const started = attempted && !perfect;
  const focusId = getB2StarsWayExerciseFocusId(part.globalPartNumber, examSlot);
  const sequentialLocked = !isExerciseSlotUnlocked(
    progressBySlot,
    part.globalPartNumber,
    examSlot,
    availableSlots,
    { bypassStarGating },
  );

  const nodeClassName = [
    styles.exerciseNode,
    perfect ? styles.exerciseNodePerfect : '',
    started ? styles.exerciseNodeStarted : '',
    !attempted && !sequentialLocked ? styles.exerciseNodeLocked : '',
    sequentialLocked ? styles.exerciseNodeBlocked : '',
    isFocused ? styles.exerciseNodeFocused : '',
  ]
    .filter(Boolean)
    .join(' ');

  const nodeBody = (
    <>
      <span className={styles.exerciseNodeCircle}>
        <span className={styles.exerciseNodeNumber}>{exerciseIndex}</span>
      </span>
      <span className={styles.exerciseNodeLabel}>{formatSkillExerciseLabel(examSlot, 'en')}</span>
      <TheoryLevelStars stars={stars} size="sm" variant="gold" />
      <span className={styles.exerciseNodeScore}>
        {sequentialLocked ? (
          'Locked'
        ) : attempted ? (
          <>
            {score.correct}/{score.total}
            {score.passed ? ' ✓' : ''}
          </>
        ) : (
          'Not tried'
        )}
      </span>
    </>
  );

  return (
    <div className={`${styles.pathSegment} ${styles[`pathSegmentAlign${align.charAt(0).toUpperCase()}${align.slice(1)}`]}`}>
      {sequentialLocked ? (
        <div
          id={focusId}
          className={nodeClassName}
          aria-label={`Test ${exerciseIndex} locked. Complete the previous test with at least 1 star to access it.`}
          aria-disabled="true"
        >
          {nodeBody}
        </div>
      ) : (
        <Link
          id={focusId}
          href={href}
          className={nodeClassName}
          aria-label={`Test ${exerciseIndex}, ${stars} of 3 stars${
            attempted ? `, score ${score.correct} of ${score.total}` : ', not tried yet'
          }`}
        >
          {nodeBody}
        </Link>
      )}
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
            <TheoryLevelStars stars={partStars} size="sm" variant="gold" />
            <span className={styles.milestoneMeta}>
              {attempts}/{exerciseTotal} tests · best {partStars}/3
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
                  availableSlots={availableSlots}
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
  const { userRole } = useUserRole();
  const focusSkillKey = searchParams.get('skill');
  const focusPart = Number(searchParams.get('part') || 0);
  const focusExam = Number(searchParams.get('examen') || 0);

  const { progressBySlot, availableSlots, loading } = useB2StarsWayProgress();
  const [activeSkillKey, setActiveSkillKey] = useState(null);

  const isColumnLocked = (column) => isB2StarsWayColumnLockedForUser(column, userRole);

  useEffect(() => {
    if (
      focusSkillKey &&
      B2_STARS_WAY_COLUMNS.some((column) => column.key === focusSkillKey)
    ) {
      const column = B2_STARS_WAY_COLUMNS.find((item) => item.key === focusSkillKey);
      if (column && !isColumnLocked(column)) {
        setActiveSkillKey(focusSkillKey);
      }
    }
  }, [focusSkillKey, userRole]);

  useEffect(() => {
    if (!activeSkillKey) return;
    const column = B2_STARS_WAY_COLUMNS.find((item) => item.key === activeSkillKey);
    if (column && isColumnLocked(column)) {
      setActiveSkillKey(null);
    }
  }, [activeSkillKey, userRole]);

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
    <section className={`stars-way-to-b2 ${styles.section}`} aria-labelledby="stars-way-title">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Your path to B2</p>
        <h2 id="stars-way-title" className={styles.title}>
          Stars way to B2
        </h2>
        <p className={styles.description}>
          Pick a skill and follow the path. Each circle is a test — earn up to 3 stars and see
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
          const locked = isColumnLocked(column);

          if (locked) {
            return (
              <span
                key={column.key}
                role="tab"
                aria-selected={false}
                aria-disabled="true"
                title="Coming soon"
                aria-label={`${column.shortLabel} locked`}
                className={`${styles.skillTab} ${styles.skillTabLocked}`}
                style={{ '--stars-way-accent': column.accent }}
              >
                <span className={styles.skillTabIcon}>
                  <SkillLockIcon />
                  <ExamSkillIcon theme={column.key === 'reading' ? 'reading' : column.key} />
                </span>
                <span className={styles.skillTabLabel}>{column.shortLabel}</span>
              </span>
            );
          }

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
