'use client';

import { useEffect, useState } from 'react';
import styles from './AdminPlanEditModal.module.css';

const EMPTY_FORM = {
  nombre: '',
  slug: '',
  descripcion: '',
  precio: '0',
  duracion_dias: '30',
  badge: '',
  orden: '0',
  stripe_price_id: '',
  descripcion_corta: '',
};

function planToForm(plan) {
  if (!plan) return { ...EMPTY_FORM };
  const meta = plan?.metadata && typeof plan.metadata === 'object' ? plan.metadata : {};
  return {
    nombre: plan?.nombre ?? '',
    slug: plan?.slug ?? '',
    descripcion: plan?.descripcion ?? '',
    precio: plan?.precio != null ? String(plan.precio) : '0',
    duracion_dias: plan?.duracion_dias != null ? String(plan.duracion_dias) : '30',
    badge: plan?.badge ?? '',
    orden: plan?.orden != null ? String(plan.orden) : '0',
    stripe_price_id: plan?.stripe_price_id ?? '',
    descripcion_corta: meta.descripcion_corta ?? '',
  };
}

export default function AdminPlanEditModal({ plan, mode = 'edit', open, saving, onClose, onSave }) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(isCreate ? { ...EMPTY_FORM } : planToForm(plan));
  }, [open, plan, isCreate]);

  if (!open) return null;
  if (!isCreate && !plan) return null;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim().toLowerCase(),
      descripcion: form.descripcion.trim(),
      descripcion_corta: form.descripcion_corta.trim(),
      precio: Number.parseFloat(form.precio) || 0,
      duracion_dias: Number.parseInt(form.duracion_dias, 10) || 30,
      badge: form.badge.trim() || null,
      orden: Number.parseInt(form.orden, 10) || 0,
      stripe_price_id: form.stripe_price_id.trim() || null,
    };
    if (!isCreate && plan?.id) payload.id = plan.id;
    onSave(payload);
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-labelledby="plan-edit-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2 id="plan-edit-title" className={styles.title}>
            {isCreate ? 'Crear plan' : 'Editar plan'}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre</span>
            <input value={form.nombre} onChange={set('nombre')} required />
          </label>
          <label className={styles.field}>
            <span>Slug</span>
            <input value={form.slug} onChange={set('slug')} required pattern="[a-z0-9-]+" />
          </label>
          <label className={styles.field}>
            <span>Precio (€)</span>
            <input type="number" min="0" step="0.01" value={form.precio} onChange={set('precio')} />
          </label>
          <label className={styles.field}>
            <span>Duración (días)</span>
            <input type="number" min="1" value={form.duracion_dias} onChange={set('duracion_dias')} />
          </label>
          <label className={styles.field}>
            <span>Orden</span>
            <input type="number" value={form.orden} onChange={set('orden')} />
          </label>
          <label className={styles.field}>
            <span>Badge (opcional)</span>
            <input value={form.badge} onChange={set('badge')} placeholder="🏆 MÁS POPULAR" />
          </label>
          <label className={styles.field}>
            <span>Stripe Price ID</span>
            <input value={form.stripe_price_id} onChange={set('stripe_price_id')} placeholder="price_…" />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Descripción corta</span>
            <input value={form.descripcion_corta} onChange={set('descripcion_corta')} />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            <span>Descripción</span>
            <textarea rows={3} value={form.descripcion} onChange={set('descripcion')} />
          </label>

          <footer className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>
              {saving ? 'Guardando…' : isCreate ? 'Crear plan' : 'Guardar cambios'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
