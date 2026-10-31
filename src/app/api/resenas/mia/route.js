import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getOwnSiteReview } from '@/lib/siteReviews';

export async function GET(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: 'Inicia sesión para ver tu reseña.' }, { status: 401 });
  }

  const result = await getOwnSiteReview(auth.user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ review: result.review });
}
