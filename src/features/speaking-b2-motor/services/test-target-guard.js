/** Fail-closed target checks for Speaking B2 remote / two-Next work. */

export const SPEAKING_B2_PROD_MARKERS = [
  'qnazrzvwvkwhkfbqsbmr',
  'www.dralo.es',
  'english_prod',
];

export const SPEAKING_B2_TEST_AUTH_VALUE = 'YES_ISOLATED_SPEAKING_TEST';

function haystack(value) {
  return String(value || '').trim().toLowerCase();
}

export function speakingB2LooksLikeProduction(value) {
  const text = haystack(value);
  return SPEAKING_B2_PROD_MARKERS.some((marker) => text.includes(marker));
}

export function speakingB2MustPersistStore(env = process.env) {
  if (env.NODE_ENV === 'production' || env.VERCEL === '1') return true;
  return speakingB2LooksLikeProduction(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL || '');
}

export function inspectSpeakingB2TestTarget({
  url = '',
  projectRef = '',
  authorized = '',
} = {}) {
  if (!String(url || '').trim()) {
    return { ok: false, code: 'MISSING_TEST_URL', remote: false };
  }
  if (speakingB2LooksLikeProduction(url) || speakingB2LooksLikeProduction(projectRef)) {
    return { ok: false, code: 'PROD_REFUSED', remote: false };
  }
  if (String(authorized || '').trim() !== SPEAKING_B2_TEST_AUTH_VALUE) {
    return { ok: false, code: 'NOT_AUTHORIZED', remote: false };
  }
  const host = (() => {
    try {
      return new URL(String(url).replace(/^postgresql:/, 'http:')).hostname;
    } catch {
      return '';
    }
  })();
  const ref = String(projectRef || '').trim();
  if (ref && host && !host.includes(ref)) {
    return { ok: false, code: 'REF_MISMATCH', remote: false, host };
  }
  return { ok: true, code: 'AUTHORIZED_TEST', remote: true, host, projectRef: ref };
}

export function readSpeakingB2TestTargetFromEnv(env = process.env) {
  return inspectSpeakingB2TestTarget({
    url:
      env.SPEAKING_B2_TEST_DATABASE_URL ||
      env.SPEAKING_B2_TEST_SUPABASE_URL ||
      '',
    projectRef: env.SPEAKING_B2_TEST_PROJECT_REF || '',
    authorized: env.SPEAKING_B2_TEST_AUTHORIZED || '',
  });
}
