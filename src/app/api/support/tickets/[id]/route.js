import { NextResponse } from 'next/server';
import { requireSupportAgent } from '@/lib/supportAuth';
import { parseTicketMeta } from '@/lib/supportTicketParse';
import { TICKET_STATUS } from '@/utils/contactModuleConfig';

const STATUS_MAP = {
  pendiente: TICKET_STATUS.UNANSWERED,
  'sin responder': TICKET_STATUS.UNANSWERED,
  abierto: TICKET_STATUS.OPEN,
  respondido: TICKET_STATUS.ANSWERED,
  resuelto: TICKET_STATUS.CLOSED,
  cerrado: TICKET_STATUS.CLOSED,
};

export async function GET(req, { params }) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = params.id;

  const { data: ticket, error: ticketError } = await auth.db
    .from('contacto_soporte')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (ticketError || !ticket) {
    return NextResponse.json({ error: 'Ticket no encontrado.' }, { status: 404 });
  }

  const { data: messages, error: msgError } = await auth.db
    .from('contacto_mensajes')
    .select('id, emisor_id, receptor_id, mensaje, enviado_en, tipo_mensaje, leido')
    .eq('soporte_ticket_id', id)
    .order('enviado_en', { ascending: true });

  if (msgError) {
    console.error('[support/ticket GET messages]', msgError);
  }

  const meta = parseTicketMeta(ticket);

  return NextResponse.json({
    ticket: {
      ...ticket,
      solicitante_email: ticket.solicitante_email || meta.email,
      solicitante_nombre: ticket.solicitante_nombre || meta.name,
      mensaje_inicial: meta.body,
    },
    messages: messages || [],
  });
}

export async function PATCH(req, { params }) {
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

  const patch = {};
  const rawStatus = String(body?.estado || body?.status || '').toLowerCase().trim();
  if (rawStatus) {
    patch.estado = STATUS_MAP[rawStatus] || body.estado;
    if (patch.estado === TICKET_STATUS.CLOSED) {
      patch.resuelto = true;
      patch.cerrado_en = new Date().toISOString();
    } else {
      patch.resuelto = patch.estado === TICKET_STATUS.CLOSED;
      if (patch.estado !== TICKET_STATUS.CLOSED) {
        patch.cerrado_en = null;
      }
    }
  }

  if (typeof body?.resuelto === 'boolean') {
    patch.resuelto = body.resuelto;
    if (body.resuelto) {
      patch.estado = TICKET_STATUS.CLOSED;
      patch.cerrado_en = new Date().toISOString();
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 });
  }

  const { data, error } = await auth.db
    .from('contacto_soporte')
    .update(patch)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('[support/ticket PATCH]', error);
    return NextResponse.json({ error: 'No se pudo actualizar el ticket.' }, { status: 500 });
  }

  return NextResponse.json({ ticket: data });
}

export async function DELETE(req, { params }) {
  const auth = await requireSupportAgent(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const id = params.id;

  await auth.db.from('contacto_mensajes').delete().eq('soporte_ticket_id', id);

  const { error } = await auth.db.from('contacto_soporte').delete().eq('id', id);

  if (error) {
    console.error('[support/ticket DELETE]', error);
    return NextResponse.json({ error: 'No se pudo borrar el ticket.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
