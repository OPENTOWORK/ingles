import { randomBytes } from 'node:crypto';
import { SITE_URL } from '@/lib/siteSeo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const MAX_TOKEN_PER_IP = 20;
const MAX_BUCKETS = 2000;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

function siteOrigin(siteUrl = SITE_URL) {
  return String(siteUrl || SITE_URL).replace(/\/+$/, '');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function consumeBucket(key, max) {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) buckets.clear();
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    bucket = { n: 0, reset: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  if (bucket.n >= max) return false;
  bucket.n += 1;
  return true;
}

/** @returns {string} email en minúsculas, o cadena vacía si no es válido */
export function normalizeNewsletterEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 254) return '';
  if (/[\r\n\0]/.test(email)) return '';
  if (!EMAIL_RE.test(email)) return '';
  return email;
}

/** Términos, protección de datos y la propia newsletter son obligatorios. */
export function newsletterConsentError(body) {
  if (
    body?.acceptedTerms === true &&
    body?.acceptedDataProtection === true &&
    body?.acceptedNewsletter === true
  ) {
    return '';
  }
  return 'Acepta los términos, la protección de datos y la newsletter para apuntarte.';
}

/** @returns {string} token opaco, o cadena vacía */
export function normalizeNewsletterToken(value) {
  const token = String(value || '').trim();
  if (!TOKEN_RE.test(token)) return '';
  return token;
}

export function createNewsletterToken() {
  return randomBytes(32).toString('base64url');
}

export function createNewsletterTokenPair() {
  const confirmToken = createNewsletterToken();
  let unsubscribeToken = createNewsletterToken();
  if (unsubscribeToken === confirmToken) unsubscribeToken = createNewsletterToken();
  return { confirmToken, unsubscribeToken };
}

/**
 * Decide qué hacer con un alta.
 * Activo: no se reenvía nada.
 * Pendiente: se reenvían los mismos enlaces.
 * Baja: vuelve a pendiente con tokens nuevos.
 */
export function planNewsletterSignup(existing, tokens, nowIso) {
  if (!existing) {
    return {
      action: 'insert',
      outcome: 'pending',
      confirmToken: tokens.confirmToken,
      unsubscribeToken: tokens.unsubscribeToken,
      row: {
        status: 'pending',
        confirm_token: tokens.confirmToken,
        unsubscribe_token: tokens.unsubscribeToken,
        confirmed_at: null,
        unsubscribed_at: null,
        updated_at: nowIso,
      },
    };
  }

  if (existing.status === 'active') {
    return { action: 'none', outcome: 'active' };
  }

  if (existing.status === 'pending') {
    return {
      action: 'update',
      outcome: 'pending',
      confirmToken: existing.confirm_token,
      unsubscribeToken: existing.unsubscribe_token,
      row: { updated_at: nowIso },
    };
  }

  return {
    action: 'update',
    outcome: 'pending',
    confirmToken: tokens.confirmToken,
    unsubscribeToken: tokens.unsubscribeToken,
    row: {
      status: 'pending',
      confirm_token: tokens.confirmToken,
      unsubscribe_token: tokens.unsubscribeToken,
      confirmed_at: null,
      unsubscribed_at: null,
      updated_at: nowIso,
    },
  };
}

export function planNewsletterConfirm(row, nowIso) {
  if (!row) return { ok: false, code: 'invalid' };
  if (row.status === 'unsubscribed') return { ok: false, code: 'inactive' };
  if (row.status === 'active') return { ok: true, already: true };
  return {
    ok: true,
    patch: { status: 'active', confirmed_at: nowIso, updated_at: nowIso },
  };
}

export function planNewsletterUnsubscribe(row, nowIso) {
  if (!row) return { ok: false, code: 'invalid' };
  if (row.status === 'unsubscribed') return { ok: true, already: true };
  return {
    ok: true,
    patch: { status: 'unsubscribed', unsubscribed_at: nowIso, updated_at: nowIso },
  };
}

export function newsletterConfirmUrl(token, siteUrl = SITE_URL) {
  return `${siteOrigin(siteUrl)}/newsletter/confirmar/?token=${encodeURIComponent(token)}`;
}

export function newsletterUnsubscribeUrl(token, siteUrl = SITE_URL) {
  return `${siteOrigin(siteUrl)}/newsletter/baja/?token=${encodeURIComponent(token)}`;
}

export function buildNewsletterConfirmEmail({ confirmUrl, unsubscribeUrl, siteUrl = SITE_URL }) {
  const origin = siteOrigin(siteUrl);
  const homeUrl = `${origin}/`;
  const confirmHref = escapeHtml(confirmUrl);
  const unsubscribeHref = escapeHtml(unsubscribeUrl);
  const homeHref = escapeHtml(homeUrl);
  const subject = 'Confirma tu newsletter de Dralo';
  const text = [
    'Hola:',
    '',
    'Alguien ha pedido la newsletter de Dralo con este correo. Para empezar a recibirla, confirma desde este enlace:',
    confirmUrl,
    '',
    'En la página tendrás que pulsar el botón. Hasta que no lo hagas, no estás en la lista.',
    '',
    'La newsletter es un correo corto: un consejo para el examen, un ejercicio nuevo o una novedad de Dralo, solo cuando hay algo que merezca la pena. El blog sigue ahí para leer una guía cuando quieras.',
    '',
    'Si no has sido tú, ignora este mensaje o date de baja:',
    unsubscribeUrl,
    '',
    'El equipo de Dralo',
    homeUrl,
  ].join('\n');
  const html = `<div style="margin:0;padding:0;background:#f4edff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4edff;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:22px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6d28d9;">Newsletter</p>
              <p style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:800;color:#241b4a;">Confirma tu correo</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#334155;">
              <p style="margin:0;">Alguien ha pedido la newsletter de Dralo con este correo. Hasta que no confirmes, no estás en la lista.</p>
              <p style="margin:22px 0 0;">
                <a href="${confirmHref}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#6a4be8;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;">Confirmar suscripción</a>
              </p>
              <p style="margin:22px 0 0;">Es un correo corto: un consejo para el examen, un ejercicio nuevo o una novedad de Dralo, solo cuando hay algo que merezca la pena. El blog sigue ahí para leer una guía cuando quieras.</p>
              <p style="margin:22px 0 0;font-size:14px;color:#64748b;">Si no has sido tú, ignora este mensaje o <a href="${unsubscribeHref}" style="color:#6d28d9;">date de baja</a>.</p>
              <p style="margin:26px 0 0;font-weight:800;color:#1e1b4b;">El equipo de Dralo</p>
              <p style="margin:4px 0 0;"><a href="${homeHref}" style="color:#6d28d9;text-decoration:underline;">dralo.es</a></p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">DRALO · Learn. Practise. Improve.</p>
      </td>
    </tr>
  </table>
</div>`;
  return { subject, text, html };
}

/** @returns {boolean} true si se puede intentar el alta */
export function tryConsumeNewsletterSignup(ip, email) {
  const safeIp = String(ip || 'unknown').slice(0, 64);
  const safeEmail = normalizeNewsletterEmail(email) || 'invalid';
  if (!consumeBucket(`signup-ip:${safeIp}`, MAX_PER_IP)) return false;
  if (!consumeBucket(`signup-email:${safeEmail}`, MAX_PER_EMAIL)) return false;
  return true;
}

/** @returns {boolean} true si se puede confirmar o darse de baja */
export function tryConsumeNewsletterTokenAction(ip) {
  const safeIp = String(ip || 'unknown').slice(0, 64);
  return consumeBucket(`token-ip:${safeIp}`, MAX_TOKEN_PER_IP);
}
