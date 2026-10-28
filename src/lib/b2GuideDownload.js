import { SITE_URL } from '@/lib/siteSeo';

export const B2_GUIDE_PAGE_PATH = '/guia-b2-first/';
export const B2_GUIDE_PDF_PATH = '/guias/guia-b2-first-dralo.pdf';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;
const MAX_BUCKETS = 2000;

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map();

export function b2GuidePdfUrl(siteUrl = SITE_URL) {
  return `${String(siteUrl || SITE_URL).replace(/\/+$/, '')}${B2_GUIDE_PDF_PATH}`;
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
  const url = b2GuidePdfUrl(siteUrl);
  const subject = 'Tu guía gratuita del B2 First';
  const text = [
    'Aquí tienes la guía de Dralo para preparar el B2 First de Cambridge.',
    '',
    'Descárgala y consulta el plan, las estrategias y las frases útiles cuando empieces a estudiar:',
    url,
    '',
    'Incluye las 17 partes del examen, un plan de 12 semanas y otro de 6, estrategias para cada parte y frases útiles para Writing y Speaking.',
  ].join('\n');
  const html = `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#1e1b4b;">Aquí tienes la guía de Dralo para preparar el B2 First de Cambridge.</p>
<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#475569;">Descárgala y consulta el plan, las estrategias y las frases útiles cuando empieces a estudiar.</p>
<p style="margin:0 0 20px;"><a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#f97316;color:#ffffff;font-weight:700;text-decoration:none;">Descargar la guía en PDF</a></p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#64748b;">Incluye las 17 partes del examen, un plan de 12 semanas y otro de 6, estrategias para cada parte y frases útiles para Writing y Speaking.<br><a href="${url}" style="color:#5b4bb7;">${url}</a></p>`;
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
