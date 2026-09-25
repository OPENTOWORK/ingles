'use client';

import Link from 'next/link';
import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';
import { getTrainingPathCurriculum } from '@/data/trainingPathCurriculum';
import { useUserRole } from '@/context/UserRoleContext';
import { getPathReviews } from '@/data/trainingReviews';
import {
  TRAINING_MASTERY_STARS,
  TRAINING_UNLOCK_STARS,
  getTrainingCurrentLevelNumber,
  isTrainingLevelLocked,
  isTrainingReviewLocked,
} from '@/lib/trainingPathUnlock';
import styles from './TrainingLevelPathMap.module.css';

const WIDE_ROW = 4;
const NARROW_ROW = 3;
const NARROW_TRACK_WIDTH = 640;
const TURN_RADIUS = 22;

function initialRowSize() {
  if (typeof window === 'undefined') return WIDE_ROW;
  return window.innerWidth < NARROW_TRACK_WIDTH ? NARROW_ROW : WIDE_ROW;
}

/** Rows of similar length: 6 → 3 + 3, 7 → 4 + 3. */
function splitEvenly(items, maxPerRow) {
  if (!items.length) return [];
  const rowCount = Math.ceil(items.length / maxPerRow);
  const base = Math.floor(items.length / rowCount);
  const extra = items.length % rowCount;
  const rows = [];
  let cursor = 0;
  for (let i = 0; i < rowCount; i += 1) {
    const size = base + (i < extra ? 1 : 0);
    rows.push(items.slice(cursor, cursor + size));
    cursor += size;
  }
  return rows;
}

function buildLayout(parts, maxPerRow) {
  let rowIndex = 0;
  return parts.map((part) => ({
    ...part,
    rows: splitEvenly(part.nodes, maxPerRow).map((items) => {
      const ltr = rowIndex % 2 === 0;
      const index = rowIndex;
      rowIndex += 1;
      const firstColumn = maxPerRow - items.length + 1;
      return {
        index,
        ltr,
        nodes: items.map((node, i) => {
          const slot = ltr ? i : items.length - 1 - i;
          return { ...node, gridColumn: `${firstColumn + slot * 2} / span 2` };
        }),
      };
    }),
  }));
}

