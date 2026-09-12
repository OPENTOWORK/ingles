import { NextResponse } from 'next/server';
import { loadStaffTasksPanelSnapshot } from '@/lib/staffTasksPanelSnapshot';
import { verifyAuroApiKey } from '@/lib/verifyAuroApiKey';

/**
 * Read-only snapshot of the Dralo staff tasks panel for Auro assistant.
 *
 * GET /api/auro/staff-tasks
 * Auth: x-auro-api-key: <DRALO_AURO_API_KEY>  OR  Authorization: Bearer <key>
 *
 * Query params (optional):
 * - estado: pendiente | en_progreso | completada | vencida | ...
 * - assigneeId: UUID del responsable
 */
export async function GET(req) {
  const auth = verifyAuroApiKey(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const snapshot = await loadStaffTasksPanelSnapshot({
      estado: searchParams.get('estado'),
      assigneeId: searchParams.get('assigneeId'),
    });

    return NextResponse.json(snapshot);
  } catch (err) {
    console.error('[auro/staff-tasks GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
