import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import {
  buildExerciseFavoritePracticeHref,
  parseExerciseFavoriteMeta,
} from '@/lib/exerciseFavoriteMeta';

export const EXERCISE_FAVORITES_UPDATED_EVENT = 'dralo-exercise-favorites-updated';

function dispatchFavoritesUpdated(userId) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(EXERCISE_FAVORITES_UPDATED_EVENT, { detail: { userId } }),
  );
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

function normalizePreguntaId(preguntaId) {
  return String(preguntaId || '')
    .trim()
    .replace(/\/+$/, '');
}

async function favoritesApi(pathSuffix = '', options = {}) {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const res = await fetch(buildClientApiUrl(`/api/levels/exercise-favorites${pathSuffix}`), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error || `Favorites request failed (${res.status})`);
  }
  return payload;
}

/** @param {import('@/lib/exerciseFavoriteMeta').ExerciseFavoriteMeta} meta */
export function favoriteFromRow(row) {
  if (!row) return null;
  const meta = parseExerciseFavoriteMeta(row.descripcion);
  return {
    id: row.id,
    preguntaId: row.pregunta_id,
    title: meta.title || 'Exercise',
    type: meta.sectionTitle || meta.heading || meta.levelSlug?.toUpperCase() || 'Practice',
    levelSlug: meta.levelSlug || null,
    lastUsed: row.created_at
      ? new Date(row.created_at).toISOString().split('T')[0]
      : null,
    href: buildExerciseFavoritePracticeHref(meta),
    meta,
  };
}

export async function fetchExerciseFavoritesFromDb(userId) {
  const payload = await favoritesApi('');
  return (payload.favorites || []).map(favoriteFromRow).filter(Boolean);
}

export async function fetchFavoritePreguntaIds(userId) {
  const payload = await favoritesApi('');
  return new Set((payload.favorites || []).map((row) => row.pregunta_id).filter(Boolean));
}

export async function isExerciseFavorite(userId, preguntaId) {
  const normalizedId = normalizePreguntaId(preguntaId);
  if (!userId || !normalizedId) return false;
  const payload = await favoritesApi(`?preguntaId=${encodeURIComponent(normalizedId)}`);
  return Boolean(payload.isFavorite);
}

/** @param {import('@/lib/exerciseFavoriteMeta').ExerciseFavoriteMeta} meta */
export async function addExerciseFavorite(userId, preguntaId, meta) {
  const normalizedId = normalizePreguntaId(preguntaId);
  const payload = await favoritesApi('', {
    method: 'POST',
    body: JSON.stringify({ preguntaId: normalizedId, meta }),
  });
  dispatchFavoritesUpdated(userId);
  return favoriteFromRow(payload.favorite);
}

export async function removeExerciseFavorite(userId, { favoriteId, preguntaId }) {
  const normalizedId = normalizePreguntaId(preguntaId);
  if (!favoriteId && !normalizedId) return;

  await favoritesApi('', {
    method: 'DELETE',
    body: JSON.stringify({ favoriteId, preguntaId: normalizedId || undefined }),
  });
  dispatchFavoritesUpdated(userId);
}
