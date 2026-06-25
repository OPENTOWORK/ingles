'use client';

import {
  EMPTY_SUBFASE_FORM,
  FASE_ESTADOS,
  FASE_ESTADO_LABELS,
} from '@/lib/staffTasksConstants';

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

export default function StaffSubphaseFormModal({
  open,
  onClose,
  onSave,
  initial,
  onChange,
  phases = [],
  saving,
  title = 'Nueva subfase',
}) {
  if (!open) return null;
  const form = initial || EMPTY_SUBFASE_FORM;

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Fase *</label>
          <select
            value={form.fase_id}
            onChange={(e) => onChange({ ...form, fase_id: e.target.value })}
            className="border rounded-lg px-3 py-2 text-sm w-full"
            required
          >
            <option value="">Selecciona fase…</option>
            {phases.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>
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
        </div>
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Guardando…' : 'Guardar subfase'}
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm">
            Cancelar
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
