import {
  assertStaffAssigneeId,
  getStaffRoleIds,
  getTeacherRoleIds,
  isSchemaNotReadyError,
} from '@/lib/coordinatorAccess';
import { taskAssigneeIds } from '@/lib/staffTaskAssignees';
import { loadTaskFilesByTaskIds } from '@/lib/staffTaskFilesServer';
import {
  computeTaskMetrics,
  enrichTaskRow,
  validateTaskPayload,
} from '@/lib/staffTaskHelpers';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assigneeMembershipFilter(userId) {
  const id = String(userId || '').trim();
  if (!UUID_RE.test(id)) return 'id.eq.00000000-0000-4000-8000-000000000000';
  return `asignado_id.eq.${id},asignados_ids.cs.{${id}}`;
}

const TASKS_TABLE = 'staff_tareas';
const FASES_TABLE = 'staff_fases';
const SUBFASES_TABLE = 'staff_subfases';

export async function assertStudentAssignedToTeacher(db, profesorId, alumnoId) {
  const { data, error } = await db
    .from('profesor_alumnos')
    .select('id')
    .eq('profesor_id', profesorId)
    .eq('alumno_id', alumnoId)
    .maybeSingle();
  if (error && !isSchemaNotReadyError(error)) throw error;
  return Boolean(data?.id);
}

function mapProfileRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    nombre: row.nombre,
    roleName: row.Usuarios_y_Perfil_roles?.nombre || row.roleName || '',
  };
}

export async function loadProfilesByIds(db, ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, Usuarios_y_Perfil_roles ( nombre )')
    .in('id', unique);
  return Object.fromEntries((data || []).map((p) => [p.id, mapProfileRow(p)]));
}

export async function loadPhasesByIds(db, ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await db
    .from(FASES_TABLE)
    .select('id, nombre, estado, orden')
    .in('id', unique);
  return Object.fromEntries((data || []).map((f) => [f.id, f]));
}

export async function loadSubphasesByIds(db, ids = []) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return {};
  const { data } = await db
    .from(SUBFASES_TABLE)
    .select('id, nombre, estado, orden, fase_id')
    .in('id', unique);
  return Object.fromEntries((data || []).map((s) => [s.id, s]));
}

export async function enrichTasksList(db, tasks = []) {
  const userIds = [];
  const faseIds = [];
  const subfaseIds = [];
  for (const t of tasks) {
    userIds.push(...taskAssigneeIds(t));
    if (t.alumno_id) userIds.push(t.alumno_id);
    if (t.fase_id) faseIds.push(t.fase_id);
    if (t.subfase_id) subfaseIds.push(t.subfase_id);
  }
  const [profilesById, phasesById, subphasesById, filesByTask] = await Promise.all([
    loadProfilesByIds(db, userIds),
    loadPhasesByIds(db, faseIds),
    loadSubphasesByIds(db, subfaseIds),
    loadTaskFilesByTaskIds(db, tasks.map((task) => task.id)),
  ]);
  return tasks.map((t) => ({
    ...enrichTaskRow(t, profilesById, phasesById, subphasesById),
    archivos: filesByTask[t.id] || [],
  }));
}

export async function probeStaffTasksTable(db) {
  return db.from(TASKS_TABLE).select('id').limit(1);
}

export async function buildTasksQuery(db, { assigneeId, mineOnly, userId, estado, faseId, subfaseId, prioridad }) {
  let query = db
    .from(TASKS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);

  if (assigneeId) {
    const check = await assertStaffAssigneeId(db, assigneeId);
    if (!check.ok) return { error: check.error, status: 404 };
    query = query.or(assigneeMembershipFilter(assigneeId));
  } else if (mineOnly && userId) {
    query = query.or(assigneeMembershipFilter(userId));
  }

  if (estado && estado !== 'vencida') query = query.eq('estado', estado);
  if (faseId) query = query.eq('fase_id', faseId);
  if (subfaseId) query = query.eq('subfase_id', subfaseId);
  if (prioridad) query = query.eq('prioridad', prioridad);

  return { query };
}

export async function validateAssigneeAndStudent(db, asignado_id, alumno_id) {
  if (!asignado_id) return { ok: true };
  const assigneeCheck = await assertStaffAssigneeId(db, asignado_id);
  if (!assigneeCheck.ok) return assigneeCheck;

  if (alumno_id) {
    const teacherRoleIds = await getTeacherRoleIds(db);
    if (!teacherRoleIds.includes(assigneeCheck.assignee.rol_id)) {
      return {
        ok: false,
        error: 'Solo puedes indicar alumno si el destinatario es profesor.',
        status: 400,
      };
    }
    const assigned = await assertStudentAssignedToTeacher(db, asignado_id, alumno_id);
    if (!assigned) {
      return { ok: false, error: 'Ese alumno no está asignado a este profesor.', status: 403 };
    }
  }
  return { ok: true };
}

export function buildTaskInsertRow(payload, userId) {
  const now = new Date().toISOString();
  return {
    titulo: payload.titulo,
    descripcion: payload.descripcion,
    estado: payload.estado,
    prioridad: payload.prioridad,
    fase_id: payload.fase_id,
    subfase_id: payload.subfase_id,
    asignado_id: payload.asignado_id,
    asignados_ids: payload.asignados_ids?.length
      ? payload.asignados_ids
      : payload.asignado_id
        ? [payload.asignado_id]
        : [],
    asignado_rol: payload.asignado_rol,
    alumno_id: payload.alumno_id,
    fecha_limite: payload.fecha_limite,
    enlace: payload.enlace,
    notas: payload.notas,
    bloqueada_motivo: payload.bloqueada_motivo,
    checklist: payload.checklist,
    created_by: userId,
    updated_at: now,
    completada_at: payload.estado === 'completada' ? now : null,
    cancelada_at: payload.estado === 'cancelada' ? now : null,
  };
}

export function buildTaskUpdatePatch(body = {}) {
  const patch = { updated_at: new Date().toISOString() };
  const fields = [
    'titulo',
    'descripcion',
    'estado',
    'prioridad',
    'fase_id',
    'subfase_id',
    'asignado_id',
    'asignados_ids',
    'asignado_rol',
    'alumno_id',
    'fecha_limite',
    'enlace',
    'notas',
    'bloqueada_motivo',
    'checklist',
  ];
  for (const key of fields) {
    if (body[key] !== undefined) patch[key] = body[key];
  }
  if (body.estado === 'completada') patch.completada_at = new Date().toISOString();
  if (body.estado === 'cancelada') patch.cancelada_at = new Date().toISOString();
  if (body.estado && body.estado !== 'completada') patch.completada_at = null;
  if (body.estado && body.estado !== 'cancelada') patch.cancelada_at = null;
  return patch;
}

export { computeTaskMetrics, validateTaskPayload, getStaffRoleIds };
