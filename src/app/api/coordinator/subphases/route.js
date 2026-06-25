import { NextResponse } from 'next/server';

import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';

import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';

import { canManageStaffPhases } from '@/lib/staffTasksPermissions';

import { computeSubphaseProgress } from '@/lib/staffTaskHelpers';

import { probeStaffTasksTable } from '@/lib/staffTasksServer';

import { getRoleNameByUserId } from '@/utils/authRoles';

const SUBFASES_TABLE = 'staff_subfases';
const FASES_TABLE = 'staff_fases';
const TASKS_TABLE = 'staff_tareas';

function mapSubphase(row, tasks = [], phasesById = {}) {
  const progress = computeSubphaseProgress(row.id, tasks);
  const fase = row.fase_id ? phasesById[row.fase_id] : null;

  return {
    id: row.id,
    fase_id: row.fase_id,
    fase_nombre: fase?.nombre || '',
    nombre: row.nombre,
    descripcion: row.descripcion || '',
    estado: row.estado,
    orden: row.orden,
    fecha_inicio: row.fecha_inicio,
    fecha_limite: row.fecha_limite,
    visible_para_todos: row.visible_para_todos !== false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    taskCount: progress.total,
    completedCount: progress.completed,
    progressPct: progress.pct,
    progressLabel: progress.label,
  };
}

function buildSubphasePayload(body) {
  return {
    fase_id: String(body?.fase_id || '').trim() || null,
    nombre: String(body?.nombre || '').trim(),
    descripcion: String(body?.descripcion || '').trim() || null,
    estado: body?.estado || 'no_iniciada',
    orden: Number(body?.orden) || 0,
    fecha_inicio: body?.fecha_inicio || null,
    fecha_limite: body?.fecha_limite || null,
    visible_para_todos: true,
  };
}

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const probe = await auth.db.from(SUBFASES_TABLE).select('id').limit(1);
    if (isSchemaNotReadyError(probe.error)) {
      return NextResponse.json({ subphases: [], tablesReady: false });
    }

    const { searchParams } = new URL(req.url);
    const faseId = String(searchParams.get('faseId') || '').trim();

    let query = auth.db
      .from(SUBFASES_TABLE)
      .select('*')
      .order('orden', { ascending: true });

    if (faseId) query = query.eq('fase_id', faseId);

    const { data: subphases, error } = await query;

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ subphases: [], tablesReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let tasks = [];
    const tasksProbe = await probeStaffTasksTable(auth.db);
    if (!isSchemaNotReadyError(tasksProbe.error)) {
      const { data } = await auth.db.from(TASKS_TABLE).select('id, subfase_id, estado');
      tasks = data || [];
    }

    const faseIds = [...new Set((subphases || []).map((s) => s.fase_id).filter(Boolean))];
    let phasesById = {};
    if (faseIds.length) {
      const { data: phases } = await auth.db
        .from(FASES_TABLE)
        .select('id, nombre')
        .in('id', faseIds);
      phasesById = Object.fromEntries((phases || []).map((p) => [p.id, p]));
    }

    return NextResponse.json({
      subphases: (subphases || []).map((s) => mapSubphase(s, tasks, phasesById)),
      tablesReady: true,
    });
  } catch (err) {
    console.error('[coordinator/subphases GET]', err);
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
    const role = await getRoleNameByUserId(auth.user.id, auth.user.email);

    if (!canManageStaffPhases(role)) {
      return NextResponse.json(
        { error: 'Solo administración puede gestionar subfases.' },
        { status: 403 },
      );
    }

    if (action === 'create') {
      const payload = buildSubphasePayload(body);
      if (!payload.fase_id) {
        return NextResponse.json({ error: 'La fase es obligatoria.' }, { status: 400 });
      }
      if (!payload.nombre) {
        return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });
      }

      const { data, error } = await auth.db
        .from(SUBFASES_TABLE)
        .insert({
          ...payload,
          created_by: auth.user.id,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/staff_subfases.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }

      return NextResponse.json({ success: true, subphase: mapSubphase(data, []) });
    }

    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });

    if (action === 'delete') {
      const { error } = await auth.db.from(SUBFASES_TABLE).delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const payload = buildSubphasePayload(body);
      if (!payload.fase_id) {
        return NextResponse.json({ error: 'La fase es obligatoria.' }, { status: 400 });
      }
      if (!payload.nombre) {
        return NextResponse.json({ error: 'El nombre es obligatorio.' }, { status: 400 });
      }

      const { data, error } = await auth.db
        .from(SUBFASES_TABLE)
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, subphase: mapSubphase(data, []) });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/subphases POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
