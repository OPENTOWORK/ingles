'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function B2GuideDownloadForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setMessage('');
    const form = event.currentTarget;
    const website = new FormData(form).get('website');
    try {
      const res = await fetch('/api/guia-b2/enviar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'No hemos podido enviar la guía. Inténtalo de nuevo.');
        return;
      }
      setStatus('sent');
      setMessage('Listo. Te hemos enviado la guía. Si no la ves en unos minutos, mira en spam.');
    } catch {
      setStatus('error');
      setMessage('No hemos podido enviar la guía. Inténtalo de nuevo.');
    }
  }

  return (
    <section className="b2-guide__form" id="descargar" aria-labelledby="b2-guide-form-title">
      <h2 id="b2-guide-form-title">Recibe gratis la guía del B2 First</h2>
      <p>Descárgala y consulta el plan, las estrategias y las frases útiles cuando empieces a estudiar.</p>
      {status === 'sent' ? (
        <p className="b2-guide__status b2-guide__status--ok" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="b2-guide__hp" aria-hidden="true">
            <label htmlFor="b2-guide-website">Web</label>
            <input id="b2-guide-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="b2-guide__label" htmlFor="b2-guide-email">
            Tu email
          </label>
          <input
            id="b2-guide-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="b2-guide__input"
          />
          <button className="b2-guide__button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando…' : 'Enviadme la guía'}
          </button>
          {status === 'error' ? (
            <p className="b2-guide__status b2-guide__status--error" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      )}
      <p className="b2-guide__legal">
        Al enviar el formulario, aceptas recibir la guía por email. Consulta nuestra{' '}
        <Link href="/politica-privacidad">Política de privacidad</Link>.
      </p>
    </section>
  );
}
