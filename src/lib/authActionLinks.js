/**
 * Enlaces de acción de Supabase Auth (recuperación, confirmación de email)
 * generados en el servidor y enviados con nuestras plantillas.
 *
 * Usamos `token_hash` en vez de los enlaces `?code=` de PKCE: el verificador
 * PKCE vive en el navegador que pidió el enlace, así que un correo abierto
 * desde el móvil o desde el visor del cliente de correo nunca podría canjearlo.
 */

/** Tipos que /auth/confirm acepta verificar. */
export const AUTH_CONFIRM_TYPES = [
  'recovery',
  'magiclink',
  'signup',
  'invite',
  'email',
  'email_change',
];

const FALLBACK_SITE_URL = 'https://www.dralo.es';

function isPrivateHost(hostname) {
  const host = String(hostname || '').toLowerCase();
  return (
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host.endsWith('.local')
  );
}

function normalizeOrigin(value) {
  const trimmed = String(value || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    if (isPrivateHost(url.hostname)) return '';
    return url.origin;
  } catch {
    return '';
  }
}

/**
 * Origen público del sitio. Detrás del proxy de Vercel `req.url` apunta al host
 * interno, así que las cabeceras reenviadas mandan sobre él.
 * @param {Request} [req]
 */
export function getSiteOrigin(req) {
  const forwardedHost = req?.headers?.get?.('x-forwarded-host') || req?.headers?.get?.('host') || '';
  if (forwardedHost) {
    const proto =
      req?.headers?.get?.('x-forwarded-proto') ||
      (forwardedHost.startsWith('localhost') || forwardedHost.startsWith('127.0.0.1')
        ? 'http'
        : 'https');
    const fromRequest = normalizeOrigin(`${proto.split(',')[0].trim()}://${forwardedHost.split(',')[0].trim()}`);
    if (fromRequest) return fromRequest;
  }

  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    FALLBACK_SITE_URL
  );
}

/**
 * Origen para enlaces que van dentro de un correo.
 *
 * Nunca debe ser localhost: el alumno abre el mail desde el móvil y ese host
 * apunta a su propio dispositivo, no a tu máquina de desarrollo.
 * @param {Request} [req]
 */
export function getPublicSiteOrigin(req) {
  const forwardedHost = req?.headers?.get?.('x-forwarded-host') || req?.headers?.get?.('host') || '';
  let fromRequest = '';
  if (forwardedHost) {
    const proto = req?.headers?.get?.('x-forwarded-proto') || 'https';
    fromRequest = normalizeOrigin(
      `${proto.split(',')[0].trim()}://${forwardedHost.split(',')[0].trim()}`,
    );
  }

  return (
    normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL) ||
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL) ||
    fromRequest ||
    FALLBACK_SITE_URL
  );
}

/** Solo rutas internas: evita que `next` se convierta en un redirect abierto. */
export function sanitizeNextPath(value, fallback = '/perfil') {
  const raw = String(value || '').trim();
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}

export function buildAuthConfirmUrl({ origin, tokenHash, type, next }) {
  const url = new URL('/auth/confirm', origin);
  url.searchParams.set('token_hash', tokenHash);
  url.searchParams.set('type', type);
  url.searchParams.set('next', sanitizeNextPath(next));
  return url.toString();
}

/** El email ya tiene una cuenta confirmada (solo aplica a `type: 'signup'`). */
export function isEmailAlreadyRegistered(error) {
  if (!error) return false;
  const message = String(error.message || error).toLowerCase();
  return (
    error.code === 'email_exists' ||
    error.code === 'user_already_exists' ||
    message.includes('already been registered') ||
    message.includes('already exists') ||
    message.includes('already registered')
  );
}

/**
 * Genera un enlace de acción y lo devuelve apuntando a /auth/confirm.
 * `generateLink` no envía ningún correo: solo crea el token.
 *
 * Con `type: 'signup'` además crea la cuenta sin confirmar. Si se omite
 * `password`, sirve para reenviar la confirmación sin tocar la contraseña.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} adminClient
 * @param {{ type: string, email: string, origin: string, next?: string, password?: string, data?: object }} params
 * @returns {Promise<{ url: string | null, error: string | null, userExists: boolean, alreadyRegistered: boolean, user: object | null, rawError: object | null }>}
 */
export async function generateAuthActionLink(
  adminClient,
  { type, email, origin, next, password, data: userMetadata },
) {
  const basePayload = {
    type,
    email,
    ...(password ? { password } : {}),
  };
  const withMetadata = userMetadata ? { data: userMetadata } : {};

  const fail = (error, extra = {}) => {
    const message = String(error?.message || '').toLowerCase();
    return {
      url: null,
      error: error?.message || 'No se pudo generar el enlace.',
      userExists: !(
        message.includes('user not found') || message.includes('no user') || error?.status === 404
      ),
      alreadyRegistered: isEmailAlreadyRegistered(error),
      user: null,
      rawError: error || null,
      ...extra,
    };
  };

  try {
    let { data, error } = await adminClient.auth.admin.generateLink({
      ...basePayload,
      options: {
        ...withMetadata,
        redirectTo: new URL(sanitizeNextPath(next), origin).toString(),
      },
    });

    // Si la URL no está en la lista de «Redirect URLs» de Supabase, GoTrue
    // rechaza la petición. Nosotros construimos el enlace a mano desde el token,
    // así que reintentamos sin redirectTo antes de darlo por perdido.
    if (error && /redirect/i.test(String(error.message || ''))) {
      ({ data, error } = await adminClient.auth.admin.generateLink({
        ...basePayload,
        options: withMetadata,
      }));
    }

    if (error) return fail(error);

    const tokenHash = data?.properties?.hashed_token;
    if (tokenHash) {
      return {
        url: buildAuthConfirmUrl({ origin, tokenHash, type, next }),
        error: null,
        userExists: true,
        alreadyRegistered: false,
        user: data?.user || null,
        rawError: null,
      };
    }

    // Sin `hashed_token` (versiones antiguas de GoTrue) queda el enlace nativo.
    return {
      url: data?.properties?.action_link || null,
      error: data?.properties?.action_link ? null : 'El enlace generado no es válido.',
      userExists: true,
      alreadyRegistered: false,
      user: data?.user || null,
      rawError: null,
    };
  } catch (err) {
    return fail(err);
  }
}
