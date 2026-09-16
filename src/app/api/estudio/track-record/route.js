import { NextResponse } from 'next/server';
import {
  assertStudySessionAccess,
  authenticateStudentRequest,
  SEGUIMIENTO_SESIONES_TABLE,
} from '@/lib/studySessionServer';
import { buildTrackRecord } from '@/lib/studySession';

/** Histórico de sesiones de estudio del propio alumno. */
export async function GET(req) {
  try {
    const auth = await authenticateStudentRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const access = await assertStudySessionAccess(auth.user, auth.db);
    if (access.error) {
      return NextResponse.json({ error: access.error, planAccess: false }, { status: access.status });
    }

    const { data, error } = await auth.db
      .from(SEGUIMIENTO_SESIONES_TABLE)
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('status', 'finalizada')
      .order('started_at', { ascending: false })
      .limit(100);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ entries: [], totals: null, tableReady: false });
      }
      console.error('[estudio/track-record]', error);
      return NextResponse.json({ error: 'No se pudo cargar el historial.' }, { status: 500 });
    }

    const record = buildTrackRecord(data || []);
    return NextResponse.json({ ...record, tableReady: true });
  } catch (err) {
    console.error('[estudio/track-record]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
