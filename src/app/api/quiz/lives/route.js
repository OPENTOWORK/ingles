import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getStudentPlanContext } from '@/lib/planAccess';
import { readTrainingLives, spendTrainingLife } from '@/lib/trainingLivesServer';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

async function contextFor(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) return { error: NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401, headers: noStore }) };
  const ctx = await getStudentPlanContext(auth.user.id, auth.user.email ?? '', auth.user.user_metadata);
  return { userId: auth.user.id, ctx };
}

function livesError(error) {
  console.warn('[quiz/lives]', error?.code || '', error?.message || error);
  return NextResponse.json({ error: 'LIVES_UNAVAILABLE' }, { status: 503, headers: noStore });
}

/** Vidas del Quiz (gratis: 3, se recupera 1 cada 10 h). */
export async function GET(req) {
  const auth = await contextFor(req);
  if (auth.error) return auth.error;
  try {
    const status = await readTrainingLives(auth.userId, auth.ctx, 'quiz');
    return NextResponse.json(status, { headers: noStore });
  } catch (error) {
    return livesError(error);
  }
}

/** Gasta una vida al fallar una pregunta del quiz. */
export async function POST(req) {
  const auth = await contextFor(req);
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  if (body?.action !== 'lose') {
    return NextResponse.json({ error: 'BAD_REQUEST' }, { status: 400, headers: noStore });
  }

  try {
    const status = await spendTrainingLife(auth.userId, auth.ctx, 'quiz');
    return NextResponse.json(status, { headers: noStore });
  } catch (error) {
    return livesError(error);
  }
}
