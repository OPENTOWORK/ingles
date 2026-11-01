import { NEWSLETTER_MONDAY_ISSUES } from '@/data/newsletterMondayIssues';
import { SITE_URL } from '@/lib/siteSeo';
import { newsletterUnsubscribeUrl } from '@/lib/newsletter';

const FIRST_MONDAY = '2026-11-02';
const WEEKDAY_FROM_MONDAY = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
const STAFF_NOTE =
  'Recibes este correo porque formas parte del equipo de Dralo: administración, marketing, coordinación o profesorado. La lista de la newsletter todavía no tiene suscriptores confirmados. Cuando los haya, el lunes se enviará solo a ellos.';

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

function madridDateParts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const read = (type) => parts.find((part) => part.type === type)?.value;
  return {
    year: Number(read('year')),
    month: Number(read('month')),
    day: Number(read('day')),
    weekday: read('weekday'),
    hour: Number(read('hour')),
  };
}

/** Lunes de esa semana en el calendario de Madrid, YYYY-MM-DD. */
export function newsletterMondayId(date = new Date()) {
  const { year, month, day, weekday } = madridDateParts(date);
  const offset = WEEKDAY_FROM_MONDAY[weekday] ?? 0;
  const monday = Date.UTC(year, month - 1, day) - offset * 86400000;
  return new Date(monday).toISOString().slice(0, 10);
}

/** Lunes a las 10:00 en Madrid. El cron dispara a las 08:00 y a las 09:00 UTC. */
export function isNewsletterMondaySendTime(date = new Date()) {
  const parts = madridDateParts(date);
  return parts.weekday === 'Mon' && parts.hour === 10;
}

export function newsletterMondaySlug(mondayId) {
  return `newsletter_monday:${mondayId}`;
}

function weeksSinceFirstMonday(mondayId) {
  const [year, month, day] = String(mondayId).split('-').map(Number);
  const [firstYear, firstMonth, firstDay] = FIRST_MONDAY.split('-').map(Number);
  const diff = Date.UTC(year, month - 1, day) - Date.UTC(firstYear, firstMonth - 1, firstDay);
  return Math.round(diff / 86400000 / 7);
}

export function newsletterIssueForMonday(mondayId) {
  const weeks = weeksSinceFirstMonday(mondayId);
  if (!Number.isFinite(weeks) || weeks < 0) return null;
  const issue = NEWSLETTER_MONDAY_ISSUES[weeks];
  if (!issue) return null;
  return { ...issue, mondayId, issueIndex: weeks };
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * Suscriptores confirmados. Si no hay ninguno, administración, marketing, coordinación y profesorado.
 * @param {{ activeEmails?: string[], staffEmails?: string[], alreadySent?: string[] }} input
 */
export function planNewsletterMondayRecipients({ activeEmails = [], staffEmails = [], alreadySent = [] } = {}) {
  const sent = new Set(alreadySent.map(normalizeEmail).filter(Boolean));
  const active = [...new Set(activeEmails.map(normalizeEmail).filter(Boolean))];
  const staff = [...new Set(staffEmails.map(normalizeEmail).filter(Boolean))];
  const audience = active.length ? 'subscribers' : 'staff';
  const source = active.length ? active : staff;
  return {
    audience,
    recipients: source.filter((email) => !sent.has(email)),
  };
}

function mondayLabel(mondayId) {
  const [year, month, day] = String(mondayId).split('-').map(Number);
  const formatted = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Correo de ese lunes.
 * @param {{ mondayId: string, audience?: 'subscribers' | 'staff', unsubscribeUrl?: string, siteUrl?: string }} input
 */
export function buildNewsletterMondayEmail({
  mondayId,
  audience = 'subscribers',
  unsubscribeUrl = '',
  siteUrl = SITE_URL,
} = {}) {
  const issue = newsletterIssueForMonday(mondayId);
  if (!issue) return null;

  const origin = siteOrigin(siteUrl);
  const homeUrl = `${origin}/`;
  const label = mondayLabel(mondayId);
  const lines = [`Hola:`, '', `${label}.`, '', ...issue.paragraphs.flatMap((paragraph) => [paragraph, ''])];

  lines.push(`${issue.ctaLabel}:`, issue.ctaUrl, '');
  for (const link of issue.links) {
    lines.push(`${link.label}:`, link.href, '');
  }

  if (audience === 'staff') {
    lines.push(
      STAFF_NOTE,
      '',
    );
  } else if (unsubscribeUrl) {
    lines.push('Puedes darte de baja cuando quieras:', unsubscribeUrl, '');
  }

  lines.push('El equipo de Dralo', homeUrl);

  const text = lines.join('\n');
  const html = renderNewsletterMondayHtml({ issue, label, audience, unsubscribeUrl, homeUrl });
  return { subject: issue.subject, text, html, preheader: issue.paragraphs[0] };
}

export function unsubscribeUrlForToken(token, siteUrl = SITE_URL) {
  if (!token) return '';
  return newsletterUnsubscribeUrl(token, siteUrl);
}

function pillButton(href, label, variant) {
  const primary = variant === 'primary';
  const style = primary
    ? 'display:inline-block;padding:14px 22px;border-radius:999px;background:#6a4be8;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;border:1px solid #6a4be8;'
    : 'display:inline-block;padding:12px 18px;border-radius:999px;background:#f8f5ff;color:#4c1d95;font-size:15px;font-weight:700;text-decoration:none;border:1px solid #ddd6fe;';
  return `<a href="${escapeHtml(href)}" style="${style}">${escapeHtml(label)}</a>`;
}

function renderNewsletterMondayHtml({ issue, label, audience, unsubscribeUrl, homeUrl }) {
  const paragraphs = issue.paragraphs
    .map((paragraph) => `<p style="margin:16px 0 0;">${escapeHtml(paragraph)}</p>`)
    .join('');
  const extraLinks = issue.links
    .map((link) => `<p style="margin:10px 0 0;">${pillButton(link.href, link.label, 'secondary')}</p>`)
    .join('');
  const staffNote =
    audience === 'staff'
      ? `<p style="margin:22px 0 0;font-size:14px;color:#64748b;">${escapeHtml(STAFF_NOTE)}</p>`
      : '';
  const unsubscribe = unsubscribeUrl
    ? `<p style="margin:22px 0 0;font-size:14px;color:#64748b;">Puedes <a href="${escapeHtml(unsubscribeUrl)}" style="color:#6d28d9;">darte de baja</a> cuando quieras.</p>`
    : '';

  return `<div style="margin:0;padding:0;background:#f4edff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4edff;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:22px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6d28d9;">Newsletter B2 First</p>
              <p style="margin:10px 0 0;font-size:26px;line-height:1.2;font-weight:800;color:#241b4a;">${escapeHtml(issue.title)}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#64748b;">${escapeHtml(label)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55;color:#334155;">
              ${paragraphs}
              <p style="margin:22px 0 0;">
                ${pillButton(issue.ctaUrl, issue.ctaLabel, 'primary')}
              </p>
              ${extraLinks}
              ${staffNote}
              ${unsubscribe}
              <p style="margin:26px 0 0;font-weight:800;color:#1e1b4b;">El equipo de Dralo</p>
              <p style="margin:14px 0 0;">${pillButton(homeUrl, 'dralo.es', 'secondary')}</p>
            </td>
          </tr>
        </table>
        <p style="margin:18px 0 0;max-width:560px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#94a3b8;text-align:center;">DRALO · Learn. Practise. Improve.</p>
      </td>
    </tr>
  </table>
</div>`;
}
