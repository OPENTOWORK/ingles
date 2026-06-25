import { NextResponse } from 'next/server';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';

export async function POST(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const body = await req.json().catch(() => ({}));
    const messageId = String(body?.message_id || '').trim();

    if (!messageId) {
      return NextResponse.json({ error: 'Mensaje no válido.' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await db
      .from('staff_buzon_mensajes_destacados')
      .select('message_id')
      .eq('user_id', user.id)
      .eq('message_id', messageId)
      .maybeSingle();

    if (existingError) {
      console.error('[buzon/stars POST lookup]', existingError);
      return NextResponse.json({ error: 'No se pudo actualizar el destacado.' }, { status: 500 });
    }

    if (existing) {
      const { error: deleteError } = await db
        .from('staff_buzon_mensajes_destacados')
        .delete()
        .eq('user_id', user.id)
        .eq('message_id', messageId);

      if (deleteError) {
        console.error('[buzon/stars POST delete]', deleteError);
        return NextResponse.json({ error: 'No se pudo quitar el destacado.' }, { status: 500 });
      }

      return NextResponse.json({ starred: false, message_id: messageId });
    }

    const { error: insertError } = await db.from('staff_buzon_mensajes_destacados').insert({
      user_id: user.id,
      message_id: messageId,
    });

    if (insertError) {
      console.error('[buzon/stars POST insert]', insertError);
      return NextResponse.json({ error: 'No se pudo destacar el mensaje.' }, { status: 500 });
    }

    return NextResponse.json({ starred: true, message_id: messageId });
  } catch (error) {
    console.error('[buzon/stars POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
