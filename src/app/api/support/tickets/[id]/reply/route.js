import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';
import { parseTicketMeta } from '@/lib/supportTicketParse';
import { sendSupportReplyEmail } from '@/lib/sendSupportReplyEmail';
import { TICKET_STATUS } from '@/utils/contactModuleConfig';

export async function POST(req, { params }) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = params.id;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  const message = String(body?.message || '').trim();
  if (!message) {
    return NextResponse.json({ error: 'Escribe un mensaje.' }, { status: 400 });
  }

  const { data: ticket, error: ticketError } = await auth.db
    .from('contacto_soporte')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado.' }, { status: 404 });
  }

  const meta = parseTicketMeta(ticket);
  const toEmail = ticket.solicitante_email || meta.email;
  if (!toEmail) {
    return NextResponse.json({ error: 'Este ticket no tiene email de contacto.' }, { status: 400 });
  }

  const agentName =
    auth.user.user_metadata?.name || auth.user.email?.split('@')[0] || 'Soporte Dralo';

  const mail = await sendSupportReplyEmail({
    to: toEmail,
    ticketSubject: ticket.asunto,
    message,
    agentName,
    adminClient: auth.adminClient,
  });

  const now = new Date().toISOString();

  const { error: msgError } = await auth.db.from('contacto_mensajes').insert({
    emisor_id: auth.user.id,
    receptor_id: ticket.user_id,
    mensaje: message,
    enviado_en: now,
    leido: false,
    tipo_conversacion: 'Alumno/soporte',
    tipo_mensaje: 'respuesta_soporte',
    soporte_ticket_id: id,
  });

  if (msgError) {
    console.error('[support/reply] message insert', msgError);
  }

  const closeTicket = Boolean(body?.markResolved);
  const { data: updated, error: updateError } = await auth.db
    .from('contacto_soporte')
    .update({
      estado: closeTicket ? TICKET_STATUS.CLOSED : TICKET_STATUS.ANSWERED,
      resuelto: closeTicket,
      cerrado_en: closeTicket ? now : null,
      ultimo_mensaje_en: now,
    })
    .eq('id', id)
    .select()
    .maybeSingle();

  if (updateError) {
    console.error('[support/reply] ticket update', updateError);
  }

  return NextResponse.json({
    ok: true,
    emailSent: mail.sent,
    emailError: mail.error || null,
    ticket: updated,
    message: mail.sent
      ? `Respuesta enviada a ${toEmail}`
      : `Mensaje guardado. Email no enviado: ${mail.error || 'SMTP no configurado'}`,
  });
}
