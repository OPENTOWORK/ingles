import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { aiErrorJson } from '@/lib/aiUsageRouteHelpers';

export async function requireB2ExamUser(req: Request) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return {
      ok: false as const,
      response: aiErrorJson(
        'AUTH_REQUIRED',
        'Please log in to use this feature.',
        {},
        401,
      ),
    };
  }
  return {
    ok: true as const,
    userId: auth.user.id,
    userEmail: auth.user.email ?? '',
    accessToken: auth.accessToken ?? null,
  };
}
