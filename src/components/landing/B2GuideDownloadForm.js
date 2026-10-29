'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function B2GuideDownloadForm() {
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProtection, setAcceptedDataProtection] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!acceptedTerms || !acceptedDataProtection) {
      setStatus('error');
      setMessage('Acepta los términos y la protección de datos para recibir la guía.');
      return;
    }
    setStatus('sending');
    setMessage('');
    const website = new FormData(event.currentTarget).get('website');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/guia-b2/enviar/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          email,
          website,
          acceptedTerms,
          acceptedDataProtection,
          acceptedMarketing,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'No hemos podido enviar la guía. Inténtalo de nuevo.');
        return;
      }
      setStatus('sent');
      setMessage('Listo. Te hemos enviado la guía. Si no la ves en unos minutos, mira en spam.');
    } catch (err) {
      setStatus('error');
      setMessage(
        err?.name === 'AbortError'
          ? 'El envío está tardando demasiado. Inténtalo de nuevo en unos minutos.'
          : 'No hemos podido enviar la guía. Inténtalo de nuevo.',
      );
    } finally {
      window.clearTimeout(timer);
    }
  }

  return (
    <div className="b2-guide__card-form" id="descargar">
      <h2>Recibe gratis la guía del B2 First</h2>
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
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="b2-guide__input"
          />
          <div className="b2-guide__checks">
            <label className="b2-guide__check">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                required
              />
              <span>
                Al solicitar la guía, acepto los{' '}
                <Link href="/terminos-condiciones">Términos y condiciones</Link> y confirmo haber leído la{' '}
                <Link href="/politica-privacidad">Política de privacidad</Link>.
              </span>
            </label>
            <label className="b2-guide__check">
              <input
                type="checkbox"
                checked={acceptedDataProtection}
                onChange={(event) => setAcceptedDataProtection(event.target.checked)}
                required
              />
              <span>
                Acepto la <Link href="/proteccion-datos">Política de protección de datos</Link>.
              </span>
            </label>
            <label className="b2-guide__check">
              <input
                type="checkbox"
                checked={acceptedMarketing}
                onChange={(event) => setAcceptedMarketing(event.target.checked)}
              />
              <span>
                Quiero recibir comunicaciones comerciales, novedades, recursos y promociones de Dralo.
              </span>
            </label>
          </div>
          <button className="b2-guide__button b2-guide__button--block" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando…' : 'Enviadme la guía'}
          </button>
          {status === 'error' ? (
            <p className="b2-guide__status b2-guide__status--error" role="alert">
              {message}
            </p>
          ) : null}
        </form>
      )}
      <p className="b2-guide__fine">
        Al enviar el formulario, aceptas recibir la guía por email.
      </p>
    </div>
  );
}
