import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { fetchMarketingPlanDashboard } from '@/lib/marketingPlanServer';

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const dashboard = await fetchMarketingPlanDashboard(auth.db);
    return NextResponse.json(dashboard);
  } catch (err) {
    console.error('[api/admin/plan-marketing] GET', err);
    return NextResponse.json(
      { error: err.message || 'No se pudo cargar el plan de marketing.' },
      { status: 500 },
    );
  }
}
