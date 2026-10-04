import { NextResponse } from 'next/server';
import { deleteAccesoWeb, listAccesosWeb, saveAccesoWeb } from '@/lib/adminAccesosServer';
import { authenticateAdminRequest } from '@/lib/adminAccess';

const noStore = { 'Cache-Control': 'no-store' };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function invalidId() {
  return NextResponse.json({ error: 'Ese acceso no existe.' }, { status: 404, headers: noStore });
}

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    if (!UUID.test(String(id || ''))) return invalidId();
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const body = await req.json().catch(() => ({}));
    await saveAccesoWeb(auth.db, auth.user.id, body, { id });
    const rows = await listAccesosWeb(auth.db);
    return NextResponse.json({ ok: true, rows }, { headers: noStore });
  } catch (error) {
    console.error('[admin/accesos-web PATCH]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo guardar el acceso.' },
      { status: error?.status || 500, headers: noStore },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    if (!UUID.test(String(id || ''))) return invalidId();
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    await deleteAccesoWeb(auth.db, auth.user.id, id);
    const rows = await listAccesosWeb(auth.db);
    return NextResponse.json({ ok: true, rows }, { headers: noStore });
  } catch (error) {
    console.error('[admin/accesos-web DELETE]', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'No se pudo quitar el acceso.' },
      { status: error?.status || 500, headers: noStore },
    );
  }
}
