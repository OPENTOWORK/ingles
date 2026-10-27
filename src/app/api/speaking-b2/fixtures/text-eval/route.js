import { NextResponse } from 'next/server';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import {
  evaluateSpeakingB2TextCase,
  evaluateSpeakingB2TextSet,
  getSpeakingB2TextCaseOrThrow,
} from '@/features/speaking-b2-motor/fixtures/text-eval';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (!isSpeakingB2FixtureRuntime()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    if (body.caseId) {
      const item = await evaluateSpeakingB2TextCase(getSpeakingB2TextCaseOrThrow(body.caseId));
      return NextResponse.json({ enabled: true, persist: false, item });
    }
    const items = await evaluateSpeakingB2TextSet(body.set || 'validate');
    return NextResponse.json({ enabled: true, persist: false, items });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Text eval failed' }, { status: 400 });
  }
}
