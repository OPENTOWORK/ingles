import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { fetchClarityInsights } from '@/lib/clarityDataExport';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const numOfDays = Number(searchParams.get('numOfDays') || 3);
    const forceRefresh = searchParams.get('refresh') === '1';

    const result = await fetchClarityInsights({
      numOfDays,
      dimension1: 'URL',
      forceRefresh,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: result.status || 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[admin/clarity-analytics]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
