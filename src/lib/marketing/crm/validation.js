import { isValidVisitorId } from './constants.js';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_STRING = 500;
const MAX_URL = 2048;
const MAX_EVENT_NAME = 120;
const MAX_METADATA_KEYS = 50;

function trimOrNull(value, maxLen = MAX_STRING) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return s.length > maxLen ? s.slice(0, maxLen) : s;
}

function parseTimestamp(value) {
  if (value == null || value === '') return { ok: true, value: new Date().toISOString() };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { ok: false, error: 'timestamp inválido (ISO 8601 requerido).' };
  }
  return { ok: true, value: d.toISOString() };
}

function parseMetadata(value) {
  if (value == null) return { ok: true, value: {} };
  if (typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, error: 'metadata debe ser un objeto JSON.' };
  }
  const keys = Object.keys(value);
  if (keys.length > MAX_METADATA_KEYS) {
    return { ok: false, error: `metadata admite máximo ${MAX_METADATA_KEYS} claves.` };
  }
  return { ok: true, value };
}

function parseConsentBoolean(value) {
  if (value === true || value === false || value === null) return { ok: true, value };
  return { ok: false, error: 'Los consentimientos deben ser true, false o null.' };
}

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

function validateOptionalUuidField(value, fieldName) {
  if (value == null || value === '') return { ok: true, value: null };
  const trimmed = String(value).trim();
  if (!isValidUuid(trimmed)) {
    return { ok: false, error: `${fieldName} debe ser un UUID válido.`, status: 400 };
  }
  return { ok: true, value: trimmed };
}

/**
 * Normaliza y valida el payload de POST /api/marketing/events.
 * @returns {{ ok: true, data: object } | { ok: false, error: string, status?: number }}
 */
export function validateMarketingEventPayload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Payload JSON inválido.', status: 400 };
  }

  const eventName = trimOrNull(body.event_name, MAX_EVENT_NAME);
  if (!eventName) {
    return { ok: false, error: 'event_name es obligatorio.', status: 400 };
  }

  const visitorIdRaw = trimOrNull(body.visitor_id, 64);
  if (visitorIdRaw && !isValidVisitorId(visitorIdRaw)) {
    return { ok: false, error: 'visitor_id con formato inválido (esperado vis_...).', status: 400 };
  }

  const ts = parseTimestamp(body.timestamp);
  if (!ts.ok) return { ok: false, error: ts.error, status: 400 };

  const meta = parseMetadata(body.metadata);
  if (!meta.ok) return { ok: false, error: meta.error, status: 400 };

  const acquisition = {
    source: trimOrNull(body.source),
    medium: trimOrNull(body.medium),
    campaign: trimOrNull(body.campaign),
    content: trimOrNull(body.content),
    term: trimOrNull(body.term),
    utm_source: trimOrNull(body.utm_source),
    utm_medium: trimOrNull(body.utm_medium),
    utm_campaign: trimOrNull(body.utm_campaign),
    utm_content: trimOrNull(body.utm_content),
    utm_term: trimOrNull(body.utm_term),
    gclid: trimOrNull(body.gclid, 256),
    gbraid: trimOrNull(body.gbraid, 256),
    wbraid: trimOrNull(body.wbraid, 256),
  };

  const contactId = validateOptionalUuidField(body.contact_id, 'contact_id');
  if (!contactId.ok) return contactId;
  const leadId = validateOptionalUuidField(body.lead_id, 'lead_id');
  if (!leadId.ok) return leadId;
  const customerId = validateOptionalUuidField(body.customer_id, 'customer_id');
  if (!customerId.ok) return customerId;
  const userId = validateOptionalUuidField(body.user_id, 'user_id');
  if (!userId.ok) return userId;

  const data = {
    visitor_id: visitorIdRaw,
    session_id: trimOrNull(body.session_id, 128),
    event_name: eventName,
    event_timestamp: ts.value,
    page_url: trimOrNull(body.page_url, MAX_URL),
    landing_page: trimOrNull(body.landing_page, MAX_URL),
    referrer: trimOrNull(body.referrer, MAX_URL),
    user_agent: trimOrNull(body.user_agent, 512),
    contact_id: contactId.value,
    lead_id: leadId.value,
    customer_id: customerId.value,
    user_id: userId.value,
    idempotency_key: trimOrNull(body.idempotency_key, 128),
    ...acquisition,
    metadata: meta.value,
  };

  return { ok: true, data };
}

export function validateMarketingConsentPayload(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Payload JSON inválido.', status: 400 };
  }

  const visitorId = trimOrNull(body.visitor_id, 64);
  if (!visitorId || !isValidVisitorId(visitorId)) {
    return { ok: false, error: 'visitor_id es obligatorio y debe tener formato vis_...', status: 400 };
  }

  const analytics = parseConsentBoolean(body.analytics_consent);
  if (!analytics.ok) return { ok: false, error: analytics.error, status: 400 };
  const ads = parseConsentBoolean(body.ads_consent);
  if (!ads.ok) return { ok: false, error: ads.error, status: 400 };
  const marketing = parseConsentBoolean(body.marketing_consent);
  if (!marketing.ok) return { ok: false, error: marketing.error, status: 400 };

  const ts = body.consent_timestamp != null ? parseTimestamp(body.consent_timestamp) : { ok: true, value: null };
  if (!ts.ok) return { ok: false, error: ts.error, status: 400 };

  const userId = validateOptionalUuidField(body.user_id, 'user_id');
  if (!userId.ok) return userId;

  return {
    ok: true,
    data: {
      visitor_id: visitorId,
      user_id: userId.value,
      analytics_consent: analytics.value,
      ads_consent: ads.value,
      marketing_consent: marketing.value,
      consent_timestamp: ts.value || new Date().toISOString(),
      consent_source: trimOrNull(body.consent_source, 120),
    },
  };
}

export function buildIdempotencyKey(payload) {
  if (payload.idempotency_key) return payload.idempotency_key;
  const parts = [
    payload.visitor_id,
    payload.session_id || '',
    payload.event_name,
    payload.event_timestamp,
    payload.page_url || '',
  ];
  return parts.join('|');
}
