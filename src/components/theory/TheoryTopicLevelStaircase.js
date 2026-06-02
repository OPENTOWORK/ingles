'use client';

import SiteMascot from '@/components/SiteMascot';
import { MASCOT_THINKING_VARIANT } from '@/config/mascotAssets';
import TheoryLevelStars from '@/components/theory/TheoryLevelStars';
import {
  formatLevelBadge,
  getTheoryLevelPathTheme,
  getTheoryPathConnectorStyle,
  THEORY_LEVEL_PATH_ROWS,
} from '@/lib/theoryLevelPathTheme';
import {
  getNextTheoryTopicPlayLevel,
  isTheoryTopicLevelUnlocked,
} from '@/lib/theoryTopicLevels';
import styles from './TheoryTopicLevelStaircase.module.css';

function LevelCard({ num, starsByLevel, onSelectLevel, isNextPlay }) {
  const unlocked = isTheoryTopicLevelUnlocked(num, starsByLevel);
  const stars = starsByLevel[num];
  const attempted = stars != null && stars !== undefined;
  const theme = getTheoryLevelPathTheme(num);

  return (
    <button
      type="button"
      className={`${styles.card}${unlocked ? '' : ` ${styles.cardLocked}`}${
        isNextPlay ? ` ${styles.cardNext}` : ''
      }`}
      style={{
        '--path-color': theme.main,
        '--path-color-dark': theme.mainDark,
      }}
      disabled={!unlocked}
      onClick={() => unlocked && onSelectLevel?.(num)}
      aria-label={`Level ${num}${attempted ? `, ${stars} stars` : ''}`}
    >
      <span className={styles.cardBadge}>{formatLevelBadge(num)}</span>
      <span className={styles.cardTitle}>Level {num}</span>
      <span className={styles.cardStars}>
        <TheoryLevelStars stars={attempted ? stars : 0} size="sm" />
      </span>
    </button>
  );
}

function RowConnector({ fromLevel, toLevel }) {
  return (
    <span
      className={styles.hConnector}
      style={getTheoryPathConnectorStyle(fromLevel, toLevel, 'horizontal')}
      aria-hidden
    />
  );
}

function LevelRow({ levels, starsByLevel, onSelectLevel, nextPlayLevel }) {
  return (
    <div className={styles.row}>
      {levels.map((num, index) => {
        const prev = index > 0 ? levels[index - 1] : null;
        return (
          <div key={num} className={styles.rowSegment}>
            {prev != null ? <RowConnector fromLevel={prev} toLevel={num} /> : null}
            <LevelCard
              num={num}
              starsByLevel={starsByLevel}
              onSelectLevel={onSelectLevel}
              isNextPlay={num === nextPlayLevel}
            />
          </div>
        );
      })}
    </div>
  );
}

function VerticalConnector({ fromLevel, toLevel }) {
  return (
    <div
      className={styles.vConnector}
      style={getTheoryPathConnectorStyle(fromLevel, toLevel, 'vertical')}
      aria-hidden
    />
  );
}

export default function TheoryTopicLevelStaircase({
  starsByLevel = {},
  poolCount = 0,
  onSelectLevel,
}) {
  const nextPlayLevel = getNextTheoryTopicPlayLevel(starsByLevel);

  if (poolCount <= 0) {
    return (
      <div className={styles.empty} role="status" aria-label="Exercises coming soon">
        <SiteMascot
          variant={MASCOT_THINKING_VARIANT}
          width={220}
          className={styles.emptyMascot}
          alt="Dralo thinking"
        />
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.heading}>Practice levels</h2>

      <div className={styles.pathCanvas}>
        {THEORY_LEVEL_PATH_ROWS.map((row) => (
          <div key={row.levels.join('-')} className={styles.rowBlock}>
            {row.connectorSide === 'left' ? (
              <VerticalConnector fromLevel={5} toLevel={9} />
            ) : null}
            <LevelRow
              levels={row.levels}
              starsByLevel={starsByLevel}
              onSelectLevel={onSelectLevel}
              nextPlayLevel={nextPlayLevel}
            />
            {row.connectorSide === 'right' ? (
              <VerticalConnector fromLevel={4} toLevel={8} />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
