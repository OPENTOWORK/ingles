import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  AI_ACTIONS,
  getDailyUsageSnapshot,
} from '@/lib/aiUsage';

export const dynamic = 'force-dynamic';

/** GET daily AI usage status for visible alpha limits (students + teachers). */
export async function GET(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }

  const userId = auth.user.id;
  const userEmail = auth.user.email ?? '';
  const limitOpts = { userEmail, accessToken: auth.accessToken };

  const [writing, speaking] = await Promise.all([
    getDailyUsageSnapshot(userId, AI_ACTIONS.EXAM_WRITING_CORRECTION, limitOpts),
    getDailyUsageSnapshot(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, limitOpts),
  ]);

  return NextResponse.json(
    { writing, speaking },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    },
  );
}
