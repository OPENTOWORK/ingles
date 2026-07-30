import { NextResponse } from 'next/server';
import { requireStaffBuzonAccess } from '@/lib/staffBuzonAccess';
import { getWebPushPublicConfig } from '@/lib/staffBuzonPush';

export const runtime = 'nodejs';

const PUSH_TABLE = 'staff_buzon_push_subscriptions';

function parseSubscription(value) {
  const endpoint = String(value?.endpoint || '').trim();
  const p256dh = String(value?.keys?.p256dh || '').trim();
  const authKey = String(value?.keys?.auth || '').trim();
  const expirationTime =
    value?.expirationTime == null ? null : Number(value.expirationTime);

  if (!endpoint.startsWith('https://') || !p256dh || !authKey) return null;
  if (endpoint.length > 4000 || p256dh.length > 1000 || authKey.length > 1000) return null;
  if (expirationTime !== null && !Number.isFinite(expirationTime)) return null;

  return { endpoint, p256dh, authKey, expirationTime };
}

export async function GET(req) {
  const auth = await requireStaffBuzonAccess(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  return NextResponse.json(getWebPushPublicConfig());
}

export async function POST(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const subscription = parseSubscription(body?.subscription);
    if (!subscription) {
      return NextResponse.json({ error: 'Suscripción de notificaciones no válida.' }, { status: 400 });
    }

    const row = {
      user_id: auth.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth_key: subscription.authKey,
      expiration_time: subscription.expirationTime,
      user_agent: String(req.headers.get('user-agent') || '').slice(0, 500) || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await auth.db.from(PUSH_TABLE).upsert(row, { onConflict: 'endpoint' });
    if (error) {
      console.error('[buzon/push-subscriptions POST]', error);
      return NextResponse.json({ error: 'No se pudo activar las notificaciones.' }, { status: 500 });
    }

    return NextResponse.json({ subscribed: true });
  } catch (error) {
    console.error('[buzon/push-subscriptions POST]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireStaffBuzonAccess(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const endpoint = String(body?.endpoint || '').trim();
    if (!endpoint) {
      return NextResponse.json({ error: 'Suscripción no válida.' }, { status: 400 });
    }

    const { error } = await auth.db
      .from(PUSH_TABLE)
      .delete()
      .eq('user_id', auth.user.id)
      .eq('endpoint', endpoint);
    if (error) {
      console.error('[buzon/push-subscriptions DELETE]', error);
      return NextResponse.json({ error: 'No se pudieron desactivar las notificaciones.' }, { status: 500 });
    }

    return NextResponse.json({ subscribed: false });
  } catch (error) {
    console.error('[buzon/push-subscriptions DELETE]', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
