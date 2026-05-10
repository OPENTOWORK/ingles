import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasDatabaseUrl } from '@/lib/prisma';
import { isServerAdmin } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isServerAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!hasDatabaseUrl()) {
    return NextResponse.json({ byCefrMode: [], taskCount: 0 });
  }
  const byCefrMode = await prisma.speakingSession.groupBy({
    by: ['cefr', 'mode'],
    _count: { id: true },
  });
  const taskCount = await prisma.speakingTask.count();
  return NextResponse.json({ byCefrMode, taskCount });
}
