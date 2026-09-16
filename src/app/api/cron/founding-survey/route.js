import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getFoundingSurveyCampaignStatus,
  runFoundingSurveyCampaign,
} from '@/lib/foundingSurveyServer';
import { sendFoundingSurveyTestEmail } from '@/lib/foundingSurveyTestEmail';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

/**
 * Campaña de la encuesta founding. La pasada diaria ya va dentro de
 * `/api/cron/automated-emails`; esta ruta permite lanzarla o consultarla suelta.
 *
 *   GET                      → estado de la campaña
 *   POST                     → pasada completa (envíos, recordatorios, revocaciones)
 *   POST { accion: 'prueba' }→ manda el correo del formulario al equipo
 */
function authorize(req) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;

  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const querySecret = req.nextUrl.searchParams.get('secret') || '';
  return bearer === secret || querySecret === secret;
}

function getAdminClient() {
  const serviceKey = getSupabaseServiceRoleKey();
  const url = getSupabaseUrl();
  if (!serviceKey || !url) return null;

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function GET(req) {
  if (!authorize(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Service role no configurado' }, { status: 503 });
  }

  return NextResponse.json(await getFoundingSurveyCampaignStatus(adminClient));
}

export async function POST(req) {
  if (!authorize(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Service role no configurado' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));

  if (String(body?.accion || '') === 'prueba') {
    // Mandar correos desde una ruta de cron solo tiene sentido con el secreto
    // puesto o en local; si no, cualquiera podría usarla para hacer ruido.
    const protegida =
      Boolean(process.env.CRON_SECRET?.trim()) || process.env.NODE_ENV === 'development';
    if (!protegida) {
      return NextResponse.json({ error: 'Configura CRON_SECRET' }, { status: 403 });
    }

    const result = await sendFoundingSurveyTestEmail(adminClient);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  }

  const result = await runFoundingSurveyCampaign(adminClient);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
