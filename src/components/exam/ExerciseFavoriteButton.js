'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useExerciseFavorite } from '@/hooks/useExerciseFavorite';

/**
 * @param {{
 *   preguntaId: string | null | undefined,
 *   meta: import('@/lib/exerciseFavoriteMeta').ExerciseFavoriteMeta | null,
 *   enabled?: boolean,
 *   lang?: 'en' | 'es',
 * }} props
 */
export default function ExerciseFavoriteButton({
  preguntaId,
  meta,
  enabled = true,
  lang = 'en',
}) {
  const router = useRouter();
  const { userId, isFavorite, busy, toggle } = useExerciseFavorite(
    preguntaId,
    meta,
    enabled,
  );

  const en = lang === 'en';
  const label = isFavorite
    ? en
      ? 'Remove from favourites'
      : 'Quitar de favoritos'
    : en
      ? 'Add to favourites'
      : 'Añadir a favoritos';

  const signInLabel = en ? 'Sign in to save favourites' : 'Inicia sesión para guardar favoritos';

  const handleClick = () => {
    if (busy) return;
    if (!userId) {
      const next =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}`
          : '/';
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    void toggle().then((ok) => {
      if (ok === false) {
        toast.error(
          en
            ? 'Could not save favourite. Refresh the page and try again.'
            : 'No se pudo guardar el favorito. Recarga la página e inténtalo de nuevo.',
        );
      }
    });
  };

  if (!enabled || !preguntaId) return null;

  return (
    <button
      type="button"
      className={`exercise-favorite-btn${isFavorite ? ' exercise-favorite-btn--active' : ''}`}
      onClick={handleClick}
      disabled={busy}
      aria-pressed={isFavorite}
      aria-label={userId ? label : signInLabel}
      title={userId ? label : signInLabel}
    >
      <Heart
        size={22}
        strokeWidth={2}
        fill={isFavorite ? 'currentColor' : 'none'}
        className="exercise-favorite-btn__icon"
        aria-hidden
      />
    </button>
  );
}

/**
 * @param {{
 *   show?: boolean,
 *   preguntaId?: string | null,
 *   meta?: import('@/lib/exerciseFavoriteMeta').ExerciseFavoriteMeta | null,
 *   lang?: 'en' | 'es',
 * }} props
 */
export function SkillPartExerciseFavorite({ show = false, preguntaId, meta, lang = 'en' }) {
  if (!show || !preguntaId || !meta) return null;
  return (
    <ExerciseFavoriteButton
      preguntaId={preguntaId}
      meta={meta}
      enabled
      lang={lang}
    />
  );
}
