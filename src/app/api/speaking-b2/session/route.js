import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  getSpeakingB2Exam,
  getSpeakingB2Examiner,
  SPEAKING_B2_EXAM_CODE,
} from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';
import { speakingB2IntroLine, startAudioCheck } from '@/features/speaking-b2-motor/services/coordinator';
import {
  authorizeSpeakingSession,
  readSpeakingAccessToken,
  sanitizeSpeakingLog,
} from '@/features/speaking-b2-motor/services/session-auth';
import {
  SpeakingStoreConflictError,
  SpeakingStoreUnavailableError,
  createPersistedSession,
  loadSpeakingB2Session,
  updatePersistedSession,
} from '@/features/speaking-b2-motor/services/session-store';
import { isSpeakingB2FixtureRuntime } from '@/features/speaking-b2-motor/fixtures/runtime';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';
import { canStartSpeakingB2Interview } from '@/features/speaking-b2-motor/services/interview-access';
import { getRoleNameByUserId } from '@/utils/authRoles';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const examCode = body.examCode || SPEAKING_B2_EXAM_CODE;
    const exam = getSpeakingB2Exam(examCode);
    if (!exam) {
      return NextResponse.json({ error: 'Unknown exam' }, { status: 404 });
    }

    const auth = await getSupabaseUserFromRequest(req);
    let roleName = '';
    if (auth?.user?.id) {
      try {
        roleName = await getRoleNameByUserId(auth.user.id, auth.user.email || '');
      } catch {
        roleName = '';
      }
    }
    if (!canStartSpeakingB2Interview(roleName)) {
      return NextResponse.json(
        { error: 'La entrevista todavía no está disponible.', code: 'SPEAKING_CLOSED' },
        { status: 403 },
      );
    }
    const localHour = Number(body.localHour);
    const { session, accessToken } = await createPersistedSession({
      userId: auth?.user?.id || null,
      examCode,
      fixtureMode: body.fixtureMode === true && isSpeakingB2FixtureRuntime(),
      localHour: Number.isInteger(localHour) ? localHour : null,
    });
    const examiner = getSpeakingB2Examiner(session.plan?.examinerId);

    return NextResponse.json({
      sessionId: session.id,
      accessToken,
      persisted: session.persisted,
      fixtureMode: Boolean(session.fixtureMode),
      state: session.state,
      examiner: { id: examiner.id, name: examiner.name },
      introText: speakingB2IntroLine(session),
      exam: {
        code: exam.code,
        title: exam.title,
        part: exam.part,
        durationTargetSec: exam.durationTargetSec,
        questionCount: exam.questions.length,
      },
    });
  } catch (error) {
    if (error instanceof SpeakingStoreUnavailableError) {
      return NextResponse.json(
        { error: 'Speaking storage is not ready.', code: 'STORE_UNAVAILABLE' },
        { status: 503 },
      );
    }
    console.error('[speaking-b2/session]', sanitizeSpeakingLog({ message: error.message }));
    return NextResponse.json({ error: 'Could not create session' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const session = await loadSpeakingB2Session(body.sessionId);
    const auth = await getSupabaseUserFromRequest(req);
    const access = authorizeSpeakingSession(session, {
      userId: auth?.user?.id || null,
      accessToken: readSpeakingAccessToken(req, body),
    });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    if (body.action === 'audio-check') {
      const next = await updatePersistedSession(startAudioCheck(session));
      return NextResponse.json({ sessionId: next.id, state: next.state });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    if (error instanceof SpeakingStoreUnavailableError) {
      return NextResponse.json(
        { error: 'Speaking storage is not ready.', code: 'STORE_UNAVAILABLE' },
        { status: 503 },
      );
    }
    if (error instanceof SpeakingStoreConflictError) {
      return NextResponse.json({ error: 'Session was updated elsewhere.', code: 'STORE_CONFLICT' }, { status: 409 });
    }
    console.error('[speaking-b2/session.patch]', error);
    return NextResponse.json({ error: 'Could not update session' }, { status: 500 });
  }
}
