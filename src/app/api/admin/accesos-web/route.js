import { NextResponse } from 'next/server';
import { listAccesosWeb, saveAccesoWeb } from '@/lib/adminAccesosServer';
import { authenticateAdminRequest } from '@/lib/adminAccess';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const rows = await listAccesosWeb(auth.db);
    return NextResponse.json({ ok: true, rows }, { headers: noStore });
  } catch (error) {
    console.error('[admin/accesos-web GET]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'No se pudieron leer los accesos.' },
      { status: error?.status || 500, headers: noStore },
    );
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await req.json().catch(() => ({}));
    await saveAccesoWeb(auth.db, auth.user.id, body);
    const rows = await listAccesosWeb(auth.db);
    return NextResponse.json({ ok: true, rows }, { headers: noStore });
  } catch (error) {
    console.error('[admin/accesos-web POST]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo guardar el acceso.' },
      { status: error?.status || 500, headers: noStore },
    );
  }
}
