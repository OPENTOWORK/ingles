'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function BlogNewsletterAside() {
  const [email, setEmail] = useState('');
  const [acceptedNewsletter, setAcceptedNewsletter] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!acceptedNewsletter) {
      setStatus('error');
      setMessage('Acepta recibir la newsletter y la política de privacidad para apuntarte.');
      return;
    }
    setStatus('sending');
    setMessage('');
    const website = new FormData(event.currentTarget).get('website');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch('/api/newsletter/subscribe/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ email, website, acceptedNewsletter }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setStatus('error');
        setMessage(data.error || 'No hemos podido apuntarte. Inténtalo de nuevo.');
        return;
      }
      setStatus(data.status === 'active' ? 'active' : 'pending');
      setMessage(
        data.status === 'active'
          ? 'Este correo ya está apuntado a la newsletter.'
          : 'Revisa tu correo y pulsa confirmar. Si no lo ves, mira en spam.',
      );
    } catch (err) {
      setStatus('error');
      setMessage(
        err?.name === 'AbortError'
          ? 'El envío está tardando demasiado. Inténtalo de nuevo en unos minutos.'
          : 'No hemos podido apuntarte. Inténtalo de nuevo.',
      );
    } finally {
      window.clearTimeout(timer);
    }
  }

  const done = status === 'pending' || status === 'active';

  return (
    <aside className="blog-newsletter-aside" aria-labelledby="blog-newsletter-title">
      <span className="blog-newsletter-aside__icon" aria-hidden="true">
        <Mail size={22} strokeWidth={1.75} />
      </span>
      <h2 id="blog-newsletter-title">Regístrate en nuestra newsletter</h2>
      <p>Recibe en tu correo fechas de examen, consejos de estudio y recursos para practicar.</p>
      {done ? (
        <p className="blog-newsletter-aside__status blog-newsletter-aside__status--ok" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="blog-newsletter-aside__hp" aria-hidden="true">
            <label htmlFor="blog-newsletter-website">Web</label>
            <input id="blog-newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <label htmlFor="blog-newsletter-email">Tu correo electrónico</label>
          <input
            id="blog-newsletter-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="nombre@ejemplo.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label className="blog-newsletter-aside__check">
            <input
              type="checkbox"
              checked={acceptedNewsletter}
              onChange={(event) => setAcceptedNewsletter(event.target.checked)}
              required
            />
            <span>
              Acepto recibir la newsletter y la{' '}
              <Link href="/politica-privacidad">Política de privacidad</Link>.
            </span>
          </label>
          {status === 'error' ? (
            <p className="blog-newsletter-aside__status blog-newsletter-aside__status--error" role="alert">
              {message}
            </p>
          ) : null}
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Enviando…' : 'Suscribirme'}
          </button>
        </form>
      )}
    </aside>
  );
}
