'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';
import { useUserRole } from '@/context/UserRoleContext';
import { supabase } from '@/utils/supabaseClient';
import {
  EXERCISE_FAVORITES_UPDATED_EVENT,
  fetchExerciseFavoritesFromDb,
  removeExerciseFavorite,
} from '@/lib/exerciseFavoritesRepository';

export default function ProfileFavouriteExercisesPanel({ lang = 'en' }) {
  const en = lang === 'en';
  const { session } = useUserRole();
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const userId = session?.user?.id ?? resolvedUserId;
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const loadFavorites = useCallback(async (uid) => {
    if (!uid) {
      setFavorites([]);
      setReady(true);
      return;
    }
    setReady(false);
    try {
      const rows = await fetchExerciseFavoritesFromDb(uid);
      setFavorites(rows);
    } catch (err) {
      console.warn('[favorites] load failed', err);
      setFavorites([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      setResolvedUserId(session.user.id);
      return undefined;
    }

    let cancelled = false;

    const applySession = async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data?.session?.user?.id ?? null;
      if (!cancelled) setResolvedUserId(uid);
    };

    void applySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!cancelled) setResolvedUserId(nextSession?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      authListener?.subscription?.unsubscribe();
    };
  }, [session?.user?.id]);

  useEffect(() => {
    void loadFavorites(userId || null);
  }, [userId, loadFavorites]);

  useEffect(() => {
    if (!userId) return undefined;
    const handleUpdate = (event) => {
      if (event?.detail?.userId && event.detail.userId !== userId) return;
      void loadFavorites(userId);
    };
    window.addEventListener(EXERCISE_FAVORITES_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(EXERCISE_FAVORITES_UPDATED_EVENT, handleUpdate);
  }, [userId, loadFavorites]);

  const handleRemove = async (favorite) => {
    if (!userId || !favorite?.id || removingId) return;
    setRemovingId(favorite.id);
    try {
      await removeExerciseFavorite(userId, { favoriteId: favorite.id });
      setFavorites((prev) => prev.filter((item) => item.id !== favorite.id));
    } catch (err) {
      console.warn('[favorites] remove failed', err);
    } finally {
      setRemovingId(null);
    }
  };

  const labels = {
    section: en ? 'Favourite exercises' : 'Ejercicios favoritos',
    empty: en
      ? 'No favourites yet. Tap the heart on any skill practice exercise to save it here.'
      : 'Aún no hay favoritos. Pulsa el corazón en cualquier ejercicio de skill practice para guardarlo aquí.',
    signIn: en ? 'Sign in to see your favourite exercises.' : 'Inicia sesión para ver tus ejercicios favoritos.',
    loading: en ? 'Loading favourites…' : 'Cargando favoritos…',
    remove: en ? 'Remove from favourites' : 'Quitar de favoritos',
    open: en ? 'Open test' : 'Abrir test',
    lastUsed: en ? 'Saved' : 'Guardado',
  };

  return (
    <ProfileCollapsibleSection title={labels.section} icon={Heart}>
      {!userId ? (
        <p className="profile-favorites-empty">{labels.signIn}</p>
      ) : !ready ? (
        <p className="profile-favorites-empty">{labels.loading}</p>
      ) : favorites.length === 0 ? (
        <p className="profile-favorites-empty">{labels.empty}</p>
      ) : (
        <div className="favorites-grid">
          {favorites.map((exercise) => (
            <div key={exercise.id} className="favorite-card">
              <div className="favorite-title">{exercise.title}</div>
              <div className="favorite-type">{exercise.type}</div>
              {exercise.levelSlug ? (
                <div className="favorite-difficulty">{exercise.levelSlug.toUpperCase()}</div>
              ) : null}
              {exercise.lastUsed ? (
                <div className="favorite-last-used">
                  {labels.lastUsed}: {exercise.lastUsed}
                </div>
              ) : null}
              {exercise.href ? (
                <Link href={exercise.href} className="favorite-open-link">
                  {labels.open}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void handleRemove(exercise)}
                className="remove-favorite-btn"
                disabled={removingId === exercise.id}
              >
                {labels.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </ProfileCollapsibleSection>
  );
}
