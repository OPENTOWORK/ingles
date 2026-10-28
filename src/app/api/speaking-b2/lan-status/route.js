import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/aiUsage';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';
import { probeSpeakingB2V2Schema } from '@/features/speaking-b2-motor/services/session-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;

  const probe = await probeSpeakingB2V2Schema(getSupabaseAdmin());
  return NextResponse.json({
    ok: true,
    sessionCreated: false,
    quotaCharged: false,
    fixturesExposed: false,
    persistReady: Boolean(probe.ready),
    persistReason: probe.ready ? null : probe.reason || 'STORE_UNAVAILABLE',
    examinerVoice: process.env.SPEAKING_B2_EDGE_VOICE || 'en-GB-SoniaNeural',
    examinerFallback: 'nova',
    whisperConfigured: Boolean(String(process.env.OPENAI_API_KEY || '').trim()),
  });
}
