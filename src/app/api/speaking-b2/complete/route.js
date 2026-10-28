import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  authorizeSpeakingSession,
  readSpeakingAccessToken,
  sanitizeSpeakingLog,
} from '@/features/speaking-b2-motor/services/session-auth';
import {
  SpeakingStoreConflictError,
  SpeakingStoreUnavailableError,
  claimSpeakingB2Evaluation,
  finalizeSpeakingB2QuotaCharge,
  loadSpeakingB2Session,
  updatePersistedSession,
} from '@/features/speaking-b2-motor/services/session-store';
import { runSpeakingB2Complete } from '@/features/speaking-b2-motor/services/evaluation/run-complete';
import {
  checkSpeakingCorrectionQuota,
  resolveSpeakingB2QuotaChargeArgs,
} from '@/features/speaking-b2-motor/services/evaluation/quota';
import { completeSpeakingB2Session } from '@/features/speaking-b2-motor/services/evaluation/complete-flow';
import {
  SPEAKING_B2_FIXTURE_OWNER,
  createSpeakingB2FixtureQuota,
  isSpeakingB2FixtureRuntime,
} from '@/features/speaking-b2-motor/fixtures/runtime';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function quotaAdapter(userId, options, session) {
  return {
    async check() {
      const result = await checkSpeakingCorrectionQuota(userId, options);
      if (result.ok) return { ok: true };
      return { ok: false, response: result.response };
    },
    async finalize() {
      const resolved = await resolveSpeakingB2QuotaChargeArgs(userId, options);
      if (!resolved.ok) return resolved;
      return finalizeSpeakingB2QuotaCharge({
        session,
        userId,
        periodType: resolved.periodType,
        periodKey: resolved.periodKey,
        limit: resolved.limit,
        dailyAction: resolved.dailyAction,
        dailyDate: resolved.dailyDate,
        dailyLimit: resolved.dailyLimit,
      });
    },
  };
}

export async function POST(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const session = await loadSpeakingB2Session(body.sessionId);
    const auth = await getSupabaseUserFromRequest(req);
    const userId = auth?.user?.id || null;
    const access = authorizeSpeakingSession(session, {
      userId,
      accessToken: readSpeakingAccessToken(req, body),
    });
    if (!access.ok) {
      return NextResponse.json({ error: access.error, code: access.code }, { status: access.status });
    }

    const fixtureRun = Boolean(session.fixtureMode) && isSpeakingB2FixtureRuntime();
    const result = await completeSpeakingB2Session({
      session,
      userId: userId || (fixtureRun ? SPEAKING_B2_FIXTURE_OWNER : null),
      quota: fixtureRun
        ? createSpeakingB2FixtureQuota()
        : quotaAdapter(
            userId,
            {
              userEmail: auth?.user?.email || '',
              accessToken: auth?.accessToken || null,
            },
            session,
          ),
      evaluate: (current) => runSpeakingB2Complete({ session: current }),
      persist: (current) => updatePersistedSession(current),
      claim: (current) => claimSpeakingB2Evaluation(current),
    });

    if (result.response) return result.response;
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (error instanceof SpeakingStoreUnavailableError) {
      return NextResponse.json({ error: 'Speaking storage is not ready.', code: 'STORE_UNAVAILABLE' }, { status: 503 });
    }
    if (error instanceof SpeakingStoreConflictError) {
      return NextResponse.json({ error: 'Session was updated elsewhere.', code: 'STORE_CONFLICT' }, { status: 409 });
    }
    console.error('[speaking-b2/complete]', sanitizeSpeakingLog({ message: error.message, code: error.code }));
    return NextResponse.json({ error: 'Evaluation failed', code: error.code || 'EVAL_FAILED' }, { status: 500 });
  }
}
