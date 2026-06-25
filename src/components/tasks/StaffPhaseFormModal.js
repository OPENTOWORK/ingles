'use client';

import { EMPTY_FASE_FORM, FASE_ESTADOS, FASE_ESTADO_LABELS } from '@/lib/staffTasksConstants';
import { getStaffRoleLabel } from '@/utils/staffBuzon';

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" role="dialog">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function StaffPhaseFormModal({
  open,
  onClose,
  onSave,
  initial,
  onChange,
  assignees = [],
  saving,
  title = 'Nueva fase',
}) {
  if (!open) return null;
  const form = initial || EMPTY_FASE_FORM;
  const selectedIds = Array.isArray(form.responsables_ids) ? form.responsables_ids : [];

  const toggleResponsable = (userId, checked) => {
    const ids = checked
      ? [...new Set([...selectedIds, userId])]
      : selectedIds.filter((id) => id !== userId);
    onChange({
      ...form,
      responsables_todos: false,
      responsables_ids: ids,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void onSave(form);
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            value={form.nombre}
            onChange={(e) => onChange({ ...form, nombre: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => onChange({ ...form, descripcion: e.target.value })}
            rows={2}
            className="border rounded-lg px-3 py-2 text-sm w-full"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => onChange({ ...form, estado: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            >
              {FASE_ESTADOS.map((s) => (
                <option key={s} value={s}>
                  {FASE_ESTADO_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
            <input
              type="number"
              value={form.orden}
              onChange={(e) => onChange({ ...form, orden: Number(e.target.value) || 0 })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
            <input
              type="date"
              value={form.fecha_inicio}
              onChange={(e) => onChange({ ...form, fecha_inicio: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha límite</label>
            <input
              type="date"
              value={form.fecha_limite}
              onChange={(e) => onChange({ ...form, fecha_limite: e.target.value })}
              className="border rounded-lg px-3 py-2 text-sm w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsables</label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
              <label className="flex items-center gap-2 text-sm font-medium pb-2 border-b border-gray-200">
                <input
                  type="checkbox"
                  checked={form.responsables_todos}
                  onChange={(e) =>
                    onChange({
                      ...form,
                      responsables_todos: e.target.checked,
                      responsables_ids: e.target.checked ? [] : selectedIds,
                    })
                  }
                />
                Todo el equipo
              </label>
              {!form.responsables_todos
                ? assignees.map((u) => (
                    <label key={u.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={(e) => toggleResponsable(u.id, e.target.checked)}
                      />
                      <span>
                        {u.nombre || u.email}
                        {u.roleName ? ` (${getStaffRoleLabel(u.roleName)})` : ''}
                      </span>
                    </label>
                  ))
                : null}
            </div>
            {form.responsables_todos ? (
              <p className="text-xs text-gray-500 mt-1">Responsabilidad compartida por todo el staff.</p>
            ) : selectedIds.length > 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                {selectedIds.length} responsable{selectedIds.length === 1 ? '' : 's'} seleccionado
                {selectedIds.length === 1 ? '' : 's'}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">Sin responsables asignados.</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar fase'}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
