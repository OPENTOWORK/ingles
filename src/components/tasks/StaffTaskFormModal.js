'use client';

import { EMPTY_TASK_FORM, TASK_ESTADOS, TASK_PRIORIDADES } from '@/lib/staffTasksConstants';
import { TASK_ESTADO_LABELS, TASK_PRIORIDAD_LABELS } from '@/lib/staffTasksConstants';
import { getStaffDepartmentLabel } from '@/lib/staffTasksPermissions';

const ROL_OPTIONS = [
  { value: 'administrador', label: 'Administración' },
  { value: 'coordinador', label: 'Coordinación' },
  { value: 'profesor', label: 'Profesorado' },
  { value: 'soporte', label: 'Soporte' },
  { value: 'informatico', label: 'Informática' },
];

function ModalShell({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        className={`bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-y-auto ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function StaffTaskFormModal({
  open,
  onClose,
  onSave,
  initial,
  phases = [],
  subphases = [],
  assignees = [],
  students = [],
  assigneeIsTeacher,
  onAssigneeChange,
  saving,
  title = 'Nueva tarea',
}) {
  if (!open) return null;

  const form = initial || EMPTY_TASK_FORM;
  const subphasesForFase = subphases.filter((s) => s.fase_id === form.fase_id);

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(form);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input
            value={form.titulo}
            onChange={(e) => onAssigneeChange({ ...form, titulo: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => onAssigneeChange({ ...form, descripcion: e.target.value })}
            rows={3}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Persona asignada</label>
            <select
              value={form.asignado_id}
              onChange={(e) => {
                const user = assignees.find((u) => u.id === e.target.value);
                onAssigneeChange({
                  ...form,
                  asignado_id: e.target.value,
                  asignado_rol: user?.roleName ? getStaffDepartmentLabel(user.roleName) : form.asignado_rol,
                  alumno_id: '',
                });
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Sin persona concreta</option>
              {assignees.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre || u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol / departamento *</label>
            <select
              value={form.asignado_rol}
              onChange={(e) => onAssigneeChange({ ...form, asignado_rol: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
              required={!form.asignado_id}
            >
              <option value="">Selecciona rol…</option>
              {ROL_OPTIONS.map((r) => (
                <option key={r.value} value={r.label}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
            <select
              value={form.fase_id}
              onChange={(e) => {
                const fase_id = e.target.value;
                const keepSubfase =
                  form.subfase_id &&
                  subphases.some((s) => s.id === form.subfase_id && s.fase_id === fase_id);
                onAssigneeChange({
                  ...form,
                  fase_id,
                  subfase_id: keepSubfase ? form.subfase_id : '',
                });
              }}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              <option value="">Sin fase</option>
              {phases.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subfase</label>
            <select
              value={form.subfase_id}
              onChange={(e) => onAssigneeChange({ ...form, subfase_id: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
              disabled={!form.fase_id}
            >
              <option value="">Sin subfase</option>
              {subphasesForFase.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              value={form.estado}
              onChange={(e) => onAssigneeChange({ ...form, estado: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              {TASK_ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {TASK_ESTADO_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad *</label>
            <select
              value={form.prioridad}
              onChange={(e) => onAssigneeChange({ ...form, prioridad: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              {TASK_PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {TASK_PRIORIDAD_LABELS[p]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
            <input
              type="datetime-local"
              value={form.fecha_limite}
              onChange={(e) => onAssigneeChange({ ...form, fecha_limite: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          {assigneeIsTeacher ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alumno (opcional)</label>
              <select
                value={form.alumno_id}
                onChange={(e) => onAssigneeChange({ ...form, alumno_id: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              >
                <option value="">Todos sus alumnos</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre || s.email}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className={assigneeIsTeacher ? '' : 'sm:col-span-2'}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace</label>
            <input
              value={form.enlace}
              onChange={(e) => onAssigneeChange({ ...form, enlace: e.target.value })}
              placeholder="/niveles/b1/..."
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas internas</label>
          <textarea
            value={form.notas}
            onChange={(e) => onAssigneeChange({ ...form, notas: e.target.value })}
            rows={2}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        {form.estado === 'bloqueada' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del bloqueo</label>
            <input
              value={form.bloqueada_motivo}
              onChange={(e) => onAssigneeChange({ ...form, bloqueada_motivo: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar tarea'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border rounded-lg text-sm text-gray-700 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export { ROL_OPTIONS };
