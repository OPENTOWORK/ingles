import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  checkSiteReview,
  createSiteReview,
  deleteOwnSiteReview,
  listPublishedSiteReviews,
  updateOwnSiteReview,
} from '@/lib/siteReviews';

async function requireUser(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) return null;
  return auth.user;
}

function readJson(req) {
  return req.json().catch(() => ({}));
}

export async function GET() {
  const result = await listPublishedSiteReviews();
  if (!result.ok && result.error === 'no_db') {
    return NextResponse.json({ reviews: [] });
  }
  if (!result.ok) {
    return NextResponse.json({ error: 'No se han podido cargar las reseñas.' }, { status: 500 });
  }
  return NextResponse.json({ reviews: result.reviews });
}

export async function POST(req) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Inicia sesión para publicar tu reseña.' }, { status: 401 });
  }

  const body = await readJson(req);
  const checked = checkSiteReview(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
  if (checked.honeypot) return NextResponse.json({ ok: true });

  const result = await createSiteReview({ userId: user.id, ...checked.review });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }
  return NextResponse.json({ ok: true, review: result.review });
}

export async function PATCH(req) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Inicia sesión para editar tu reseña.' }, { status: 401 });
  }

  const body = await readJson(req);
  const checked = checkSiteReview(body);
  if (!checked.ok) return NextResponse.json({ error: checked.error }, { status: 400 });
  if (checked.honeypot) return NextResponse.json({ ok: true });

  const result = await updateOwnSiteReview({ userId: user.id, ...checked.review });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }
  return NextResponse.json({ ok: true, review: result.review });
}

export async function DELETE(req) {
  const user = await requireUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Inicia sesión para eliminar tu reseña.' }, { status: 401 });
  }

  const result = await deleteOwnSiteReview(user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status || 500 });
  }
  return NextResponse.json({ ok: true });
}
