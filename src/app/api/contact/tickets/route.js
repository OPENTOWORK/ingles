import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';
import SupportTicketEmail from '@/components/SupportTicketEmail';
import { TICKET_STATUS, USER_TYPES } from '@/utils/contactModuleConfig';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

const VALID_STATUSES = new Set(Object.values(TICKET_STATUS));
const VALID_USER_TYPES = new Set(Object.values(USER_TYPES));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
}

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase.' },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Debes iniciar sesión.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const userType = String(body?.userType || USER_TYPES.CONFIRMED).trim();
    const status = String(body?.status || TICKET_STATUS.UNANSWERED).trim();
    const topic = String(body?.topic || 'uso de la plataforma').trim();

    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 });
    }
    if (!VALID_USER_TYPES.has(userType)) {
      return NextResponse.json({ error: 'Tipo de usuario no válido.' }, { status: 400 });
    }

    const descripcion = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Tipo de usuario: ${userType}`,
      '',
      message,
    ].join('\n');

    const row = {
      user_id: authData.user.id,
      asunto: subject,
      descripcion,
      estado: status,
      tipo_problema: topic,
      prioridad: 'normal',
      resuelto: false,
    };

    const dbClient = supabaseServiceRoleKey?.trim()
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const { data: ticket, error: insertError } = await dbClient
      .from('contacto_soporte')
      .insert(row)
      .select('id')
      .single();

    if (insertError) {
      console.error('[contact/tickets] insert failed', insertError);
      return NextResponse.json(
        { error: 'No se pudo guardar el ticket de soporte.' },
        { status: 500 },
      );
    }

    let emailSent = false;
    if (process.env.RESEND_API_KEY?.trim()) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: sendError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [SUPPORT_TICKET_INBOX_EMAIL],
        replyTo: email,
        subject: `[Soporte] ${subject}`,
        react: SupportTicketEmail({
          name,
          email,
          userType,
          subject,
          message,
          status,
          topic,
        }),
      });

      if (sendError) {
        console.error('[contact/tickets] email failed', sendError);
      } else {
        emailSent = true;
      }
    } else {
      console.warn('[contact/tickets] RESEND_API_KEY missing; ticket saved without email');
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket?.id ?? null,
      emailSent,
      inbox: SUPPORT_TICKET_INBOX_EMAIL,
    });
  } catch (err) {
    console.error('[contact/tickets]', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
