import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertTeacherApiAccess, isSchemaNotReadyError } from '@/lib/teacherAccess';
import { parseTutorProfilePayload, TUTOR_PROFILE_COLUMNS } from '@/lib/tutoringCalendly';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const client = createClient(url, anon);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const access = await assertTeacherApiAccess(user.id, user.email);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ profile: null, tablesReady: false });
    }

    const { data, error } = await admin
      .from('profesor_calendly')
      .select(TUTOR_PROFILE_COLUMNS)
      .eq('profesor_id', user.id)
      .maybeSingle();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ profile: null, tablesReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profile: data, tablesReady: true });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al leer perfil de tutoría' },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const access = await assertTeacherApiAccess(user.id, user.email);
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: 403 });
    }

    const body = await request.json();
    const parsed = parseTutorProfilePayload(body);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ saved: false, offline: true });
    }

    const row = {
      profesor_id: user.id,
      ...parsed.row,
      actualizado_en: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('profesor_calendly')
      .upsert(row, { onConflict: 'profesor_id' })
      .select(TUTOR_PROFILE_COLUMNS)
      .single();

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json(
          {
            error:
              'La tabla profesor_calendly no está disponible. Ejecuta scripts/profesor_calendly.sql en Supabase.',
          },
          { status: 503 },
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true, profile: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar perfil de tutoría' },
      { status: 500 },
    );
  }
}
