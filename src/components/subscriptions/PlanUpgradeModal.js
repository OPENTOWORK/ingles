'use client';

import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import styles from './PlanUpgradeModal.module.css';

const COPY = {
  en: {
    locked_slot: {
      title: 'Unlock more exams',
      subtitle: (slot) =>
        slot
          ? `Exam ${slot} is not included in your current plan.`
          : 'This exam is not included in your current plan.',
      message:
        'Your Free plan includes Exam 1 only. Upgrade to Plus to unlock 10 new exams each month, or Premium for the full catalogue from day one.',
      benefits: [
        'Plus: 10 new exams unlocked every month',
        'Premium: full B2 exam catalogue',
        'Writing & Speaking corrections included',
      ],
      cta: 'View plans',
      dismiss: 'Not now',
    },
    quota_exceeded: {
      title: 'Monthly exam limit reached',
      subtitle: 'You have used all exam attempts for this month.',
      message:
        'Upgrade your plan to start more full exams this month, or wait until your quota resets.',
      benefits: [
        'Higher monthly exam allowance',
        'Full B2 exam catalogue',
        'Priority support on Premium',
      ],
      cta: 'View plans',
      dismiss: 'Got it',
    },
    custom: {
      title: 'Plan upgrade required',
      subtitle: 'This action needs a higher plan.',
      message: null,
      benefits: [],
      cta: 'View plans',
      dismiss: 'Close',
    },
  },
  es: {
    locked_slot: {
      title: 'Desbloquea más exámenes',
      subtitle: (slot) =>
        slot
          ? `El Test ${slot} no está en el plan gratuito. El Test 1 es el examen de prueba.`
          : 'Este test no está en el plan gratuito. El Test 1 es el examen de prueba.',
      message:
        'Con el plan gratis solo puedes hacer el Test 1, que es de prueba. El Test 2 y el resto se desbloquean con Plus o Premium.',
      benefits: [
        'Plus: 10 exámenes nuevos cada mes',
        'Premium: catálogo completo B2',
        'Correcciones de Writing y Speaking incluidas',
      ],
      cta: 'Ver precios',
      dismiss: 'Ahora no',
    },
    quota_exceeded: {
      title: 'Límite mensual alcanzado',
      subtitle: 'Has usado todos los intentos de examen de este mes.',
      message:
        'Mejora tu plan para iniciar más exámenes completos este mes, o espera a que se renueve tu cuota.',
      benefits: [
        'Mayor cupo mensual de exámenes',
        'Catálogo completo B2',
        'Soporte prioritario en Premium',
      ],
      cta: 'Ver precios',
      dismiss: 'Entendido',
    },
    custom: {
      title: 'Mejora de plan necesaria',
      subtitle: 'Esta acción requiere un plan superior.',
      message: null,
      benefits: [],
      cta: 'Ver precios',
      dismiss: 'Cerrar',
    },
    paid_place: {
      title: 'Esto es de pago',
      subtitle: 'Tu plan gratuito no incluye este contenido.',
      message:
        'Para entrar aquí necesitas Plus o Premium. En precios puedes ver qué incluye cada plan.',
      benefits: [
        'Plus: más exámenes y el nivel C1',
        'Premium: catálogo completo, incluido C2',
      ],
      cta: 'Ver precios',
      dismiss: 'Cerrar',
    },
  },
};

/**
 * Modal de upgrade de plan (sustituye alert() nativo).
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   variant?: 'locked_slot' | 'quota_exceeded' | 'custom' | 'paid_place',
 *   message?: string | null,
 *   slot?: number | null,
 *   lang?: 'en' | 'es',
 * }} props
 */
export default function PlanUpgradeModal({
  open,
  onClose,
  variant = 'locked_slot',
  message = null,
  slot = null,
  lang = 'es',
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef(null);
  const locale = COPY[lang] || COPY.en;
  const content = locale[variant] || locale.custom;
  const bodyMessage = message || content.message;

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.overlay}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={content.dismiss}>
          ×
        </button>

        <div className={styles.header}>
          <div className={styles.headerInner}>
            <span className={styles.iconWrap} aria-hidden>
              🔒
            </span>
            <div>
              <h2 id={titleId} className={styles.title}>
                {content.title}
              </h2>
              <p className={styles.subtitle}>
                {typeof content.subtitle === 'function' ? content.subtitle(slot) : content.subtitle}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {bodyMessage ? (
            <p id={descId} className={styles.message}>
              {bodyMessage}
            </p>
          ) : (
            <p id={descId} className={styles.message}>
              {content.subtitle}
            </p>
          )}

          {content.benefits?.length > 0 ? (
            <ul className={styles.benefits}>
              {content.benefits.map((item) => (
                <li key={item} className={styles.benefit}>
                  <span className={styles.benefitIcon} aria-hidden>
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className={styles.actions}>
            <Link href="/precios" className={styles.primaryBtn} onClick={onClose}>
              {content.cta}
            </Link>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              {content.dismiss}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
