'use client';

import Link from 'next/link';
import { useId, useMemo } from 'react';
import { TRAINING_LEVEL_COUNT, TRAINING_PATH_COLS } from '@/constants/trainingLevels';
import { getTrainingPathCurriculum, getLevelTopic } from '@/data/trainingPathCurriculum';
import { getCefrLevelColor } from '@/constants/cefrLevelColors';
import { useUserRole } from '@/context/UserRoleContext';
import {
  getTrainingCurrentLevelNumber,
  isTrainingLevelLocked,
  isTrainingPathStaffBypass,
} from '@/lib/trainingPathUnlock';
import styles from './TrainingLevelPathMap.module.css';

const PAD_X = 14;
const PAD_Y = 8;

function buildUniformNodes(total = TRAINING_LEVEL_COUNT, cols = TRAINING_PATH_COLS) {
  const rows = Math.ceil(total / cols);
  const spanX = 100 - PAD_X * 2;
  const spanY = 100 - PAD_Y * 2;
  const rowDivisor = rows > 1 ? rows - 1 : 1;
  const nodes = [];
  let n = 1;

  for (let row = 0; row < rows; row++) {
    const y = PAD_Y + (row / rowDivisor) * spanY;
    const xs = Array.from({ length: cols }, (_, col) => PAD_X + (col / (cols - 1)) * spanX);
    const orderedX = row % 2 === 0 ? xs : [...xs].reverse();
    for (const x of orderedX) {
      if (n > total) break;
      nodes.push({ n: n++, x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
    }
  }
  return nodes;
}

function buildPathD(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (Math.abs(prev.y - curr.y) < 0.5 || Math.abs(prev.x - curr.x) < 0.5) {
      d += ` L ${curr.x} ${curr.y}`;
    } else {
      const midY = (prev.y + curr.y) / 2;
      d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
    }
  }
  return d;
}

function IconLock({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3M6 11h12v9H6V11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ count = 0 }) {
  return (
    <div className={styles.stars} aria-hidden>
      {[1, 2, 3].map((star) => (
        <span key={star} className={`${styles.star} ${star <= count ? styles.starOn : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function SectionLegend({ sections }) {
  if (!sections?.length) return null;

  return (
    <div className={styles.sectionLegend} aria-label="Path sections">
      {sections.map((section) => (
        <div
          key={section.id}
          className={styles.legendItem}
          style={{ '--legend-color': section.color }}
        >
          <span className={styles.legendDot} aria-hidden />
          <span className={styles.legendTitle}>{section.title}</span>
          <span className={styles.legendRange}>
            {String(section.from).padStart(2, '0')}–{String(section.to).padStart(2, '0')}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * @param {{
 *   baseHref: string,
 *   levelStars?: Record<string, number>,
 *   cefrLevel: string,
 *   difficulty: string,
 *   skill?: string,
 * }} props
 */
export default function TrainingLevelPathMap({
  baseHref,
  levelStars = {},
  cefrLevel,
  difficulty,
  skill = 'use-of-english',
}) {
  const uid = useId().replace(/:/g, '');
  const { userRole } = useUserRole();
  const staffBypass = isTrainingPathStaffBypass(userRole);

  const curriculum = useMemo(
    () => getTrainingPathCurriculum(cefrLevel, difficulty, skill),
    [cefrLevel, difficulty, skill]
  );

  const total = curriculum.totalLevels ?? TRAINING_LEVEL_COUNT;

  const nodes = useMemo(() => buildUniformNodes(total), [total]);

  const sectionPaths = useMemo(
    () =>
      curriculum.sections
        .map((section) => {
          const points = nodes.filter((node) => node.n >= section.from && node.n <= section.to);
          return { section, d: buildPathD(points) };
        })
        .filter((item) => item.d),
    [curriculum, nodes]
  );

  const completedLevels = useMemo(
    () => nodes.filter(({ n }) => (levelStars[`level-${n}`] || 0) > 0).map(({ n }) => n),
    [levelStars, nodes]
  );
  const completedCount = completedLevels.length;
  const currentLevel = getTrainingCurrentLevelNumber(levelStars, total);
  const lastCompleted = currentLevel > 1 ? currentLevel - 1 : 0;
  const currentTopic = getLevelTopic(currentLevel, curriculum);
  const progressPct = Math.round((completedCount / total) * 100);
  const lastCompletedIndex =
    lastCompleted > 0 ? nodes.findIndex((node) => node.n === lastCompleted) : -1;
  const pathFillPct =
    lastCompletedIndex >= 0 ? Math.round(((lastCompletedIndex + 1) / total) * 100) : 0;
  const levelAccent = getCefrLevelColor(cefrLevel);

  const pathNodes = useMemo(
    () =>
      nodes.map(({ n, x, y }, index) => {
        const entry = curriculum.levelMap[n];
        const section = entry?.section ?? curriculum.sections[0];
        const topic = entry?.topic ?? `Level ${n}`;
        const stars = levelStars[`level-${n}`] || 0;
        const isCompleted = stars > 0;
        const isCurrent = n === currentLevel && !isCompleted;
        const isLocked = isTrainingLevelLocked(n, levelStars, userRole, total);
        const isUpcoming = !isLocked && n > currentLevel && !isCompleted;
        const stateClass = isLocked
          ? styles.nodeLocked
          : isCompleted
            ? styles.nodeCompleted
            : isCurrent
              ? styles.nodeCurrent
              : isUpcoming
                ? styles.nodeUpcoming
                : '';

        return {
          n,
          x,
          y,
          index,
          section,
          topic,
          stars,
          href: `${baseHref}/level-${n}`,
          stateClass,
          isCompleted,
          isCurrent,
          isLocked,
        };
      }),
    [curriculum, levelStars, baseHref, currentLevel, userRole, nodes, total],
  );

  const sectionBands = useMemo(
    () =>
      curriculum.sections
        .map((section) => {
          const sectionNodes = nodes.filter((node) => node.n >= section.from && node.n <= section.to);
          if (!sectionNodes.length) return null;
          const xs = sectionNodes.map((node) => node.x);
          const ys = sectionNodes.map((node) => node.y);
          return {
            section,
            left: Math.min(...xs) - 8,
            right: Math.max(...xs) + 8,
            top: Math.min(...ys) - 6,
            bottom: Math.max(...ys) + 6,
          };
        })
        .filter(Boolean),
    [curriculum, nodes]
  );

  return (
    <section className={styles.stage} aria-label="Level path">
      <div className={styles.metaRow}>
        <span className={styles.metaBadge}>{curriculum.progressionLabel}</span>
        <span className={styles.metaTrail}>Progression {curriculum.tier + 1} / 18</span>
      </div>

      <div className={styles.progressBar} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${progressPct}%`,
              background: levelAccent,
            }}
          />
        </div>
        <p className={styles.progressHint}>
          Level <strong>{currentLevel}</strong> of {total} · {currentTopic}
          {completedCount > 0
            ? ` · ${completedCount} completed`
            : ' · Start here'}
        </p>
      </div>

      <SectionLegend sections={curriculum.sections} />

      <div className={styles.canvas}>
        {sectionBands.map(({ section, left, right, top, bottom }) => (
          <div
            key={section.id}
            className={styles.sectionBand}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${right - left}%`,
              height: `${bottom - top}%`,
              '--band-color': section.color,
              '--band-light': section.colorLight,
            }}
            aria-hidden
          />
        ))}

        <svg className={styles.pathSvg} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id={`pathProgress-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              {curriculum.sections.map((s, i) => (
                <stop
                  key={s.id}
                  offset={`${(i / (curriculum.sections.length - 1)) * 100}%`}
                  stopColor={s.colorMid}
                />
              ))}
            </linearGradient>
          </defs>
          {sectionPaths.map(({ section, d }) => (
            <g key={section.id}>
              <path d={d} className={styles.pathTrack} style={{ stroke: section.colorLight }} />
              <path d={d} className={styles.pathSegment} style={{ stroke: section.colorMid }} />
            </g>
          ))}
          <path
            d={buildPathD(nodes)}
            className={styles.pathProgress}
            pathLength={100}
            style={{
              stroke: `url(#pathProgress-${uid})`,
              strokeDasharray: `${pathFillPct} 100`,
            }}
          />
        </svg>

        {pathNodes.map(
          ({ n, x, y, section, topic, stars, href, stateClass, isCompleted, isCurrent, isLocked }) => {
            const nodeStyle = {
              left: `${x}%`,
              top: `${y}%`,
              '--section-color': section.color,
              '--section-color-light': section.colorLight,
            };
            const ariaLabel = isLocked
              ? `${topic}, level ${n}, locked — complete previous levels first`
              : `${topic}, level ${n}${isCompleted ? `, ${stars} stars` : isCurrent ? ', up next' : ''}`;

            const card = (
              <span className={styles.nodeCard}>
                {isLocked ? (
                  <span className={styles.lockIcon} aria-hidden>
                    <IconLock className={styles.lockSvg} />
                  </span>
                ) : null}
                <span className={styles.badge}>{String(n).padStart(2, '0')}</span>
                <span className={styles.topic}>{topic}</span>
                <StarRow count={isLocked ? 0 : stars} />
              </span>
            );

            if (isLocked) {
              return (
                <div
                  key={n}
                  className={`${styles.node} ${stateClass}`}
                  style={nodeStyle}
                  aria-label={ariaLabel}
                  title="Complete the previous level to unlock"
                >
                  {card}
                </div>
              );
            }

            return (
              <Link
                key={n}
                href={href}
                prefetch={false}
                className={`${styles.node} ${stateClass}`}
                style={nodeStyle}
                aria-label={ariaLabel}
                {...(isCurrent ? { 'aria-current': 'step' } : {})}
              >
                {card}
              </Link>
            );
          },
        )}
        {staffBypass ? (
          <p className={styles.staffHint}>Preview mode: all levels unlocked for staff.</p>
        ) : null}
      </div>
    </section>
  );
}
