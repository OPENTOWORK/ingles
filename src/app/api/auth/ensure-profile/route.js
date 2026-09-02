import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';
import { pickRandomMascotVariant } from '@/lib/profileDefaultAvatar';
import { dispatchAutomatedEmail } from '@/lib/dispatchAutomatedEmail';
import { AUTOMATED_EMAIL_TRIGGERS } from '@/lib/automatedEmailTriggers';
import { maybeGrantFoundingMemberPlus } from '@/lib/foundingMemberPlus';

async function grantFoundingPlusForAuthUser(adminClient, user) {
  if (!user?.email) return;
  const nombre =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.nombre ||
    '';
  try {
    const founding = await maybeGrantFoundingMemberPlus(adminClient, {
      userId: user.id,
      email: user.email,
      nombre,
      createdAt: user.created_at,
    });
    if (founding.granted) {
      console.info(
        `api/auth/ensure-profile founding plus: slot ${founding.slotNumber} → ${user.email}`,
      );
    }
  } catch (err) {
    console.error('api/auth/ensure-profile founding plus:', err);
  }
}

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

async function resolveStudentRoleId(adminClient) {
  const candidates = ['Alumno', 'alumno', 'student', 'Student', 'Alumno/a'];
  for (const nombre of candidates) {
    const { data } = await adminClient
      .from('Usuarios_y_Perfil_roles')
      .select('id')
      .eq('nombre', nombre)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  const { data } = await adminClient
    .from('Usuarios_y_Perfil_roles')
    .select('id')
    .ilike('nombre', '%alumn%')
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json({ error: 'Servidor no configurado.' }, { status: 503 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }

    const user = authData.user;
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existing } = await adminClient
      .from('Usuarios_y_Perfil_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existing?.id) {
      const { data: profileRow } = await adminClient
        .from('Usuarios_y_Perfil_profiles')
        .select('mascot_variant')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileRow?.mascot_variant == null) {
        const mascotVariant = pickRandomMascotVariant();
        await adminClient
          .from('Usuarios_y_Perfil_profiles')
          .update({ mascot_variant: mascotVariant })
          .eq('user_id', user.id);
      }

      await grantFoundingPlusForAuthUser(adminClient, user);
      return NextResponse.json({ ok: true, created: false });
    }

    const rolId = await resolveStudentRoleId(adminClient);
    const { error: upsertError } = await adminClient.from('Usuarios_y_Perfil_users').upsert(
      {
        id: user.id,
        email: user.email || null,
        rol_id: rolId,
        activo: true,
      },
      { onConflict: 'id' },
    );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    const mascotVariant = pickRandomMascotVariant();
    await adminClient.from('Usuarios_y_Perfil_profiles').upsert(
      {
        user_id: user.id,
        idioma_preferido: 'es',
        mascot_variant: mascotVariant,
      },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );

    if (user.email) {
      await dispatchAutomatedEmail({
        adminClient,
        triggerEvent: AUTOMATED_EMAIL_TRIGGERS.USER_REGISTERED,
        to: user.email,
        variables: { email: user.email },
      });
    }

    await grantFoundingPlusForAuthUser(adminClient, user);

    return NextResponse.json({ ok: true, created: true });
  } catch (err) {
    console.error('api/auth/ensure-profile:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
