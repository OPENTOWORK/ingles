import { NextResponse } from 'next/server';
import {
  assertStudySessionAccess,
  authenticateStudentRequest,
  getActiveStudySession,
  SEGUIMIENTO_SESIONES_TABLE,
} from '@/lib/studySessionServer';
import { accumulateSession, buildStudyReport } from '@/lib/studySession';

/** Acumula los contadores de foco que envía el cliente cada 30 s. */
export async function POST(req) {
  try {
    const auth = await authenticateStudentRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const access = await assertStudySessionAccess(auth.user, auth.db);
    if (access.error) {
      return NextResponse.json({ error: access.error, planAccess: false }, { status: access.status });
    }

    const body = await req.json().catch(() => ({}));
    const { session, tableReady } = await getActiveStudySession(auth.db, auth.user.id);

    if (!tableReady) {
      return NextResponse.json({ error: 'Seguimiento no disponible.' }, { status: 503 });
    }
    if (!session || (body?.sessionId && body.sessionId !== session.id)) {
      return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 409 });
    }

    const totals = accumulateSession(session, body);
    const { data: updated, error } = await auth.db
      .from(SEGUIMIENTO_SESIONES_TABLE)
      .update(totals)
      .eq('id', session.id)
      .eq('user_id', auth.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('[estudio/sesion/ping] update', error);
      return NextResponse.json({ error: 'No se pudo actualizar la sesión.' }, { status: 500 });
    }

    return NextResponse.json({ report: buildStudyReport(updated) });
  } catch (err) {
    console.error('[estudio/sesion/ping]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
