import { NextResponse } from 'next/server';
import { requireB2ExamUser } from '@/app/api/speaking/b2-exam/_auth';
import {
  saveB2ExamTurn,
  updateB2ExamSessionState,
  SpeakingSessionTurnLimitError,
  B2ExamSessionAccessError,
  assertB2ExamSessionOwner,
} from '@/features/speaking/services/b2-exam/b2-exam-session.service';
import type { B2SpeakingSpeakerRole } from '@/features/speaking/domain/b2-speaking-exam-bank.types';
import type { B2SpeakingExamEngineState } from '@/features/speaking/domain/b2-speaking-exam-bank.types';
import { aiErrorJson } from '@/lib/aiUsageRouteHelpers';

export const dynamic = 'force-dynamic';

async function readJsonBody<T>(req: Request): Promise<T | null> {
  try {
    const text = await req.text();
    if (!text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Persist exam turns — script lines + candidate responses. No GPT. No feedback quota. */
export async function POST(req: Request) {
  try {
    const auth = await requireB2ExamUser(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonBody<{
      sessionId: string;
      examId: string;
      partNumber: number;
      turnIndex: number;
      speakerRole: B2SpeakingSpeakerRole;
      text: string;
      transcriptSource?: 'STT' | 'TYPED' | 'MOCK' | 'SCRIPT';
      examState?: B2SpeakingExamEngineState;
    }>(req);

    if (!body?.sessionId || !body.examId || !body.text?.trim()) {
      return NextResponse.json({ error: 'sessionId, examId and text required' }, { status: 400 });
    }

    await assertB2ExamSessionOwner(body.sessionId, auth.userId);

    const speakerRole = body.speakerRole ?? 'candidate';
    const transcriptSource = body.transcriptSource ?? (speakerRole === 'candidate' ? 'TYPED' : 'SCRIPT');

    if (speakerRole !== 'candidate' && body.examState) {
      await updateB2ExamSessionState(body.sessionId, body.examState);
    }

    const result = await saveB2ExamTurn({
      sessionId: body.sessionId,
      examId: body.examId,
      partNumber: body.partNumber,
      turnIndex: body.turnIndex,
      speakerRole,
      text: body.text.trim(),
      transcriptSource,
      examState: body.examState,
    });

    return NextResponse.json({
      ok: true,
      candidateTurnCount: result.candidateTurnCount,
    });
  } catch (e) {
    if (e instanceof SpeakingSessionTurnLimitError) {
      return NextResponse.json(
        { error: e.message, code: e.code },
        { status: 429 },
      );
    }
    if (e instanceof B2ExamSessionAccessError) {
      return aiErrorJson(e.code, e.message, {}, 403);
    }
    console.error(e);
    return NextResponse.json({ error: 'Failed to save turn' }, { status: 500 });
  }
}
