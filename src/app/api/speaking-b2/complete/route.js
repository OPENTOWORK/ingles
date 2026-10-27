import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  authorizeSpeakingSession,
  readSpeakingAccessToken,
  sanitizeSpeakingLog,
} from '@/features/speaking-b2-motor/services/session-auth';
import {
  getMemorySession,
  updatePersistedSession,
} from '@/features/speaking-b2-motor/services/session-store';
import { runSpeakingB2Complete } from '@/features/speaking-b2-motor/services/evaluation/run-complete';
import {
  chargeSpeakingCorrectionQuota,
  checkSpeakingCorrectionQuota,
} from '@/features/speaking-b2-motor/services/evaluation/quota';
import { completeSpeakingB2Session } from '@/features/speaking-b2-motor/services/evaluation/complete-flow';
import {
  SPEAKING_B2_FIXTURE_OWNER,
  createSpeakingB2FixtureQuota,
  isSpeakingB2FixtureRuntime,
} from '@/features/speaking-b2-motor/fixtures/runtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function quotaAdapter(userId, options) {
  return {
    async check() {
      const result = await checkSpeakingCorrectionQuota(userId, options);
      if (result.ok) return { ok: true };
      return { ok: false, response: result.response };
    },
    async charge() {
      const result = await chargeSpeakingCorrectionQuota(userId, options);
      if (result.ok) return { ok: true };
      return { ok: false, response: result.response };
    },
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const session = getMemorySession(body.sessionId);
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
        : quotaAdapter(userId, {
            userEmail: auth?.user?.email || '',
            accessToken: auth?.accessToken || null,
          }),
      evaluate: (current) => runSpeakingB2Complete({ session: current }),
      persist: (current) => updatePersistedSession(current),
    });

    if (result.response) return result.response;
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error('[speaking-b2/complete]', sanitizeSpeakingLog({ message: error.message, code: error.code }));
    return NextResponse.json({ error: 'Evaluation failed', code: error.code || 'EVAL_FAILED' }, { status: 500 });
  }
}
