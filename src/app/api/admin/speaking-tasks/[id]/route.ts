import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { isServerAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isServerAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const data: Prisma.SpeakingTaskUpdateInput = {};
  if (body.title != null) data.title = String(body.title);
  if (body.cefr != null) data.cefr = body.cefr as Prisma.SpeakingTaskUpdateInput['cefr'];
  if (body.examType != null) data.examType = body.examType as Prisma.SpeakingTaskUpdateInput['examType'];
  if (body.part != null) data.part = Number(body.part);
  if (body.prompt != null) data.prompt = String(body.prompt);
  if (body.followUpQuestions != null) {
    data.followUpQuestions = body.followUpQuestions as Prisma.InputJsonValue;
  }
  if (body.targetVocabulary != null) {
    data.targetVocabulary = body.targetVocabulary as Prisma.InputJsonValue;
  }
  if (body.timeLimitSec !== undefined) {
    data.timeLimitSec = body.timeLimitSec == null ? null : Number(body.timeLimitSec);
  }
  if (body.taskType != null) data.taskType = body.taskType as Prisma.SpeakingTaskUpdateInput['taskType'];
  if (body.published != null) data.published = Boolean(body.published);

  const task = await prisma.speakingTask.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json({ task });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isServerAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 503 });
  }
  await prisma.speakingTask.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
