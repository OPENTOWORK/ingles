import { NextResponse } from 'next/server';
import {
  requireStaffBuzonAccess,
  userIsStaffBuzonRecipient,
} from '@/lib/staffBuzonAccess';

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;

    const { data: memberships, error: memberError } = await db
      .from('staff_buzon_grupo_miembros')
      .select('group_id')
      .eq('user_id', user.id);

    if (memberError) {
      console.error('[buzon/groups GET memberships]', memberError);
      return NextResponse.json({ error: 'No se pudieron cargar los grupos.' }, { status: 500 });
    }

    const groupIds = [...new Set((memberships || []).map((row) => row.group_id))];
    if (!groupIds.length) {
      return NextResponse.json({ groups: [] });
    }

    const { data: groups, error: groupError } = await db
      .from('staff_buzon_grupos')
      .select('id, name, description, created_by, created_at')
      .in('id', groupIds)
      .order('created_at', { ascending: false });

    if (groupError) {
      console.error('[buzon/groups GET groups]', groupError);
      return NextResponse.json({ error: 'No se pudieron cargar los grupos.' }, { status: 500 });
    }

    const { data: allMembers, error: allMembersError } = await db
      .from('staff_buzon_grupo_miembros')
      .select('group_id, user_id')
      .in('group_id', groupIds);

    if (allMembersError) {
      console.error('[buzon/groups GET members]', allMembersError);
      return NextResponse.json({ error: 'No se pudieron cargar los grupos.' }, { status: 500 });
    }

    const membersByGroup = new Map();
    for (const row of allMembers || []) {
      if (!membersByGroup.has(row.group_id)) membersByGroup.set(row.group_id, []);
      membersByGroup.get(row.group_id).push(row.user_id);
    }

    const enriched = (groups || []).map((group) => ({
      ...group,
      member_ids: membersByGroup.get(group.id) || [],
    }));

    return NextResponse.json({ groups: enriched });
  } catch (error) {
    console.error('[buzon/groups GET]', error);
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
    const name = String(body?.name || '').trim();
    const description = String(body?.description || '').trim();
    const memberIds = Array.isArray(body?.member_ids)
      ? [...new Set(body.member_ids.map((id) => String(id).trim()).filter(Boolean))]
      : [];

    if (!name) {
      return NextResponse.json({ error: 'El nombre del grupo es obligatorio.' }, { status: 400 });
    }

    const uniqueMembers = new Set([user.id, ...memberIds]);
    for (const memberId of uniqueMembers) {
      if (memberId === user.id) continue;
      const allowed = await userIsStaffBuzonRecipient(memberId, db);
      if (!allowed) {
        return NextResponse.json({ error: 'Algún miembro seleccionado no es válido.' }, { status: 400 });
      }
    }

    const { data: group, error: groupError } = await db
      .from('staff_buzon_grupos')
      .insert({
        name,
        description: description || null,
        created_by: user.id,
      })
      .select('id, name, description, created_by, created_at')
      .single();

    if (groupError || !group) {
      console.error('[buzon/groups POST group]', groupError);
      return NextResponse.json({ error: 'No se pudo crear el grupo.' }, { status: 500 });
    }

    const memberRows = [...uniqueMembers].map((memberId) => ({
      group_id: group.id,
      user_id: memberId,
    }));

    const { error: membersError } = await db.from('staff_buzon_grupo_miembros').insert(memberRows);
    if (membersError) {
      console.error('[buzon/groups POST members]', membersError);
      return NextResponse.json({ error: 'No se pudieron añadir los miembros.' }, { status: 500 });
    }

    return NextResponse.json({
      group: { ...group, member_ids: [...uniqueMembers] },
    });
  } catch (error) {
    console.error('[buzon/groups POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
