import { NextResponse } from 'next/server';
import type { CefrLevel, SpeakingMode } from '@prisma/client';
import { runCorrectionEngine } from '@/features/speaking/services/evaluation/correction-engine';
import { saveEvaluation, completeSession } from '@/features/speaking/services/sessions/speaking-session.service';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { runExamFinalReport } from '@/features/speaking/services/evaluation/exam-final-report';

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
    };

    const { sessionId, cefr, mode, taskPrompt } = body;
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    }

    let text = body.combinedTranscript?.trim() || body.text?.trim() || '';

    if (mode === 'EXAM' && !text && hasDatabaseUrl() && !sessionId.startsWith('local_')) {
      const turns = await prisma.speakingTurn.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
      });
      const userLines = turns.filter((t) => t.role === 'USER').map((t) => t.text);
      text = userLines.join('\n\n');
    }

    if (!text) {
      return NextResponse.json({ error: 'No text to evaluate' }, { status: 400 });
    }

    let report;
    if (mode === 'EXAM' || mode === 'PRACTICE') {
      report = await runExamFinalReport({
        cefr,
        combinedTranscript: text,
        context: mode === 'PRACTICE' ? 'practice' : 'exam',
      });
    } else {
      const r = await runCorrectionEngine({ cefr, text, taskPrompt });
      report = r.report;
    }

    await saveEvaluation({
      sessionId,
      turnId: null,
      payload: report,
    });

    await completeSession(sessionId);

    return NextResponse.json({ report });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
