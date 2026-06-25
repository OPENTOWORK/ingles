import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { userCanAccessStaffBuzon } from '@/lib/staffBuzonAccess';
import {
  BUZON_ATTACHMENT_BUCKET,
  validateBuzonAttachmentFile,
} from '@/lib/staffBuzonAttachments';
import {
  buildBuzonAttachmentStoragePath,
  getBuzonAttachmentPublicUrl,
} from '@/lib/staffBuzonAttachmentsServer';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const serviceKey = getSupabaseServiceRoleKey();
    const supabaseUrl = getSupabaseUrl();
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Servidor no configurado.' }, { status: 503 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const allowed = await userCanAccessStaffBuzon(auth.user.id, auth.user.email, admin);
    if (!allowed) {
      return NextResponse.json({ error: 'No tienes acceso al Buzón.' }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo.' }, { status: 400 });
    }

    const validation = validateBuzonAttachmentFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const path = buildBuzonAttachmentStoragePath(auth.user.id, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(BUZON_ATTACHMENT_BUCKET)
      .upload(path, buffer, {
        upsert: false,
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('[buzon/attachments POST]', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'No se pudo subir el archivo.' },
        { status: 500 },
      );
    }

    const attachmentUrl = getBuzonAttachmentPublicUrl(admin, path);

    return NextResponse.json({
      attachment_url: attachmentUrl,
      attachment_name: file.name,
      attachment_mime: file.type,
      attachment_kind: validation.kind,
    });
  } catch (error) {
    console.error('[buzon/attachments POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
