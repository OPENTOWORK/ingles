'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ANNUAL_BILLING_DISCOUNT_PERCENT,
  COMING_SOON,
  DRALO_SUBSCRIPTION_PLANS,
  getPublicSubscriptionPlans,
  canUpgradeToPlan,
  formatEuroAmount,
  formatPlanAnnualTotal,
  formatPlanPriceAmount,
  formatPlanPriceLabel,
  getPlanAnnualSavingsPercent,
  getPlanCrossedPrices,
  getPlanLaunchDiscountPercent,
  getPlanListDiscountPercent,
  getPlanListPrice,
  getPlanTierRank,
  isCurrentPlanSlug,
  isBlackFridayOfferActive,
  isPlusOfferActive,
  PLUS_ANNUAL_BF_GIFT_MONTHS,
  PLUS_ANNUAL_BF_PRICE,
  PLUS_ANNUAL_REGULAR_PRICE,
  PLUS_BLACK_FRIDAY_UNTIL_LABEL,
  PLUS_MONTHLY_PRICE,
  PLUS_OFFER_UNTIL_LABEL,
  plusAnnualRegularDiscountPercent,
  plusAnnualRegularSavingsEuros,
  plusAnnualRenewalCopy,
  plusAnnualSavingsVersusMonthlyEuros,
  plusBlackFridayEffectiveMonthly,
  plusTwelveMonthsMonthlyTotal,
  planHasLaunchPricing,
  PLAN_COMPARISON_ROWS,
} from '@/data/financialPlanConfig';
import { examsLimitLabel } from '@/lib/subscriptionPlans';
import { startCheckout } from '@/lib/stripe/client';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import styles from './SubscriptionPlansSection.module.css';

function comparisonCellValue(row, planSlug, billingCycle) {
  if (row.id === 'exams') {
    const plan = DRALO_SUBSCRIPTION_PLANS.find((item) => item.slug === planSlug);
    if (plan?.entitlements?.examsPerMonth == null && planSlug !== 'free') return true;
    return examsLimitLabel(planSlug);
  }
  if (row.id === 'price') {
    const plan = DRALO_SUBSCRIPTION_PLANS.find((p) => p.slug === planSlug);
    if (!plan) return row.values[planSlug];
    const crossed = getPlanCrossedPrices(plan, billingCycle).map((amount) =>
      billingCycle === 'annual' ? amount * 12 : amount,
    );
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
        {value.discount ? (
          <span className={styles.cellPriceDiscount}>-{value.discount}%</span>
        ) : null}
      </span>
    );
  }
  return <span className={styles.cellText}>{value}</span>;
}

function publicAnnualSavingsPercent() {
  if (isBlackFridayOfferActive()) return plusAnnualRegularDiscountPercent();
  const paid = getPublicSubscriptionPlans().find((plan) => Number(plan.precio) > 0);
  return (paid && getPlanAnnualSavingsPercent(paid)) || ANNUAL_BILLING_DISCOUNT_PERCENT;
}

function annualBillingHint() {
  const hasLaunchPrice = getPublicSubscriptionPlans().some((plan) => planHasLaunchPricing(plan));
  if (hasLaunchPrice && isBlackFridayOfferActive()) return '';
  if (hasLaunchPrice && isPlusOfferActive()) {
    return `${formatEuroAmount(PLUS_ANNUAL_REGULAR_PRICE)} al año, cobrados de una vez.`;
  }
  if (hasLaunchPrice) {
    return 'Al pagar el año completo de una vez.';
  }
  return `Ahorra un ${publicAnnualSavingsPercent()}% pagando el año completo de una vez.`;
}

