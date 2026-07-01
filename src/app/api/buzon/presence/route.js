import { NextResponse } from 'next/server';
import { listStaffAssignees } from '@/lib/coordinatorAccess';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';
import { isUserOnline } from '@/lib/userActivity';
import { BUZON_STATUS_VALUES } from '@/utils/staffBuzon';

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db } = auth;
    const { assignees } = await listStaffAssignees(db);
    const userIds = (assignees || [])
      .filter((user) => user.activo !== false)
      .map((user) => user.id);

    const [buzonRes, activityRes] = await Promise.all([
      db.from('staff_buzon_presencia').select('user_id, status, activity, updated_at'),
      userIds.length
        ? db.from('usuario_presencia').select('user_id, last_seen_at').in('user_id', userIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (buzonRes.error) {
      console.error('[buzon/presence GET]', buzonRes.error);
      return NextResponse.json({ error: 'No se pudo cargar la presencia.' }, { status: 500 });
    }

    if (activityRes.error) {
      console.error('[buzon/presence GET activity]', activityRes.error);
    }

    const buzonByUser = new Map((buzonRes.data || []).map((row) => [row.user_id, row]));
    const lastSeenByUser = new Map(
      (activityRes.data || []).map((row) => [row.user_id, row.last_seen_at]),
    );

    const presence = userIds.map((userId) => {
      const buzon = buzonByUser.get(userId);
      return {
        user_id: userId,
        status: buzon?.status || 'disponible',
        activity: buzon?.activity ?? null,
        updated_at: buzon?.updated_at ?? null,
        online: isUserOnline(lastSeenByUser.get(userId)),
      };
    });

    return NextResponse.json({ presence });
  } catch (error) {
    console.error('[buzon/presence GET]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user, db } = auth;
    const body = await req.json().catch(() => ({}));
    const status = String(body?.status || 'disponible').trim();
    const activityRaw = String(body?.activity || '').trim();

    if (!BUZON_STATUS_VALUES.includes(status)) {
      return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 });
    }

    const row = {
      user_id: user.id,
      status,
      activity: activityRaw || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('staff_buzon_presencia')
      .upsert(row, { onConflict: 'user_id' })
      .select('user_id, status, activity, updated_at')
      .single();

    if (error) {
      console.error('[buzon/presence PUT]', error);
      return NextResponse.json({ error: 'No se pudo guardar el estado.' }, { status: 500 });
    }

    return NextResponse.json({ presence: { ...data, online: true } });
  } catch (error) {
    console.error('[buzon/presence PUT]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
