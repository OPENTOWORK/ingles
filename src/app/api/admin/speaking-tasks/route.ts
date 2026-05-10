import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { isServerAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isServerAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured', tasks: [] }, { status: 200 });
  }
  const tasks = await prisma.speakingTask.findMany({ orderBy: [{ cefr: 'asc' }, { part: 'asc' }] });
  return NextResponse.json({ tasks });
}

export async function POST(req: Request) {
  if (!(await isServerAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const task = await prisma.speakingTask.create({
    data: {
      title: String(body.title ?? ''),
      cefr: body.cefr as 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
      examType: body.examType as 'KEY' | 'PET' | 'FIRST' | 'ADVANCED' | 'PROFICIENCY',
      part: Number(body.part ?? 1),
      prompt: String(body.prompt ?? ''),
      followUpQuestions: (body.followUpQuestions as Prisma.InputJsonValue) ?? [],
      targetVocabulary: (body.targetVocabulary as Prisma.InputJsonValue) ?? [],
      timeLimitSec: body.timeLimitSec != null ? Number(body.timeLimitSec) : null,
      taskType: body.taskType as
        | 'INTERVIEW'
        | 'LONG_TURN'
        | 'COLLABORATIVE'
        | 'DISCUSSION'
        | 'OTHER',
      published: Boolean(body.published ?? true),
    },
  });
  return NextResponse.json({ task });
}
