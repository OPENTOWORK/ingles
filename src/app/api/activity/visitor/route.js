import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidVisitorId } from '@/lib/marketing/crm/constants';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  getClientIpFromRequest,
  tryConsumeMarketingIngestRate,
} from '@/lib/marketing/crm/rateLimit';
import { classifyTrafficSource } from '@/lib/trafficSource';

function isBot(userAgent) {
  return /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse/i.test(
    userAgent || '',
  );
}

function getServiceClient() {
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) return null;
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    if (isBot(userAgent)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip = getClientIpFromRequest(req);
    if (!tryConsumeMarketingIngestRate(ip, 'activity:visitor')) {
      return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const visitorId = String(body?.visitorId || '').trim();
    const heartbeat = Boolean(body?.heartbeat);
    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: 'Visitante no válido.' }, { status: 400 });
    }

    const db = getServiceClient();
    if (!db) {
      return NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 503 });
    }

    const seenAt = new Date().toISOString();
    const { error: insertError } = await db.from('marketing_visitors').insert({
      visitor_id: visitorId,
      last_ip: ip,
      last_seen_at: seenAt,
    });
    if (insertError && insertError.code !== '23505') {
      console.error('[activity/visitor] insert', insertError);
      return NextResponse.json({ error: 'No se pudo guardar la visita.' }, { status: 500 });
    }

    const { error: ipError } = await db
      .from('marketing_visitors')
      .update({ last_ip: ip, last_seen_at: seenAt })
      .eq('visitor_id', visitorId);
    if (ipError) {
      console.error('[activity/visitor] last_ip', ipError);
    }

    const auth = await getSupabaseUserFromRequest(req);
    if (auth?.user?.id) {
      const { error: linkError } = await db
        .from('marketing_visitors')
        .update({
          user_id: auth.user.id,
          identified_at: new Date().toISOString(),
        })
        .eq('visitor_id', visitorId)
        .is('user_id', null);
      if (linkError) {
        console.error('[activity/visitor] link', linkError);
      }
    }

    if (!heartbeat) {
      const { error: hitError } = await db.from('marketing_visitor_hits').insert({
        visitor_id: visitorId,
        ip_address: ip,
      });
      if (hitError) {
        console.error('[activity/visitor] hit', hitError);
      }
    }

    if (!heartbeat || body?.landingPage) {
      await persistVisitorFirstTouch(db, visitorId, body, seenAt);
      if (!heartbeat) {
        await persistVisitorAcquisition(db, visitorId, body, seenAt);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[activity/visitor]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

function classifyVisit(body) {
  return classifyTrafficSource({
    referrer: body?.referrer,
    landingPage: body?.landingPage,
    utmSource: body?.utmSource,
    utmMedium: body?.utmMedium,
    utmCampaign: body?.utmCampaign,
    gclid: body?.gclid,
  });
}

async function persistVisitorFirstTouch(db, visitorId, body, seenAt) {
  const classified = classifyVisit(body);
  const landingPage = String(body?.landingPage || '').slice(0, 500) || null;
  const { error } = await db
    .from('marketing_visitors')
    .update({
      first_source: classified.key,
      first_landing_page: landingPage,
      first_referrer: classified.referrerHost || null,
      updated_at: seenAt,
    })
    .eq('visitor_id', visitorId)
    .is('first_source', null);
  if (error) console.error('[activity/visitor] first touch', error);
}

async function persistVisitorAcquisition(db, visitorId, body, seenAt) {
  const classified = classifyVisit(body);

  const { data: existing, error: readError } = await db
    .from('marketing_acquisition_profiles')
    .select('visitor_id, first_source, first_timestamp')
    .eq('visitor_id', visitorId)
    .maybeSingle();
  if (readError) {
    console.error('[activity/visitor] acquisition read', readError);
    return;
  }

  const lastTouch = {
    last_source: classified.key,
    last_medium: classified.medium,
    last_campaign: classified.campaign,
    last_landing_page: String(body?.landingPage || '').slice(0, 500) || null,
    last_timestamp: seenAt,
    last_utm_source: String(body?.utmSource || '').slice(0, 120) || null,
    last_utm_medium: String(body?.utmMedium || '').slice(0, 120) || null,
    last_utm_campaign: String(body?.utmCampaign || '').slice(0, 180) || null,
    last_gclid: String(body?.gclid || '').slice(0, 256) || null,
  };

  if (existing?.first_source) {
    const { error } = await db
      .from('marketing_acquisition_profiles')
      .update(lastTouch)
      .eq('visitor_id', visitorId);
    if (error) console.error('[activity/visitor] acquisition last', error);
    return;
  }

  const { error } = await db.from('marketing_acquisition_profiles').upsert(
    {
      visitor_id: visitorId,
      first_source: classified.key,
      first_medium: classified.medium,
      first_campaign: classified.campaign,
      first_content: classified.referrerHost,
      first_landing_page: String(body?.landingPage || '').slice(0, 500) || null,
      first_timestamp: seenAt,
      first_utm_source: String(body?.utmSource || '').slice(0, 120) || null,
      first_utm_medium: String(body?.utmMedium || '').slice(0, 120) || null,
      first_utm_campaign: String(body?.utmCampaign || '').slice(0, 180) || null,
      first_gclid: String(body?.gclid || '').slice(0, 256) || null,
      ...lastTouch,
    },
    { onConflict: 'visitor_id' },
  );
  if (error) console.error('[activity/visitor] acquisition first', error);
}
