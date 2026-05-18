import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { isResendDomainReady } from '@/lib/resendDomainReady';
import { sendSupportTicketViaSmtp } from '@/lib/sendSupportTicketViaSmtp';
import { isSupportSmtpReady } from '@/lib/supportSmtpCredentials';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { userHasRole } from '@/utils/authRoles';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());

async function sendOneEmail({ to, subject, text }) {
  if (isSupportSmtpReady()) {
    const smtp = await sendSupportTicketViaSmtp({ to, subject, text });
    if (smtp.sent) return { ok: true, channel: 'smtp' };
    if (!smtp.skipped) {
      return { ok: false, error: smtp.error || 'Error SMTP' };
    }
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey && (await isResendDomainReady())) {
    const resend = new Resend(apiKey);
    const from = process.env.RESEND_FROM_EMAIL?.trim() || 'soporte@dralo.es';
    const { error } = await resend.emails.send({ from, to: [to], subject, text });
    if (!error) return { ok: true, channel: 'resend' };
    return { ok: false, error: error.message || 'Error Resend' };
  }

  return {
    ok: false,
    error:
      'Correo no configurado. Configura SMTP en /contacto/configurar-correo o RESEND_API_KEY.',
  };
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(getSupabaseUrl(), getSupabaseAnonKey());
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
      return NextResponse.json({ error: 'Sin permiso.' }, { status: 403 });
    }

    const body = await req.json();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const rawTo = Array.isArray(body?.to) ? body.to : body?.to ? [body.to] : [];
    const recipients = [
      ...new Set(
        rawTo.map((e) => String(e || '').trim().toLowerCase()).filter(isValidEmail),
      ),
    ];

    if (!recipients.length) {
      return NextResponse.json({ error: 'No hay destinatarios válidos.' }, { status: 400 });
    }
    if (!subject || !message) {
      return NextResponse.json({ error: 'Asunto y mensaje son obligatorios.' }, { status: 400 });
    }

    const adminName =
      authData.user.user_metadata?.name ||
      authData.user.email?.split('@')[0] ||
      'Administración Dralo';

    const text = [
      message,
      '',
      '—',
      `${adminName} · Dralo English`,
    ].join('\n');

    let sent = 0;
    const errors = [];

    for (const to of recipients) {
      const result = await sendOneEmail({ to, subject, text });
      if (result.ok) {
        sent += 1;
      } else {
        errors.push({ to, error: result.error });
      }
    }

    if (sent === 0) {
      return NextResponse.json(
        {
          error: errors[0]?.error || 'No se pudo enviar ningún correo.',
          sent: 0,
          failed: recipients.length,
          errors,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      sent,
      failed: recipients.length - sent,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error('[admin/send-mail]', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