function resolvePlanCardCta(plan, { currentPlanSlug, enableCheckout, interactive, isSelected }) {
  const hasPaidPlan = plan.precio > 0;
  const isPremium = plan.recommended;

  if (interactive) {
    return {
      kind: 'select',
      label: isSelected ? 'Plan seleccionado' : hasPaidPlan ? 'Elegir plan' : 'Empezar gratis',
      isPremium,
    };
  }

  if (enableCheckout && currentPlanSlug) {
    if (isCurrentPlanSlug(currentPlanSlug, plan.slug)) {
      return { kind: 'static', label: 'Tu plan actual', variant: 'current', isPremium };
    }
    if (getPlanTierRank(plan.slug) < getPlanTierRank(currentPlanSlug)) {
      return { kind: 'static', label: 'Incluido en tu plan', variant: 'disabled', isPremium };
    }
    if (hasPaidPlan && canUpgradeToPlan(currentPlanSlug, plan.slug)) {
      const upgrading = getPlanTierRank(currentPlanSlug) > 0;
      return {
        kind: 'checkout',
        label: upgrading ? 'Mejorar plan' : 'Suscribirme',
        isPremium,
      };
    }
    if (!hasPaidPlan) {
      return { kind: 'static', label: 'Plan gratuito', variant: 'disabled', isPremium };
    }
  }

  if (enableCheckout && hasPaidPlan) {
    return { kind: 'checkout', label: 'Suscribirme', isPremium };
  }

  return {
    kind: 'link',
    label: hasPaidPlan ? 'Ver plan' : 'Empezar gratis',
    href: hasPaidPlan ? `/precios?plan=${plan.slug}` : '/registro',
    isPremium,
  };
}

