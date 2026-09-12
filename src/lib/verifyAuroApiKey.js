/**
 * Auth for /api/auro/* routes (Auro assistant read-only integrations).
 * Accepts x-auro-api-key or Authorization: Bearer <key>.
 */
export function verifyAuroApiKey(req) {
  const headerKey = String(req.headers.get('x-auro-api-key') || '').trim();
  const authHeader = String(req.headers.get('authorization') || '').trim();
  const bearer =
    authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
  const provided = headerKey || bearer;

  const secret = String(process.env.DRALO_AURO_API_KEY || '').trim();
  if (!secret) {
    return {
      ok: false,
      status: 503,
      error: 'DRALO_AURO_API_KEY no está configurada en el servidor.',
    };
  }

  if (!provided || provided !== secret) {
    return { ok: false, status: 401, error: 'No autorizado.' };
  }

  return { ok: true };
}
