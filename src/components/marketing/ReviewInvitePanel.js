'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from './MarketingAudiencePanel.module.css';

async function staffFetch(path, options = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export default function ReviewInvitePanel() {
  const [accepted, setAccepted] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [people, published] = await Promise.all([
          staffFetch('/api/admin/marketing/guide-requests/'),
          staffFetch('/api/admin/marketing/reviews/'),
        ]);
        if (cancelled) return;
        const requests = Array.isArray(people.json.requests) ? people.json.requests : [];
        setAccepted(requests.filter((row) => row.marketingAccepted).length);
        setReviews(Array.isArray(published.json.reviews) ? published.json.reviews : []);
        if (!people.res.ok || !published.res.ok) {
          setError(people.json.error || published.json.error || 'No se ha podido cargar.');
        }
      } catch (err) {
        console.error('[ReviewInvitePanel]', err);
        if (!cancelled) setError('No se ha podido cargar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function sendInvite() {
    setError('');
    setMessage('');
    if (!accepted) {
      setError('No hay personas que hayan aceptado los envíos comerciales.');
      return;
    }
    const confirmed = window.confirm(
      `Se enviará un correo a ${accepted} ${accepted === 1 ? 'persona que aceptó' : 'personas que aceptaron'} los envíos comerciales.`,
    );
    if (!confirmed) return;
    setSending(true);
    try {
      const { res, json } = await staffFetch('/api/admin/marketing/review-invite/', {
        method: 'POST',
        body: JSON.stringify({ confirm: true }),
      });
      if (!res.ok) {
        setError(json.error || 'No se ha podido enviar el correo.');
        return;
      }
      const failed = Number(json.failed) || 0;
      setMessage(
        failed
          ? `Enviados ${json.sent}. No se han podido enviar ${failed}.`
          : `Correo enviado a ${json.sent} ${json.sent === 1 ? 'persona' : 'personas'}.`,
      );
    } catch (err) {
      console.error('[ReviewInvitePanel] send', err);
      setError('No se ha podido enviar el correo.');
    } finally {
      setSending(false);
    }
  }

  async function setPublished(review, published) {
    setError('');
    const { res, json } = await staffFetch('/api/admin/marketing/reviews/', {
      method: 'PATCH',
      body: JSON.stringify({ id: review.id, published }),
    });
    if (!res.ok) {
      setError(json.error || 'No se ha podido actualizar la reseña.');
      return;
    }
    setReviews((current) =>
      current.map((item) => (item.id === review.id ? { ...item, published } : item)),
    );
  }

  return (
    <section className={`${styles.card} ${styles.sheet}`} aria-labelledby="review-invite-heading">
      <h2 id="review-invite-heading" className={styles.heading}>
        Pedir reseñas
      </h2>
      <p className={styles.lead}>
        Envía un correo a quienes pidieron la guía y aceptaron los envíos comerciales, con el enlace para dejar su reseña en la web.
      </p>
      {loading ? <p className={styles.summary}>Cargando…</p> : null}
      {!loading ? (
        <div className={styles.inviteActions}>
          <button type="button" className={styles.primary} onClick={sendInvite} disabled={sending || accepted === 0}>
            {sending ? 'Enviando…' : 'Enviar correo de reseña'}
          </button>
          <p className={styles.summary}>
            {accepted} {accepted === 1 ? 'persona acepta' : 'personas aceptan'} los envíos comerciales.
          </p>
        </div>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.summary}>{message}</p> : null}

      <h3 className={styles.subheading}>Reseñas en la web</h3>
      {reviews.length ? (
        <ul className={styles.reviewList}>
          {reviews.map((review) => (
            <li key={review.id}>
              <p>
                <strong>{review.name}</strong>
                {' '}
                {'★'.repeat(review.stars || 0)}
                {' '}
                {review.published ? 'Visible' : 'Oculta'}
              </p>
              <p>{review.text}</p>
              <button type="button" className={styles.filter} onClick={() => setPublished(review, !review.published)}>
                {review.published ? 'Ocultar' : 'Mostrar'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>{loading ? '' : 'Todavía no hay reseñas.'}</p>
      )}
    </section>
  );
}
