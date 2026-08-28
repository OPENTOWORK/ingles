'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ANNUAL_BILLING_DISCOUNT_PERCENT,
  COMING_SOON,
  DRALO_SUBSCRIPTION_PLANS,
  formatEuroAmount,
  formatPlanAnnualTotal,
  formatPlanPriceAmount,
  formatPlanPriceLabel,
  getPlanCrossedPrices,
  getPlanLaunchDiscountPercent,
  getPlanListDiscountPercent,
  getPlanListPrice,
  LAUNCH_PRICE_LABEL,
  planHasLaunchPricing,
  PLAN_COMPARISON_ROWS,
} from '@/data/financialPlanConfig';
import { examsLimitLabel } from '@/lib/subscriptionPlans';
import { startCheckout } from '@/lib/stripe/client';
import styles from './SubscriptionPlansSection.module.css';

function comparisonCellValue(row, planSlug, billingCycle) {
  if (row.id === 'exams') {
    if (planSlug === 'pro') return true;
    return examsLimitLabel(planSlug);
  }
  if (row.id === 'price') {
    const plan = DRALO_SUBSCRIPTION_PLANS.find((p) => p.slug === planSlug);
    if (!plan) return row.values[planSlug];
    const crossed = getPlanCrossedPrices(plan, billingCycle);
    const discount = getPlanLaunchDiscountPercent(plan, billingCycle) ?? getPlanListDiscountPercent(plan, billingCycle);
    return {
      kind: 'price',
      crossed: crossed.map((amount) => formatEuroAmount(amount)),
      list: crossed.length ? formatEuroAmount(crossed[crossed.length - 1]) : null,
      current: formatPlanPriceLabel(plan, billingCycle),
      discount,
      launch: planHasLaunchPricing(plan),
    };
  }
  return row.values[planSlug];
}

