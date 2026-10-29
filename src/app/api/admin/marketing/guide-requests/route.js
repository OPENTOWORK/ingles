import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data, error } = await auth.db
      .from('guia_b2_solicitudes')
      .select('id, email, accepted_marketing, created_at, last_requested_at, request_count')
      .order('last_requested_at', { ascending: false });

    if (error) throw error;

    const requests = (data || [])
      .map((row) => ({
        id: row.id,
        email: String(row.email || '').trim(),
        marketingAccepted: row.accepted_marketing === true,
        createdAt: row.created_at,
        lastRequestedAt: row.last_requested_at,
        requestCount: Number(row.request_count) || 1,
      }))
      .filter((row) => row.email);

    return NextResponse.json({ requests });
  } catch (err) {
    console.error('[api/admin/marketing/guide-requests] GET', err);
    return NextResponse.json(
      { error: err.message || 'No se pudo cargar el listado de la guía.' },
      { status: 500 },
    );
  }
}
