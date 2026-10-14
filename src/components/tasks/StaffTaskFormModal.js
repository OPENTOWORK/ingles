'use client';

import { useEffect, useRef, useState } from 'react';
import { validateBuzonAttachmentFile } from '@/lib/staffBuzonAttachments';
import { STAFF_TASK_FILES_MAX_COUNT, formatTaskFileSize } from '@/lib/staffTaskFiles';
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
  existingFiles = [],
  onAssigneeChange,
  saving,
  title = 'Nueva tarea',
}) {
  const fileInputRef = useRef(null);
  const wasOpenRef = useRef(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [removedFileIds, setRemovedFileIds] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setPendingFiles([]);
      setRemovedFileIds([]);
      setUploadedFiles([]);
      setFormError('');
    }
    wasOpenRef.current = open;
  }, [open]);

  if (!open) return null;

  const form = initial || EMPTY_TASK_FORM;
  const selectedIds = Array.isArray(form.asignados_ids)
    ? form.asignados_ids
    : form.asignado_id
      ? [form.asignado_id]
      : [];
  const subphasesForFase = subphases.filter((s) => s.fase_id === form.fase_id);
  const keptFiles = [
    ...existingFiles.filter((file) => file?.id && !removedFileIds.includes(file.id)),
    ...uploadedFiles.filter((file) => !removedFileIds.includes(file.id)),
  ];

  const setAssignees = (ids) => {
    const first = assignees.find((user) => user.id === ids[0]);
    onAssigneeChange({
      ...form,
      asignados_ids: ids,
      asignado_id: ids[0] || '',
      asignado_rol: first?.roleName ? getStaffDepartmentLabel(first.roleName) : '',
    });
  };

  const toggleAssignee = (userId, checked) => {
    const ids = checked
      ? [...new Set([...selectedIds, userId])]
      : selectedIds.filter((id) => id !== userId);
    setAssignees(ids);
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const next = [...pendingFiles];
    for (const file of incoming) {
      const validation = validateBuzonAttachmentFile(file);
      if (!validation.ok) {
        setFormError(validation.error);
        return;
      }
      if (keptFiles.length + next.length >= STAFF_TASK_FILES_MAX_COUNT) {
        setFormError(`Una tarea puede tener hasta ${STAFF_TASK_FILES_MAX_COUNT} archivos.`);
        return;
      }
      next.push(file);
    }
    setFormError('');
    setPendingFiles(next);
  };

  return (
    <ModalShell title={title} onClose={onClose} wide>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!selectedIds.length) {
            setFormError('Selecciona al menos una persona.');
            return;
          }
          setFormError('');
          void onSave(form, {
            files: pendingFiles,
            removeFileIds: removedFileIds,
            onFileUploaded: (file, saved) => {
              setPendingFiles((current) => current.filter((item) => item !== file));
              if (saved?.id) setUploadedFiles((current) => [...current, saved]);
            },
          });
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
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Personas asignadas *</label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
              {assignees.map((user) => (
                <label key={user.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(user.id)}
                    onChange={(e) => toggleAssignee(user.id, e.target.checked)}
                  />
                  <span>
                    {user.nombre || user.email}
                    {user.roleName ? ` (${getStaffDepartmentLabel(user.roleName)})` : ''}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedIds.length
                ? `${selectedIds.length} ${selectedIds.length === 1 ? 'persona seleccionada' : 'personas seleccionadas'}`
                : 'Selecciona al menos una persona.'}
            </p>
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
          <div className="sm:col-span-2">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Archivos</label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 border rounded-lg text-sm text-gray-700"
          >
            Subir archivos
          </button>
          {keptFiles.length || pendingFiles.length ? (
            <ul className="mt-2 space-y-1">
              {keptFiles.map((file) => (
                <li key={file.id} className="flex items-center justify-between gap-2 text-sm text-gray-700">
                  <span className="min-w-0 truncate">
                    {file.nombre}
                    {file.size_bytes ? ` · ${formatTaskFileSize(file.size_bytes)}` : ''}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-600 shrink-0"
                    onClick={() => setRemovedFileIds((current) => [...current, file.id])}
                  >
                    Quitar
                  </button>
                </li>
              ))}
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 text-sm text-gray-700">
                  <span className="min-w-0 truncate">
                    {file.name} · {formatTaskFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-red-600 shrink-0"
                    onClick={() => setPendingFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 mt-1">Puedes adjuntar varios archivos, de hasta 15 MB cada uno.</p>
          )}
        </div>
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
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
