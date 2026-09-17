import { NextResponse } from 'next/server';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { getUserRoleNameServer } from '@/lib/userRoleServer';
import { ADMIN_EMAIL, normalizeEmail } from '@/utils/authRoles';
import {
  getTaskConversation,
  postTaskConversationMessage,
} from '@/lib/staffTaskConversationServer';

export const dynamic = 'force-dynamic';

async function resolveRoleName(user, db) {
  if (normalizeEmail(user.email) === normalizeEmail(ADMIN_EMAIL)) return 'admin';
  return getUserRoleNameServer(user.id, db);
}

/** GET: hilo de la conversación. PATCH: marcar como leída. POST: nuevo mensaje. */
export async function GET(req, { params }) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const taskId = String(params?.taskId || '').trim();
    if (!taskId) return NextResponse.json({ error: 'Tarea no válida.' }, { status: 400 });

    const roleName = await resolveRoleName(auth.user, auth.db);
    const markRead = req.nextUrl.searchParams.get('marcarLeido') === '1';

    const result = await getTaskConversation(auth.db, {
      taskId,
      userId: auth.user.id,
      roleName,
      markRead,
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[coordinator/tasks/messages GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const taskId = String(params?.taskId || '').trim();
    if (!taskId) return NextResponse.json({ error: 'Tarea no válida.' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const roleName = await resolveRoleName(auth.user, auth.db);

    const result = await postTaskConversationMessage(auth.db, {
      taskId,
      userId: auth.user.id,
      roleName,
      body: body?.body ?? body?.mensaje,
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json(result);
  } catch (err) {
    console.error('[coordinator/tasks/messages POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const taskId = String(params?.taskId || '').trim();
    if (!taskId) return NextResponse.json({ error: 'Tarea no válida.' }, { status: 400 });

    const roleName = await resolveRoleName(auth.user, auth.db);
    const result = await getTaskConversation(auth.db, {
      taskId,
      userId: auth.user.id,
      roleName,
      markRead: true,
    });

    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ ok: true, unreadCount: 0 });
  } catch (err) {
    console.error('[coordinator/tasks/messages PATCH]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
