import { NextResponse } from 'next/server';
import {
  requireStaffBuzonAccess,
  userIsStaffBuzonRecipient,
} from '@/lib/staffBuzonAccess';
import { getBuzonAttachmentDefaultBody } from '@/lib/staffBuzonAttachments';
import { sendBuzonMessagePushNotifications } from '@/lib/staffBuzonPush';

export const runtime = 'nodejs';

const MESSAGE_SELECT =
  'id, sender_id, recipient_id, group_id, body, created_at, read_at, attachment_url, attachment_name, attachment_mime, attachment_kind';

async function getUserGroupIds(db, userId) {
  const { data, error } = await db
    .from('staff_buzon_grupo_miembros')
    .select('group_id')
    .eq('user_id', userId);

  if (error) throw error;
  return [...new Set((data || []).map((row) => row.group_id))];
}

async function userIsGroupMember(db, userId, groupId) {
  const { data, error } = await db
    .from('staff_buzon_grupo_miembros')
    .select('group_id')
    .eq('user_id', userId)
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const groupIds = await getUserGroupIds(db, user.id);

    const orParts = [`sender_id.eq.${user.id}`, `recipient_id.eq.${user.id}`];
    if (groupIds.length) {
      orParts.push(`group_id.in.(${groupIds.join(',')})`);
    }

    const { data, error } = await db
      .from('staff_buzon_mensajes')
      .select(MESSAGE_SELECT)
      .or(orParts.join(','))
      .order('created_at', { ascending: true })
      .limit(2000);

    if (error) {
      console.error('[buzon/messages GET]', error);
      return NextResponse.json({ error: 'No se pudieron cargar los mensajes.' }, { status: 500 });
    }

    const { data: stars, error: starsError } = await db
      .from('staff_buzon_mensajes_destacados')
      .select('message_id')
      .eq('user_id', user.id);

    if (starsError) {
      console.error('[buzon/messages GET stars]', starsError);
      return NextResponse.json({ error: 'No se pudieron cargar los mensajes.' }, { status: 500 });
    }

    const messageIds = (data || []).map((message) => message.id);
    let reactions = [];
    if (messageIds.length) {
      const { data: reactionRows, error: reactionsError } = await db
        .from('staff_buzon_mensaje_reacciones')
        .select('message_id, user_id, emoji, created_at')
        .in('message_id', messageIds);
      if (reactionsError) {
        console.error('[buzon/messages GET reactions]', reactionsError);
        return NextResponse.json({ error: 'No se pudieron cargar las reacciones.' }, { status: 500 });
      }
      reactions = reactionRows || [];
    }

    return NextResponse.json({
      messages: data || [],
      starred_ids: (stars || []).map((row) => row.message_id),
      reactions,
    });
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
    const groupId = String(body?.group_id || '').trim();
    const messageBody = String(body?.body || '').trim();
    const attachmentUrl = String(body?.attachment_url || '').trim() || null;
    const attachmentName = String(body?.attachment_name || '').trim() || null;
    const attachmentMime = String(body?.attachment_mime || '').trim() || null;
    const attachmentKind = String(body?.attachment_kind || '').trim() || null;

    if (!messageBody && !attachmentUrl) {
      return NextResponse.json({ error: 'Escribe un mensaje o adjunta un archivo.' }, { status: 400 });
    }

    if (attachmentUrl && !['image', 'document', 'audio'].includes(attachmentKind || '')) {
      return NextResponse.json({ error: 'Tipo de adjunto no válido.' }, { status: 400 });
    }

    const attachmentFields = attachmentUrl
      ? {
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_mime: attachmentMime,
          attachment_kind: attachmentKind,
        }
      : {
          attachment_url: null,
          attachment_name: null,
          attachment_mime: null,
          attachment_kind: null,
        };

    const finalBody =
      messageBody ||
      attachmentName ||
      getBuzonAttachmentDefaultBody(attachmentKind || 'document');

    let insertRow = null;

    if (groupId) {
      const isMember = await userIsGroupMember(db, user.id, groupId);
      if (!isMember) {
        return NextResponse.json({ error: 'No perteneces a este grupo.' }, { status: 403 });
      }
      insertRow = {
        sender_id: user.id,
        group_id: groupId,
        recipient_id: null,
        body: finalBody,
        ...attachmentFields,
      };
    } else if (recipientId) {
      if (recipientId === user.id) {
        return NextResponse.json({ error: 'No puedes enviarte un mensaje a ti mismo.' }, { status: 400 });
      }
      const recipientAllowed = await userIsStaffBuzonRecipient(recipientId, db);
      if (!recipientAllowed) {
        return NextResponse.json({ error: 'Destinatario no válido.' }, { status: 400 });
      }
      insertRow = {
        sender_id: user.id,
        recipient_id: recipientId,
        group_id: null,
        body: finalBody,
        ...attachmentFields,
      };
    } else {
      return NextResponse.json({ error: 'Destinatario o grupo obligatorio.' }, { status: 400 });
    }

    const { data, error } = await db
      .from('staff_buzon_mensajes')
      .insert(insertRow)
      .select(MESSAGE_SELECT)
      .single();

    if (error) {
      console.error('[buzon/messages POST]', error);
      return NextResponse.json({ error: 'No se pudo enviar el mensaje.' }, { status: 500 });
    }

    try {
      const [senderResult, groupResult] = await Promise.all([
        db
          .from('Usuarios_y_Perfil_users')
          .select('nombre, email')
          .eq('id', user.id)
          .maybeSingle(),
        data.group_id
          ? db.from('staff_buzon_grupos').select('name').eq('id', data.group_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (senderResult.error) throw senderResult.error;
      if (groupResult.error) throw groupResult.error;

      await sendBuzonMessagePushNotifications({
        db,
        message: data,
        senderName:
          senderResult.data?.nombre?.trim() ||
          senderResult.data?.email?.split('@')[0] ||
          'Dralo',
        groupName: groupResult.data?.name || '',
      });
    } catch (pushError) {
      // The chat message is already saved; a push failure must not turn a successful send into an error.
      console.error('[buzon/messages POST push]', pushError);
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
      .is('group_id', null)
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
