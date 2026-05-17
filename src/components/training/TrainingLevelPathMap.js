'use client';

import Link from 'next/link';
import { useId, useMemo } from 'react';
import { TRAINING_LEVEL_COUNT, TRAINING_PATH_COLS } from '@/constants/trainingLevels';
import {
  getTrainingPathCurriculum,
  getSectionForLevel,
  getLevelTopic,
} from '@/data/trainingPathCurriculum';
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

const NODES = buildUniformNodes();

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

function SectionLabel({ section, anchorNode }) {
  return (
    <div
      className={styles.sectionLabel}
      style={{
        left: `${anchorNode.x}%`,
        top: `${Math.max(anchorNode.y - 10, 3)}%`,
        '--section-color': section.color,
        '--section-bg': section.colorLight,
      }}
    >
      <span className={styles.sectionLabelPill}>{section.title}</span>
      <span className={styles.sectionLabelTopics}>{section.topics}</span>
      <span className={styles.sectionLabelRange}>
        {String(section.from).padStart(2, '0')}–{String(section.to).padStart(2, '0')}
      </span>
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

  const curriculum = useMemo(
    () => getTrainingPathCurriculum(cefrLevel, difficulty, skill),
    [cefrLevel, difficulty, skill]
  );

  const sectionPaths = useMemo(
    () =>
      curriculum.sections
        .map((section) => {
          const points = NODES.filter((node) => node.n >= section.from && node.n <= section.to);
          return { section, d: buildPathD(points) };
        })
        .filter((item) => item.d),
    [curriculum]
  );

  const total = TRAINING_LEVEL_COUNT;
  const completedLevels = useMemo(
    () => NODES.filter(({ n }) => (levelStars[`level-${n}`] || 0) > 0).map(({ n }) => n),
    [levelStars]
  );
  const completedCount = completedLevels.length;
  const lastCompleted = completedCount > 0 ? Math.max(...completedLevels) : 0;
  const currentLevel = lastCompleted < total ? lastCompleted + 1 : total;
  const currentTopic = getLevelTopic(currentLevel, curriculum);
  const progressPct = Math.round((completedCount / total) * 100);
  const lastCompletedIndex =
    lastCompleted > 0 ? NODES.findIndex((node) => node.n === lastCompleted) : -1;
  const pathFillPct =
    lastCompletedIndex >= 0 ? Math.round(((lastCompletedIndex + 1) / total) * 100) : 0;

  const sectionBands = useMemo(
    () =>
      curriculum.sections
        .map((section) => {
          const nodes = NODES.filter((node) => node.n >= section.from && node.n <= section.to);
          if (!nodes.length) return null;
          const xs = nodes.map((node) => node.x);
          const ys = nodes.map((node) => node.y);
          return {
            section,
            left: Math.min(...xs) - 9,
            right: Math.max(...xs) + 9,
            top: Math.min(...ys) - 13,
            bottom: Math.max(...ys) + 10,
          };
        })
        .filter(Boolean),
    [curriculum]
  );

  return (
    <section className={styles.stage} aria-label="Level path">
      <div className={styles.metaRow}>
        <span className={styles.metaBadge}>{curriculum.progressionLabel}</span>
        <span className={styles.metaTrail}>Progresión {curriculum.tier + 1} / 18</span>
      </div>

      <div className={styles.progressBar} role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${curriculum.sections[0].color}, ${curriculum.sections[3].color})`,
            }}
          />
        </div>
        <p className={styles.progressHint}>
          Nivel <strong>{currentLevel}</strong> de {total} · {currentTopic}
          {completedCount > 0
            ? ` · ${completedCount} completado${completedCount !== 1 ? 's' : ''}`
            : ' · Empieza aquí'}
        </p>
      </div>

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
            d={buildPathD(NODES)}
            className={styles.pathProgress}
            pathLength={100}
            style={{
              stroke: `url(#pathProgress-${uid})`,
              strokeDasharray: `${pathFillPct} 100`,
            }}
          />
        </svg>

        {curriculum.sections.map((section) => {
          const anchor = NODES.find((node) => node.n === section.from);
          if (!anchor) return null;
          return <SectionLabel key={section.id} section={section} anchorNode={anchor} />;
        })}

        {NODES.map(({ n, x, y }, index) => {
          const key = `level-${n}`;
          const stars = levelStars[key] || 0;
          const href = `${baseHref}/level-${n}`;
          const section = getSectionForLevel(n, curriculum);
          const topic = getLevelTopic(n, curriculum);
          const isCompleted = stars > 0;
          const isCurrent = n === currentLevel && !isCompleted;
          const isUpcoming = n > currentLevel && !isCompleted;

          const stateClass = isCompleted
            ? styles.nodeCompleted
            : isCurrent
              ? styles.nodeCurrent
              : isUpcoming
                ? styles.nodeUpcoming
                : '';

          return (
            <Link
              key={n}
              href={href}
              prefetch={false}
              className={`${styles.node} ${styles.nodeEnter} ${stateClass}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                animationDelay: `${Math.min(index * 0.02, 0.4)}s`,
                '--section-color': section.color,
                '--section-color-light': section.colorLight,
              }}
              aria-label={`${topic}, nivel ${n}${isCompleted ? `, ${stars} estrellas` : isCurrent ? ', siguiente' : ''}`}
              {...(isCurrent ? { 'aria-current': 'step' } : {})}
            >
              <span className={styles.card}>
                <span className={styles.badge}>{String(n).padStart(2, '0')}</span>
                <span className={styles.topic}>{topic}</span>
                <StarRow count={stars} />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
