import { NextResponse } from 'next/server';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import { publicSpeakingB2HumanCatalog } from '@/features/speaking-b2-motor/fixtures/human/bank';
import { describeSpeakingB2HumanInterviewReadiness } from '@/features/speaking-b2-motor/fixtures/interview-scenario';
import { redactSpeakingB2AudioValue } from '@/features/speaking-b2-motor/fixtures/human/privacy';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  if (!isSpeakingB2FixtureRuntime()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(
    redactSpeakingB2AudioValue({
      enabled: true,
      persist: false,
      quotaCharged: false,
      ...publicSpeakingB2HumanCatalog(),
      interview: describeSpeakingB2HumanInterviewReadiness(),
    }),
  );
}
