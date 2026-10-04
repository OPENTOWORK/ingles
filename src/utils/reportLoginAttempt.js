const LOGIN_ATTEMPT_URL = '/api/auth/login-attempt';

/** Avisa al servidor de un acceso que no se completó. No bloquea el login. */
export function reportLoginAttempt({ email = '', code, provider = '' } = {}) {
  if (typeof window === 'undefined' || !code || code === 'ok') return;

  const body = JSON.stringify({
    email: String(email || '').trim().slice(0, 320),
    code,
    provider: provider === 'google' ? 'google' : '',
  });

  fetch(LOGIN_ATTEMPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}
