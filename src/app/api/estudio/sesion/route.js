import { NextResponse } from 'next/server';
import {
  assertStudySessionAccess,
  authenticateStudentRequest,
  getActiveStudySession,
  SEGUIMIENTO_CONSENTIMIENTOS_TABLE,
  SEGUIMIENTO_SESIONES_TABLE,
} from '@/lib/studySessionServer';
import {
  buildStudyReport,
  STUDY_CONSENT_VERSION,
  STUDY_SESSION_STALE_MS,
} from '@/lib/studySession';

/** Sesión de estudio en curso del alumno. */
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

    const { session, tableReady } = await getActiveStudySession(auth.db, auth.user.id);
    return NextResponse.json({
      session: session ? { id: session.id, startedAt: session.started_at } : null,
      report: session ? buildStudyReport(session) : null,
      consentVersion: STUDY_CONSENT_VERSION,
      tableReady,
    });
  } catch (err) {
    console.error('[estudio/sesion GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

/** Inicia una sesión monitorizada. Requiere consentimiento explícito y vigente. */
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
    if (body?.consentVersion !== STUDY_CONSENT_VERSION) {
      return NextResponse.json(
        {
          error: 'Necesitamos tu consentimiento para activar el seguimiento.',
          consentVersion: STUDY_CONSENT_VERSION,
        },
        { status: 400 },
      );
    }

    const { db } = auth;
    const userId = auth.user.id;

    const { session: existing, tableReady } = await getActiveStudySession(db, userId);
    if (!tableReady) {
      return NextResponse.json({ error: 'Seguimiento no disponible.' }, { status: 503 });
    }

    if (existing) {
      const lastUpdate = new Date(existing.updated_at || existing.started_at).getTime();
      const stale = Date.now() - lastUpdate > STUDY_SESSION_STALE_MS;
      if (!stale) {
        return NextResponse.json({
          session: { id: existing.id, startedAt: existing.started_at },
          report: buildStudyReport(existing),
          resumed: true,
        });
      }
      // La anterior quedó abierta (cerró el navegador): se cierra para liberar el hueco.
      await db
        .from(SEGUIMIENTO_SESIONES_TABLE)
        .update({ status: 'finalizada', ended_at: existing.updated_at || existing.started_at })
        .eq('id', existing.id);
    }

    const nowIso = new Date().toISOString();
    const { data: created, error } = await db
      .from(SEGUIMIENTO_SESIONES_TABLE)
      .insert({
        user_id: userId,
        started_at: nowIso,
        status: 'activa',
        consent_version: STUDY_CONSENT_VERSION,
        consent_at: nowIso,
        idle_detection_granted: Boolean(body?.idleDetectionGranted),
      })
      .select('*')
      .single();

    if (error) {
      console.error('[estudio/sesion POST] insert', error);
      return NextResponse.json({ error: 'No se pudo iniciar la sesión.' }, { status: 500 });
    }

    await db.from(SEGUIMIENTO_CONSENTIMIENTOS_TABLE).insert({
      user_id: userId,
      version: STUDY_CONSENT_VERSION,
      accion: 'otorgado',
      user_agent: String(req.headers.get('user-agent') || '').slice(0, 300),
    });

    return NextResponse.json({
      session: { id: created.id, startedAt: created.started_at },
      report: buildStudyReport(created),
      resumed: false,
    });
  } catch (err) {
    console.error('[estudio/sesion POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
