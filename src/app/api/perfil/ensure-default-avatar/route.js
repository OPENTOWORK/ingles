import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { pickRandomMascotVariant } from '@/lib/profileDefaultAvatar';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const serviceKey = getSupabaseServiceRoleKey();
    const supabaseUrl = getSupabaseUrl();
    if (!serviceKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server not configured.' }, { status: 503 });
    }

    const userId = auth.user.id;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existing } = await admin
      .from('Usuarios_y_Perfil_profiles')
      .select('id, mascot_variant')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.mascot_variant != null) {
      return NextResponse.json({ mascotVariant: existing.mascot_variant, created: false });
    }

    const mascotVariant = pickRandomMascotVariant();

    if (existing?.id) {
      const { error } = await admin
        .from('Usuarios_y_Perfil_profiles')
        .update({ mascot_variant: mascotVariant })
        .eq('user_id', userId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ mascotVariant, created: false });
    }

    const { error } = await admin.from('Usuarios_y_Perfil_profiles').insert({
      user_id: userId,
      idioma_preferido: 'es',
      mascot_variant: mascotVariant,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mascotVariant, created: true });
  } catch (err) {
    console.error('[perfil/ensure-default-avatar]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
