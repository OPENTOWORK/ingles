import { authenticateAdminRequest } from '@/lib/adminAccess';

/** @param {Request} req */
export async function requireAdminFromRequest(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return { ok: false, status: auth.status, error: auth.error };
  }
  return { ok: true, user: auth.user, adminDb: auth.db };
}
