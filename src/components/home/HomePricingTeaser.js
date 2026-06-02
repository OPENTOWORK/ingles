'use client';

import Link from 'next/link';
import { DRALO_SUBSCRIPTION_PLANS } from '@/data/financialPlanConfig';
import styles from './HomePricingTeaser.module.css';

function formatPrice(plan) {
  if (!plan.precio || plan.precio <= 0) return 'Gratis';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(plan.precio);
}

export default function HomePricingTeaser() {
  return (
    <section className={styles.section} aria-labelledby="home-pricing-title">
      <div className={styles.head}>
        <h2 id="home-pricing-title" className={styles.title}>
          Planes para cada etapa
        </h2>
        <p className={styles.desc}>
          Empieza gratis con A2, sube a STARTER o PREMIUM para preparar el examen, o desbloquea PRO
          con IA ilimitada.
        </p>
      </div>

      <div className={styles.grid}>
        {DRALO_SUBSCRIPTION_PLANS.map((plan) => (
          <article
            key={plan.slug}
            className={`${styles.card}${plan.recommended ? ` ${styles.cardPopular}` : ''}`}
          >
            {plan.badge ? <span className={styles.badge}>{plan.badge}</span> : null}
            <h3 className={styles.planName}>{plan.nombre}</h3>
            <p className={styles.price}>
              {formatPrice(plan)}
              {plan.precio > 0 ? <span className={styles.period}>/mes</span> : null}
            </p>
            <p className={styles.tagline}>{plan.descripcionCorta}</p>
          </article>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href="/precios" className={styles.cta}>
          Ver comparativa completa
        </Link>
      </div>
    </section>
  );
}
