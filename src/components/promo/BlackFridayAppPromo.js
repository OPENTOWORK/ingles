'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { landingFont } from '@/components/home/landing/landingFont';
import { useUserRole } from '@/context/UserRoleContext';
import { BLACK_FRIDAY_APP_PROMO, isBlackFridayOfferActive } from '@/data/financialPlanConfig';
import usePlanEntitlements from '@/hooks/usePlanEntitlements';
import './black-friday-app-promo.css';

const BANNER_KEY = 'dralo_bf_banner_hide_until';
const RESULTS_KEY = 'dralo_bf_results_notice';
const HIDE_MS = 48 * 60 * 60 * 1000;
const PAID_PLANS = new Set(['starter', 'premium', 'pro']);

function analyticsAllowed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem('dralo_cookie_consent');
    const parsed = raw ? JSON.parse(raw) : null;
    return Boolean(parsed?.preferences?.analytics);
  } catch {
    return false;
  }
}

function trackPromo(payload) {
  if (!analyticsAllowed()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function bannerHidden() {
  try {
    const until = Number(window.localStorage.getItem(BANNER_KEY) || 0);
    return Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

function hideBannerFor48h() {
  try {
    window.localStorage.setItem(BANNER_KEY, String(Date.now() + HIDE_MS));
  } catch {
    /* el navegador puede bloquear el almacenamiento */
  }
}

function resultsAlreadyShown() {
  try {
    return window.sessionStorage.getItem(RESULTS_KEY) === '1';
  } catch {
    return false;
  }
}

function markResultsShown() {
  try {
    window.sessionStorage.setItem(RESULTS_KEY, '1');
  } catch {
    /* la sesión del navegador puede no estar disponible */
  }
}

function useUnpaidBlackFriday() {
  const { session } = useUserRole();
  const { data, loading } = usePlanEntitlements();
  const slug = String(data?.planSlug || '').toLowerCase();
  return Boolean(session?.user) && isBlackFridayOfferActive() && !loading && Boolean(data) && !PAID_PLANS.has(slug);
}

export function BlackFridayDashboardBanner() {
  const eligible = useUnpaidBlackFriday();
  const [open, setOpen] = useState(false);
  const copy = BLACK_FRIDAY_APP_PROMO.banner;

  useEffect(() => {
    setOpen(eligible && !bannerHidden());
  }, [eligible]);

  if (!open) return null;

  const dismiss = () => {
    hideBannerFor48h();
    setOpen(false);
    trackPromo({ event: 'promo_dismiss', cta_id: copy.src });
  };

  return (
    <aside className={`${landingFont.variable} bf-app-banner`} role="region" aria-label="Black Friday">
      <div>
        <p className="bf-app-banner__title">{copy.title}</p>
        <p className="bf-app-banner__text">{copy.text}</p>
      </div>
      <Link
        href={copy.href}
        className="bf-app-banner__cta"
        onClick={() => trackPromo({ event: 'cta_click', cta_id: copy.src, cta_destination: copy.href })}
      >
        {copy.cta}
      </Link>
      <button type="button" className="bf-app-banner__close" onClick={dismiss} aria-label="Cerrar">
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}

export function BlackFridayResultsNotice() {
  const eligible = useUnpaidBlackFriday();
  const [open, setOpen] = useState(false);
  const copy = BLACK_FRIDAY_APP_PROMO.results;

  useEffect(() => {
    if (!eligible || resultsAlreadyShown()) return;
    markResultsShown();
    setOpen(true);
  }, [eligible]);

  if (!open) return null;

  const dismiss = () => {
    markResultsShown();
    setOpen(false);
    trackPromo({ event: 'promo_dismiss', cta_id: copy.src });
  };

  return (
    <aside className={`${landingFont.variable} bf-app-result`} role="region" aria-label="Oferta del año">
      <p className="bf-app-result__title">{copy.title}</p>
      <p className="bf-app-result__text">{copy.text}</p>
      <div className="bf-app-result__actions">
        <Link
          href={copy.href}
          className="bf-app-result__cta"
          onClick={() => trackPromo({ event: 'cta_click', cta_id: copy.src, cta_destination: copy.href })}
        >
          {copy.cta}
        </Link>
        <button type="button" className="bf-app-result__dismiss" onClick={dismiss}>
          {copy.dismiss}
        </button>
      </div>
    </aside>
  );
}
