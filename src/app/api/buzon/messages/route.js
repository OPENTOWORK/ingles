import { NextResponse } from 'next/server';
import {
  requireStaffBuzonAccess,
  userIsStaffBuzonRecipient,
} from '@/lib/staffBuzonAccess';

const MESSAGE_SELECT =
  'id, sender_id, recipient_id, body, created_at, read_at';

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const { data, error } = await db
      .from('staff_buzon_mensajes')
      .select(MESSAGE_SELECT)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: true })
      .limit(1000);

    if (error) {
      console.error('[buzon/messages GET]', error);
      return NextResponse.json({ error: 'No se pudieron cargar los mensajes.' }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error('[buzon/messages GET]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const body = await req.json().catch(() => ({}));
    const recipientId = String(body?.recipient_id || '').trim();
    const messageBody = String(body?.body || '').trim();

    if (!recipientId) {
      return NextResponse.json({ error: 'Destinatario obligatorio.' }, { status: 400 });
    }
    if (!messageBody) {
      return NextResponse.json({ error: 'El mensaje no puede estar vacío.' }, { status: 400 });
    }
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'No puedes enviarte un mensaje a ti mismo.' }, { status: 400 });
    }

    const recipientAllowed = await userIsStaffBuzonRecipient(recipientId, db);
    if (!recipientAllowed) {
      return NextResponse.json({ error: 'Destinatario no válido.' }, { status: 400 });
    }

    const { data, error } = await db
      .from('staff_buzon_mensajes')
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        body: messageBody,
      })
      .select(MESSAGE_SELECT)
      .single();

    if (error) {
      console.error('[buzon/messages POST]', error);
      return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
    }

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('[buzon/messages POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const body = await req.json().catch(() => ({}));
    const partnerId = String(body?.partner_id || '').trim();
    if (!partnerId) {
      return NextResponse.json({ error: 'Conversación no válida.' }, { status: 400 });
    }

    const readAt = new Date().toISOString();
    const { data, error } = await db
      .from('staff_buzon_mensajes')
      .update({ read_at: readAt })
      .eq('recipient_id', user.id)
      .eq('sender_id', partnerId)
      .is('read_at', null)
      .select('id');

    if (error) {
      console.error('[buzon/messages PATCH]', error);
      return NextResponse.json({ error: 'No se pudo marcar como leído.' }, { status: 500 });
    }

    return NextResponse.json({ ids: (data || []).map((row) => row.id), read_at: readAt });
  } catch (error) {
    console.error('[buzon/messages PATCH]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
