'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronUp, Gift, X } from 'lucide-react';
import { useUserRole } from '@/context/UserRoleContext';
import { supabase } from '@/utils/supabaseClient';

const SESSION_COLLAPSED_KEY = 'dralo_invite_promo_collapsed';

/** true = plegado, false = abierto, null = sin elección guardada. */
function readCollapsePreference() {
  if (typeof window === 'undefined') return null;
  try {
    const value = sessionStorage.getItem(SESSION_COLLAPSED_KEY);
    if (value === '1') return true;
    if (value === '0') return false;
    return null;
  } catch {
    return null;
  }
}

function writeCollapsePreference(collapsed) {
  try {
    if (collapsed === true) sessionStorage.setItem(SESSION_COLLAPSED_KEY, '1');
    else if (collapsed === false) sessionStorage.setItem(SESSION_COLLAPSED_KEY, '0');
    else sessionStorage.removeItem(SESSION_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}

function defaultCollapsed() {
  const preference = readCollapsePreference();
  if (preference !== null) return preference;
  return window.matchMedia('(max-width: 639px)').matches;
}

/**
 * Promo de referidos en la home (zona morada).
 * En móvil (<640px) empieza plegado. Al abrirlo o cerrarlo se recuerda en la sesión.
 */
export default function InviteFriendPromoBanner({ guest = false }) {
  const { session } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (guest) {
      setCollapsed(defaultCollapsed());
      setReady(true);
      return;
    }
    if (!session?.user) {
      setReady(false);
      return;
    }
    setCollapsed(defaultCollapsed());
    setReady(true);
  }, [guest, session?.user]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        writeCollapsePreference(null);
        setCollapsed(window.matchMedia('(max-width: 639px)').matches);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const collapse = () => {
    setCollapsed(true);
    writeCollapsePreference(true);
  };

  const expand = () => {
    setCollapsed(false);
    writeCollapsePreference(false);
  };

  if ((!guest && !session?.user) || !ready) return null;

  const inviteHref = guest ? '/registro' : '/perfil?tab=settings&invite=1';
  const guestClass = guest ? ' invite-promo-banner--guest' : '';

  if (collapsed) {
    return (
      <div className={`invite-promo-banner invite-promo-banner--home invite-promo-banner--folded${guestClass}`}>
        <button
          type="button"
          className="invite-promo-banner__fold-trigger"
          onClick={expand}
          aria-expanded="false"
        >
          <Gift size={18} strokeWidth={2.25} aria-hidden />
          <span>Invite a friend — get 2 months free</span>
          <ChevronUp size={16} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`invite-promo-banner invite-promo-banner--home${guestClass}`}
      role="region"
      aria-label="Referral offer"
      aria-expanded="true"
    >
      <div className="invite-promo-banner__inner">
        <span className="invite-promo-banner__icon" aria-hidden>
          <Gift size={20} strokeWidth={2.25} />
        </span>
        <p className="invite-promo-banner__text">
          <strong>Invite a friend and get 2 months free</strong>
          <span className="invite-promo-banner__detail">when they join a paid plan — you get 2 months free on PLUS.</span>
        </p>
        <Link href={inviteHref} className="invite-promo-banner__cta">
          Invite now
        </Link>
        <button
          type="button"
          className="invite-promo-banner__close"
          onClick={collapse}
          aria-label="Fold referral offer"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
