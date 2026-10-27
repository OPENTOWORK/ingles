import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { runWeeklyTuesdayChallenge } from '@/lib/weeklyChallengeEmailServer';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const querySecret = req.nextUrl.searchParams.get('secret') || '';

  if (secret && bearer !== secret && querySecret !== secret) {
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

  const weeklyChallenge = await runWeeklyTuesdayChallenge(adminClient);
  return NextResponse.json({ weeklyChallenge });
}
