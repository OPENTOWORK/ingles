import { randomBytes } from 'node:crypto';

export const VISITOR_ID_PREFIX = 'vis_';
export const EVENT_ID_PREFIX = 'evt_';

/** Eventos conocidos; el sistema acepta cualquier nombre personalizado. */
export const KNOWN_MARKETING_EVENTS = [
  'page_view',
  'landing_view',
  'service_view',
  'pricing_view',
  'form_start',
  'generate_lead',
  'lead_qualified',
  'meeting_booked',
  'proposal_sent',
  'purchase',
  'customer_created',
  'download_leadmagnet',
  'book_consultation',
  'request_quote',
  'contact_sales',
];

export const LEAD_EVENTS = new Set(['generate_lead', 'form_start']);
export const CUSTOMER_EVENTS = new Set(['purchase', 'customer_created']);

export function generateVisitorId() {
  return `${VISITOR_ID_PREFIX}${randomBytes(16).toString('hex')}`;
}

export function generateEventPublicId() {
  return `${EVENT_ID_PREFIX}${randomBytes(16).toString('hex')}`;
}

export function isValidVisitorId(value) {
  return typeof value === 'string' && /^vis_[a-f0-9]{24,32}$/.test(value);
}

export function isValidEventPublicId(value) {
  return typeof value === 'string' && /^evt_[a-f0-9]{24,32}$/.test(value);
}
