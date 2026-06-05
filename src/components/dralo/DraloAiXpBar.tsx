'use client';

import { useDraloXp } from '@/context/DraloXpContext';

type DraloAiXpBarProps = {
  lang?: 'en' | 'es';
};

const COPY = {
  en: {
    loading: 'Loading XP…',
    guest: 'Sign in to track your Dralo XP.',
    level: (n: number, name: string) => `Level ${n} · ${name}`,
    progress: 'Progress',
    toNext: (n: number) => `${n} XP to next level`,
    max: 'Maximum level — English Legend',
  },
  es: {
    loading: 'Cargando XP…',
    guest: 'Inicia sesión para guardar tu XP de Dralo.',
    level: (n: number, name: string) => `Nivel ${n} · ${name}`,
    progress: 'Progreso',
    toNext: (n: number) => `${n} XP para el siguiente nivel`,
    max: 'Nivel máximo — English Legend',
  },
} as const;

export default function DraloAiXpBar({ lang = 'es' }: DraloAiXpBarProps) {
  const { levelInfo, totalXp, loading, error, toast, dismissToast } = useDraloXp();
  const t = COPY[lang] ?? COPY.es;

  if (loading) {
    return (
      <div className="dralo-ai-xp-bar dralo-ai-xp-bar--loading" aria-live="polite">
        <span>{t.loading}</span>
      </div>
    );
  }

  if (error && totalXp === 0) {
    return (
      <div className="dralo-ai-xp-bar dralo-ai-xp-bar--muted" aria-live="polite">
        <span>{t.guest}</span>
      </div>
    );
  }

  const info = levelInfo;

  return (
    <>
      <div className="dralo-ai-xp-bar" aria-label="Dralo experience progress">
        <div className="dralo-ai-xp-bar__main">
          <div className="dralo-ai-xp-bar__titles">
            <span className="dralo-ai-xp-bar__level">{t.level(info.level, info.levelName)}</span>
            <span className="dralo-ai-xp-bar__xp">{totalXp.toLocaleString()} XP</span>
          </div>
          <div className="dralo-ai-xp-bar__meta">
            <span>
              {t.progress}: {info.progressPercent}%
            </span>
            {!info.isMaxLevel && info.xpNeededForNextLevel != null ? (
              <span className="dralo-ai-xp-bar__next">
                {t.toNext(info.xpNeededForNextLevel)}
              </span>
            ) : (
              <span className="dralo-ai-xp-bar__next">{t.max}</span>
            )}
          </div>
          <div
            className="dralo-ai-xp-bar__track"
            role="progressbar"
            aria-valuenow={info.progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span
              className="dralo-ai-xp-bar__fill"
              style={{ width: `${info.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {toast ? (
        <div className="dralo-ai-xp-toast" role="status" aria-live="polite">
          <span>+{toast.amount} XP</span>
          <button type="button" className="dralo-ai-xp-toast__close" onClick={dismissToast}>
            ×
          </button>
        </div>
      ) : null}
    </>
  );
}
