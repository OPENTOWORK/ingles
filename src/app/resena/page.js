'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { landingFont } from '@/components/home/landing/landingFont';
import { supabase } from '@/utils/supabaseClient';
import styles from './resena.module.css';

const EMPTY = { name: '', text: '', stars: 0, company: '' };
const LOGIN_HREF = '/login/?next=%2Fresena%2F';

function accountName(user) {
  const meta = user?.user_metadata || {};
  return String(meta.nombre || meta.full_name || meta.name || '').trim();
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : null;
}

export default function ResenaPage() {
  const [mode, setMode] = useState('loading');
  const [form, setForm] = useState(EMPTY);
  const [hasReview, setHasReview] = useState(false);
  const [reviewId, setReviewId] = useState('');
  const [hiddenOnSite, setHiddenOnSite] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const headers = await authHeader();
      if (!headers) {
        if (!cancelled) setMode('guest');
        return;
      }
      try {
        const { data } = await supabase.auth.getSession();
        const res = await fetch('/api/resenas/mia/', { headers });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.status === 401) {
          setMode('guest');
          return;
        }
        if (!res.ok) {
          setError(json.error || 'No se ha podido cargar tu reseña.');
          setMode('form');
          return;
        }
        if (json.review) {
          setForm({
            name: json.review.name || '',
            text: json.review.text || '',
            stars: Number(json.review.stars) || 0,
            company: '',
          });
          setHasReview(true);
          setReviewId(json.review.id || '');
          setHiddenOnSite(json.review.published === false);
        } else {
          setForm({ ...EMPTY, name: accountName(data?.session?.user) });
        }
        setMode('form');
      } catch {
        if (!cancelled) {
          setError('No se ha podido cargar tu reseña.');
          setMode('form');
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setStatus('');
    const headers = await authHeader();
    if (!headers) {
      setMode('guest');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/resenas/', {
        method: hasReview ? 'PATCH' : 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMode('guest');
        return;
      }
      if (!res.ok) {
        setError(json.error || 'No se ha podido guardar la reseña.');
        return;
      }
      if (json.review) {
        setHasReview(true);
        setReviewId(json.review.id || reviewId);
        setHiddenOnSite(json.review.published === false);
        window.dispatchEvent(new CustomEvent('dralo-site-review', { detail: json.review }));
      }
      setStatus(hasReview ? 'Cambios guardados.' : 'Tu reseña ya está en la web.');
    } catch {
      setError('No se ha podido guardar la reseña.');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setError('');
    setStatus('');
    if (!window.confirm('¿Eliminar tu reseña de la web?')) return;
    const headers = await authHeader();
    if (!headers) {
      setMode('guest');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/resenas/', { method: 'DELETE', headers });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setMode('guest');
        return;
      }
      if (!res.ok) {
        setError(json.error || 'No se ha podido eliminar la reseña.');
        return;
      }
      const { data } = await supabase.auth.getSession();
      setForm({ ...EMPTY, name: accountName(data?.session?.user) });
      setHasReview(false);
      setReviewId('');
      setHiddenOnSite(false);
      setStatus('Has eliminado tu reseña.');
      window.dispatchEvent(new CustomEvent('dralo-site-review', { detail: { removedId: reviewId } }));
    } catch {
      setError('No se ha podido eliminar la reseña.');
    } finally {
      setSaving(false);
    }
  }

  const scoreLabel = form.stars ? `${form.stars} de 5` : 'Elige de 1 a 5';

  return (
    <main className={`site-review-page ${landingFont.className} ${styles.page}`}>
      <PageHero
        eyebrow="Opiniones"
        title="Tu reseña"
        description="Se publica en la web. Cada cuenta puede dejar una, y después puedes editarla o eliminarla."
        showMascot
        mascotVariant={8}
        mascotWidth={132}
        accent="violet"
        contentAlign="left"
      />

      {mode === 'loading' ? <p className={styles.note}>Cargando…</p> : null}

      {mode === 'guest' ? (
        <section className={styles.card}>
          <p className={styles.lead}>Para dejar tu reseña necesitas iniciar sesión.</p>
          <Link className={styles.primary} href={LOGIN_HREF}>
            Iniciar sesión
          </Link>
        </section>
      ) : null}

      {mode === 'form' ? (
        <form className={styles.card} onSubmit={onSubmit}>
          {hiddenOnSite ? <p className={styles.note}>Esta reseña no se está mostrando en la web.</p> : null}
          <label className={styles.hp} aria-hidden="true">
            Empresa
            <input
              tabIndex={-1}
              autoComplete="off"
              value={form.company}
              onChange={(event) => setField('company', event.target.value)}
            />
          </label>
          <label className={styles.field}>
            <span>Nombre</span>
            <input
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              autoComplete="name"
              maxLength={40}
              required
            />
          </label>
          <div className={styles.field}>
            <span id="review-stars-label">Valoración</span>
            <div className={styles.stars} role="radiogroup" aria-labelledby="review-stars-label">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={form.stars === score}
                  aria-label={`${score} ${score === 1 ? 'estrella' : 'estrellas'}`}
                  className={form.stars >= score ? styles.starOn : styles.star}
                  onClick={() => setField('stars', score)}
                >
                  ★
                </button>
              ))}
              <span className={styles.score}>{scoreLabel}</span>
            </div>
          </div>
          <label className={styles.field}>
            <span>Reseña</span>
            <textarea
              value={form.text}
              onChange={(event) => setField('text', event.target.value)}
              placeholder="Cuéntanos qué te ha parecido"
              maxLength={400}
              required
            />
            <span className={styles.count}>{form.text.length} / 400</span>
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={saving}>
              {saving ? 'Guardando…' : hasReview ? 'Guardar cambios' : 'Publicar reseña'}
            </button>
            {hasReview ? (
              <button className={styles.danger} type="button" onClick={onDelete} disabled={saving}>
                Eliminar
              </button>
            ) : null}
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          {status ? <p className={styles.status} role="status">{status}</p> : null}
        </form>
      ) : null}
    </main>
  );
}
