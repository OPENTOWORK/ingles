import { NextResponse } from 'next/server';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';
import { BUZON_STATUS_VALUES } from '@/utils/staffBuzon';

export async function GET(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db } = auth;
    const { data, error } = await db
      .from('staff_buzon_presencia')
      .select('user_id, status, activity, updated_at');

    if (error) {
      console.error('[buzon/presence GET]', error);
      return NextResponse.json({ error: 'No se pudo cargar la presencia.' }, { status: 500 });
    }

    return NextResponse.json({ presence: data || [] });
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

    return NextResponse.json({ presence: data });
  } catch (error) {
    console.error('[buzon/presence PUT]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
