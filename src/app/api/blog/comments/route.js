import { NextResponse } from 'next/server';
import {
  createBlogArticleComment,
  fetchBlogArticleComments,
  getBlogCommentsAdminDb,
} from '@/lib/blogComments';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const articleId = String(req.nextUrl.searchParams.get('articleId') || '').trim();
    if (!articleId) {
      return NextResponse.json({ error: 'Falta el identificador del artículo.' }, { status: 400 });
    }

    const comments = await fetchBlogArticleComments(articleId);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error('[blog/comments] GET failed', err);
    return NextResponse.json({ error: 'No se pudieron cargar los comentarios.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para comentar.' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const articleId = String(body?.articleId || '').trim();
    const commentBody = String(body?.body || '');

    if (!articleId) {
      return NextResponse.json({ error: 'Falta el identificador del artículo.' }, { status: 400 });
    }

    const adminDb = getBlogCommentsAdminDb();
    const comment = await createBlogArticleComment(adminDb, {
      articleId,
      userId: auth.user.id,
      email: auth.user.email || '',
      body: commentBody,
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    const message = err?.message || 'No se pudo publicar el comentario.';
    const status = /demasiado corto|no puede superar|no encontrado/i.test(message) ? 400 : 500;
    if (status === 500) console.error('[blog/comments] POST failed', err);
    return NextResponse.json({ error: message }, { status });
  }
}
