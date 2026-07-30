import { NextResponse } from 'next/server';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';
import { BUZON_REACTION_EMOJIS } from '@/lib/staffBuzonEmojis';

const REACTIONS_TABLE = 'staff_buzon_mensaje_reacciones';

async function userCanAccessMessage(db, userId, messageId) {
  const { data: message, error } = await db
    .from('staff_buzon_mensajes')
    .select('id, sender_id, recipient_id, group_id')
    .eq('id', messageId)
    .maybeSingle();
  if (error) throw error;
  if (!message) return false;

  if (message.sender_id === userId || message.recipient_id === userId) return true;
  if (!message.group_id) return false;

  const { data: membership, error: membershipError } = await db
    .from('staff_buzon_grupo_miembros')
    .select('group_id')
    .eq('group_id', message.group_id)
    .eq('user_id', userId)
    .maybeSingle();
  if (membershipError) throw membershipError;
  return Boolean(membership);
}

export async function POST(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const messageId = String(body?.message_id || '').trim();
    const emoji = String(body?.emoji || '').trim();
    if (!messageId || !BUZON_REACTION_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Reacción no válida.' }, { status: 400 });
    }

    const allowed = await userCanAccessMessage(auth.db, auth.user.id, messageId);
    if (!allowed) {
      return NextResponse.json({ error: 'No tienes acceso a este mensaje.' }, { status: 403 });
    }

    const { data: existing, error: lookupError } = await auth.db
      .from(REACTIONS_TABLE)
      .select('message_id')
      .eq('message_id', messageId)
      .eq('user_id', auth.user.id)
      .eq('emoji', emoji)
      .maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      const { error: deleteError } = await auth.db
        .from(REACTIONS_TABLE)
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', auth.user.id)
        .eq('emoji', emoji);
      if (deleteError) throw deleteError;
      return NextResponse.json({
        reacted: false,
        reaction: { message_id: messageId, user_id: auth.user.id, emoji },
      });
    }

    const reaction = {
      message_id: messageId,
      user_id: auth.user.id,
      emoji,
    };
    const { error: insertError } = await auth.db.from(REACTIONS_TABLE).insert(reaction);
    if (insertError) throw insertError;

    return NextResponse.json({ reacted: true, reaction });
  } catch (error) {
    console.error('[buzon/reactions POST]', error);
    return NextResponse.json({ error: 'No se pudo actualizar la reacción.' }, { status: 500 });
  }
}
