import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPPORT_TICKET_INBOX_EMAIL } from '@/config/support';
import { sendSupportTicketEmail } from '@/lib/sendSupportTicketEmail';
import { sendSupportTicketAckEmail } from '@/lib/sendSupportTicketAckEmail';
import { getUserRoleNameServer, isStudentRole } from '@/lib/userRoleServer';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';
import { DEFAULT_TICKET_TOPIC, TICKET_STATUS, USER_TYPES } from '@/utils/contactModuleConfig';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const supabaseServiceRoleKey = getSupabaseServiceRoleKey();

const VALID_STATUSES = new Set(Object.values(TICKET_STATUS));
const VALID_USER_TYPES = new Set(Object.values(USER_TYPES));

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim().toLowerCase());
}

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'You must sign in.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
    }

    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const subject = String(body?.subject || '').trim();
    const message = String(body?.message || '').trim();
    const userType = String(body?.userType || USER_TYPES.CONFIRMED).trim();
    const status = String(body?.status || TICKET_STATUS.UNANSWERED).trim();
    const topic = String(body?.topic || DEFAULT_TICKET_TOPIC).trim();

    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    if (!VALID_USER_TYPES.has(userType)) {
      return NextResponse.json({ error: 'Invalid user type.' }, { status: 400 });
    }

    const descripcion = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      `Tipo de usuario: ${userType}`,
      '',
      message,
    ].join('\n');

    const baseRow = {
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

    const insertTicket = async (row) =>
      dbClient.from('contacto_soporte').insert(row).select('id').single();

    let { data: ticket, error: insertError } = await insertTicket({
      ...baseRow,
      solicitante_email: email,
      solicitante_nombre: name,
    });

    const missingSolicitanteColumn =
      insertError?.code === 'PGRST204' &&
      /solicitante_(email|nombre)/i.test(insertError?.message || '');

    if (missingSolicitanteColumn) {
      ({ data: ticket, error: insertError } = await insertTicket(baseRow));
    }

    if (insertError) {
      console.error('[contact/tickets] insert failed', insertError);
      const detail =
        process.env.NODE_ENV === 'development' ? insertError.message : undefined;
      return NextResponse.json(
        {
          error: 'Could not save the support ticket.',
          ...(detail ? { detail } : {}),
        },
        { status: 500 },
      );
    }

    const mail = await sendSupportTicketEmail({
      name,
      email,
      userType,
      subject,
      message,
      status,
      topic,
    });

    const inboxDelivered =
      mail.sent && mail.deliveredTo === SUPPORT_TICKET_INBOX_EMAIL;

    if (!inboxDelivered) {
      console.error('[contact/tickets] email not delivered to inbox', mail.error);
    }

    let ackEmailSent = false;
    let ackEmailWarning = null;

    const roleName = await getUserRoleNameServer(authData.user.id, dbClient);
    if (isStudentRole(roleName)) {
      const ack = await sendSupportTicketAckEmail({
        to: email,
        name,
        subject,
        adminClient: supabaseServiceRoleKey?.trim() ? dbClient : null,
      });
      ackEmailSent = ack.sent;
      if (!ack.sent) {
        ackEmailWarning = ack.error || 'Could not send the confirmation email.';
        console.error('[contact/tickets] student ack email failed', ack.error);
      }
    }

    return NextResponse.json({
      success: true,
      ticketId: ticket?.id ?? null,
      emailSent: inboxDelivered,
      emailUsedFallback: mail.usedFallback ?? false,
      deliveredTo: mail.deliveredTo ?? null,
      channel: mail.channel ?? null,
      emailWarning: inboxDelivered ? null : mail.error ?? null,
      ackEmailSent,
      ackEmailWarning,
      inbox: SUPPORT_TICKET_INBOX_EMAIL,
    });
  } catch (err) {
    console.error('[contact/tickets]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
