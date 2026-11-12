/** Parámetros de anuncio que deben sobrevivir al pasar de la home a /registro/. */
export const SIGNUP_ACQUISITION_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'ttclid',
  'msclkid',
];

const NAMED_SOURCES = new Set(['hero', 'plan_plus', 'post_practice', 'promo_25']);
const TRACKED_KEY = 'dralo_sign_up_tracked';
const trackedInMemory = new Set();

export function normalizeSignupSource(value) {
  const raw = String(value || '').trim().toLowerCase();
  return NAMED_SOURCES.has(raw) ? raw : 'otros';
}

/** /registro/ con la atribución de la URL actual y el botón que convierte. */
export function buildSignupHref(search, src) {
  const incoming = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const params = new URLSearchParams();
  for (const key of SIGNUP_ACQUISITION_KEYS) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }
  params.set('src', normalizeSignupSource(src));
  return `/registro/?${params.toString()}`;
}

function readTracked(storage) {
  try {
    const raw = storage?.getItem(TRACKED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Un evento sign_up por cuenta. La recarga no lo repite: solo se llama al
 * completar el alta, y la marca queda en la sesión del navegador.
 */
export function pushSignUpEvent({
  method = 'email',
  userId,
  search = '',
  storage,
  layer,
} = {}) {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const signupSource = normalizeSignupSource(params.get('src'));
  const id = String(userId || '').trim();
  const key = `${method}:${id || signupSource}`;
  const already = readTracked(storage);
  if (already.includes(key) || trackedInMemory.has(key)) return false;
  trackedInMemory.add(key);
  try {
    storage?.setItem(TRACKED_KEY, JSON.stringify([...already, key]));
  } catch {
    /* la marca en memoria evita el doble disparo de esta carga */
  }
  const payload = { event: 'sign_up', method, signup_source: signupSource };
  if (layer && typeof layer.push === 'function') {
    layer.push(payload);
    if (signupSource === 'promo_25') {
      layer.push({ event: 'signup_promo_25', method, signup_source: signupSource });
    }
  }
  return true;
}

export function trackSignUp({ method = 'email', userId, search } = {}) {
  if (typeof window === 'undefined') return false;
  window.dataLayer = window.dataLayer || [];
  return pushSignUpEvent({
    method,
    userId,
    search: search ?? window.location.search,
    storage: window.sessionStorage,
    layer: window.dataLayer,
  });
}
