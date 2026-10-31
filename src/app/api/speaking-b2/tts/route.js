import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { examinerLineIsAuthorised } from '@/features/speaking-b2-motor/services/coordinator';
import {
  SPEAKING_B2_EXAM_CODE,
  getSpeakingB2Examiner,
} from '@/features/speaking-b2-motor/domain/question-bank/sp-ex001-part1';
import { normaliseSpeakingB2Line } from '@/features/speaking-b2-motor/domain/examiner-script';
import {
  authorizeSpeakingSession,
  readSpeakingAccessToken,
} from '@/features/speaking-b2-motor/services/session-auth';
import { loadSpeakingB2Session } from '@/features/speaking-b2-motor/services/session-store';
import { voiceSpeakingB2ExaminerLine } from '@/features/speaking-b2-motor/services/examiner-voice';
import { speakingB2LanGuardResponse } from '@/features/speaking-b2-motor/services/lan-access-http';

export const runtime = 'nodejs';

/** Follow-ups written for the candidate are spoken only in the session that produced them. */
async function examinerSaidLineInSession(req, body, text) {
  const sessionId = String(body?.sessionId || '').trim();
  if (!sessionId) return false;
  try {
    const session = await loadSpeakingB2Session(sessionId);
    const auth = await getSupabaseUserFromRequest(req);
    const access = authorizeSpeakingSession(session, {
      userId: auth?.user?.id || null,
      accessToken: readSpeakingAccessToken(req, body),
    });
    if (!access.ok) return false;
    const target = normaliseSpeakingB2Line(text);
    return (session.turns || []).some(
      (turn) => turn.role === 'examiner' && normaliseSpeakingB2Line(turn.transcript) === target,
    );
  } catch {
    return false;
  }
}

export async function POST(req) {
  const denied = speakingB2LanGuardResponse(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const text = String(body?.text || '').trim();
    const examCode = body?.examCode || SPEAKING_B2_EXAM_CODE;
    if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    if (!examinerLineIsAuthorised(examCode, text) && !(await examinerSaidLineInSession(req, body, text))) {
      return NextResponse.json({ error: 'Text is not an authorised examiner line' }, { status: 400 });
    }

    const examiner = getSpeakingB2Examiner(body?.examinerId);
    const started = Date.now();
    const spoken = await voiceSpeakingB2ExaminerLine(text, examiner);
    if (!spoken?.audio?.length) {
      return NextResponse.json({ error: 'TTS unavailable' }, { status: 503 });
    }

    console.info('[speaking-b2/tts] used', {
      examiner: examiner.id,
      engine: spoken.engine,
      voice: spoken.voice,
      model: spoken.model,
      fallback: spoken.fallback,
      elapsedMs: Date.now() - started,
    });

    return new NextResponse(spoken.audio, {
      status: 200,
      headers: {
        'Content-Type': spoken.mime,
        'Cache-Control': 'no-store',
        'x-speaking-tts-engine': spoken.engine,
        'x-speaking-tts-voice': spoken.voice,
        'x-speaking-tts-fallback': spoken.fallback ? '1' : '0',
      },
    });
  } catch (error) {
    console.error('[speaking-b2/tts]', error);
    return NextResponse.json({ error: 'TTS failed' }, { status: 502 });
  }
}
