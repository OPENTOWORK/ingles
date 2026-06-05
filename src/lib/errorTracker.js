import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { callDraloAi } from '@/lib/ai/draloAiClient';

const TABLE = 'user_error_tracker';

const FRIENDLY_ERROR = 'Something went wrong while loading your errors. Please try again.';
const REVIEWED_LS_PREFIX = 'practice-errors-reviewed:';

function readLocalReviewedKeys(userId) {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = window.localStorage.getItem(`${REVIEWED_LS_PREFIX}${userId}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalReviewedKeys(userId, keys) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    window.localStorage.setItem(`${REVIEWED_LS_PREFIX}${userId}`, JSON.stringify(keys));
  } catch {
    /* ignore */
  }
}

async function authFetch(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) throw new Error('You need to be signed in.');
  const res = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.error || FRIENDLY_ERROR);
  return payload;
}

function normalizeText(value) {
  return String(value == null ? '' : value).trim().toLowerCase();
}

async function getCurrentUser() {
  try {
    const { user } = await getClientAuth();
    return user || null;
  } catch {
    return null;
  }
}

/**
 * Inserta un error nuevo o, si ya existe uno muy parecido para el usuario,
 * incrementa su frecuencia. Nunca opera sin usuario autenticado.
 */
export async function saveUserError(errorData = {}) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { ok: false, skipped: true, reason: 'not-authenticated' };
  }

  const original = String(errorData.original_text || '').trim();
  const corrected = String(errorData.corrected_text || '').trim();
  if (!original || !corrected) {
    return { ok: false, skipped: true, reason: 'missing-text' };
  }

  try {
    const { data: existing, error: selectError } = await supabase
      .from(TABLE)
      .select('id, original_text, corrected_text, frequency')
      .eq('user_id', user.id)
      .ilike('original_text', original)
      .limit(10);

    if (selectError) {
      return { ok: false, error: 'Could not save this mistake right now.' };
    }

    const match = (existing || []).find(
      (row) =>
        normalizeText(row.original_text) === normalizeText(original) &&
        normalizeText(row.corrected_text) === normalizeText(corrected),
    );

    if (match) {
      const { data, error: updateError } = await supabase
        .from(TABLE)
        .update({ frequency: (match.frequency || 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', match.id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (updateError) {
        return { ok: false, error: 'Could not update this mistake right now.' };
      }
      return { ok: true, action: 'incremented', data };
    }

    const row = {
      user_id: user.id,
      source: String(errorData.source || 'Writing').trim() || 'Writing',
      level: errorData.level ? String(errorData.level).trim().toUpperCase() : null,
      skill: errorData.skill ? String(errorData.skill).trim() : null,
      error_type: errorData.error_type ? String(errorData.error_type).trim() : null,
      original_text: original,
      corrected_text: corrected,
      explanation: errorData.explanation ? String(errorData.explanation).trim() : null,
      suggestion: errorData.suggestion ? String(errorData.suggestion).trim() : null,
    };

    const { data, error: insertError } = await supabase
      .from(TABLE)
      .insert(row)
      .select()
      .single();

    if (insertError) {
      return { ok: false, error: 'Could not save this mistake right now.' };
    }
    return { ok: true, action: 'inserted', data };
  } catch {
    return { ok: false, error: 'Could not save this mistake right now.' };
  }
}

/** Errores de práctica (puntuación < 50 en levels_puntuaciones y levels_teoria_puntuaciones). */
export async function getUserPracticeErrors(userId) {
  const user = await getCurrentUser();
  const id = userId || user?.id;
  if (!user?.id || !id || id !== user.id) {
    return { ok: false, data: [], reviewedKeys: [], error: user?.id ? null : 'You need to be signed in.' };
  }

  try {
    const payload = await authFetch('/api/profile/error-tracker');
    const serverKeys = Array.isArray(payload.reviewedKeys) ? payload.reviewedKeys : [];
    const localKeys = readLocalReviewedKeys(user.id);
    const reviewedKeys = [...new Set([...serverKeys, ...localKeys])];
    return {
      ok: true,
      data: Array.isArray(payload.data) ? payload.data : [],
      reviewedKeys,
      summary: payload.summary || null,
    };
  } catch (e) {
    return { ok: false, data: [], reviewedKeys: readLocalReviewedKeys(user.id), error: e?.message || FRIENDLY_ERROR };
  }
}

export async function getErrorReviewDetail(errorKey) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { ok: false, error: 'You need to be signed in.' };
  }
  try {
    const payload = await authFetch(
      `/api/profile/error-tracker?errorKey=${encodeURIComponent(errorKey)}`,
    );
    return { ok: true, data: payload.data };
  } catch (e) {
    return { ok: false, error: e?.message || FRIENDLY_ERROR };
  }
}

export async function markPracticeErrorReviewed(errorKey, userId) {
  const user = await getCurrentUser();
  const id = userId || user?.id;
  if (!user?.id || !id || id !== user.id) {
    return { ok: false, error: 'You need to be signed in.' };
  }
  if (!errorKey) {
    return { ok: false, error: 'Missing error id.' };
  }

  const localKeys = readLocalReviewedKeys(user.id);
  if (!localKeys.includes(errorKey)) {
    writeLocalReviewedKeys(user.id, [...localKeys, errorKey]);
  }

  try {
    await authFetch('/api/profile/error-tracker', {
      method: 'POST',
      body: JSON.stringify({ errorKey }),
    });
    return { ok: true };
  } catch (e) {
    return { ok: true, localOnly: true, warning: e?.message };
  }
}

/** @deprecated Usa getUserPracticeErrors — alias para el panel de perfil. */
export async function getUserErrors(userId) {
  return getUserPracticeErrors(userId);
}

/** Marca un error como dominado. */
export async function markErrorAsMastered(errorId) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { ok: false, error: 'You need to be signed in.' };
  }
  if (!errorId) {
    return { ok: false, error: 'Missing error id.' };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .update({ mastered: true, updated_at: new Date().toISOString() })
      .eq('id', errorId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { ok: false, error: 'Could not update this mistake right now.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Could not update this mistake right now.' };
  }
}

/** Incrementa la frecuencia de un error en 1. */
export async function updateErrorFrequency(errorId) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { ok: false, error: 'You need to be signed in.' };
  }
  if (!errorId) {
    return { ok: false, error: 'Missing error id.' };
  }

  try {
    const { data: current, error: selectError } = await supabase
      .from(TABLE)
      .select('id, frequency')
      .eq('id', errorId)
      .eq('user_id', user.id)
      .single();

    if (selectError || !current) {
      return { ok: false, error: 'Could not update this mistake right now.' };
    }

    const { data, error } = await supabase
      .from(TABLE)
      .update({ frequency: (current.frequency || 1) + 1, updated_at: new Date().toISOString() })
      .eq('id', errorId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { ok: false, error: 'Could not update this mistake right now.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: 'Could not update this mistake right now.' };
  }
}

/** Genera ejercicios de práctica a partir de un error concreto. */
export async function generateExercisesFromError(error = {}) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { ok: false, error: 'You need to be signed in.' };
  }

  try {
    const result = await callDraloAi({
      action: 'generate_error_exercises',
      level: error.level || 'B2',
      error: {
        error_type: error.error_type,
        original_text: error.original_text,
        corrected_text: error.corrected_text,
        explanation: error.explanation,
      },
    });
    return { ok: true, data: result };
  } catch (e) {
    return { ok: false, error: e?.message || 'Could not generate exercises right now.' };
  }
}

/**
 * Hook de Writing: extrae errores de una corrección y los guarda en segundo plano.
 * Nunca lanza: cualquier fallo se traga para no romper la corrección de writing.
 */
export async function trackWritingErrors({
  level = 'B2',
  source = 'Writing',
  skill = 'Writing',
  userText = '',
  correctedText = '',
} = {}) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) return { ok: false, skipped: true };

    const result = await callDraloAi({
      action: 'extract_errors',
      level,
      source,
      userText,
      correctedText,
    });

    const errors = Array.isArray(result?.errors) ? result.errors : [];
    let saved = 0;
    for (const err of errors) {
      const res = await saveUserError({
        source,
        skill,
        level,
        error_type: err.error_type,
        original_text: err.original_text,
        corrected_text: err.corrected_text,
        explanation: err.explanation,
        suggestion: err.suggestion,
      });
      if (res?.ok) saved += 1;
    }
    return { ok: true, saved };
  } catch {
    return { ok: false, skipped: true };
  }
}
