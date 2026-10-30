import { SITE_URL } from '@/lib/siteSeo';

export const B2_GUIDE_PAGE_PATH = '/guia-b2-first/';
export const B2_GUIDE_PDF_PATH = '/guias/guia-b2-first-dralo.pdf';
/** Ejercicio público: se puede probar sin cuenta y, desde ahí, registrarse. */
export const B2_GUIDE_TRY_PATH = '/exam-practice/b2/exam-reading-and-use-of-english/?examen=1';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
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

export function b2GuidePdfUrl(siteUrl = SITE_URL) {
  return `${siteOrigin(siteUrl)}${B2_GUIDE_PDF_PATH}`;
}

export function b2GuideTryUrl(siteUrl = SITE_URL) {
  return `${siteOrigin(siteUrl)}${B2_GUIDE_TRY_PATH}`;
}

/** Los dos primeros checks son obligatorios. El comercial es opcional. */
export function guideConsentError(body) {
  if (body?.acceptedTerms === true && body?.acceptedDataProtection === true) return '';
  return 'Acepta los términos y la protección de datos para recibir la guía.';
}

/** @returns {string} email normalizado, o cadena vacía si no es válido */
export function normalizeGuideEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 254) return '';
  if (/[\r\n\0]/.test(email)) return '';
  if (!EMAIL_RE.test(email)) return '';
  return email;
}

export function buildB2GuideDownloadEmail(email, siteUrl = SITE_URL) {
  const to = normalizeGuideEmail(email);
  const origin = siteOrigin(siteUrl);
  const url = b2GuidePdfUrl(origin);
  const tryUrl = b2GuideTryUrl(origin);
  const homeUrl = `${origin}/`;
  const contactUrl = `${origin}/contacto/`;
  const href = escapeHtml(url);
  const tryHref = escapeHtml(tryUrl);
  const homeHref = escapeHtml(homeUrl);
  const contactHref = escapeHtml(contactUrl);
  const subject = 'Tu guía gratuita del B2 First';
  const text = [
    'Hola:',
    '',
    '¡Gracias por descargar la guía! Ya puedes acceder a ella desde este enlace:',
    url,
    '',
    'En la guía encontrarás las 17 partes del examen explicadas, estrategias para cada ejercicio y un plan de estudio de 12 semanas —o de 6, si tienes menos tiempo— para organizar tu preparación.',
    '',
    '¿Quieres poner a prueba lo aprendido?',
    'Prueba gratis un ejercicio en Dralo. Puedes hacerlo sin cuenta y registrarte cuando quieras guardar tu progreso:',
    tryUrl,
    '',
    '¡Mucho ánimo con tu preparación!',
    'El equipo de Dralo',
    homeUrl,
  ].join('\n');
  const html = `<div style="margin:0;padding:0;background:#f4edff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4edff;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:28px 16px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:3px solid #ddd6fe;border-radius:28px;">
          <tr>
            <td style="padding:36px 32px 28px;font-family:Georgia,'Times New Roman',serif;color:#3b0764;">
              <p style="margin:0;text-align:center;font-size:28px;line-height:1;font-weight:800;letter-spacing:0.08em;color:#4c1d95;">DRALO</p>
              <p style="margin:8px 0 0;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.4;color:#7c6aad;">Learn. Practise. Improve.</p>
              <p style="margin:28px 0 0;">
                <span style="display:inline-block;padding:6px 12px;border-radius:999px;background:#ede9fe;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.06em;color:#6d28d9;">TU GUÍA GRATUITA</span>
              </p>
              <h1 style="margin:18px 0 0;font-size:34px;line-height:1.15;font-weight:800;color:#3b0764;">Tu guía del B2 First ya está aquí</h1>
              <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#334155;">Hola:</p>
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#334155;">¡Gracias por descargar la guía! Ya puedes acceder a ella desde este enlace:</p>
              <p style="margin:22px 0 0;">
                <a href="${href}" style="display:block;padding:14px 18px;border-radius:12px;background:#6d28d9;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;text-align:center;text-decoration:none;">Descargar la guía del B2 First</a>
              </p>
              <p style="margin:22px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#334155;">En la guía encontrarás las <strong>17 partes del examen</strong> explicadas, estrategias para cada ejercicio y un plan de estudio de <strong>12 semanas</strong> —o de 6, si tienes menos tiempo— para organizar tu preparación.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;background:#f5f3ff;border-radius:16px;">
                <tr>
                  <td style="padding:18px 18px 16px;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0;font-size:18px;line-height:1.4;font-weight:800;color:#5b21b6;">¿Quieres poner a prueba lo aprendido?</p>
                    <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#334155;">Prueba gratis un ejercicio en Dralo. No hace falta cuenta: al terminar puedes registrarte y guardar el progreso.</p>
                    <p style="margin:16px 0 0;">
                      <a href="${tryHref}" style="display:block;padding:12px 16px;border:2px solid #6d28d9;border-radius:12px;background:#ffffff;color:#5b21b6;font-size:16px;font-weight:700;text-align:center;text-decoration:none;">Probar un ejercicio gratis →</a>
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:26px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;color:#334155;">¡Mucho ánimo con tu preparación!</p>
              <p style="margin:8px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.5;font-weight:800;color:#1e1b4b;">El equipo de Dralo</p>
              <p style="margin:4px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;"><a href="${homeHref}" style="color:#6d28d9;text-decoration:underline;">dralo.es</a></p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">DRALO · Learn. Practise. Improve.<br><a href="${homeHref}" style="color:#94a3b8;text-decoration:none;">dralo.es</a></p>
        <p style="margin:8px 0 0;max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">Este correo no admite respuesta. Si quieres escribirnos, usa <a href="${contactHref}" style="color:#6d28d9;text-decoration:none;font-weight:600;">Contacto</a>.</p>
      </td>
    </tr>
  </table>
</div>`;
  return { to, subject, text, html };
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

/** @returns {boolean} true si se puede enviar */
export function tryConsumeB2GuideSend(ip, email) {
  const safeIp = String(ip || 'unknown').slice(0, 64);
  const safeEmail = normalizeGuideEmail(email) || 'invalid';
  if (!consumeBucket(`ip:${safeIp}`, MAX_PER_IP)) return false;
  if (!consumeBucket(`email:${safeEmail}`, MAX_PER_EMAIL)) return false;
  return true;
}
