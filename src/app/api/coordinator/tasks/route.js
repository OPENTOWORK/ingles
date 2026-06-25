import { NextResponse } from 'next/server';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { canDeleteStaffTask } from '@/lib/staffTasksPermissions';
import { filterTasksClientSide } from '@/lib/staffTaskHelpers';
import {
  buildTaskInsertRow,
  buildTaskUpdatePatch,
  buildTasksQuery,
  computeTaskMetrics,
  enrichTasksList,
  probeStaffTasksTable,
  validateAssigneeAndStudent,
  validateTaskPayload,
} from '@/lib/staffTasksServer';
import { getRoleNameByUserId } from '@/utils/authRoles';

const TASKS_TABLE = 'staff_tareas';

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const assigneeId = String(searchParams.get('assigneeId') || '').trim();
    const estado = String(searchParams.get('estado') || '').trim();
    const faseId = String(searchParams.get('faseId') || '').trim();
    const subfaseId = String(searchParams.get('subfaseId') || '').trim();
    const prioridad = String(searchParams.get('prioridad') || '').trim();
    const mineOnly = String(searchParams.get('mineOnly') || '').trim() === '1';
    const search = String(searchParams.get('search') || '').trim();
    const rol = String(searchParams.get('rol') || '').trim();
    const fechaLimite = String(searchParams.get('fechaLimite') || '').trim();

    const tablesProbe = await probeStaffTasksTable(auth.db);
    if (isSchemaNotReadyError(tablesProbe.error)) {
      return NextResponse.json({ tasks: [], tablesReady: false, summary: computeTaskMetrics([]) });
    }

    const built = await buildTasksQuery(auth.db, {
      assigneeId,
      mineOnly,
      userId: auth.user.id,
      estado: estado === 'vencida' ? '' : estado,
      faseId,
      subfaseId,
      prioridad,
    });

    if (built.error) {
      return NextResponse.json({ error: built.error }, { status: built.status });
    }

    const { data, error } = await built.query;
    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ tasks: [], tablesReady: false, summary: computeTaskMetrics([]) });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let tasks = await enrichTasksList(auth.db, data || []);

    tasks = filterTasksClientSide(tasks, {
      search,
      rol,
      fechaLimite,
      estado,
    });

    return NextResponse.json({
      tasks,
      tablesReady: true,
      summary: computeTaskMetrics(tasks),
    });
  } catch (err) {
    console.error('[coordinator/tasks GET]', err);
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
      const validated = validateTaskPayload(body);
      if (!validated.ok) {
        return NextResponse.json({ error: validated.error }, { status: 400 });
      }

      if (validated.data.asignado_id) {
        const assigneeCheck = await validateAssigneeAndStudent(
          auth.db,
          validated.data.asignado_id,
          validated.data.alumno_id,
        );
        if (!assigneeCheck.ok) {
          return NextResponse.json(
            { error: assigneeCheck.error },
            { status: assigneeCheck.status || 400 },
          );
        }
      }

      const row = buildTaskInsertRow(validated.data, auth.user.id);
      const { data, error } = await auth.db.from(TASKS_TABLE).insert(row).select().single();

      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/staff_tasks_system.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }

      const [task] = await enrichTasksList(auth.db, [data]);
      return NextResponse.json({ success: true, task });
    }

    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });

    if (action === 'delete') {
      const role = await getRoleNameByUserId(auth.user.id, auth.user.email);
      if (!canDeleteStaffTask(role)) {
        return NextResponse.json(
          { error: 'Solo administración puede eliminar tareas. Marca la tarea como cancelada.' },
          { status: 403 },
        );
      }

      const { error } = await auth.db.from(TASKS_TABLE).delete().eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'duplicate') {
      const { data: source, error: readErr } = await auth.db
        .from(TASKS_TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (readErr || !source) {
        return NextResponse.json({ error: 'Tarea no encontrada.' }, { status: 404 });
      }
      const duplicate = buildTaskInsertRow(
        {
          titulo: `${source.titulo} (copia)`,
          descripcion: source.descripcion,
          estado: 'pendiente',
          prioridad: source.prioridad,
          fase_id: source.fase_id,
          subfase_id: source.subfase_id,
          asignado_id: source.asignado_id,
          asignado_rol: source.asignado_rol,
          alumno_id: source.alumno_id,
          fecha_limite: source.fecha_limite,
          enlace: source.enlace,
          notas: source.notas,
          bloqueada_motivo: null,
          checklist: source.checklist || [],
        },
        auth.user.id,
      );
      const { data, error } = await auth.db.from(TASKS_TABLE).insert(duplicate).select().single();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      const [task] = await enrichTasksList(auth.db, [data]);
      return NextResponse.json({ success: true, task });
    }

    if (action === 'update' || action === 'updateEstado') {
      if (action === 'update') {
        const validated = validateTaskPayload(body);
        if (!validated.ok) {
          return NextResponse.json({ error: validated.error }, { status: 400 });
        }
        if (validated.data.asignado_id) {
          const assigneeCheck = await validateAssigneeAndStudent(
            auth.db,
            validated.data.asignado_id,
            validated.data.alumno_id,
          );
          if (!assigneeCheck.ok) {
            return NextResponse.json(
              { error: assigneeCheck.error },
              { status: assigneeCheck.status || 400 },
            );
          }
        }
      }

      const patch =
        action === 'updateEstado'
          ? buildTaskUpdatePatch({ estado: body.estado })
          : buildTaskUpdatePatch(body);

      const { data, error } = await auth.db
        .from(TASKS_TABLE)
        .update(patch)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const [task] = await enrichTasksList(auth.db, [data]);
      return NextResponse.json({ success: true, task });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/tasks POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
