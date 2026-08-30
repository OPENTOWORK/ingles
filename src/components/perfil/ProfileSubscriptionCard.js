'use client';

import { Check, PenLine, Mic, ClipboardList, Bot, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPlanBySlug, getPlanProfileDisplay } from '@/data/financialPlanConfig';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanEntitlements } from '@/hooks/usePlanEntitlements';
import { buildPlanUsageItems } from '@/lib/planUsageLabels';
import { isSubscriptionActive, openBillingPortal, syncSubscriptionAfterCheckout } from '@/lib/stripe/client';
import styles from './ProfileSubscriptionCard.module.css';

function cleanBadge(text) {
  if (!text) return null;
  return String(text)
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/\uFE0F/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatPeriodDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Una sola línea que resume en qué punto del ciclo de cobro está el alumno. */
function billingStatusLabel(subscription) {
  const when = formatPeriodDate(subscription?.current_period_end);
  if (!when) return null;
  if (subscription.cancel_at_period_end) return `Cancels on ${when}`;
  switch (subscription.status) {
    case 'trialing':
      return `Active until ${when}`;
    case 'past_due':
    case 'unpaid':
      return `Payment issue — update your card before ${when}`;
    case 'canceled':
      return `Ended on ${when}`;
    default:
      return `Renews on ${when}`;
  }
}

const USAGE_ICONS = {
  writing_correction: PenLine,
  speaking_correction: Mic,
  exam_session: ClipboardList,
  dralo_assistant: Bot,
};

function PlanUsagePanel({ items, loading }) {
  if (!items.length) return null;

  return (
    <section className={styles.usageBlock} aria-label="Plan usage this period">
      <div className={styles.usageHeader}>
        <div>
          <p className={styles.usageTitle}>
            <Sparkles size={14} aria-hidden />
            Your usage
          </p>
          <p className={styles.usageSubtitle}>Track what you have left this period</p>
        </div>
        {loading ? <span className={styles.usageBadge}>Updating…</span> : null}
      </div>

      <ul className={styles.usageGrid}>
        {items.map((item) => {
          const Icon = USAGE_ICONS[item.key] || ClipboardList;
          return (
            <li
              key={item.key}
              className={`${styles.usageCard}${item.atLimit ? ` ${styles.usageCardAtLimit}` : ''}`}
            >
              <div className={styles.usageCardTop}>
                <span className={styles.usageIcon} aria-hidden>
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                <div className={styles.usageCopy}>
                  <span className={styles.usageLabel}>{item.label}</span>
                  <span className={styles.usagePeriod}>{item.periodLabel}</span>
                </div>
                <span className={styles.usageFraction} aria-label={`${item.used} of ${item.limit} used`}>
                  <strong>{item.used}</strong>
                  <span>/{item.limit}</span>
                </span>
              </div>
              <div className={styles.usageBarTrack} aria-hidden>
                <span
                  className={styles.usageBarFill}
                  style={{ width: `${item.percent}%` }}
                  data-full={item.atLimit || undefined}
                />
              </div>
              <p className={styles.usageRemaining}>
                {item.atLimit
                  ? 'Limit reached — upgrade for more'
                  : `${item.remaining} remaining`}
              </p>
            </li>
          );
        })}
      </ul>

      <Link href="/precios" className={styles.usageUpgradeBtn}>
        <span>Upgrade for more</span>
        <ArrowRight size={16} aria-hidden />
      </Link>
      <p className={styles.usageFootnote}>
        Limits reset monthly · Dralo Assistant is daily on Plus
      </p>
    </section>
  );
}

export default function ProfileSubscriptionCard(props) {
  return (
    <Suspense fallback={<p className="section-desc">Loading subscription…</p>}>
      <ProfileSubscriptionCardInner {...props} />
    </Suspense>
  );
}

function ProfileSubscriptionCardInner({
  plan,
  description,
  highlights = [],
  badge = null,
  showPricingLink = false,
}) {
  const searchParams = useSearchParams();
  const { subscription, refresh } = useSubscription();
  const { applyLimits, usage, loading: usageLoading, refresh: refreshEntitlements } = usePlanEntitlements();
  const usageItems = applyLimits ? buildPlanUsageItems(usage, 'en') : [];
  const checkoutSyncStarted = useRef(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState('');
  const [checkoutSyncing, setCheckoutSyncing] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return;
    if (checkoutSyncStarted.current) return;
    checkoutSyncStarted.current = true;

    let cancelled = false;
    setCheckoutSyncing(true);
    setCheckoutMessage('Activating your subscription…');

    void (async () => {
      try {
        const result = await syncSubscriptionAfterCheckout();
        if (cancelled) return;
        if (result?.synced) {
          await Promise.all([refresh(), refreshEntitlements?.()]);
          setCheckoutMessage('Your PLUS subscription is now active.');
        } else {
          setCheckoutMessage('Payment received. Your plan will update shortly.');
        }
      } catch {
        if (!cancelled) {
          setCheckoutMessage('Payment received. Refresh the page if your plan does not update.');
        }
      } finally {
        if (!cancelled) setCheckoutSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, refresh, refreshEntitlements]);

  // La fila de Stripe manda sobre user_metadata, que va con el JWT y puede
  // quedarse atrás justo después de pagar.
  const livePlan =
    isSubscriptionActive(subscription) && subscription.plan_id
      ? getPlanBySlug(subscription.plan_id)
      : null;
  const effectivePlan = livePlan || plan;
  const display = livePlan ? getPlanProfileDisplay(livePlan) : null;

  const slug = effectivePlan?.slug || 'free';
  const badgeLabel = cleanBadge(display ? display.badge : badge);
  const effectiveDescription = display ? display.descripcionCorta : description;
  const effectiveHighlights = display ? display.highlights : highlights;
  const priceLabel =
    effectivePlan?.precioLabel && effectivePlan.precioLabel !== '0€'
      ? effectivePlan.precioLabel
      : 'Free · forever';

  const canManageBilling = Boolean(subscription?.stripe_customer_id);
  const statusLabel = billingStatusLabel(subscription);

  async function handleManageBilling() {
    setPortalError('');
    setPortalLoading(true);
    try {
      await openBillingPortal();
    } catch (err) {
      setPortalError(err?.message || 'Could not open the billing portal.');
      setPortalLoading(false);
    }
  }

  return (
    <article className={`${styles.card} ${styles[`card_${slug}`] || styles.card_free}`}>
      <div className={styles.glow} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.topRow}>
          <span className={styles.status}>
            <span className={styles.statusDot} aria-hidden />
            Your current plan
          </span>
          {badgeLabel ? <span className={styles.tag}>{badgeLabel}</span> : null}
        </div>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Dralo subscription</p>
            <h3 className={styles.planName}>{effectivePlan?.nombre || 'FREE'}</h3>
            <p className={styles.tagline}>{effectiveDescription}</p>
          </div>
          <div className={styles.priceChip}>
            <span className={styles.priceValue}>{priceLabel}</span>
          </div>
        </div>

        <ul className={styles.features}>
          {(effectiveHighlights || []).slice(0, 5).map((line) => (
            <li key={line} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden>
                <Check size={14} strokeWidth={2.5} />
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {applyLimits && usageItems.length > 0 ? (
          <PlanUsagePanel items={usageItems} loading={usageLoading || checkoutSyncing} />
        ) : null}

        {checkoutMessage ? (
          <p className={styles.checkoutMessage} role="status">
            {checkoutMessage}
          </p>
        ) : null}

        {statusLabel ? <p className={styles.billingStatus}>{statusLabel}</p> : null}

        {canManageBilling || showPricingLink ? (
          <div className={styles.footer}>
            {canManageBilling ? (
              <button
                type="button"
                className={styles.manageBtn}
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? 'Opening Stripe…' : 'Manage subscription'}
              </button>
            ) : null}
            {showPricingLink ? (
              <Link href="/precios" className={styles.footerLink}>
                View all plans and comparison
              </Link>
            ) : null}
          </div>
        ) : null}

        {portalError ? (
          <p className={styles.portalError} role="alert">
            {portalError}
          </p>
        ) : null}
      </div>
    </article>
  );
}
