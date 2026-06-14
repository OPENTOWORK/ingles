'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { DRALO_SUBSCRIPTION_PLANS } from '@/data/financialPlanConfig';
import { canViewPricing } from '@/utils/pricingAccess';
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
  const { userRole } = useUserRole();
  if (!canViewPricing(userRole)) return null;

  return (
    <section className={styles.section} aria-labelledby="home-pricing-title">
      <div className={styles.head}>
        <h2 id="home-pricing-title" className={styles.title}>
          Planes para cada etapa
        </h2>
        <p className={styles.desc}>
          Empieza gratis con A2, B1 y B2; elige PLUS para C1–C2 o desbloquea PREMIUM con más Writing Correction y límites diarios ampliados.
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
