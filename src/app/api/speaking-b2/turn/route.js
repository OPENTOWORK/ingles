import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  beginIntroduction,
  beginListening,
  beginAsking,
  resolveSpeakingB2Turn,
  markPausedTechnical,
  markAborted,
  markFailed,
  examinerLineIsAuthorised,
  predictSpeakingB2UpcomingLines,
  speakingB2FollowUpContext,
  speakingB2IntroLine,
  startAudioCheck,
} from '@/features/speaking-b2-motor/services/coordinator';
import { composeSpeakingB2ExaminerMove } from '@/features/speaking-b2-motor/services/contextual-follow-up';
import {
  voiceSpeakingB2ExaminerLine,
  withSpeakingB2Timeout,
} from '@/features/speaking-b2-motor/services/examiner-voice';
import {
  SPEAKING_B2_FOLLOW_UP_VALIDATION,
  speakingB2GeneratedLineIsSafe,
} from '@/features/speaking-b2-motor/domain/contextual-follow-up';
import {
  authorizeSpeakingSession,
  readSpeakingAccessToken,
} from '@/features/speaking-b2-motor/services/session-auth';
import {
  SpeakingStoreConflictError,
  SpeakingStoreUnavailableError,
  loadSpeakingB2Session,
  persistSpeakingB2Turns,
  updatePersistedSession,
} from '@/features/speaking-b2-motor/services/session-store';
import { persistSpeakingB2Audio } from '@/features/speaking-b2-motor/services/audio/persist';
import { transcribeCandidateAudio } from '@/features/speaking-b2-motor/services/evaluation/transcribe-acoustic';
import { resolveSpeakingB2AnswerAudio } from '@/features/speaking-b2-motor/services/evaluation/answer-audio';
import { canUseSpeakingB2FixtureAnswer } from '@/features/speaking-b2-motor/fixtures/runtime';
import { resolveSpeakingB2FixtureAudio } from '@/features/speaking-b2-motor/fixtures/materialize';
import {
  SPEAKING_B2_INTRODUCTION,
  getSpeakingB2Examiner,
} from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';
import { canSubmitSpeakingB2TypedAnswer } from '@/features/speaking-b2-motor/services/typed-answer-access';
import { synthesizeExamTtsMp3 } from '@/lib/levelsExamTts';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';
import { getRoleNameByUserId, isAdminRole } from '@/utils/authRoles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const INLINE_VOICE_WAIT_MS = 6000;

async function speakingB2RequestIsAdmin(auth) {
  if (!auth?.user) return false;
  try {
    return isAdminRole(await getRoleNameByUserId(auth.user.id, auth.user.email));
  } catch {
    return false;
  }
}

async function readBody(req) {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const audio = form.get('audio');
    let buffer = null;
    let mimeType = 'audio/webm';
    if (audio && typeof audio === 'object' && typeof audio.arrayBuffer === 'function') {
      buffer = Buffer.from(await audio.arrayBuffer());
      mimeType = audio.type || mimeType;
    }
    return {
      sessionId: String(form.get('sessionId') || ''),
      action: String(form.get('action') || 'answer'),
      accessToken: String(form.get('accessToken') || ''),
      speakingMs: Number(form.get('speakingMs') || 0),
      silence: form.get('silence') === 'true',
      fixtureId: String(form.get('fixtureId') || ''),
      buffer,
      mimeType,
    };
  }
  return req.json();
}

