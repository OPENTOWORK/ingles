import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidVisitorId } from '@/lib/marketing/crm/constants';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  getClientIpFromRequest,
  tryConsumeMarketingIngestRate,
} from '@/lib/marketing/crm/rateLimit';

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
    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: 'Visitante no válido.' }, { status: 400 });
    }

    const db = getServiceClient();
    if (!db) {
      return NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 503 });
    }

    const { error: insertError } = await db.from('marketing_visitors').insert({
      visitor_id: visitorId,
      last_ip: ip,
    });
    if (insertError && insertError.code !== '23505') {
      console.error('[activity/visitor] insert', insertError);
      return NextResponse.json({ error: 'No se pudo guardar la visita.' }, { status: 500 });
    }

    const { error: ipError } = await db
      .from('marketing_visitors')
      .update({ last_ip: ip })
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

    const { error: hitError } = await db.from('marketing_visitor_hits').insert({
      visitor_id: visitorId,
      ip_address: ip,
    });
    if (hitError) {
      console.error('[activity/visitor] hit', hitError);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[activity/visitor]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
