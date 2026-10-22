import { normalizeTrainingExperienceLevels, readStoredTrainingStars } from '@/lib/trainingExperience';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import { supabase } from '@/utils/supabaseClient';

const ENDPOINT = '/api/training/experience';

let queue = Promise.resolve(null);

async function runSync() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  if (!token) return null;

  const levels = normalizeTrainingExperienceLevels(readStoredTrainingStars(window.localStorage));
  const res = await fetch(buildClientApiUrl(ENDPOINT), {
    method: levels.length ? 'POST' : 'GET',
    headers: levels.length
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { Authorization: `Bearer ${token}` },
    body: levels.length ? JSON.stringify({ levels }) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || 'EXPERIENCE_UNAVAILABLE');
  return json;
}

/**
 * Sends this browser's Training stars to the account and returns `{ stars, totalXp, levelInfo }`.
 * Resolves to null without a session. Calls run one after another, so each reads the latest stars.
 */
export function syncTrainingExperience() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  queue = queue.catch(() => null).then(runSync);
  return queue;
}
