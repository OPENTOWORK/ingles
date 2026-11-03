'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, ChevronDown, Compass, Mail } from 'lucide-react';
import { landingFont } from '@/components/home/landing/landingFont';
import { NEWSLETTER_ZONES } from '@/lib/newsletterZones';
import styles from './newsletter.module.css';

const POINTS = [
  {
    icon: Calendar,
    title: 'Fechas y convocatorias',
    text: 'Conoce fechas de examen y plazos de inscripción en tu zona.',
  },
  {
    icon: Compass,
    title: 'Orientación para prepararte',
    text: 'Organiza tu estudio y entiende qué pide cada parte del B2 First.',
  },
  {
    icon: BookOpen,
    title: 'Recursos para avanzar',
    text: 'Guías, ejercicios y estrategias que puedes aplicar al practicar.',
  },
];

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [zone, setZone] = useState('');
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
        body: JSON.stringify({
          email,
          zone,
          website,
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
        <div className={styles.grid}>
          <section className={styles.copy}>
            <p className={styles.kicker}>Newsletter B2 First</p>
            <h1>Prepárate para el B2 First.</h1>
            <p className={styles.lead}>
              Consejos para organizar tu estudio, recursos útiles y próximas fechas de examen. Todo en un mismo correo.
            </p>
            <ul className={styles.points}>
              {POINTS.map((point) => {
                const Icon = point.icon;
                return (
                  <li key={point.title} className={styles.point}>
                    <span className={styles.mark} aria-hidden="true">
                      <Icon size={22} strokeWidth={1.75} />
                    </span>
                    <div>
                      <strong>{point.title}</strong>
                      <p>{point.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className={styles.aside}>Gratis. Puedes darte de baja cuando quieras.</p>
          </section>

          <div className={styles.stack}>
            <section className={styles.card} aria-labelledby="newsletter-form-title">
              <p className={styles.formKicker}>Tu próximo paso hacia el B2</p>
              <h2 id="newsletter-form-title" className={styles.formTitle}>Recibe la newsletter de DRALO</h2>
              <p className={styles.formLead}>Elige tu zona para recibir información más relevante.</p>
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
                  <label className={styles.label} htmlFor="newsletter-zone">Ciudad o provincia (opcional)</label>
                  <div className={styles.selectWrap}>
                    <select
                      id="newsletter-zone"
                      name="zone"
                      value={zone}
                      onChange={(event) => setZone(event.target.value)}
                      className={`${styles.input} ${styles.select} ${zone ? '' : styles.selectEmpty}`}
                    >
                      <option value="">Selecciona tu zona</option>
                      {NEWSLETTER_ZONES.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown className={styles.chevron} size={18} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={acceptedNewsletter}
                      onChange={(event) => setAcceptedNewsletter(event.target.checked)}
                      required
                    />
                    <span>
                      Quiero recibir la newsletter y acepto la{' '}
                      <Link href="/politica-privacidad">Política de privacidad</Link>.
                    </span>
                  </label>
                  {status === 'error' ? (
                    <p className={`${styles.status} ${styles.statusError}`} role="alert">{message}</p>
                  ) : null}
                  <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'Enviando…' : 'Quiero recibir orientación'}
                  </button>
                  <p className={styles.note}>Te enviaremos un correo para confirmar tu suscripción.</p>
                </form>
              )}
            </section>

            <aside className={styles.sample} aria-label="Un ejemplo de lo que recibirás">
              <p className={styles.formKicker}>Un ejemplo de lo que recibirás</p>
              <div className={styles.sampleRow}>
                <span className={styles.sampleIcon} aria-hidden="true">
                  <Mail size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <strong>¿Cuándo presentarte al B2 First?</strong>
                  <p>Cómo elegir tu convocatoria y organizar las semanas de preparación.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
