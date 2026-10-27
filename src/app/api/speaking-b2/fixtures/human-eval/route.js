import { NextResponse } from 'next/server';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import { evaluateSpeakingB2HumanBank } from '@/features/speaking-b2-motor/fixtures/human/eval';
import { evaluateScriptedSpeakingB2Interview } from '@/features/speaking-b2-motor/fixtures/interview-scenario';
import { redactSpeakingB2AudioValue } from '@/features/speaking-b2-motor/fixtures/human/privacy';
import { transcribeCandidateAudio } from '@/features/speaking-b2-motor/services/evaluation/transcribe-acoustic';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (!isSpeakingB2FixtureRuntime()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const includeScripted = body.scriptedInterview !== false;
  const human = await evaluateSpeakingB2HumanBank({
    transcribe: body.runStt === true ? transcribeCandidateAudio : undefined,
    evaluate: typeof body.evaluate === 'function' ? body.evaluate : undefined,
  });
  const scripted = includeScripted
    ? await evaluateScriptedSpeakingB2Interview({
        evaluate: body.evaluateScripted === true ? undefined : async () => null,
      })
    : null;
  return NextResponse.json(
    redactSpeakingB2AudioValue({
      enabled: true,
      persist: false,
      quotaCharged: false,
      human,
      scriptedInterview: scripted
        ? {
            authenticity: scripted.authenticity,
            humanInterview: false,
            associationOk: scripted.associationOk,
            orderOk: scripted.orderOk,
            closed: scripted.closed,
            closingOk: scripted.closingOk,
            technicalOk: scripted.technicalOk,
            scores: scripted.report?.scores || null,
            summaryEs: scripted.report?.summaryEs || '',
          }
        : null,
    }),
  );
}
