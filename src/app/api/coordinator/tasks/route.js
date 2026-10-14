import { NextResponse } from 'next/server';
import { isSchemaNotReadyError } from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { canDeleteStaffTask, canRemindStaffTask } from '@/lib/staffTasksPermissions';
import { filterTasksClientSide } from '@/lib/staffTaskHelpers';
import {
  sendStaffTaskAssignedEmail,
  sendStaffTaskReminderEmail,
} from '@/lib/sendStaffTaskAssignedEmail';
import { copyTaskFiles } from '@/lib/staffTaskFilesServer';
import {
  buildTaskInsertRow,
  buildTaskUpdatePatch,
  buildTasksQuery,
  computeTaskMetrics,
  enrichTasksList,
  loadProfilesByIds,
  probeStaffTasksTable,
  validateAssigneeAndStudent,
  validateTaskPayload,
} from '@/lib/staffTasksServer';
import { getRoleNameByUserId } from '@/utils/authRoles';

const TASKS_TABLE = 'staff_tareas';

function assigneeRecipients(task) {
  const people =
    Array.isArray(task?.asignados) && task.asignados.length
      ? task.asignados
      : task?.asignado
        ? [task.asignado]
        : [];
  const seen = new Set();
  return people.filter((person) => {
    const email = String(person?.email || '').trim().toLowerCase();
    if (!email || seen.has(email)) return false;
    seen.add(email);
    return true;
  });
}

async function notifyTaskAssignees(auth, task, send) {
  const recipients = assigneeRecipients(task);
  if (!recipients.length) return { sent: false, skipped: true, names: [] };

  const profiles = await loadProfilesByIds(auth.db, [auth.user.id]);
  const creator = profiles[auth.user.id];
  const creatorName = creator?.nombre || auth.user.email || 'Un miembro del equipo';
  const names = [];
  let sent = false;
  let queued = false;
  let error = '';

  for (const person of recipients) {
    const mail = await send({
      adminClient: auth.db,
      task: { ...task, asignado: person },
      creatorName,
    });
    if (mail.sent || mail.queued) {
      sent = Boolean(mail.sent) || sent;
      queued = Boolean(mail.queued) || queued;
      names.push(person.nombre || person.email);
    } else if (!mail.skipped) {
      error = mail.error || error;
    }
  }

  return { sent, queued, skipped: names.length === 0 && !error, error, names };
}

async function validateAssignees(db, ids, alumnoId) {
  for (const id of ids) {
    const check = await validateAssigneeAndStudent(db, id, id === ids[0] ? alumnoId : null);
    if (!check.ok) return check;
  }
  return { ok: true };
}

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

      const assigneeCheck = await validateAssignees(
        auth.db,
        validated.data.asignados_ids,
        validated.data.alumno_id,
      );
      if (!assigneeCheck.ok) {
        return NextResponse.json(
          { error: assigneeCheck.error },
          { status: assigneeCheck.status || 400 },
        );
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
      const mail = await notifyTaskAssignees(auth, task, sendStaffTaskAssignedEmail);
      if (!mail.sent && !mail.skipped && mail.error) {
        console.warn('[coordinator/tasks create] assignment email:', mail.error);
      }
      return NextResponse.json({
        success: true,
        task,
        emailSent: Boolean(mail.sent || mail.queued),
      });
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
          asignados_ids: source.asignados_ids,
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
      try {
        await copyTaskFiles(auth.db, id, data.id, auth.user.id);
      } catch (copyError) {
        console.warn('[coordinator/tasks duplicate] files:', copyError?.message || copyError);
      }
      const [task] = await enrichTasksList(auth.db, [data]);
      const mail = await notifyTaskAssignees(auth, task, sendStaffTaskAssignedEmail);
      if (!mail.sent && !mail.skipped && mail.error) {
        console.warn('[coordinator/tasks duplicate] assignment email:', mail.error);
      }
      return NextResponse.json({
        success: true,
        task,
        emailSent: Boolean(mail.sent || mail.queued),
      });
    }

    if (action === 'remind') {
      const role = await getRoleNameByUserId(auth.user.id, auth.user.email);
      if (!canRemindStaffTask(role)) {
        return NextResponse.json(
          { error: 'Solo un administrador puede enviar recordatorios.' },
          { status: 403 },
        );
      }

      const { data: source, error: readErr } = await auth.db
        .from(TASKS_TABLE)
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (readErr || !source) {
        return NextResponse.json({ error: 'Tarea no encontrada.' }, { status: 404 });
      }
      if (source.estado === 'completada' || source.estado === 'cancelada') {
        return NextResponse.json(
          { error: 'Esta tarea ya no está pendiente.' },
          { status: 400 },
        );
      }

      const [task] = await enrichTasksList(auth.db, [source]);
      const mail = await notifyTaskAssignees(auth, task, sendStaffTaskReminderEmail);

      if (!mail.sent && !mail.queued) {
        return NextResponse.json(
          { error: mail.error || 'No se pudo enviar el recordatorio.' },
          { status: mail.skipped ? 400 : 502 },
        );
      }

      const assigneeLabel = mail.names.filter(Boolean).join(', ') || 'la persona asignada';
      return NextResponse.json({
        success: true,
        emailSent: Boolean(mail.sent),
        emailQueued: Boolean(mail.queued),
        message: mail.queued
          ? `El recordatorio para ${assigneeLabel} queda en cola y se enviará en breve.`
          : `Recordatorio enviado a ${assigneeLabel}.`,
      });
    }

    if (action === 'update' || action === 'updateEstado') {
      let validated = null;
      if (action === 'update') {
        validated = validateTaskPayload(body);
        if (!validated.ok) {
          return NextResponse.json({ error: validated.error }, { status: 400 });
        }
        const assigneeCheck = await validateAssignees(
          auth.db,
          validated.data.asignados_ids,
          validated.data.alumno_id,
        );
        if (!assigneeCheck.ok) {
          return NextResponse.json(
            { error: assigneeCheck.error },
            { status: assigneeCheck.status || 400 },
          );
        }
      }

      const patch =
        action === 'updateEstado'
          ? buildTaskUpdatePatch({ estado: body.estado })
          : buildTaskUpdatePatch(validated.data);

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
