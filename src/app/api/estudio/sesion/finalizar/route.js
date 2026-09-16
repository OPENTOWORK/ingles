import { NextResponse } from 'next/server';
import {
  assertStudySessionAccess,
  authenticateStudentRequest,
  generateStudySummary,
  getActiveStudySession,
  SEGUIMIENTO_SESIONES_TABLE,
} from '@/lib/studySessionServer';
import { accumulateSession, buildStudyReport } from '@/lib/studySession';

/** Cierra la sesión, genera el resumen y lo archiva en el track record. */
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
    const { db, user } = auth;

    const { session, tableReady } = await getActiveStudySession(db, user.id);
    if (!tableReady) {
      return NextResponse.json({ error: 'Seguimiento no disponible.' }, { status: 503 });
    }
    if (!session) {
      return NextResponse.json({ error: 'No hay sesión activa.' }, { status: 409 });
    }

    // El último tramo de foco viaja en la misma llamada de cierre.
    const totals = accumulateSession(session, body);
    const endedAt = new Date().toISOString();
    const report = buildStudyReport({ ...session, ...totals, ended_at: endedAt });

    const studentName =
      user.user_metadata?.nombre || user.user_metadata?.full_name || '';
    const { resumen, source } = await generateStudySummary(report, { studentName });

    const { data: closed, error } = await db
      .from(SEGUIMIENTO_SESIONES_TABLE)
      .update({
        ...totals,
        status: 'finalizada',
        ended_at: endedAt,
        resumen,
        resumen_bullets: {
          focusRatio: report.focusRatio,
          quality: report.quality.key,
          topArea: report.topArea,
          source,
        },
        resumen_generado_en: new Date().toISOString(),
      })
      .eq('id', session.id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('[estudio/sesion/finalizar] update', error);
      return NextResponse.json({ error: 'No se pudo cerrar la sesión.' }, { status: 500 });
    }

    return NextResponse.json({
      report: buildStudyReport(closed),
      resumen: closed.resumen,
      resumenSource: source,
    });
  } catch (err) {
    console.error('[estudio/sesion/finalizar]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