function PlanCtaControl({
  cta,
  planSlug,
  onSelectPlan,
  isSelected,
  onCheckout,
  checkoutPlan,
  planLoading,
  showCta,
}) {
  if (cta.kind === 'select') {
    return (
      <button
        type="button"
        className={`${styles.cardBtn}${cta.isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
        onClick={() => onSelectPlan(planSlug)}
        aria-pressed={isSelected}
      >
        {cta.label}
      </button>
    );
  }

  if (cta.kind === 'checkout') {
    return (
      <button
        type="button"
        className={`${styles.cardBtn}${cta.isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
        onClick={() => onCheckout(planSlug)}
        disabled={Boolean(checkoutPlan) || planLoading}
      >
        {checkoutPlan === planSlug ? 'Redirigiendo a Stripe…' : cta.label}
      </button>
    );
  }

  if (cta.kind === 'static') {
    return (
      <span
        className={`${styles.cardBtn} ${
          cta.variant === 'current' ? styles.cardBtnCurrent : styles.cardBtnDisabled
        }`}
        aria-disabled="true"
      >
        {cta.label}
      </span>
    );
  }

  if (!showCta) return null;

  return (
    <Link
      href={cta.href}
      className={`${styles.cardBtn}${cta.isPremium ? ` ${styles.cardBtnPrimary}` : ''}`}
    >
      {cta.label}
    </Link>
  );
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
  initialBillingCycle = 'monthly',
}) {
  const interactive = typeof onSelectPlan === 'function';
  const [billingCycle, setBillingCycle] = useState(initialBillingCycle === 'annual' ? 'annual' : 'monthly');

  useEffect(() => {
    setBillingCycle(initialBillingCycle === 'annual' ? 'annual' : 'monthly');
  }, [initialBillingCycle]);

  function selectBillingCycle(cycle) {
    setBillingCycle(cycle);
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (cycle === 'annual') params.set('facturacion', 'anual');
    else params.delete('facturacion');
    const query = params.toString();
    const next = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', next);
  }
  const [checkoutPlan, setCheckoutPlan] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [activeCard, setActiveCard] = useState(0);
  const cardsRef = useRef(null);
  const isAnnual = billingCycle === 'annual';
  const publicPlans = getPublicSubscriptionPlans();
  const { data: entitlementsData, planSlug: userPlanSlug, loading: planLoading } = usePlanEntitlements();
  const currentPlanSlug = enableCheckout && entitlementsData ? userPlanSlug : null;

  async function handleCheckout(planSlug) {
    if (currentPlanSlug && !canUpgradeToPlan(currentPlanSlug, planSlug)) {
      setCheckoutError('Ya tienes este plan o uno superior.');
      return;
    }
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
      if (err?.code === 'cancelled') {
        setCheckoutPlan('');
        return;
      }
      setCheckoutError(err?.message || 'No se pudo iniciar el pago.');
      setCheckoutPlan('');
    }
  }

  /** Paso del carrusel móvil: en escritorio las tarjetas son una rejilla y no hay desplazamiento. */
  function cardStep(track) {
    return track.scrollWidth / publicPlans.length;
  }

  function handleCardsScroll(event) {
    const track = event.currentTarget;
    const step = cardStep(track);
    if (!step) return;
    const index = Math.min(
      publicPlans.length - 1,
      Math.max(0, Math.round(track.scrollLeft / step)),
    );
    setActiveCard(index);
  }

  function goToCard(index) {
    const track = cardsRef.current;
    if (!track) return;
    track.scrollTo({ left: cardStep(track) * index, behavior: 'smooth' });
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
            onClick={() => selectBillingCycle('monthly')}
          >
            Mensual
          </button>
          <button
            type="button"
            className={`${styles.billingToggleBtn}${isAnnual ? ` ${styles.billingToggleBtnActive}` : ''}`}
            aria-pressed={isAnnual}
            onClick={() => selectBillingCycle('annual')}
          >
            Anual
            <span className={styles.billingToggleBadge}>-{publicAnnualSavingsPercent()}%</span>
          </button>
        </div>
        {isAnnual && annualBillingHint() ? (
          <p className={styles.billingToggleHint}>
            {annualBillingHint()}
          </p>
        ) : null}
        {isBlackFridayOfferActive() ? (
          <div className={styles.bfCompare}>
            <p className={styles.bfCompareRow}>
              <span>Mensual</span>
              <span>
                {formatEuroAmount(PLUS_MONTHLY_PRICE)}/mes → {formatEuroAmount(plusTwelveMonthsMonthlyTotal())} si lo pagas durante 12 meses
              </span>
            </p>
            <p className={styles.bfCompareRow}>
              <span>Anual Black Friday</span>
              <span>{formatEuroAmount(PLUS_ANNUAL_BF_PRICE)} → 12 meses de acceso</span>
            </p>
            <p className={styles.bfCompareClose}>
              Con el año pagas {formatEuroAmount(plusAnnualSavingsVersusMonthlyEuros())} menos que con 12 mensualidades.
            </p>
          </div>
        ) : null}
      </div>

      <div className={styles.cards} ref={cardsRef} onScroll={handleCardsScroll}>
        {publicPlans.map((plan) => {
          const isSelected = selectedSlug === plan.slug;
          const isPremium = plan.recommended;
          const hasPaidPlan = plan.precio > 0;
          const cta = resolvePlanCardCta(plan, {
            currentPlanSlug,
            enableCheckout,
            interactive,
            isSelected,
          });
          const listPriceRaw = getPlanListPrice(plan, billingCycle);
          const listPrice = listPriceRaw && isAnnual ? listPriceRaw * 12 : listPriceRaw;
          const crossedPrices = getPlanCrossedPrices(plan, billingCycle).map((amount) =>
            isAnnual ? amount * 12 : amount,
          );
          const listDiscount = getPlanListDiscountPercent(plan, billingCycle);
          const launchDiscount = getPlanLaunchDiscountPercent(plan, billingCycle);
          const showLaunchLabel = hasPaidPlan && planHasLaunchPricing(plan);
          const blackFridayYear = isAnnual && plan.slug === 'premium' && isBlackFridayOfferActive();
          const annualPlus = isAnnual && plan.slug === 'premium';
          const shownDiscount = launchDiscount;
          const cardCta = blackFridayYear && cta.label === 'Suscribirme' ? { ...cta, label: 'Quiero el año' } : cta;
          return (
            <article
              key={plan.slug}
              className={`${styles.card}${isPremium ? ` ${styles.cardPopular}` : ''}${
                annualPlus ? ` ${styles.cardAnnual}` : ''
              }${isSelected ? ` ${styles.cardSelected}` : ''}`}
            >
              {blackFridayYear ? (
                <span className={`${styles.badge} ${styles.badgePopular}`}>
                  Black Friday · hasta el {PLUS_BLACK_FRIDAY_UNTIL_LABEL}
                </span>
              ) : plan.badge ? (
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
                        {isAnnual
                          ? formatPlanAnnualTotal(plan)
                          : formatPlanPriceAmount(plan, billingCycle)}
                      </span>
                      <span className={styles.cardPricePeriod}>{isAnnual ? '/año' : '/mes'}</span>
                      {showLaunchLabel && shownDiscount ? (
                        <span className={styles.cardPriceDiscount}>-{shownDiscount}%</span>
                      ) : listDiscount && !showLaunchLabel ? (
                        <span className={styles.cardPriceDiscount}>-{listDiscount}%</span>
                      ) : null}
                    </span>
                    {showLaunchLabel && isPlusOfferActive() && !isAnnual ? (
                      <span className={styles.cardPriceLaunch}>
                        Oferta disponible hasta el {PLUS_OFFER_UNTIL_LABEL}
                      </span>
                    ) : null}
                    {blackFridayYear ? (
                      <>
                        <span className={styles.cardPriceAnnual}>
                          Ahorras {formatEuroAmount(plusAnnualRegularSavingsEuros())} sobre el precio normal del plan anual.
                        </span>
                        <span className={styles.cardPriceAnnual}>
                          12 meses de acceso, con {PLUS_ANNUAL_BF_GIFT_MONTHS} meses de regalo incluidos.
                        </span>
                        <span className={styles.cardPriceAnnual}>
                          Equivale a {formatEuroAmount(plusBlackFridayEffectiveMonthly())}/mes
                        </span>
                      </>
                    ) : isAnnual && plan.slug !== 'premium' ? (
                      <span className={styles.cardPriceAnnual}>
                        Equivale a {formatPlanPriceAmount(plan, 'annual')}/mes
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
                  const label = typeof line === 'string' ? line : line.text;
                  const excluded = typeof line === 'object' && line.included === false;
                  const isSoon = !excluded && /próximamente|coming soon/i.test(label);
                  return (
                    <li
                      key={label}
                      className={
                        excluded
                          ? styles.cardFeatureNo
                          : isSoon
                            ? styles.cardFeatureSoon
                            : styles.cardFeatureYes
                      }
                    >
                      {excluded ? <span className="sr-only">No incluido: </span> : null}
                      {label}
                    </li>
                  );
                })}
                {(plan.excludedHighlights || []).map((line) => (
                  <li key={line} className={styles.cardFeatureNo}>
                    <span className="sr-only">No incluido: </span>
                    {line}
                  </li>
                ))}
              </ul>

              <PlanCtaControl
                cta={cardCta}
                planSlug={plan.slug}
                onSelectPlan={onSelectPlan}
                isSelected={isSelected}
                onCheckout={handleCheckout}
                checkoutPlan={checkoutPlan}
                planLoading={planLoading}
                showCta={showCta}
              />
              {annualPlus ? (
                <p className={styles.cardRenewal}>{plusAnnualRenewalCopy()}</p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className={styles.cardsNav}>
        {publicPlans.map((plan, index) => (
          <button
            key={plan.slug}
            type="button"
            className={`${styles.cardsNavBtn}${index === activeCard ? ` ${styles.cardsNavBtnActive}` : ''}`}
            aria-label={`Ver plan ${plan.nombre}`}
            aria-current={index === activeCard}
            onClick={() => goToCard(index)}
          >
            <span>{plan.nombre}</span>
          </button>
        ))}
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
              {publicPlans.some((p) => {
                const cta = resolvePlanCardCta(p, {
                  currentPlanSlug,
                  enableCheckout,
                  interactive,
                  isSelected: selectedSlug === p.slug,
                });
                return cta.kind !== 'link' || showCta;
              }) ? (
                <tr>
                  <td className={styles.thCtaSpacer} />
                  {publicPlans.map((p) => {
                    const cta = resolvePlanCardCta(p, {
                      currentPlanSlug,
                      enableCheckout,
                      interactive,
                      isSelected: selectedSlug === p.slug,
                    });
                    return (
                      <td
                        key={p.slug}
                        className={p.recommended ? styles.thCtaPopular : styles.thCta}
                      >
                        <PlanCtaControl
                          cta={cta}
                          planSlug={p.slug}
                          onSelectPlan={onSelectPlan}
                          isSelected={selectedSlug === p.slug}
                          onCheckout={handleCheckout}
                          checkoutPlan={checkoutPlan}
                          planLoading={planLoading}
                          showCta={showCta}
                        />
                      </td>
                    );
                  })}
                </tr>
              ) : null}
              <tr>
                <th scope="col" className={styles.thFeature}>
                  Característica
                </th>
                {publicPlans.map((p) => (
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
                  {publicPlans.map((p) => (
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
