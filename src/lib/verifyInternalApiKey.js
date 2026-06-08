/**
 * Shared auth for /api/internal/* routes.
 * Requires x-internal-key matching a server-only secret (never accept service role as HTTP credential).
 */
export function verifyInternalApiKey(req) {
  const provided = String(req.headers.get('x-internal-key') || '').trim();
  const allowed = [
    process.env.DRALO_INTERNAL_API_KEY,
    process.env.INTERNAL_API_SECRET,
    process.env.OPENAI_API_KEY,
    process.env.RESEND_API_KEY,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  if (!provided || allowed.length === 0 || !allowed.some((key) => key === provided)) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}
