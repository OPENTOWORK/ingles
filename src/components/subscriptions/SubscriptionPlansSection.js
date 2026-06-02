'use client';

import Link from 'next/link';
import {
  DRALO_SUBSCRIPTION_PLANS,
  PLAN_COMPARISON_ROWS,
} from '@/data/financialPlanConfig';
import styles from './SubscriptionPlansSection.module.css';

function formatPrice(plan) {
  if (!plan.precio || plan.precio <= 0) return '0€';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(plan.precio);
}

function CellValue({ value, type }) {
  if (type === 'bool') {
    return value ? (
      <span className={styles.cellYes} aria-label="Incluido">
        ✅
      </span>
    ) : (
      <span className={styles.cellNo} aria-label="No incluido">
        ❌
      </span>
    );
  }
  return <span className={styles.cellText}>{value}</span>;
}

/**
 * Tarjetas de planes + tabla comparativa (página pública o admin).
 * @param {{ showCta?: boolean, selectedSlug?: string, onSelectPlan?: (slug: string) => void, title?: string, subtitle?: string }} props
 */
export default function SubscriptionPlansSection({
  showCta = true,
  selectedSlug = '',
  onSelectPlan,
  title = 'Elige tu plan',
  subtitle = 'Compara características y encuentra el plan que mejor encaja con tu preparación.',
}) {
  const interactive = typeof onSelectPlan === 'function';

  return (
    <section className={styles.section} aria-labelledby="subscription-plans-heading">
      <header className={styles.header}>
        <h2 id="subscription-plans-heading" className={styles.title}>
          {title}
        </h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.cards}>
        {DRALO_SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedSlug === plan.slug;
          const isPremium = plan.recommended;
          return (
            <article
              key={plan.slug}
              className={`${styles.card}${isPremium ? ` ${styles.cardPopular}` : ''}${
                isSelected ? ` ${styles.cardSelected}` : ''
              }`}
            >
              {plan.badge ? (
                <span
                  className={`${styles.badge}${
                    plan.badgeVariant === 'value' ? ` ${styles.badgeValue}` : ` ${styles.badgePopular}`
                  }`}
                >
                  {plan.badge}
                </span>
              ) : null}

              <h3 className={styles.cardName}>{plan.nombre}</h3>
              <p className={styles.cardPrice}>
                {plan.precio > 0 ? (
                  <>
                    <span className={styles.cardPriceAmount}>{formatPrice(plan)}</span>
                    <span className={styles.cardPricePeriod}>/mes</span>
                  </>
                ) : (
                  <span className={styles.cardPriceAmount}>Gratis</span>
                )}
              </p>
              <p className={styles.cardTagline}>{plan.descripcionCorta}</p>

              <ul className={styles.cardFeatures}>
                {plan.highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              {interactive ? (
                <button
                  type="button"
                  className={`${styles.cardBtn}${isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
                  onClick={() => onSelectPlan(plan.slug)}
                  aria-pressed={isSelected}
                >
                  {isSelected ? 'Plan seleccionado' : plan.precio > 0 ? 'Elegir plan' : 'Empezar gratis'}
                </button>
              ) : showCta ? (
                <Link
                  href={plan.precio > 0 ? `/precios?plan=${plan.slug}` : '/registro'}
                  className={`${styles.cardBtn}${isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
                >
                  {plan.precio > 0 ? 'Ver plan' : 'Empezar gratis'}
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className={styles.compareWrap}>
        <h3 className={styles.compareTitle}>Comparativa de planes</h3>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.thFeature}>
                  Característica
                </th>
                {DRALO_SUBSCRIPTION_PLANS.map((p) => (
                  <th
                    key={p.slug}
                    scope="col"
                    className={p.recommended ? styles.thPlanPopular : styles.thPlan}
                  >
                    {p.nombre}
                    {p.badge ? <span className={styles.thBadge}>{p.badge}</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON_ROWS.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.rowLabel}>
                    {row.label}
                  </th>
                  {DRALO_SUBSCRIPTION_PLANS.map((p) => (
                    <td
                      key={p.slug}
                      className={p.recommended ? styles.tdPopular : undefined}
                    >
                      <CellValue value={row.values[p.slug]} type={row.type} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className={styles.footnote}>
        Los planes anuales llegarán pronto. Pagos con Stripe en preparación — el catálogo ya está
        listo para conectar precios.
      </p>
    </section>
  );
}
