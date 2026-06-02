'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  filterTheoryPartsByLevel,
} from '@/lib/theoryPartsCatalog';
import modalStyles from './AdminPlanEditModal.module.css';
import panelStyles from './AdminEjerciciosPanel.module.css';

function emptyOption() {
  return { text: '', correcta: false };
}

function exerciseToForm(exercise) {
  if (!exercise) {
    return {
      topicHref: '',
      nivelId: '',
      skillId: '',
      tipoId: '',
      topicHint: '',
      pregunta: '',
      instruction: '',
      opciones: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
      respuestaAbierta: '',
      respuestaAbiertaDescripcion: '',
    };
  }

  const opciones =
    exercise.opciones?.length > 0
      ? exercise.opciones.map((o) => ({
          text: o.text || '',
          correcta: Boolean(o.correcta),
        }))
      : [emptyOption(), emptyOption(), emptyOption(), emptyOption()];

  return {
    topicHref: exercise.topicHref || '',
    nivelId: exercise.id_nivel || '',
    skillId: exercise.id_skills || '',
    tipoId: exercise.id_tipo_preguntas || '',
    topicHint: '',
    pregunta: exercise.pregunta || '',
    instruction: exercise.instruction || '',
    opciones,
    respuestaAbierta: exercise.respuestaAbierta || '',
    respuestaAbiertaDescripcion: exercise.respuestaAbiertaDescripcion || '',
  };
}

export default function AdminEjercicioEditModal({
  open,
  saving,
  exercise,
  levels = [],
  skills = [],
  tipos = [],
  theoryParts = [],
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(exerciseToForm(null));

  useEffect(() => {
    if (!open) return;
    setForm(exerciseToForm(exercise));
  }, [open, exercise]);

  const selectedLevel = useMemo(
    () => levels.find((l) => l.id === form.nivelId) || null,
    [levels, form.nivelId],
  );

  const filteredTheoryParts = useMemo(
    () => filterTheoryPartsByLevel(theoryParts, selectedLevel?.nombre),
    [theoryParts, selectedLevel?.nombre],
  );

  const theoryPartsByGroup = useMemo(() => {
    const map = new Map();
    for (const part of filteredTheoryParts) {
      if (!map.has(part.group)) map.set(part.group, []);
      map.get(part.group).push(part);
    }
    return [...map.entries()];
  }, [filteredTheoryParts]);

  const selectedTipo = useMemo(
    () => tipos.find((t) => t.id === form.tipoId) || null,
    [tipos, form.tipoId],
  );

  const isOpen = selectedTipo?.answerMode === 'open';

  if (!open || !exercise) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const setOption = (index, field, value) => {
    setForm((f) => {
      const opciones = [...f.opciones];
      opciones[index] = { ...opciones[index], [field]: value };
      return { ...f, opciones };
    });
  };

  const markCorrect = (index) => {
    setForm((f) => ({
      ...f,
      opciones: f.opciones.map((o, i) => ({ ...o, correcta: i === index })),
    }));
  };

  const addOption = () => {
    setForm((f) => ({ ...f, opciones: [...f.opciones, emptyOption()] }));
  };

  const removeOption = (index) => {
    setForm((f) => {
      if (f.opciones.length <= 2) return f;
      return { ...f, opciones: f.opciones.filter((_, i) => i !== index) };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: exercise.id,
      topicHref: form.topicHref,
      nivelId: form.nivelId,
      skillId: form.skillId,
      tipoId: form.tipoId,
      topicHint: form.topicHint,
      pregunta: form.pregunta.trim(),
      instruction: form.instruction.trim(),
      opciones: form.opciones,
      respuestaAbierta: form.respuestaAbierta.trim(),
      respuestaAbiertaDescripcion: form.respuestaAbiertaDescripcion.trim(),
    });
  };

  return (
    <div className={modalStyles.overlay} role="presentation" onClick={onClose}>
      <div
        className={modalStyles.dialog}
        style={{ width: 'min(640px, 100%)' }}
        role="dialog"
        aria-labelledby="ejercicio-edit-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={modalStyles.header}>
          <h2 id="ejercicio-edit-title" className={modalStyles.title}>
            Editar ejercicio
          </h2>
          <button type="button" className={modalStyles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <form className={modalStyles.form} onSubmit={handleSubmit}>
          <label className={`${modalStyles.field} ${modalStyles.fieldFull}`}>
            Parte de teoría
            <select value={form.topicHref} onChange={set('topicHref')} required>
              <option value="">— Selecciona un tema —</option>
              {theoryPartsByGroup.map(([group, items]) => (
                <optgroup key={group} label={group}>
                  {items.map((part) => (
                    <option key={part.href} value={part.href}>
                      {part.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className={modalStyles.field}>
            Nivel
            <select value={form.nivelId} onChange={set('nivelId')} required>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {String(l.nombre).toUpperCase()}
                </option>
              ))}
            </select>
          </label>

          <label className={modalStyles.field}>
            Skill
            <select value={form.skillId} onChange={set('skillId')} required>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>

          <label className={modalStyles.field}>
            Tipo de pregunta
            <select value={form.tipoId} onChange={set('tipoId')} required>
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className={modalStyles.field}>
            Tema (opcional)
            <input type="text" value={form.topicHint} onChange={set('topicHint')} />
          </label>

          <label className={`${modalStyles.field} ${modalStyles.fieldFull}`}>
            Pregunta
            <textarea
              rows={3}
              value={form.pregunta}
              onChange={set('pregunta')}
              required
            />
          </label>

          <label className={`${modalStyles.field} ${modalStyles.fieldFull}`}>
            Instrucción para el alumno
            <textarea rows={2} value={form.instruction} onChange={set('instruction')} />
          </label>

          {isOpen ? (
            <>
              <label className={`${modalStyles.field} ${modalStyles.fieldFull}`}>
                Respuesta modelo
                <textarea
                  rows={2}
                  value={form.respuestaAbierta}
                  onChange={set('respuestaAbierta')}
                  required
                />
              </label>
              <label className={`${modalStyles.field} ${modalStyles.fieldFull}`}>
                Criterio de corrección
                <textarea
                  rows={2}
                  value={form.respuestaAbiertaDescripcion}
                  onChange={set('respuestaAbiertaDescripcion')}
                />
              </label>
            </>
          ) : (
            <div className={modalStyles.fieldFull}>
              <span className={panelStyles.fieldLabel}>Opciones (marca la correcta)</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {form.opciones.map((opt, index) => (
                  <div key={index} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="correcta"
                      checked={opt.correcta}
                      onChange={() => markCorrect(index)}
                      aria-label={`Opción ${index + 1} correcta`}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => setOption(index, 'text', e.target.value)}
                      placeholder={`Opción ${index + 1}`}
                      style={{ flex: 1 }}
                      className={panelStyles.field}
                    />
                    {form.opciones.length > 2 ? (
                      <button
                        type="button"
                        className={panelStyles.btn}
                        onClick={() => removeOption(index)}
                      >
                        Quitar
                      </button>
                    ) : null}
                  </div>
                ))}
                <button type="button" className={panelStyles.btn} onClick={addOption}>
                  + Añadir opción
                </button>
              </div>
            </div>
          )}

          <footer className={modalStyles.footer}>
            <button
              type="button"
              className={modalStyles.btnSecondary}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button type="submit" className={modalStyles.btnPrimary} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