function CellValue({ value, type }) {
  if (value === COMING_SOON) {
    return (
      <span className={styles.cellSoon} aria-label="Próximamente">
        Coming soon
      </span>
    );
  }
  if (type === 'bool' || value === true || value === false) {
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
  if (value && typeof value === 'object' && value.kind === 'price') {
    return (
      <span className={styles.cellPrice}>
        {value.crossed?.length ? (
          <span className={styles.cellPriceCrossedRow}>
            {value.crossed.map((amount) => (
              <span key={amount} className={styles.cellPriceWas} aria-label="Precio anterior">
                {amount}
              </span>
            ))}
          </span>
        ) : value.list ? (
          <span className={styles.cellPriceWas} aria-label="Precio anterior">
            {value.list}
          </span>
        ) : null}
        <span className={styles.cellPriceCurrent}>{value.current}</span>
        {value.launch ? (
          <span className={styles.cellPriceLaunch}>{LAUNCH_PRICE_LABEL}</span>
        ) : null}
        {value.discount ? (
          <span className={styles.cellPriceDiscount}>-{value.discount}%</span>
        ) : null}
      </span>
    );
  }
  return <span className={styles.cellText}>{value}</span>;
}

/**
 * Tarjetas de planes + tabla comparativa (página pública o admin).
 * @param {{
 *   showCta?: boolean,
 *   enableCheckout?: boolean,
 *   selectedSlug?: string,
 *   onSelectPlan?: (slug: string) => void,
 *   title?: string,
 *   subtitle?: string,
 * }} props
 */
export default function SubscriptionPlansSection({
  showCta = true,
  enableCheckout = false,
  selectedSlug = '',
  onSelectPlan,
  title = 'Elige tu plan',
  subtitle = 'Compara características y encuentra el plan que mejor encaja con tu preparación.',
}) {
  const interactive = typeof onSelectPlan === 'function';
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [checkoutPlan, setCheckoutPlan] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const isAnnual = billingCycle === 'annual';

  async function handleCheckout(planSlug) {
    setCheckoutError('');
    setCheckoutPlan(planSlug);
    try {
      // Redirige a Stripe si todo va bien, así que no hace falta limpiar el estado.
      await startCheckout({ planSlug, billingCycle });
    } catch (err) {
      if (err?.code === 'no_session') {
        window.location.assign('/login/');
        return;
      }
      setCheckoutError(err?.message || 'No se pudo iniciar el pago.');
      setCheckoutPlan('');
    }
  }

  return (
    <section className={styles.section} aria-labelledby="subscription-plans-heading">
      <header className={styles.header}>
        <h2 id="subscription-plans-heading" className={styles.title}>
          {title}
        </h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.billingToggleWrap}>
        <p className={styles.billingToggleLabel}>Facturación</p>
        <div
          className={styles.billingToggle}
          role="group"
          aria-label="Periodo de facturación"
        >
          <button
            type="button"
            className={`${styles.billingToggleBtn}${!isAnnual ? ` ${styles.billingToggleBtnActive}` : ''}`}
            aria-pressed={!isAnnual}
            onClick={() => setBillingCycle('monthly')}
          >
            Mensual
          </button>
          <button
            type="button"
            className={`${styles.billingToggleBtn}${isAnnual ? ` ${styles.billingToggleBtnActive}` : ''}`}
            aria-pressed={isAnnual}
            onClick={() => setBillingCycle('annual')}
          >
            Anual
            <span className={styles.billingToggleBadge}>-{ANNUAL_BILLING_DISCOUNT_PERCENT}%</span>
          </button>
        </div>
        {isAnnual ? (
          <p className={styles.billingToggleHint}>
            Ahorra un {ANNUAL_BILLING_DISCOUNT_PERCENT}% pagando el año completo de una vez.
          </p>
        ) : null}
      </div>

      <div className={styles.cards}>
        {DRALO_SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = selectedSlug === plan.slug;
          const isPremium = plan.recommended;
          const hasPaidPlan = plan.precio > 0;
          const listPrice = getPlanListPrice(plan, billingCycle);
          const crossedPrices = getPlanCrossedPrices(plan, billingCycle);
          const listDiscount = getPlanListDiscountPercent(plan, billingCycle);
          const launchDiscount = getPlanLaunchDiscountPercent(plan, billingCycle);
          const showLaunchLabel = hasPaidPlan && planHasLaunchPricing(plan);
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
                {hasPaidPlan ? (
                  <>
                    {showLaunchLabel && crossedPrices.length > 0 ? (
                      <span className={styles.cardPriceWasRow}>
                        {crossedPrices.map((amount) => (
                          <span
                            key={amount}
                            className={styles.cardPriceWas}
                            aria-label="Precio anterior"
                          >
                            {formatEuroAmount(amount)}
                          </span>
                        ))}
                      </span>
                    ) : null}
                    <span className={styles.cardPriceRow}>
                      {!showLaunchLabel && listPrice ? (
                        <span className={styles.cardPriceWas} aria-label="Precio habitual">
                          {formatEuroAmount(listPrice)}
                        </span>
                      ) : null}
                      <span className={styles.cardPriceAmount}>
                        {formatPlanPriceAmount(plan, billingCycle)}
                      </span>
                      <span className={styles.cardPricePeriod}>/mes</span>
                      {showLaunchLabel && launchDiscount ? (
                        <span className={styles.cardPriceDiscount}>-{launchDiscount}%</span>
                      ) : listDiscount && !showLaunchLabel ? (
                        <span className={styles.cardPriceDiscount}>-{listDiscount}%</span>
                      ) : null}
                    </span>
                    {showLaunchLabel ? (
                      <span className={styles.cardPriceLaunch}>{LAUNCH_PRICE_LABEL}</span>
                    ) : null}
                    {isAnnual ? (
                      <span className={styles.cardPriceAnnual}>
                        {formatPlanAnnualTotal(plan)} facturados al año
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className={styles.cardPriceAmount}>Gratis</span>
                )}
              </p>
              <p className={styles.cardTagline}>{plan.descripcionCorta}</p>

              <ul className={styles.cardFeatures}>
                {plan.highlights.map((line) => {
                  const isSoon = /próximamente|coming soon/i.test(line);
                  return (
                    <li
                      key={line}
                      className={isSoon ? styles.cardFeatureSoon : styles.cardFeatureYes}
                    >
                      {line}
                    </li>
                  );
                })}
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
              ) : enableCheckout && hasPaidPlan ? (
                <button
                  type="button"
                  className={`${styles.cardBtn}${isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
                  onClick={() => handleCheckout(plan.slug)}
                  disabled={Boolean(checkoutPlan)}
                >
                  {checkoutPlan === plan.slug ? 'Redirigiendo a Stripe…' : 'Suscribirme'}
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

      {checkoutError ? (
        <p className={styles.checkoutError} role="alert">
          {checkoutError}
        </p>
      ) : null}

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
                      <CellValue
                        value={comparisonCellValue(row, p.slug, billingCycle)}
                        type={row.type}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
