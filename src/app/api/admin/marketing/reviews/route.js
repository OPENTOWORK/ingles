import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { listSiteReviewsForStaff, setSiteReviewPublished } from '@/lib/siteReviews';

const REVIEW_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(req) {
  const auth = await authenticateMarketingPlanAdminRequest(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const result = await listSiteReviewsForStaff();
  if (!result.ok) {
    return NextResponse.json({ error: 'No se han podido cargar las reseñas.' }, { status: 500 });
  }
  return NextResponse.json({ reviews: result.reviews });
}

export async function PATCH(req) {
  const auth = await authenticateMarketingPlanAdminRequest(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const id = String(body.id || '');
  if (!REVIEW_ID.test(id) || typeof body.published !== 'boolean') {
    return NextResponse.json({ error: 'No se ha podido actualizar la reseña.' }, { status: 400 });
  }

  const result = await setSiteReviewPublished(id, body.published);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}
