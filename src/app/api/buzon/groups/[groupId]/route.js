import { NextResponse } from 'next/server';
import {
  requireStaffBuzonAccess,
  userIsGroupCreator,
} from '@/lib/staffBuzonAccess';

const GROUP_SELECT = 'id, name, description, created_by, created_at';

export async function PATCH(req, { params }) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const groupId = String(params?.groupId || '').trim();
    if (!groupId) {
      return NextResponse.json({ error: 'Grupo no válido.' }, { status: 400 });
    }

    const { user, db } = auth;
    const isCreator = await userIsGroupCreator(db, user.id, groupId);
    if (!isCreator) {
      return NextResponse.json({ error: 'Solo el creador puede editar el grupo.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const updates = {};
    if (body.name !== undefined) {
      const name = String(body.name || '').trim();
      if (!name) {
        return NextResponse.json({ error: 'El nombre no puede estar vacío.' }, { status: 400 });
      }
      updates.name = name;
    }
    if (body.description !== undefined) {
      const description = String(body.description || '').trim();
      updates.description = description || null;
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 });
    }

    const { data, error } = await db
      .from('staff_buzon_grupos')
      .update(updates)
      .eq('id', groupId)
      .select(GROUP_SELECT)
      .single();

    if (error) {
      console.error('[buzon/groups PATCH]', error);
      return NextResponse.json({ error: 'No se pudo actualizar el grupo.' }, { status: 500 });
    }

    const { data: members } = await db
      .from('staff_buzon_grupo_miembros')
      .select('user_id')
      .eq('group_id', groupId);

    return NextResponse.json({
      group: { ...data, member_ids: (members || []).map((row) => row.user_id) },
    });
  } catch (error) {
    console.error('[buzon/groups PATCH]', error);
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
    if (!groupId) {
      return NextResponse.json({ error: 'Grupo no válido.' }, { status: 400 });
    }

    const { user, db } = auth;
    const isCreator = await userIsGroupCreator(db, user.id, groupId);
    if (!isCreator) {
      return NextResponse.json({ error: 'Solo el creador puede eliminar el grupo.' }, { status: 403 });
    }

    const { error } = await db.from('staff_buzon_grupos').delete().eq('id', groupId);
    if (error) {
      console.error('[buzon/groups DELETE]', error);
      return NextResponse.json({ error: 'No se pudo eliminar el grupo.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[buzon/groups DELETE]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
