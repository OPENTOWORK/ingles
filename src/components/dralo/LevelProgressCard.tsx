'use client';

import type { DraloLevelInfo } from '@/lib/dralo-levels';
import { getLevelInfo } from '@/lib/dralo-levels';

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
    empty: 'You have not earned XP yet. Complete Dralo AI activities to level up.',
    maxLevel: 'Maximum level reached — you are an English Legend.',
    progress: 'Progress',
    xpToNext: (n: number) => `${n.toLocaleString()} XP to the next level`,
    xpLabel: (n: number) => `${n.toLocaleString()} XP`,
    levelLine: (level: number, name: string) => `Level ${level} · ${name}`,
  },
  es: {
    loading: 'Cargando tu experiencia Dralo…',
    error: 'No se pudo cargar la experiencia.',
    empty: 'Aún no tienes XP. Completa actividades de Dralo IA para subir de nivel.',
    maxLevel: 'Nivel máximo alcanzado — eres una English Legend.',
    progress: 'Progreso',
    xpToNext: (n: number) => `${n.toLocaleString()} XP para el siguiente nivel`,
    xpLabel: (n: number) => `${n.toLocaleString()} XP`,
    levelLine: (level: number, name: string) => `Nivel ${level} · ${name}`,
  },
} as const;

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
      <div className={`dralo-level-card dralo-level-card--loading${className ? ` ${className}` : ''}`}>
        <p className="dralo-level-card__status">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`dralo-level-card dralo-level-card--error${className ? ` ${className}` : ''}`}>
        <p className="dralo-level-card__status">{t.error}</p>
        <p className="dralo-level-card__meta">{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`dralo-level-card dralo-level-card--empty${className ? ` ${className}` : ''}`}>
        <p className="dralo-level-card__title">{t.levelLine(0, info.levelName)}</p>
        <p className="dralo-level-card__meta">{t.empty}</p>
      </div>
    );
  }

  return (
    <div className={`dralo-level-card${className ? ` ${className}` : ''}`}>
      <div className="dralo-level-card__head">
        <h3 className="dralo-level-card__title">{t.levelLine(info.level, info.levelName)}</h3>
        <p className="dralo-level-card__xp">{t.xpLabel(info.currentXp)}</p>
      </div>

      <div className="dralo-level-card__progress-row">
        <span className="dralo-level-card__progress-label">
          {t.progress}: {info.progressPercent}%
        </span>
        {!info.isMaxLevel && info.xpNeededForNextLevel != null ? (
          <span className="dralo-level-card__progress-remaining">
            {t.xpToNext(info.xpNeededForNextLevel)}
          </span>
        ) : null}
      </div>

      <div
        className="dralo-level-card__bar"
        role="progressbar"
        aria-valuenow={info.progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${t.progress} ${info.progressPercent}%`}
      >
        <span
          className="dralo-level-card__bar-fill"
          style={{ width: `${info.progressPercent}%` }}
        />
      </div>

      {info.isMaxLevel ? (
        <p className="dralo-level-card__max-msg">{t.maxLevel}</p>
      ) : null}
    </div>
  );
}
