import { createClient } from '@supabase/supabase-js';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { computeAcquisitionPatch, shouldSkipDuplicatePageView } from './acquisition.js';
import {
  CUSTOMER_EVENTS,
  LEAD_EVENTS,
  generateEventPublicId,
  generateVisitorId,
} from './constants.js';
import { buildIdempotencyKey } from './validation.js';

export function getMarketingDbClient(existingDb = null) {
  if (existingDb) return existingDb;
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada.');
  }
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function ensureVisitor(db, payload) {
  if (payload.visitor_id) {
    const { data: existing } = await db
      .from('marketing_visitors')
      .select('visitor_id, user_id, contact_id, lead_id, customer_id')
      .eq('visitor_id', payload.visitor_id)
      .maybeSingle();

    if (existing) {
      const patch = {};
      const userId = payload.user_id || payload.contact_id || payload.customer_id;
      if (userId && !existing.user_id) patch.user_id = userId;
      if (payload.contact_id && !existing.contact_id) patch.contact_id = payload.contact_id;
      if (payload.lead_id && !existing.lead_id) patch.lead_id = payload.lead_id;
      if (payload.customer_id && !existing.customer_id) patch.customer_id = payload.customer_id;
      if (Object.keys(patch).length) {
        await db.from('marketing_visitors').update(patch).eq('visitor_id', payload.visitor_id);
      }
      return { visitor_id: payload.visitor_id, created: false };
    }
  }

  const visitorId = payload.visitor_id || generateVisitorId();
  const userId = payload.user_id || payload.contact_id || payload.customer_id || null;

  const row = {
    visitor_id: visitorId,
    user_id: userId,
    contact_id: payload.contact_id || userId,
    lead_id: payload.lead_id || null,
    customer_id: payload.customer_id || null,
    identified_at: userId ? new Date().toISOString() : null,
  };

  const { error } = await db.from('marketing_visitors').insert(row);
  if (error) throw new Error(error.message);

  await db.from('marketing_acquisition_profiles').insert({ visitor_id: visitorId, user_id: userId });

  return { visitor_id: visitorId, created: true };
}

async function resolveIdentityIds(db, payload, visitorId) {
  const contactId = payload.contact_id || payload.user_id || null;
  let leadId = payload.lead_id || null;
  let customerId = payload.customer_id || null;

  if (contactId && LEAD_EVENTS.has(payload.event_name) && !leadId) {
    leadId = contactId;
  }
  if (contactId && CUSTOMER_EVENTS.has(payload.event_name) && !customerId) {
    customerId = contactId;
  }

  const visitorPatch = {};
  if (contactId) visitorPatch.contact_id = contactId;
  if (leadId) visitorPatch.lead_id = leadId;
  if (customerId) visitorPatch.customer_id = customerId;
  if (contactId && !visitorPatch.user_id) visitorPatch.user_id = contactId;

  if (Object.keys(visitorPatch).length) {
    await db.from('marketing_visitors').update(visitorPatch).eq('visitor_id', visitorId);
  }

  return { contactId, leadId, customerId };
}

async function upsertAcquisitionProfile(db, visitorId, payload, identity) {
  const { data: profile } = await db
    .from('marketing_acquisition_profiles')
    .select('*')
    .eq('visitor_id', visitorId)
    .maybeSingle();

  const { patch } = computeAcquisitionPatch(profile, payload);
  if (!Object.keys(patch).length) return;

  if (identity.contactId && !profile?.user_id) {
    patch.user_id = identity.contactId;
  }

  if (profile) {
    await db.from('marketing_acquisition_profiles').update(patch).eq('visitor_id', visitorId);
  } else {
    await db.from('marketing_acquisition_profiles').insert({ visitor_id: visitorId, ...patch });
  }
}

