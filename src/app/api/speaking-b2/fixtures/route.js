import { NextResponse } from 'next/server';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import { publicSpeakingB2FixtureCatalog } from '@/features/speaking-b2-motor/fixtures/catalog';
import { speakingB2DevSurfaceGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const blocked = speakingB2DevSurfaceGuardResponse(req);
  if (blocked) return blocked;
  if (!isSpeakingB2FixtureRuntime()) {
    return NextResponse.json({ enabled: false });
  }
  return NextResponse.json({
    enabled: true,
    ...publicSpeakingB2FixtureCatalog(),
  });
}
