import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';

/**
 * Autoriza ingest de eventos:
 * - Header x-marketing-ingest-key === MARKETING_INGEST_SECRET
 * - O sesión staff admin/marketing (para pruebas internas)
 */
export async function authenticateMarketingIngestRequest(req) {
  const secret = process.env.MARKETING_INGEST_SECRET?.trim();
  const headerKey = req.headers.get('x-marketing-ingest-key')?.trim();

  if (secret && headerKey && headerKey === secret) {
    return { ok: true, mode: 'ingest_key' };
  }

  const staff = await authenticateMarketingPlanAdminRequest(req);
  if (!staff.error) {
    return { ok: true, mode: 'staff', db: staff.db, user: staff.user };
  }

  if (!secret) {
    return {
      ok: false,
      error: 'Servicio de ingest no configurado.',
      status: 503,
    };
  }

  return { ok: false, error: 'No autorizado.', status: 401 };
}
