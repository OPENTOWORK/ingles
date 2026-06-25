import { NextResponse } from 'next/server';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import {
  normalizeDepartamentos,
  normalizePuntosDia,
} from '@/lib/staffMeetingsConstants';

const TABLE = 'staff_reuniones';

function mapMeeting(row) {
  return {
    id: row.id,
    titulo: row.titulo || '',
    fecha: row.fecha,
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    departamentos: normalizeDepartamentos(row.departamentos),
    puntos_dia: normalizePuntosDia(row.puntos_dia),
    notas: row.notas || '',
    created_by: row.created_by,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function validateMeetingBody(body = {}) {
  const fecha = String(body.fecha || '').trim();
  if (!fecha) {
    return { ok: false, error: 'La fecha de la reunión es obligatoria.' };
  }

  const departamentos = normalizeDepartamentos(body.departamentos);
  if (!departamentos.length) {
    return { ok: false, error: 'Selecciona al menos un departamento.' };
  }

  const puntos_dia = normalizePuntosDia(body.puntos_dia);
  if (!puntos_dia.length) {
    return { ok: false, error: 'Añade al menos un punto del día.' };
  }

  return {
    ok: true,
    data: {
      titulo: String(body.titulo || '').trim() || null,
      fecha,
      hora: body.hora ? String(body.hora).trim() : null,
      departamentos,
      puntos_dia,
      notas: String(body.notas || '').trim() || null,
    },
  };
}

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const probe = await auth.db.from(TABLE).select('id').limit(1);
    if (isSchemaNotReadyError(probe.error)) {
      return NextResponse.json({ meetings: [], tablesReady: false });
    }

    const { data, error } = await auth.db
      .from(TABLE)
      .select('*')
      .order('fecha', { ascending: true })
      .order('hora', { ascending: true, nullsFirst: false });

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ meetings: [], tablesReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      meetings: (data || []).map(mapMeeting),
      tablesReady: true,
    });
  } catch (err) {
    console.error('[coordinator/meetings GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'create').trim();

    if (action === 'create') {
      const validated = validateMeetingBody(body);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      const { data, error } = await auth.db
        .from(TABLE)
        .insert({
          ...validated.data,
          created_by: auth.user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/staff_reuniones.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }

      return NextResponse.json({ success: true, meeting: mapMeeting(data) });
    }

    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });

    if (action === 'delete') {
      const { error } = await auth.db.from(TABLE).delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const validated = validateMeetingBody(body);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      const { data, error } = await auth.db
        .from(TABLE)
        .update({
          ...validated.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, meeting: mapMeeting(data) });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/meetings POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
