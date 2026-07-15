import { NextResponse } from 'next/server';
import { requireBlogAdminFromRequest } from '@/lib/adminApiAuth';
import {
  createBlogArticle,
  deleteBlogArticle,
  fetchAllBlogArticles,
  mapClientFormToPayload,
  updateBlogArticle,
} from '@/lib/blogArticles';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireBlogAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const articles = await fetchAllBlogArticles(auth.adminDb);
    return NextResponse.json({ articles });
  } catch (err) {
    console.error('[admin/blog GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireBlogAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const article = await createBlogArticle(auth.adminDb, {
      ...mapClientFormToPayload(body),
      authorId: auth.user.id,
    });

    return NextResponse.json({ ok: true, article });
  } catch (err) {
    console.error('[admin/blog POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await requireBlogAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del contenido.' }, { status: 400 });
    }

    const article = await updateBlogArticle(auth.adminDb, id, mapClientFormToPayload(body));
    return NextResponse.json({ ok: true, article });
  } catch (err) {
    console.error('[admin/blog PATCH]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireBlogAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del contenido.' }, { status: 400 });
    }

    await deleteBlogArticle(auth.adminDb, id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/blog DELETE]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
