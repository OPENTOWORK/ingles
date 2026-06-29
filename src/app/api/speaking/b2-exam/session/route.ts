import { NextResponse } from 'next/server';
import { requireB2ExamUser } from '@/app/api/speaking/b2-exam/_auth';
import { getB2SpeakingExamBySlot, getB2SpeakingExamById } from '@/data/b2-speaking-exams';
import { createB2ExamSession } from '@/features/speaking/services/b2-exam/b2-exam-session.service';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await requireB2ExamUser(req);
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as { examId?: string; examSlot?: number };
    const examSlot = Number(body.examSlot) || 1;
    const exam = body.examId ? getB2SpeakingExamById(body.examId) : getB2SpeakingExamBySlot(examSlot);
    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    const session = await createB2ExamSession({
      userId: auth.userId,
      examId: exam.id,
      examSlot: exam.examSlot ?? examSlot,
    });

    return NextResponse.json({
      sessionId: session.sessionId,
      persisted: session.persisted,
      examId: exam.id,
      exam: {
        id: exam.id,
        title: exam.title,
        theme: exam.theme,
        estimatedDurationMinutes: exam.estimatedDurationMinutes,
      },
      examState: session.examState,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create B2 exam session' }, { status: 500 });
  }
}

/** Public metadata for exam bank (no session data). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const examSlot = Number(searchParams.get('examSlot')) || 1;
  const exam = getB2SpeakingExamBySlot(examSlot);
  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      theme: exam.theme,
      estimatedDurationMinutes: exam.estimatedDurationMinutes,
      isActive: exam.isActive,
    },
  });
}