function eventRowFromPayload(visitorId, payload, identity, eventPublicId, idempotencyKey) {
  return {
    event_public_id: eventPublicId,
    visitor_id: visitorId,
    contact_id: identity.contactId,
    lead_id: identity.leadId,
    customer_id: identity.customerId,
    session_id: payload.session_id,
    event_name: payload.event_name,
    event_timestamp: payload.event_timestamp,
    page_url: payload.page_url,
    source: payload.source,
    medium: payload.medium,
    campaign: payload.campaign,
    content: payload.content,
    term: payload.term,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    utm_term: payload.utm_term,
    gclid: payload.gclid,
    gbraid: payload.gbraid,
    wbraid: payload.wbraid,
    idempotency_key: idempotencyKey,
    metadata: payload.metadata || {},
  };
}

function touchpointRowFromPayload(visitorId, payload, identity) {
  return {
    visitor_id: visitorId,
    contact_id: identity.contactId,
    lead_id: identity.leadId,
    customer_id: identity.customerId,
    session_id: payload.session_id,
    timestamp: payload.event_timestamp,
    event_name: payload.event_name,
    source: payload.source,
    medium: payload.medium,
    campaign: payload.campaign,
    content: payload.content,
    term: payload.term,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    utm_campaign: payload.utm_campaign,
    utm_content: payload.utm_content,
    utm_term: payload.utm_term,
    gclid: payload.gclid,
    gbraid: payload.gbraid,
    wbraid: payload.wbraid,
    page_url: payload.page_url,
    landing_page: payload.landing_page || payload.page_url,
    referrer: payload.referrer,
    user_agent: payload.user_agent,
    metadata: payload.metadata || {},
  };
}

/**
 * Registra un evento de marketing completo (visitor, evento, touchpoint, adquisición).
 */
export async function ingestMarketingEvent(payload, { db: existingDb = null } = {}) {
  const db = getMarketingDbClient(existingDb);
  const idempotencyKey = buildIdempotencyKey(payload);

  const { data: dupByKey } = await db
    .from('marketing_events')
    .select('event_public_id, visitor_id')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (dupByKey) {
    return {
      success: true,
      duplicate: true,
      event_id: dupByKey.event_public_id,
      visitor_id: dupByKey.visitor_id,
    };
  }

  const { visitor_id: visitorId } = await ensureVisitor(db, payload);

  const fullPayload = { ...payload, visitor_id: visitorId };
  const identity = await resolveIdentityIds(db, fullPayload, visitorId);

  if (payload.event_name === 'page_view') {
    const { data: recentPageView } = await db
      .from('marketing_events')
      .select('event_timestamp, page_url')
      .eq('visitor_id', visitorId)
      .eq('event_name', 'page_view')
      .eq('session_id', payload.session_id || '')
      .order('event_timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (shouldSkipDuplicatePageView({ existingEvent: recentPageView, incoming: fullPayload })) {
      const { data: lastEvt } = await db
        .from('marketing_events')
        .select('event_public_id')
        .eq('visitor_id', visitorId)
        .eq('event_name', 'page_view')
        .order('event_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        success: true,
        duplicate: true,
        event_id: lastEvt?.event_public_id,
        visitor_id: visitorId,
      };
    }
  }

  await upsertAcquisitionProfile(db, visitorId, fullPayload, identity);

  const eventPublicId = generateEventPublicId();
  const eventRow = eventRowFromPayload(visitorId, fullPayload, identity, eventPublicId, idempotencyKey);

  const { error: eventError } = await db.from('marketing_events').insert(eventRow);
  if (eventError) {
    if (eventError.code === '23505') {
      const { data: existing } = await db
        .from('marketing_events')
        .select('event_public_id, visitor_id')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      return {
        success: true,
        duplicate: true,
        event_id: existing?.event_public_id,
        visitor_id: existing?.visitor_id || visitorId,
      };
    }
    throw new Error(eventError.message);
  }

  const touchpointRow = touchpointRowFromPayload(visitorId, fullPayload, identity);
  const { error: tpError } = await db.from('marketing_touchpoints').insert(touchpointRow);
  if (tpError) throw new Error(tpError.message);

  if (payload.event_name === 'purchase' && identity.customerId) {
    const amount = Number(payload.metadata?.amount);
    if (Number.isFinite(amount) && amount > 0) {
      await db.from('marketing_revenue').insert({
        customer_id: identity.customerId,
        contact_id: identity.contactId,
        visitor_id: visitorId,
        amount,
        currency: payload.metadata?.currency || 'EUR',
        product: payload.metadata?.product || null,
        service: payload.metadata?.service || null,
        transaction_date: payload.event_timestamp,
        status: 'completed',
        metadata: payload.metadata || {},
      });
    }
  }

  return {
    success: true,
    duplicate: false,
    event_id: eventPublicId,
    visitor_id: visitorId,
  };
}

