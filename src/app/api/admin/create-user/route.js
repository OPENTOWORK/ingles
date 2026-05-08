import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const ADMIN_EMAIL = 'direccion@opentowork.com';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const buildClients = () => ({
  authClient: createClient(supabaseUrl, supabaseAnonKey),
  adminClient: createClient(supabaseUrl, supabaseServiceRoleKey),
});

const isAdminUser = async (user, adminClient) => {
  if (!user?.id) return false;
  if ((user.email || '').toLowerCase() === ADMIN_EMAIL) return true;

  const { data: userRow, error: userError } = await adminClient
    .from('Usuarios_y_Perfil_users')
    .select('rol_id')
    .eq('id', user.id)
    .single();

  if (userError || !userRow?.rol_id) return false;

  const { data: roleRow, error: roleError } = await adminClient
    .from('Usuarios_y_Perfil_roles')
    .select('nombre')
    .eq('id', userRow.rol_id)
    .single();

  if (roleError || !roleRow?.nombre) return false;
  const role = roleRow.nombre.toLowerCase();
  return role === 'admin' || role === 'administrador';
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

export async function POST(req) {
  try {
    const { authClient, adminClient } = buildClients();

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase para crear usuarios.' },
        { status: 500 }
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canCreateUsers = await isAdminUser(authData.user, adminClient);
    if (!canCreateUsers) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const roleId = String(body?.roleId || '').trim();
    const name = String(body?.name || '').trim();
    const temporaryPassword = String(body?.temporaryPassword || '').trim();

    if (!isValidEmail(email) || !roleId || temporaryPassword.length < 8) {
      return NextResponse.json(
        { error: 'Campos inválidos: email, roleId y temporaryPassword son obligatorios.' },
        { status: 400 }
      );
    }

    const { data: createdUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: false,
      user_metadata: {
        name: name || null,
      },
      app_metadata: {
        invited_by: authData.user.id,
      },
    });

    if (createError || !createdUserData?.user?.id) {
      return NextResponse.json(
        { error: createError?.message || 'No se pudo crear el usuario en Auth.' },
        { status: 400 }
      );
    }

    const createdUserId = createdUserData.user.id;
    const profilePayload = {
      id: createdUserId,
      email,
      nombre: name || null,
      rol_id: roleId,
      activo: true,
    };
    const { error: profileError } = await adminClient
      .from('Usuarios_y_Perfil_users')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      return NextResponse.json(
        { error: `Usuario creado en Auth pero falló perfil: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const loginUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [email],
        subject: 'Tu cuenta en English Practice ha sido creada',
        text: [
          `Hola${name ? ` ${name}` : ''},`,
          '',
          'Tu cuenta ha sido creada por un administrador.',
          `Email: ${email}`,
          `Password temporal: ${temporaryPassword}`,
          '',
          'Te recomendamos cambiar la contraseña en tu perfil tras iniciar sesión.',
          loginUrl ? `Acceso: ${loginUrl}` : '',
        ].filter(Boolean).join('\n'),
      });
    }

    return NextResponse.json({
      success: true,
      userId: createdUserId,
      email,
    });
  } catch (err) {
    console.error('Error in admin create-user route:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
