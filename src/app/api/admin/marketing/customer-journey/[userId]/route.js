import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { fetchCustomerJourneyForUser } from '@/lib/marketing/crm/eventsServer';

export async function GET(req, { params }) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = String(params?.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'userId requerido.' }, { status: 400 });
    }

    const useMock = req.nextUrl.searchParams.get('mock') === '1';
    const journey = await fetchCustomerJourneyForUser(userId, { db: auth.db, useMock });

    return NextResponse.json(journey);
  } catch (err) {
    console.error('[api/admin/marketing/customer-journey] GET', err);
    const isMissingTable = /marketing_/i.test(err.message || '');
    if (isMissingTable) {
      const userId = String(params?.userId || '');
      const useMock = req.nextUrl.searchParams.get('mock') === '1';
      if (useMock) {
        const { getMockCustomerJourney } = await import('@/lib/marketing/crm/eventsServer');
        return NextResponse.json(getMockCustomerJourney(userId));
      }
      return NextResponse.json({
        hasData: false,
        userId,
        migrationPending: true,
        error: 'Migración marketing pendiente. Ejecuta create_marketing_crm_phase1.sql.',
      });
    }
    return NextResponse.json(
      { error: err.message || 'No se pudo cargar el customer journey.' },
      { status: 500 },
    );
  }
}
