'use client';

import { useState } from 'react';
import { shouldShowSchemaSetupHint } from '@/lib/staffTasksPermissions';
import { EMPTY_TEMPLATE_FORM, TASK_PRIORIDADES } from '@/lib/staffTasksConstants';
import { TASK_PRIORIDAD_LABELS } from '@/lib/staffTasksConstants';

export default function StaffTaskTemplatesSection({
  fetchApi,
  templates = [],
  templatesReady,
  phases = [],
  saving,
  onUseTemplate,
  onTemplatesChange,
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_TEMPLATE_FORM });
  const [localSaving, setLocalSaving] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_TEMPLATE_FORM });
  };

  const startCreate = () => {
    resetForm();
    setExpanded(true);
  };

  const startEdit = (template) => {
    setEditingId(template.id);
    setForm({
      nombre: template.nombre || '',
      titulo: template.titulo || '',
      descripcion: template.descripcion || '',
      enlace: template.enlace || '',
      prioridad_default: template.prioridad_default || 'media',
      asignado_rol_default: template.asignado_rol_default || '',
      fase_id: template.fase_id || '',
      notas_default: template.notas_default || '',
    });
    setExpanded(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.titulo.trim()) {
      alert('Nombre y título son obligatorios.');
      return;
    }
    setLocalSaving(true);
    try {
      await fetchApi('/api/coordinator/task-templates', {
        method: 'POST',
        body: JSON.stringify({
          action: editingId ? 'update' : 'create',
          id: editingId || undefined,
          ...form,
          fase_id: form.fase_id || null,
        }),
      });
      resetForm();
      await onTemplatesChange?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setLocalSaving(false);
    }
  };

  const handleDelete = async (template) => {
    if (!window.confirm(`¿Eliminar la plantilla «${template.nombre}»?`)) return;
    setLocalSaving(true);
    try {
      await fetchApi('/api/coordinator/task-templates', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id: template.id }),
      });
      if (editingId === template.id) resetForm();
      await onTemplatesChange?.();
    } catch (error) {
      alert(error.message);
    } finally {
      setLocalSaving(false);
    }
  };

  const isBusy = saving || localSaving;
  const showDevHint = shouldShowSchemaSetupHint(templatesReady);

  return (
    <section className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Plantillas rápidas</h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Reutiliza tareas frecuentes como revisar Writing, validar producción o preparar contenido.
          </p>
        </div>
        <button
          type="button"
          onClick={() => (expanded ? setExpanded(false) : startCreate())}
          disabled={isBusy}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-violet-200 text-violet-700 hover:bg-violet-50 disabled:opacity-50"
        >
          {expanded ? 'Cerrar' : '+ Nueva plantilla'}
        </button>
      </div>

      {showDevHint && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          [Dev] Migración de plantillas pendiente en local.
        </p>
      )}

      {templates.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="inline-flex items-center gap-1 rounded-full bg-white border border-violet-200 pl-3 pr-1 py-1 text-xs shadow-sm"
            >
              <button
                type="button"
                onClick={() => onUseTemplate(template)}
                disabled={isBusy}
                className="font-medium text-violet-800 hover:text-violet-950 disabled:opacity-50"
              >
                {template.nombre}
              </button>
              <button
                type="button"
                onClick={() => startEdit(template)}
                disabled={isBusy}
                className="px-2 py-0.5 text-gray-500 hover:text-gray-800"
                title="Editar"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(template)}
                disabled={isBusy}
                className="px-2 py-0.5 text-red-500 hover:text-red-700"
                title="Eliminar"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : templatesReady !== false ? (
        <div className="rounded-lg border border-dashed border-violet-200 bg-white/60 px-4 py-6 text-center">
          <p className="text-sm text-gray-600">
            Todavía no hay plantillas creadas. Crea una para reutilizar tareas frecuentes.
          </p>
          <button
            type="button"
            onClick={startCreate}
            className="mt-2 text-sm text-violet-600 hover:underline font-medium"
          >
            + Nueva plantilla
          </button>
        </div>
      ) : null}

      {expanded && (
        <div className="rounded-lg border border-violet-200 bg-white p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            {editingId ? 'Editar plantilla' : 'Nueva plantilla'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
              <input
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej. Revisar feedback Writing"
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título de tarea *</label>
              <input
                value={form.titulo}
                onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prioridad</label>
              <select
                value={form.prioridad_default}
                onChange={(e) => setForm((p) => ({ ...p, prioridad_default: e.target.value }))}
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Fase</label>
              <select
                value={form.fase_id}
                onChange={(e) => setForm((p) => ({ ...p, fase_id: e.target.value }))}
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
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Instrucciones</label>
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
                rows={2}
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Enlace</label>
              <input
                value={form.enlace}
                onChange={(e) => setForm((p) => ({ ...p, enlace: e.target.value }))}
                placeholder="/niveles/b1/..."
                className="border rounded-lg px-3 py-2 text-sm w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isBusy}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {localSaving ? 'Guardando…' : editingId ? 'Guardar' : 'Crear plantilla'}
            </button>
            <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">
              Limpiar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
