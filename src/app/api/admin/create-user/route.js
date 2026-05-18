import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';
import { userHasRole } from '@/utils/authRoles';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

async function sendWelcomeEmail({ email, name, temporaryPassword }) {
  const loginUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';
  const subject = 'Tu cuenta en Dralo English ha sido creada';
  const text = [
    `Hola${name ? ` ${name}` : ''},`,
    '',
    'Tu cuenta ha sido creada por un administrador.',
    `Email: ${email}`,
    `Contraseña temporal: ${temporaryPassword}`,
    '',
    'Te recomendamos cambiar la contraseña en tu perfil tras iniciar sesión.',
    loginUrl ? `Acceso: ${loginUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const smtp = await sendSupportTicketViaSmtp({ to: email, subject, text });
  if (smtp.sent) return { sent: true };

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && (await isResendDomainReady())) {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
    const { error } = await resend.emails.send({ from, to: [email], subject, text });
    if (!error) return { sent: true };
  }

  return { sent: false };
}

export async function POST(req) {
  try {
    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const isAdmin = await userHasRole(
      authData.user.id,
      ['admin', 'administrador'],
      authData.user.email,
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Sin permiso de administrador.' }, { status: 403 });
    }

    const body = await req.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const roleId = String(body?.roleId || '').trim();
    const name = String(body?.name || '').trim();
    const temporaryPassword = String(body?.temporaryPassword || '').trim();

    if (!isValidEmail(email) || !roleId || temporaryPassword.length < 8) {
      return NextResponse.json(
        { error: 'Email, rol y contraseña temporal (mín. 8 caracteres) son obligatorios.' },
        { status: 400 },
      );
    }

    if (!supabaseServiceRoleKey) {
      const fnRes = await fetch(`${supabaseUrl}/functions/v1/admin-create-user`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, roleId, temporaryPassword }),
      });

      let fnPayload = {};
      try {
        fnPayload = await fnRes.json();
      } catch {
        /* no JSON */
      }

      if (!fnRes.ok) {
        return NextResponse.json(
          { error: fnPayload?.error || 'No se pudo crear el usuario (Edge Function).' },
          { status: fnRes.status >= 400 && fnRes.status < 600 ? fnRes.status : 500 },
        );
      }

      const mail = await sendWelcomeEmail({ email, name, temporaryPassword });
      return NextResponse.json({
        success: true,
        userId: fnPayload.userId,
        email,
        emailSent: mail.sent,
        emailWarning: mail.sent
          ? null
          : 'Usuario creado. No se pudo enviar el correo (configura SMTP o Resend).',
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: roleRow } = await adminClient
      .from('Usuarios_y_Perfil_roles')
      .select('id')
      .eq('id', roleId)
      .maybeSingle();

    if (!roleRow?.id) {
      return NextResponse.json({ error: 'El rol seleccionado no existe.' }, { status: 400 });
    }

    const { data: createdUserData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: { name: name || null },
      app_metadata: { invited_by: authData.user.id },
    });

    if (createError || !createdUserData?.user?.id) {
      return NextResponse.json(
        { error: createError?.message || 'No se pudo crear el usuario en Auth.' },
        { status: 400 },
      );
    }

    const createdUserId = createdUserData.user.id;
    const { error: profileError } = await adminClient.from('Usuarios_y_Perfil_users').upsert(
      {
        id: createdUserId,
        email,
        nombre: name || null,
        rol_id: roleId,
        activo: true,
      },
      { onConflict: 'id' },
    );

    if (profileError) {
      console.error('[admin/create-user] profile', profileError);
      return NextResponse.json(
        {
          error: `Usuario creado en Auth pero falló el perfil: ${profileError.message}`,
          userId: createdUserId,
        },
        { status: 500 },
      );
    }

    const mail = await sendWelcomeEmail({ email, name, temporaryPassword });

    return NextResponse.json({
      success: true,
      userId: createdUserId,
      email,
      emailSent: mail.sent,
      emailWarning: mail.sent
        ? null
        : 'Usuario creado. No se pudo enviar el correo (configura SMTP o Resend).',
    });
  } catch (err) {
    console.error('[admin/create-user]', err);
    const message =
      process.env.NODE_ENV === 'development' && err?.message
        ? err.message
        : 'Error interno del servidor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
