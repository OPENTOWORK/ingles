import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  PROFILE_AVATAR_BUCKET,
  buildProfileAvatarStoragePath,
  getProfileAvatarPublicUrl,
  validateProfileAvatarFile,
} from '@/lib/profileAvatarStorage';
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

    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo de imagen.' }, { status: 400 });
    }

    const validation = validateProfileAvatarFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const userId = auth.user.id;
    const path = buildProfileAvatarStoragePath(userId, file.type);
    const buffer = Buffer.from(await file.arrayBuffer());

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: uploadError } = await admin.storage
      .from(PROFILE_AVATAR_BUCKET)
      .upload(path, buffer, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      const msg = uploadError.message || 'No se pudo subir la imagen.';
      const hint = /bucket|not found|does not exist/i.test(msg)
        ? ' Crea el bucket profile-avatars en Supabase (scripts/setup-profile-avatars-storage.sql).'
        : '';
      return NextResponse.json({ error: msg + hint }, { status: 500 });
    }

    const avatarUrl = getProfileAvatarPublicUrl(admin, path);

    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id, fecha_nacimiento, idioma_preferido, biografia')
      .eq('user_id', userId)
      .maybeSingle();

    const profilePayload = {
      user_id: userId,
      foto_url: avatarUrl,
      fecha_nacimiento: existingProfile?.fecha_nacimiento ?? null,
      idioma_preferido: existingProfile?.idioma_preferido ?? 'es',
      biografia: existingProfile?.biografia ?? null,
    };
    if (existingProfile?.id) {
      profilePayload.id = existingProfile.id;
    }

    let profileError = null;
    if (existingProfile?.id) {
      const { error } = await admin
        .from('profiles')
        .update({ foto_url: avatarUrl })
        .eq('user_id', userId);
      profileError = error;
    } else {
      const { error } = await admin.from('profiles').insert(profilePayload);
      profileError = error;
    }

    if (profileError) {
      const msg = profileError.message || '';
      if (/foto_url|column/i.test(msg)) {
        return NextResponse.json(
          {
            error:
              'No se pudo guardar la URL de la foto en el perfil. Revisa la tabla Usuarios_y_Perfil_profiles.',
            avatarUrl,
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    try {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { ...(auth.user.user_metadata || {}), avatar_url: avatarUrl },
      });
    } catch {
      /* opcional */
    }

    return NextResponse.json({ avatarUrl });
  } catch (err) {
    console.error('[perfil/avatar]', err);
    return NextResponse.json({ error: 'Error interno al subir la foto.' }, { status: 500 });
  }
}
