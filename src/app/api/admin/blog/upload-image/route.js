import { NextResponse } from 'next/server';
import { requireBlogAdminFromRequest } from '@/lib/adminApiAuth';
import {
  BLOG_IMAGE_BUCKET,
  buildBlogImageStoragePath,
  getBlogImagePublicUrl,
  validateBlogImageFile,
} from '@/lib/blogImageStorage';
import { getBlogAdminDb } from '@/lib/blogArticles';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await requireBlogAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const articleId = String(formData.get('articleId') || 'drafts').trim() || 'drafts';
    const kind = String(formData.get('kind') || 'inline').trim();
    const safeKind = ['cover', 'inline', 'og'].includes(kind) ? kind : 'inline';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo de imagen.' }, { status: 400 });
    }

    const validation = validateBlogImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const path = buildBlogImageStoragePath(articleId, file.type, safeKind);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await getBlogAdminDb().storage
      .from(BLOG_IMAGE_BUCKET)
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
        cacheControl: '31536000',
      });

    if (uploadError) {
      const msg = uploadError.message || 'No se pudo subir la imagen.';
      const hint = /bucket|not found|does not exist/i.test(msg)
        ? ' Crea el bucket blog-images en Supabase.'
        : '';
      return NextResponse.json({ error: msg + hint }, { status: 500 });
    }

    const imageUrl = getBlogImagePublicUrl(getBlogAdminDb(), path);
    return NextResponse.json({ ok: true, imageUrl, path, kind: safeKind });
  } catch (err) {
    console.error('[admin/blog/upload-image POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
