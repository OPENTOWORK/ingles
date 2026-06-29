import { NextResponse } from 'next/server';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { runCorrectionEngine } from '@/features/speaking/services/evaluation/correction-engine';
import { saveEvaluation, completeSession } from '@/features/speaking/services/sessions/speaking-session.service';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { AI_ACTIONS, getDailyUsageSnapshot } from '@/lib/aiUsage';
import { aiErrorJson, runAiPreflight } from '@/lib/aiUsageRouteHelpers';
import { handleExamSpeakingFeedback } from '@/lib/aiActionHandlers';
import { resolveSpeakingExamTranscript } from '@/features/speaking/services/evaluation/resolve-speaking-exam-transcript';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      sessionId: string;
      cefr: CefrLevel;
      mode: SpeakingMode;
      text?: string;
      combinedTranscript?: string;
      taskPrompt?: string;
      examId?: string;
      isPartialEvaluation?: boolean;
      evidenceMetadata?: {
        partsCompleted?: number[];
        startedAt?: string;
        endedAt?: string;
        responseDurationsSec?: number[];
      };
      partsCompleted?: number[];
      startedAt?: string;
      endedAt?: string;
      responseDurationsSec?: number[];
    };

    const { sessionId, cefr, mode, taskPrompt } = body;
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    let text = body.combinedTranscript?.trim() || body.text?.trim() || '';

    if (mode === 'EXAM' && sessionId) {
      text = await resolveSpeakingExamTranscript({
        sessionId,
        examId: body.examId ?? null,
        combinedTranscript: text,
      });
    }

    if (!text) {
      return NextResponse.json({ error: 'No text to evaluate' }, { status: 400 });
    }

    const auth = await getSupabaseUserFromRequest(req);
    const userId = auth?.user?.id ?? null;

    let report;
    let usage = null;

    if (mode === 'EXAM') {
      if (!userId) {
        return aiErrorJson(
          'AUTH_REQUIRED',
          'Please log in to use this feature.',
          {},
          401,
        );
      }

      const aiCtx = {
        userEmail: auth?.user?.email ?? '',
        accessToken: auth?.accessToken ?? null,
      };

      const preflight = await runAiPreflight(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, aiCtx);
      if (!preflight.ok) return preflight.response;

      const out = await handleExamSpeakingFeedback(
        userId,
        {
          combinedTranscript: text,
          level: cefr,
          sessionId,
          context: 'exam',
          evidenceMetadata: body.evidenceMetadata ?? {
            partsCompleted: body.partsCompleted,
            startedAt: body.startedAt,
            endedAt: body.endedAt,
            responseDurationsSec: body.responseDurationsSec,
          },
        },
        aiCtx,
      );

      if (!out.ok) {
        return NextResponse.json({ error: out.error || 'Evaluation failed' }, { status: out.status || 500 });
      }

      report = out.result?.report;
      usage = await getDailyUsageSnapshot(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, aiCtx);
    } else if (mode === 'PRACTICE') {
      const { runExamFinalReport } = await import('@/features/speaking/services/evaluation/exam-final-report');
      report = await runExamFinalReport({
        cefr,
        combinedTranscript: text,
        context: 'practice',
      });
    } else {
      const r = await runCorrectionEngine({ cefr, text, taskPrompt });
      report = r.report;
    }

    await saveEvaluation({
      sessionId,
      turnId: null,
      payload: {
        ...report,
        meta: {
          examId: body.examId ?? null,
          sessionId,
          cefr,
          savedAt: new Date().toISOString(),
          speakingScoreTotal: report?.b2Speaking?.total ?? null,
          estimatedLevel: report?.b2Speaking?.estimatedLevel ?? null,
          source: 'ai_feedback',
          isPartialEvaluation:
            body.isPartialEvaluation ??
            report?.isPartialEvaluation ??
            report?.partialFeedback ??
            /\[Not completed|may be missing or incomplete/i.test(text),
          canProvideFullScore: report?.canProvideFullScore ?? null,
        },
      },
    });

    await completeSession(sessionId);

    return NextResponse.json(usage ? { report, usage } : { report });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
