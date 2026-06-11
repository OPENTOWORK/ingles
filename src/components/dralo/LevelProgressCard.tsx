'use client';

import Link from 'next/link';
import type { DraloLevelInfo } from '@/lib/dralo-levels';
import { getLevelInfo, LEVEL_XP_STEP } from '@/lib/dralo-levels';
import styles from './LevelProgressCard.module.css';

export type LevelProgressCardProps = {
  totalXp?: number;
  levelInfo?: DraloLevelInfo;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  className?: string;
  lang?: 'en' | 'es';
};

const COPY = {
  en: {
    loading: 'Loading your Dralo experience…',
    error: 'Could not load experience.',
    empty: 'Complete Dralo AI activities to earn XP and unlock new level titles.',
    emptySubtitle: 'No XP earned yet — your journey starts here.',
    maxLevel: 'Maximum level reached — you are an English Legend.',
    progress: 'Level progress',
    xpToNext: (n: number) => `${n.toLocaleString()} XP to next level`,
    xpLabel: (n: number) => `${n.toLocaleString()} XP`,
    levelLine: (name: string) => name,
    nextLevel: 'Next level',
    xpStep: 'XP per level',
    totalXp: 'Total XP',
    cta: 'Try Dralo AI to start earning XP →',
    ctaHref: '/dralo-ai',
  },
  es: {
    loading: 'Cargando tu experiencia Dralo…',
    error: 'No se pudo cargar la experiencia.',
    empty: 'Completa actividades de Dralo IA para ganar XP y desbloquear nuevos títulos.',
    emptySubtitle: 'Aún sin XP — tu aventura empieza aquí.',
    maxLevel: 'Nivel máximo alcanzado — eres una English Legend.',
    progress: 'Progreso de nivel',
    xpToNext: (n: number) => `${n.toLocaleString()} XP para el siguiente nivel`,
    xpLabel: (n: number) => `${n.toLocaleString()} XP`,
    levelLine: (name: string) => name,
    nextLevel: 'Siguiente nivel',
    xpStep: 'XP por nivel',
    totalXp: 'XP total',
    cta: 'Prueba Dralo IA para empezar a ganar XP →',
    ctaHref: '/dralo-ai',
  },
} as const;

function ProgressBody({
  info,
  isEmpty,
  t,
}: {
  info: DraloLevelInfo;
  isEmpty: boolean;
  t: (typeof COPY)[keyof typeof COPY];
}) {
  const progressPercent = isEmpty ? 0 : info.progressPercent;
  const xpInside = isEmpty ? 0 : info.xpInsideCurrentLevel;
  const xpNeeded = isEmpty ? LEVEL_XP_STEP : info.xpNeededForNextLevel ?? 0;
  const nextLevelName = info.isMaxLevel
    ? info.levelName
    : getLevelInfo((info.level + 1) * LEVEL_XP_STEP).levelName;

  return (
    <>
      <div className={styles.progressMeta}>
        <span>
          {t.progress}: {progressPercent}%
        </span>
        {!info.isMaxLevel ? (
          <span className={styles.progressRemaining}>
            {isEmpty ? t.xpToNext(LEVEL_XP_STEP) : t.xpToNext(xpNeeded)}
          </span>
        ) : null}
      </div>

      <div
        className={styles.bar}
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t.progress} ${progressPercent}%`}
      >
        <span
          className={`${styles.barFill}${isEmpty ? ` ${styles.barFillEmpty}` : ''}`}
          style={{ width: isEmpty ? '4px' : `${progressPercent}%` }}
        />
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{t.xpLabel(info.currentXp)}</span>
          <span className={styles.statLabel}>{t.totalXp}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {xpInside}/{LEVEL_XP_STEP}
          </span>
          <span className={styles.statLabel}>{t.xpStep}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{nextLevelName}</span>
          <span className={styles.statLabel}>{t.nextLevel}</span>
        </div>
      </div>

      {isEmpty ? (
        <p className={styles.hint}>
          {t.empty}{' '}
          <Link href={t.ctaHref} className={styles.hintLink}>
            {t.cta}
          </Link>
        </p>
      ) : null}

      {info.isMaxLevel && !isEmpty ? <p className={styles.maxMsg}>{t.maxLevel}</p> : null}
    </>
  );
}

export default function LevelProgressCard({
  totalXp = 0,
  levelInfo,
  loading = false,
  error = null,
  isEmpty = false,
  className = '',
  lang = 'es',
}: LevelProgressCardProps) {
  const t = COPY[lang] ?? COPY.es;
  const info = levelInfo ?? getLevelInfo(totalXp);

  if (loading) {
    return (
      <div className={`${styles.card} ${styles.cardLoading}${className ? ` ${className}` : ''}`}>
        <p className={styles.status}>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.card} ${styles.cardError}${className ? ` ${className}` : ''}`}>
        <p className={styles.status}>{t.error}</p>
        <p className={styles.meta}>{error}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.card}${className ? ` ${className}` : ''}`}>
      <div className={styles.top}>
        <div className={styles.badge} aria-hidden>
          <span className={styles.badgeIcon}>✨</span>
          <span className={styles.badgeLevel}>{info.level}</span>
        </div>
        <div className={styles.head}>
          <h3 className={styles.title}>Level {info.level} · {t.levelLine(info.levelName)}</h3>
          <p className={styles.subtitle}>
            {isEmpty
              ? t.emptySubtitle
              : info.isMaxLevel
                ? t.maxLevel
                : t.xpToNext(info.xpNeededForNextLevel ?? 0)}
          </p>
        </div>
        <span className={styles.xpPill}>{t.xpLabel(info.currentXp)}</span>
      </div>

      <ProgressBody info={info} isEmpty={isEmpty} t={t} />
    </div>
  );
}
