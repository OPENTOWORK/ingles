import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { processStaffBuzonDigests } from '@/lib/staffBuzonDigest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;

  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const querySecret = req.nextUrl.searchParams.get('secret') || '';
  return bearer === secret || querySecret === secret;
}

export async function GET(req) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const serviceKey = getSupabaseServiceRoleKey();
  const url = getSupabaseUrl();

  if (!serviceKey || !url) {
    return NextResponse.json({ error: 'Service role no configurado' }, { status: 503 });
  }

  const adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';
  const force = req.nextUrl.searchParams.get('force') === '1';
  const digestDate = req.nextUrl.searchParams.get('date') || undefined;
  const userId = req.nextUrl.searchParams.get('userId') || undefined;

  const result = await processStaffBuzonDigests(adminClient, {
    dryRun,
    force,
    digestDate,
    userId,
  });

  return NextResponse.json(result);
}

export async function POST(req) {
  return GET(req);
}
