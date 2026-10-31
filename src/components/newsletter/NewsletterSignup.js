'use client';

import { useState } from 'react';
import Link from 'next/link';
import { landingFont } from '@/components/home/landing/landingFont';
import styles from './newsletter.module.css';

const POINTS = [
  {
    title: 'Un consejo que puedes usar',
    text: 'Una idea corta para el Writing, el Reading o el Listening. Nada de un artículo entero.',
  },
  {
    title: 'Lo nuevo, solo si merece la pena',
    text: 'Un ejercicio, una guía o una función de Dralo. Si no aporta, no te escribimos.',
  },
  {
    title: 'Te das de baja cuando quieras',
    text: 'Cada correo lleva un enlace. Un clic y no vuelve a llegar.',
  },
];

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataProtection, setAcceptedDataProtection] = useState(false);
  const [acceptedNewsletter, setAcceptedNewsletter] = useState(false);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!acceptedTerms || !acceptedDataProtection || !acceptedNewsletter) {
      setStatus('error');
      setMessage('Acepta los términos, la protección de datos y la newsletter para apuntarte.');
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
        body: JSON.stringify({
          email,
          website,
          acceptedTerms,
          acceptedDataProtection,
          acceptedNewsletter,
        }),
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
          : 'Revisa tu correo y pulsa confirmar. Si no lo ves en unos minutos, mira en spam.',
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
    <div className={`${styles.page} ${landingFont.variable}`}>
      <div className={styles.shell}>
        <p className={styles.kicker}>Newsletter</p>
        <div className={styles.grid}>
          <section className={styles.copy}>
            <h1>Un correo corto cuando hay algo que te sirva.</h1>
            <p className={styles.lead}>
              Un consejo para el examen, un ejercicio nuevo o una novedad de Dralo. Llega a tu bandeja.
              El blog se queda para leer una guía cuando tú quieras.
            </p>
            <ul className={styles.points}>
              {POINTS.map((point, index) => (
                <li key={point.title} className={styles.point}>
                  <span className={styles.mark} aria-hidden="true">{index + 1}</span>
                  <div>
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.aside}>
              ¿Prefieres entrar y leer? El <Link href="/blog">blog</Link> tiene las guías y las noticias.
            </p>
          </section>

          <section className={styles.card} aria-labelledby="newsletter-form-title">
            <div className={styles.letter}>
              <p className={styles.letterMeta}>Así es un número</p>
              <p>
                <strong>Asunto:</strong> Una palabra que cambia el registro
              </p>
              <p>
                «People can feel isolated» dice lo mismo que «People may feel isolated». En un essay, la segunda suena más natural.
              </p>
            </div>

            <h2 id="newsletter-form-title" className={styles.formTitle}>Apúntate</h2>
            {done ? (
              <p className={`${styles.status} ${styles.statusOk} ${styles.statusAlone}`} role="status">
                {message}
              </p>
            ) : (
              <form className={styles.form} onSubmit={onSubmit}>
                <div className={styles.hp} aria-hidden="true">
                  <label htmlFor="newsletter-website">Web</label>
                  <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>
                <label className={styles.label} htmlFor="newsletter-email">Tu correo</label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className={styles.input}
                />
                <div className={styles.checks}>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(event) => setAcceptedTerms(event.target.checked)}
                      required
                    />
                    <span>
                      Al apuntarme a la newsletter, acepto los{' '}
                      <Link href="/terminos-condiciones">Términos y condiciones</Link> y confirmo haber leído la{' '}
                      <Link href="/politica-privacidad">Política de privacidad</Link>.
                    </span>
                  </label>
                  <label className={styles.check}>
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
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={acceptedNewsletter}
                      onChange={(event) => setAcceptedNewsletter(event.target.checked)}
                      required
                    />
                    <span>
                      Quiero recibir la newsletter, novedades, recursos y promociones de Dralo.
                    </span>
                  </label>
                </div>
                {status === 'error' ? (
                  <p className={`${styles.status} ${styles.statusError}`} role="alert">{message}</p>
                ) : null}
                <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Enviando…' : 'Apuntarme'}
                </button>
                <p className={styles.note}>
                  Te escribimos de vez en cuando. Antes de entrar en la lista tienes que confirmar el correo.
                </p>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