export async function POST(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await readBody(req);
    const session = await loadSpeakingB2Session(body.sessionId);
    const auth = await getSupabaseUserFromRequest(req);
    const access = authorizeSpeakingSession(session, {
      userId: auth?.user?.id || null,
      accessToken: readSpeakingAccessToken(req, body),
    });
    if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });

    if (body.action === 'abort') {
      const next = await updatePersistedSession(markAborted(session));
      return NextResponse.json({ state: next.state, done: true });
    }
    if (body.action === 'fail') {
      const next = await updatePersistedSession(markFailed(session));
      return NextResponse.json({ state: next.state, done: true });
    }
    if (body.action === 'pause-technical') {
      const next = await updatePersistedSession(markPausedTechnical(session));
      return NextResponse.json({ state: next.state });
    }

    const examinerId = getSpeakingB2Examiner(session.plan?.examinerId).id;

    if (body.action === 'start') {
      if (['INTRODUCTION', 'ASKING', 'LISTENING'].includes(session.state)) {
        const lastLine = [...(session.turns || [])]
          .reverse()
          .find((turn) => turn.role === 'examiner' && turn.transcript);
        return NextResponse.json({
          state: session.state,
          examinerText: lastLine?.transcript || speakingB2IntroLine(session),
          questionId: session.currentQuestionId || lastLine?.questionId || SPEAKING_B2_INTRODUCTION.id,
          examinerId,
          resumed: true,
        });
      }
      const ready = session.state === 'READY' ? startAudioCheck(session) : session;
      const opened = beginIntroduction(ready);
      opened.session.turns = [
        ...(opened.session.turns || []),
        {
          role: 'examiner',
          questionId: opened.questionId,
          transcript: opened.examinerText,
          source: 'SCRIPT',
        },
      ];
      const next = await updatePersistedSession(opened.session);
      await persistSpeakingB2Turns(next);
      if (!examinerLineIsAuthorised(next.examCode, opened.examinerText)) {
        return NextResponse.json({ error: 'Unauthorised examiner line' }, { status: 500 });
      }
      return NextResponse.json({
        state: next.state,
        examinerText: opened.examinerText,
        questionId: opened.questionId,
        examinerId,
      });
    }

    if (body.action === 'listen') {
      const next = await updatePersistedSession(beginListening(session));
      return NextResponse.json({ state: next.state, upcoming: predictSpeakingB2UpcomingLines(next) });
    }

    if (!['LISTENING', 'INTRODUCTION', 'ASKING', 'TURN_VALIDATION'].includes(session.state)) {
      return NextResponse.json(
        { error: 'Not accepting an answer in this state.', code: 'INVALID_STATE' },
        { status: 409 },
      );
    }
    if (session.answerInFlight) {
      return NextResponse.json({ error: 'Answer already being saved.', code: 'IN_FLIGHT' }, { status: 409 });
    }
    session.answerInFlight = true;
    await updatePersistedSession(session);

    try {
      let answerBuffer = body.buffer || null;
      let answerMime = body.mimeType || '';
      let loaded = null;
      if (body.fixtureId) {
        if (!canUseSpeakingB2FixtureAnswer(session)) {
          return NextResponse.json({ error: 'Forbidden', code: 'FIXTURE_FORBIDDEN' }, { status: 403 });
        }
        loaded = await resolveSpeakingB2FixtureAudio(String(body.fixtureId), {
          synthesize: (text) =>
            synthesizeExamTtsMp3(text, { edgeVoice: 'en-GB-SoniaNeural', preferEdge: true }),
        });
        if (!loaded) {
          return NextResponse.json({ error: 'Unknown fixture', code: 'FIXTURE_UNKNOWN' }, { status: 404 });
        }
        if (!loaded.available) {
          return NextResponse.json(
            { error: 'No intelligible speech audio is available for this fixture.', code: loaded.reason || 'NO_SPEECH_AUDIO' },
            { status: 422 },
          );
        }
        answerBuffer = loaded.buffer;
        answerMime = loaded.mimeType;
      }

      let stt;
      if (answerBuffer || body.fixtureId) {
        const resolved = await resolveSpeakingB2AnswerAudio({
          buffer: answerBuffer,
          mimeType: answerMime,
          transcribe: transcribeCandidateAudio,
          declaredKind: loaded?.fixture?.kind || '',
          speakingMs: Number(body.speakingMs || 0),
        });
        if (!resolved.ok) {
          const status = resolved.code === 'STT_FAILED' ? 502 : 400;
          return NextResponse.json(
            { error: resolved.error || 'Invalid audio.', code: resolved.code },
            { status },
          );
        }
        stt = resolved.stt;
      } else if (body.transcript) {
        const allowTyped = canSubmitSpeakingB2TypedAnswer({
          session,
          isAdmin: await speakingB2RequestIsAdmin(auth),
        });
        if (!allowTyped) {
          return NextResponse.json(
            { error: 'Typed answers are not allowed in a live exam.', code: 'TYPED_FORBIDDEN' },
            { status: 403 },
          );
        }
        stt = {
          text: String(body.transcript || ''),
          source: 'TYPED',
          confidence: 0.9,
          hasAudio: false,
          uncertain: false,
        };
      } else {
        stt = {
          text: '',
          source: 'STT',
          confidence: 0,
          hasAudio: false,
          uncertain: true,
        };
      }

      const silence = body.silence || !stt.text;
      const [stored, examinerMove] = await Promise.all([
        persistSpeakingB2Audio({
          userId: session.userId,
          sessionId: session.id,
          buffer: answerBuffer,
          mimeType: answerMime,
        }),
        composeSpeakingB2ExaminerMove(
          speakingB2FollowUpContext(session, {
            transcript: stt.text,
            speakingMs: Number(body.speakingMs || 0),
            silence,
            uncertain: stt.uncertain,
          }),
        ),
      ]);

      session.turns = [
        ...(session.turns || []),
        {
          role: 'candidate',
          questionId: session.currentQuestionId,
          transcript: stt.text,
          source: stt.source,
          confidence: stt.confidence,
          uncertain: stt.uncertain,
          hallucination: Boolean(stt.hallucination),
          hasAudio: Boolean(stt.hasAudio),
          audioPath: stored?.path || null,
          speakingMs: Number(body.speakingMs || 0),
        },
      ];

      const resolved = resolveSpeakingB2Turn({
        session,
        transcript: stt.text,
        speakingMs: Number(body.speakingMs || 0),
        silence,
        examinerMove,
      });

      if (resolved.examinerText) {
        const allowed = resolved.generated
          ? speakingB2GeneratedLineIsSafe(resolved.examinerText)
          : examinerLineIsAuthorised(session.examCode, resolved.examinerText);
        if (!allowed) {
          return NextResponse.json({ error: 'Unauthorised examiner line' }, { status: 500 });
        }
        resolved.session.turns.push({
          role: 'examiner',
          questionId: resolved.questionId,
          transcript: resolved.examinerText,
          source: 'SCRIPT',
          ...(resolved.generated ? { validation: SPEAKING_B2_FOLLOW_UP_VALIDATION } : {}),
        });
      }

      if (resolved.session.state === 'ASKING' && resolved.examinerText) {
        resolved.session = beginAsking(resolved.session, resolved.examinerText, resolved.questionId);
      }

      // Scripted lines are prefetched by the client; a generated one is voiced while the turn is saved.
      const voicing = resolved.generated
        ? voiceSpeakingB2ExaminerLine(resolved.examinerText, getSpeakingB2Examiner(session.plan?.examinerId))
        : null;
      resolved.session.answerInFlight = false;
      await persistSpeakingB2Turns(resolved.session);
      const next = await updatePersistedSession(resolved.session);
      const voiced = voicing
        ? await withSpeakingB2Timeout(voicing, INLINE_VOICE_WAIT_MS).catch(() => null)
        : null;
      return NextResponse.json({
        state: next.state,
        examinerText: resolved.examinerText,
        questionId: resolved.questionId,
        validation: resolved.validation,
        done: Boolean(resolved.done),
        transcript: stt.text,
        uncertain: stt.uncertain,
        sttSource: stt.source,
        examinerAudio: voiced?.audio?.length
          ? { base64: voiced.audio.toString('base64'), mime: voiced.mime }
          : undefined,
      });
    } finally {
      const latest = await loadSpeakingB2Session(session.id);
      if (latest?.answerInFlight) {
        latest.answerInFlight = false;
        await updatePersistedSession(latest);
      }
    }
  } catch (error) {
    if (error instanceof SpeakingStoreUnavailableError) {
      console.error('[speaking-b2/turn] store', error.message);
      return NextResponse.json({ error: 'Speaking storage is not ready.', code: 'STORE_UNAVAILABLE' }, { status: 503 });
    }
    if (error instanceof SpeakingStoreConflictError) {
      return NextResponse.json({ error: 'Session was updated elsewhere.', code: 'STORE_CONFLICT' }, { status: 409 });
    }
    console.error('[speaking-b2/turn]', error?.code || error?.message || 'Turn failed');
    return NextResponse.json(
      { error: error.message || 'Turn failed', code: error.code },
      { status: 500 },
    );
  }
}
