import { NextResponse } from 'next/server';
import { getServerUser } from '@/lib/auth/session';

export async function requireUser(): Promise<
  { ok: true; userId: string } | { ok: false; response: NextResponse }
> {
  const user = await getServerUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { ok: true, userId: user.id };
}

/** Optional auth: sessions can be anonymous when user not logged in. */
export async function optionalUserId(): Promise<string | null> {
  const user = await getServerUser();
  return user?.id ?? null;
}
