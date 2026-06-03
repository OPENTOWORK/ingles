import { NextResponse } from 'next/server';
import { evaluateCambridgeEssay } from '@/lib/cambridgeEssayFeedback';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const result = await evaluateCambridgeEssay({
    essay: body.essay,
    level: body.level,
    taskContext: body.taskContext,
    structuredExamContext: body.structuredExamContext,
    wordMin: body.wordMin,
    wordMax: body.wordMax,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    feedback: result.feedback,
    scores: result.scores,
  });
}
