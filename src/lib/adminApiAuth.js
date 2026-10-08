import { authenticateAdminRequest, authenticateBlogAdminRequest, authenticateExamPartPromptRequest } from '@/lib/adminAccess';

/** @param {Request} req */
export async function requireModuleFromRequest(req, permissionKeys) {
  const auth = await authenticateAdminRequest(req, permissionKeys);
  if (auth.error) {
    return { ok: false, status: auth.status, error: auth.error };
  }
  return { ok: true, user: auth.user, adminDb: auth.db };
}

export async function requireAdminFromRequest(req) {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return { ok: false, status: auth.status, error: auth.error };
  }
  return { ok: true, user: auth.user, adminDb: auth.db };
}

/** @param {Request} req */
export async function requireBlogAdminFromRequest(req) {
  const auth = await authenticateBlogAdminRequest(req);
  if (auth.error) {
    return { ok: false, status: auth.status, error: auth.error };
  }
  return { ok: true, user: auth.user, adminDb: auth.db };
}

/** @param {Request} req */
export async function requireExamPartPromptAccessFromRequest(req) {
  const auth = await authenticateExamPartPromptRequest(req);
  if (auth.error) {
    return { ok: false, status: auth.status, error: auth.error };
  }
  return { ok: true, user: auth.user, adminDb: auth.db };
}
