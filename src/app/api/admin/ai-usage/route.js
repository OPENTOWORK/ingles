import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import { getAiUsageSummary, getMonthlyAiSpend, checkMonthlyBudget } from '@/lib/aiUsage';

/** Admin-only AI usage and cost summary for the current month. */
export async function GET(req) {
  const admin = await requireAdminFromRequest(req);
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const { searchParams } = new URL(req.url);
  const monthKey = searchParams.get('month') || new Date().toISOString().slice(0, 7);

  const [summary, spend, budget] = await Promise.all([
    getAiUsageSummary(monthKey),
    getMonthlyAiSpend(monthKey),
    checkMonthlyBudget(monthKey),
  ]);

  return NextResponse.json({
    monthKey,
    summary,
    spend,
    budget,
  });
}
