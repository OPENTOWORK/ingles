'use client';

import { useState } from 'react';
import Link from 'next/link';
import { landingFont } from '@/components/home/landing/landingFont';
import styles from './newsletter.module.css';

const COPY = {
  confirm: {
    kicker: 'Newsletter',
    title: 'Confirma tu correo',
    lead: 'Pulsa el botón para empezar a recibir la newsletter. Hasta entonces no estás en la lista.',
    action: 'Confirmar suscripción',
    sending: 'Confirmando…',
    done: 'Listo. Ya recibes la newsletter de Dralo.',
    already: 'Este correo ya estaba confirmado.',
    missing: 'Este enlace no es válido.',
    endpoint: '/api/newsletter/confirm/',
  },
  unsubscribe: {
    kicker: 'Newsletter',
    title: 'Date de baja',
    lead: 'Si pulsas el botón, dejaremos de enviarte la newsletter. El blog sigue disponible cuando quieras leer.',
    action: 'Darme de baja',
    sending: 'Guardando…',
    done: 'Te hemos dado de baja. No volverás a recibir la newsletter.',
    already: 'Ya estabas dado de baja.',
    missing: 'Este enlace no es válido.',
    endpoint: '/api/newsletter/unsubscribe/',
  },
};

export default function NewsletterTokenAction({ mode, token }) {
  const copy = COPY[mode] || COPY.confirm;
  const [status, setStatus] = useState(token ? 'ready' : 'missing');
  const [message, setMessage] = useState(token ? '' : copy.missing);

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending' || !token) return;
    setStatus('sending');
    setMessage('');
    try {
      const res = await fetch(copy.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'No hemos podido completar la acción. Inténtalo de nuevo.');
        return;
      }
      setStatus('done');
      setMessage(data.already ? copy.already : copy.done);
    } catch {
      setStatus('error');
      setMessage('No hemos podido completar la acción. Inténtalo de nuevo.');
    }
  }

  return (
    <div className={`${styles.page} ${landingFont.variable}`}>
      <div className={styles.shell}>
        <div className={styles.outcome}>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h1>{copy.title}</h1>
          {status === 'done' || status === 'missing' ? (
            <p role="status">{message}</p>
          ) : (
            <>
              <p>{copy.lead}</p>
              {status === 'error' ? (
                <p className={`${styles.status} ${styles.statusError}`} role="alert">{message}</p>
              ) : null}
              <form onSubmit={onSubmit}>
                <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? copy.sending : copy.action}
                </button>
              </form>
            </>
          )}
          <p>
            <Link href="/newsletter/">Volver a la newsletter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
