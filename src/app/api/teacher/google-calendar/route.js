import { NextResponse } from 'next/server';
import { authenticateTeacherRequest, isSchemaNotReadyError } from '@/lib/teacherAccess';
import {
  fetchGoogleCalendarIcs,
  googleEventsForRange,
  monthRange,
} from '@/lib/teacherGoogleCalendar';

function fail(error, status = 500) {
  return NextResponse.json({ error: error?.message || 'No se pudo enlazar el calendario.' }, { status });
}

async function readLink(db, professorId) {
  const { data, error } = await db
    .from('profesor_google_calendar')
    .select('nombre, ical_url')
    .eq('profesor_id', professorId)
    .maybeSingle();
  if (error) {
    if (isSchemaNotReadyError(error)) return { tablesReady: false };
    throw error;
  }
  return { tablesReady: true, link: data || null };
}

export async function GET(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { start, end, month } = monthRange(new URL(req.url).searchParams.get('month'));
    const stored = await readLink(auth.db, auth.professorId);
    if (!stored.tablesReady) {
      return NextResponse.json({ connected: false, events: [], tablesReady: false, month });
    }
    if (!stored.link?.ical_url) {
      return NextResponse.json({ connected: false, events: [], tablesReady: true, month });
    }

    try {
      const feed = await fetchGoogleCalendarIcs(stored.link.ical_url);
      return NextResponse.json({
        connected: true,
        name: stored.link.nombre || feed.name || 'Google Calendar',
        events: googleEventsForRange(feed.ics, start, end),
        tablesReady: true,
        month,
      });
    } catch (err) {
      return NextResponse.json({
        connected: true,
        name: stored.link.nombre || 'Google Calendar',
        events: [],
        warning: err.message || 'No se pudo leer Google Calendar.',
        tablesReady: true,
        month,
      });
    }
  } catch (err) {
    console.error('[teacher/google-calendar GET]', err);
    return fail(err);
  }
}

export async function PUT(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await req.json().catch(() => ({}));
    let feed;
    try {
      feed = await fetchGoogleCalendarIcs(body?.url);
    } catch (err) {
      return fail(err, err.status || 400);
    }

    const nombre = feed.name || 'Google Calendar';
    const { error } = await auth.db.from('profesor_google_calendar').upsert(
      {
        profesor_id: auth.professorId,
        ical_url: feed.url,
        nombre,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: 'profesor_id' },
    );

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json(
          { error: 'Falta la tabla del calendario. Ejecuta scripts/teacher_google_calendar.sql.' },
          { status: 503 },
        );
      }
      return fail(error);
    }

    return NextResponse.json({ connected: true, name: nombre });
  } catch (err) {
    console.error('[teacher/google-calendar PUT]', err);
    return fail(err);
  }
}

export async function DELETE(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { error } = await auth.db
      .from('profesor_google_calendar')
      .delete()
      .eq('profesor_id', auth.professorId);

    if (error && !isSchemaNotReadyError(error)) return fail(error);
    return NextResponse.json({ connected: false });
  } catch (err) {
    console.error('[teacher/google-calendar DELETE]', err);
    return fail(err);
  }
}