export async function upsertMarketingConsent(payload, { db: existingDb = null } = {}) {
  const db = getMarketingDbClient(existingDb);
  await ensureVisitor(db, { visitor_id: payload.visitor_id, user_id: payload.user_id });

  const row = {
    visitor_id: payload.visitor_id,
    user_id: payload.user_id || null,
    analytics_consent: payload.analytics_consent,
    ads_consent: payload.ads_consent,
    marketing_consent: payload.marketing_consent,
    consent_timestamp: payload.consent_timestamp,
    consent_source: payload.consent_source,
  };

  const { data: existing } = await db
    .from('marketing_consent')
    .select('id')
    .eq('visitor_id', payload.visitor_id)
    .maybeSingle();

  if (existing) {
    const { error } = await db.from('marketing_consent').update(row).eq('visitor_id', payload.visitor_id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await db.from('marketing_consent').insert(row);
    if (error) throw new Error(error.message);
  }

  return { success: true, visitor_id: payload.visitor_id };
}

export async function linkVisitorToUser({ visitorId, userId }, { db: existingDb = null } = {}) {
  const db = getMarketingDbClient(existingDb);
  await db
    .from('marketing_visitors')
    .update({
      user_id: userId,
      contact_id: userId,
      identified_at: new Date().toISOString(),
    })
    .eq('visitor_id', visitorId);

  await db
    .from('marketing_acquisition_profiles')
    .update({ user_id: userId })
    .eq('visitor_id', visitorId);

  return { success: true, visitor_id: visitorId, user_id: userId };
}

export async function fetchCustomerJourneyForUser(userId, { db: existingDb = null, useMock = false } = {}) {
  if (useMock) {
    return getMockCustomerJourney(userId);
  }

  const db = getMarketingDbClient(existingDb);

  const { data: visitor } = await db
    .from('marketing_visitors')
    .select('visitor_id, lead_id, customer_id, created_at')
    .or(`user_id.eq.${userId},contact_id.eq.${userId},customer_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!visitor) {
    return { hasData: false, userId, journey: null };
  }

  const { data: profile } = await db
    .from('marketing_acquisition_profiles')
    .select('*')
    .eq('visitor_id', visitor.visitor_id)
    .maybeSingle();

  const { data: touchpoints } = await db
    .from('marketing_touchpoints')
    .select('id, event_name, timestamp, source, medium, campaign, page_url, landing_page')
    .eq('visitor_id', visitor.visitor_id)
    .order('timestamp', { ascending: true })
    .limit(100);

  const { data: events } = await db
    .from('marketing_events')
    .select('event_public_id, event_name, event_timestamp, source, medium, campaign')
    .eq('visitor_id', visitor.visitor_id)
    .order('event_timestamp', { ascending: true })
    .limit(100);

  const { data: revenue } = await db
    .from('marketing_revenue')
    .select('amount, currency, product, service, transaction_date, status')
    .or(`customer_id.eq.${userId},contact_id.eq.${userId}`)
    .order('transaction_date', { ascending: false });

  const { data: consent } = await db
    .from('marketing_consent')
    .select('analytics_consent, ads_consent, marketing_consent, consent_timestamp, consent_source')
    .or(`user_id.eq.${userId},visitor_id.eq.${visitor.visitor_id}`)
    .maybeSingle();

  return {
    hasData: true,
    userId,
    visitor_id: visitor.visitor_id,
    profile,
    touchpoints: touchpoints || [],
    events: events || [],
    revenue: revenue || [],
    consent,
    journey: buildJourneyTimeline({ profile, touchpoints, events, revenue }),
  };
}

function buildJourneyTimeline({ profile, touchpoints = [], events = [], revenue = [] }) {
  const steps = [];

  if (profile?.first_timestamp) {
    steps.push({
      type: 'first_touch',
      label: [profile.first_source, profile.first_medium].filter(Boolean).join(' / ') || 'Primera fuente',
      timestamp: profile.first_timestamp,
      detail: profile.first_campaign,
    });
  }

  for (const tp of touchpoints) {
    steps.push({
      type: 'touchpoint',
      label: tp.event_name,
      timestamp: tp.timestamp,
      detail: tp.page_url || tp.landing_page,
      source: tp.source,
      medium: tp.medium,
    });
  }

  for (const evt of events) {
    if (['generate_lead', 'lead_qualified', 'meeting_booked', 'proposal_sent', 'customer_created', 'purchase'].includes(evt.event_name)) {
      steps.push({
        type: 'conversion',
        label: evt.event_name,
        timestamp: evt.event_timestamp,
        detail: evt.campaign,
      });
    }
  }

  for (const rev of revenue) {
    steps.push({
      type: 'revenue',
      label: 'Revenue',
      timestamp: rev.transaction_date,
      detail: `${rev.amount} ${rev.currency}`,
      product: rev.product,
    });
  }

  steps.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  return steps;
}

/** Datos de demostración UI — no mezclar con datos reales en producción. */
export function getMockCustomerJourney(userId) {
  return {
    hasData: true,
    mock: true,
    userId,
    visitor_id: 'vis_mock_demo_only',
    profile: {
      first_source: 'google',
      first_medium: 'cpc',
      first_campaign: 'cambridge_b2_prep',
      first_timestamp: '2026-09-18T09:15:00Z',
      last_source: 'google',
      last_medium: 'cpc',
      last_campaign: 'cambridge_b2_prep',
      last_timestamp: '2026-09-23T14:20:00Z',
      lead_created_at: '2026-09-23T14:20:00Z',
      customer_created_at: '2026-10-04T11:00:00Z',
    },
    journey: [
      { type: 'first_touch', label: 'Google Ads', timestamp: '2026-09-18T09:15:00Z', detail: 'cambridge_b2_prep' },
      { type: 'touchpoint', label: 'landing_view', timestamp: '2026-09-18T09:16:00Z', detail: '/landing/b2' },
      { type: 'touchpoint', label: 'page_view', timestamp: '2026-09-20T18:30:00Z', detail: '/blog/use-of-english' },
      { type: 'touchpoint', label: 'service_view', timestamp: '2026-09-22T12:00:00Z', detail: '/servicios' },
      { type: 'conversion', label: 'generate_lead', timestamp: '2026-09-23T14:20:00Z', detail: 'Registro' },
      { type: 'conversion', label: 'meeting_booked', timestamp: '2026-09-25T10:00:00Z', detail: null },
      { type: 'conversion', label: 'proposal_sent', timestamp: '2026-09-28T16:00:00Z', detail: null },
      { type: 'conversion', label: 'customer_created', timestamp: '2026-10-04T11:00:00Z', detail: 'Plan Plus' },
      { type: 'revenue', label: 'Revenue', timestamp: '2026-10-04T11:05:00Z', detail: '2400 EUR' },
    ],
    revenue: [{ amount: 2400, currency: 'EUR', product: 'Plan Plus', transaction_date: '2026-10-04T11:05:00Z' }],
    consent: { analytics_consent: true, ads_consent: false, marketing_consent: true },
  };
}