function buildSnakePath(lanes, left, right, radius, stop = null) {
  if (!lanes.length) return '';
  let d = `M ${lanes[0].ltr ? left : right} ${lanes[0].y}`;
  for (let i = 0; i < lanes.length; i += 1) {
    const lane = lanes[i];
    if (stop && stop.lane === i) return `${d} L ${stop.x} ${lane.y}`;
    const endX = lane.ltr ? right : left;
    const next = lanes[i + 1];
    if (!next) return `${d} L ${endX} ${lane.y}`;
    const r = Math.min(radius, (next.y - lane.y) / 2);
    const dir = lane.ltr ? 1 : -1;
    const sweep = lane.ltr ? 1 : 0;
    d += ` L ${endX - dir * r} ${lane.y}`;
    d += ` A ${r} ${r} 0 0 ${sweep} ${endX} ${lane.y + r}`;
    d += ` L ${endX} ${next.y - r}`;
    d += ` A ${r} ${r} 0 0 ${sweep} ${endX - dir * r} ${next.y}`;
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

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5l4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="3"
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

function Station({ node, row, tag }) {
  const stateClass = node.isLocked
    ? styles.nodeLocked
    : node.isMastered
      ? styles.nodeMastered
      : node.isCompleted
        ? styles.nodeCompleted
        : node.isCurrent
          ? styles.nodeCurrent
          : styles.nodeUpcoming;

  const prefix = node.isSectionStart ? `${node.sectionTitle}. ` : '';
  const ariaLabel = node.isLocked
    ? `${prefix}${node.topic}, level ${node.n}, locked — complete previous levels first`
    : `${prefix}${node.topic}, level ${node.n}${node.isCompleted ? `, ${node.stars} stars` : node.isCurrent ? ', up next' : ''}`;

  const body = (
    <>
      <span
        className={styles.stationDot}
        data-station={node.n}
        data-row={row.index}
        data-ltr={row.ltr ? '1' : '0'}
      >
        {node.isLocked ? (
          <IconLock className={styles.lockSvg} />
        ) : (
          <span className={styles.stationNum}>{String(node.n).padStart(2, '0')}</span>
        )}
        {node.isCompleted ? (
          <span className={styles.stationCheck}>
            <IconCheck />
          </span>
        ) : null}
        {node.isCurrent ? <span className={styles.stationTag}>{tag}</span> : null}
      </span>
      <span className={styles.stationTopic}>{node.topic}</span>
      {node.isLocked ? null : <StarRow count={node.stars} />}
    </>
  );

  const className = `${styles.station} ${stateClass}`;
  const style = { gridColumn: node.gridColumn, gridRow: 1, '--i': node.n };

  if (node.isLocked) {
    return (
      <div
        className={className}
        style={style}
        aria-label={ariaLabel}
        title="Get 2 stars on the previous level to unlock"
      >
        {body}
      </div>
    );
  }

  return (
    <Link
      href={node.href}
      prefetch={false}
      className={className}
      style={style}
      data-path-station=""
      aria-label={ariaLabel}
      {...(node.isCurrent ? { 'aria-current': 'step' } : {})}
    >
      {body}
    </Link>
  );
}

function ReviewStation({ review, side, stars, locked }) {
  const isCompleted = stars >= TRAINING_UNLOCK_STARS;
  const isMastered = stars >= TRAINING_MASTERY_STARS;
  const stateClass = locked
    ? styles.nodeLocked
    : isMastered
      ? styles.nodeMastered
      : isCompleted
        ? styles.nodeCompleted
        : styles.nodeUpcoming;

  const ariaLabel = locked
    ? `Review ${review.n}, ${review.sectionTitle}, locked — finish this block first`
    : `Review ${review.n}, ${review.sectionTitle}${isCompleted ? `, ${stars} stars` : ''}`;

  const body = (
    <>
      <span className={styles.reviewKicker}>Review</span>
      <span className={styles.stationDot}>
        {locked ? (
          <IconLock className={styles.lockSvg} />
        ) : (
          <span className={styles.stationNum}>{`R${review.n}`}</span>
        )}
        {isCompleted ? (
          <span className={styles.stationCheck}>
            <IconCheck />
          </span>
        ) : null}
      </span>
      <span className={styles.stationTopic}>{review.sectionTitle}</span>
      {locked ? null : <StarRow count={stars} />}
    </>
  );

  const className = `${styles.station} ${styles.review} ${side === 'right' ? styles.reviewRight : styles.reviewLeft} ${styles.nodeReview} ${stateClass}`;

  if (locked) {
    return (
      <div className={className} aria-label={ariaLabel} title="Finish this block to unlock the review">
        {body}
      </div>
    );
  }

  return (
    <Link href={review.href} prefetch={false} className={className} aria-label={ariaLabel}>
      {body}
    </Link>
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
  const { userRole } = useUserRole();
  const gradientId = `path-progress-${useId().replace(/:/g, '')}`;
  const trackRef = useRef(null);
  const [rowSize, setRowSize] = useState(initialRowSize);
  const [geometry, setGeometry] = useState(null);

  const curriculum = useMemo(
    () => getTrainingPathCurriculum(cefrLevel, difficulty, skill),
    [cefrLevel, difficulty, skill]
  );

  const total = curriculum.totalLevels ?? TRAINING_LEVEL_COUNT;
  const currentLevel = getTrainingCurrentLevelNumber(levelStars, total);
  let completedCount = 0;
  for (let n = 1; n <= total; n += 1) {
    if ((Number(levelStars[`level-${n}`]) || 0) >= TRAINING_UNLOCK_STARS) completedCount += 1;
  }
  const allCompleted = completedCount >= total;
  const progressPct = Math.round((completedCount / Math.max(1, total)) * 100);
  const progressStop = allCompleted ? null : currentLevel;

  const parts = useMemo(
    () =>
      (curriculum.sections || []).map((section, sectionIndex) => ({
        title: section.title,
        from: section.from,
        number: sectionIndex + 1,
        nodes: (section.levels || []).map((level) => {
          const n = level.n;
          const stars = Number(levelStars[`level-${n}`]) || 0;
          const isCompleted = stars >= TRAINING_UNLOCK_STARS;
          const isMastered = stars >= TRAINING_MASTERY_STARS;
          return {
            n,
            topic: level.topic ?? `Level ${n}`,
            stars,
            href: `${baseHref}/level-${n}`,
            isCompleted,
            isMastered,
            isCurrent: n === currentLevel && !isCompleted,
            isLocked: isTrainingLevelLocked(n, levelStars, userRole, total),
            isSectionStart: n === section.from,
            sectionTitle: section.title,
          };
        }),
      })),
    [curriculum, levelStars, baseHref, currentLevel, userRole, total],
  );

  const reviews = useMemo(
    () =>
      getPathReviews(curriculum.sections || []).map((review) => {
        const stars = Number(levelStars[review.key]) || 0;
        return {
          ...review,
          href: `${baseHref}/${review.key}`,
          stars,
          isLocked: isTrainingReviewLocked(review, levelStars, userRole),
        };
      }),
    [curriculum, levelStars, baseHref, userRole],
  );

  const layout = useMemo(() => buildLayout(parts, rowSize), [parts, rowSize]);
  const layoutKey = layout
    .map((part) => part.rows.map((row) => row.nodes.map((node) => node.n).join('.')).join('|'))
    .join('/');

  useLayoutEffect(() => {
    const root = trackRef.current;
    if (!root) return undefined;

    const measure = () => {
      const box = root.getBoundingClientRect();
      if (!box.width || !box.height) return;

      const wantedRowSize = box.width < NARROW_TRACK_WIDTH ? NARROW_ROW : WIDE_ROW;
      if (wantedRowSize !== rowSize) {
        setRowSize(wantedRowSize);
        return;
      }

      const css = window.getComputedStyle(root);
      const padLeft = parseFloat(css.paddingLeft) || 0;
      const padRight = parseFloat(css.paddingRight) || 0;
      const left = padLeft / 2;
      const right = box.width - padRight / 2;
      const radius = Math.min(TURN_RADIUS, padLeft / 2, padRight / 2);

      const lanes = [];
      let stop = null;
      root.querySelectorAll('[data-station]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const row = Number(el.dataset.row);
        const x = rect.left + rect.width / 2 - box.left;
        const y = rect.top + rect.height / 2 - box.top;
        if (!lanes[row]) lanes[row] = { y, ltr: el.dataset.ltr === '1' };
        if (Number(el.dataset.station) === progressStop) stop = { lane: row, x };
      });

      const first = lanes[0];
      const last = lanes[lanes.length - 1];
      if (!first || !last) return;

      const trackD = buildSnakePath(lanes, left, right, radius);
      setGeometry({
        width: box.width,
        height: box.height,
        track: trackD,
        progress:
          progressStop == null
            ? trackD
            : stop
              ? buildSnakePath(lanes, left, right, radius, stop)
              : '',
        start: { x: first.ltr ? left : right, y: first.y },
        end: { x: last.ltr ? right : left, y: last.y },
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [layoutKey, rowSize, progressStop]);

  const tag = completedCount > 0 ? 'Continue' : 'Start';

  return (
    <section className={styles.stage} aria-label="Level path">
      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-label="Path progress"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
        </div>
        <p className={styles.progressHint}>
          Level <strong>{currentLevel}</strong> of {total}
          <span className={styles.progressDot} aria-hidden>
            ·
          </span>
          {progressPct}% complete
        </p>
      </div>

      <div className={styles.canvas}>
        <div ref={trackRef} className={styles.track}>
          {geometry ? (
            <svg
              className={styles.pathSvg}
              width={geometry.width}
              height={geometry.height}
              viewBox={`0 0 ${geometry.width} ${geometry.height}`}
              aria-hidden
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2={geometry.width}
                  y2={geometry.height}
                >
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path d={geometry.track} className={styles.pathTrack} />
              {geometry.progress ? (
                <path
                  d={geometry.progress}
                  className={styles.pathProgress}
                  stroke={`url(#${gradientId})`}
                  pathLength={1}
                />
              ) : null}
              <circle
                cx={geometry.start.x}
                cy={geometry.start.y}
                r={7}
                className={`${styles.pathCap} ${styles.pathCapActive}`}
              />
              <circle
                cx={geometry.end.x}
                cy={geometry.end.y}
                r={7}
                className={`${styles.pathCap} ${allCompleted ? styles.pathCapActive : ''}`}
              />
            </svg>
          ) : null}

          {layout.map((part, partIndex) => (
            <div key={part.from} className={styles.part}>
              <div className={styles.partHead}>
                <span className={styles.partRule} aria-hidden />
                <div className={styles.partLabel}>
                  <span className={styles.partIndex}>
                    Part {String(part.number).padStart(2, '0')}
                  </span>
                  <h2 className={styles.partTitle}>{part.title}</h2>
                </div>
                <span className={`${styles.partRule} ${styles.partRuleEnd}`} aria-hidden />
              </div>

              {part.rows.map((row) => (
                <div
                  key={row.index}
                  className={styles.row}
                  style={{ gridTemplateColumns: `repeat(${rowSize * 2}, minmax(0, 1fr))` }}
                >
                  {row.nodes.map((node) => (
                    <Station key={node.n} node={node} row={row} tag={tag} />
                  ))}
                </div>
              ))}
              {reviews[partIndex] ? (
                <ReviewStation
                  review={reviews[partIndex]}
                  side={part.rows[part.rows.length - 1]?.ltr ? 'right' : 'left'}
                  stars={reviews[partIndex].stars}
                  locked={reviews[partIndex].isLocked}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
