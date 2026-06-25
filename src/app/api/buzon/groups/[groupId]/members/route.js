import { NextResponse } from 'next/server';
import {
  requireStaffBuzonAccess,
  userIsGroupCreator,
  userIsGroupMember,
  userIsStaffBuzonRecipient,
} from '@/lib/staffBuzonAccess';

const GROUP_SELECT = 'id, name, description, created_by, created_at';

async function loadGroupWithMembers(db, groupId) {
  const { data: group, error } = await db
    .from('staff_buzon_grupos')
    .select(GROUP_SELECT)
    .eq('id', groupId)
    .maybeSingle();

  if (error) throw error;
  if (!group) return null;

  const { data: members, error: membersError } = await db
    .from('staff_buzon_grupo_miembros')
    .select('user_id')
    .eq('group_id', groupId);

  if (membersError) throw membersError;

  return {
    ...group,
    member_ids: (members || []).map((row) => row.user_id),
  };
}

export async function POST(req, { params }) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const groupId = String(params?.groupId || '').trim();
    const { user, db } = auth;
    const isCreator = await userIsGroupCreator(db, user.id, groupId);
    if (!isCreator) {
      return NextResponse.json({ error: 'Solo el creador puede añadir miembros.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const userIds = Array.isArray(body?.user_ids)
      ? [...new Set(body.user_ids.map((id) => String(id).trim()).filter(Boolean))]
      : body?.user_id
        ? [String(body.user_id).trim()]
        : [];

    if (!userIds.length) {
      return NextResponse.json({ error: 'Selecciona al menos un miembro.' }, { status: 400 });
    }

    for (const memberId of userIds) {
      const allowed = await userIsStaffBuzonRecipient(memberId, db);
      if (!allowed) {
        return NextResponse.json({ error: 'Algún miembro no es válido.' }, { status: 400 });
      }
    }

    const rows = userIds.map((memberId) => ({ group_id: groupId, user_id: memberId }));
    const { error } = await db
      .from('staff_buzon_grupo_miembros')
      .upsert(rows, { onConflict: 'group_id,user_id', ignoreDuplicates: true });

    if (error) {
      console.error('[buzon/groups members POST]', error);
      return NextResponse.json({ error: 'No se pudieron añadir los miembros.' }, { status: 500 });
    }

    const group = await loadGroupWithMembers(db, groupId);
    return NextResponse.json({ group });
  } catch (error) {
    console.error('[buzon/groups members POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const groupId = String(params?.groupId || '').trim();
    const { user, db } = auth;
    const body = await req.json().catch(() => ({}));
    const targetUserId = String(body?.user_id || user.id).trim();

    const isCreator = await userIsGroupCreator(db, user.id, groupId);
    const isSelf = targetUserId === user.id;

    if (!isSelf && !isCreator) {
      return NextResponse.json({ error: 'No tienes permiso para expulsar miembros.' }, { status: 403 });
    }

    if (isCreator && isSelf) {
      return NextResponse.json(
        { error: 'El creador no puede abandonar el grupo. Elimínalo o transfiérelo.' },
        { status: 400 },
      );
    }

    const isMember = await userIsGroupMember(db, targetUserId, groupId);
    if (!isMember) {
      return NextResponse.json({ error: 'Ese usuario no está en el grupo.' }, { status: 400 });
    }

    const { error } = await db
      .from('staff_buzon_grupo_miembros')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', targetUserId);

    if (error) {
      console.error('[buzon/groups members DELETE]', error);
      return NextResponse.json({ error: 'No se pudo quitar al miembro.' }, { status: 500 });
    }

    if (isSelf) {
      return NextResponse.json({ left: true });
    }

    const group = await loadGroupWithMembers(db, groupId);
    return NextResponse.json({ group });
  } catch (error) {
    console.error('[buzon/groups members DELETE]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
