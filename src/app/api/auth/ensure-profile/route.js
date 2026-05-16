import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

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

    return NextResponse.json({ ok: true, created: true });
  } catch (err) {
    console.error('api/auth/ensure-profile:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
