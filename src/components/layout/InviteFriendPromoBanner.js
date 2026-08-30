'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronUp, Gift, X } from 'lucide-react';
import { useUserRole } from '@/context/UserRoleContext';
import { supabase } from '@/utils/supabaseClient';

const SESSION_COLLAPSED_KEY = 'dralo_invite_promo_collapsed';

function readCollapsed() {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(SESSION_COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeCollapsed(collapsed) {
  try {
    if (collapsed) sessionStorage.setItem(SESSION_COLLAPSED_KEY, '1');
    else sessionStorage.removeItem(SESSION_COLLAPSED_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Promo de referidos en la home (zona morada).
 * Al cerrar se pliega; en una nueva sesión del navegador vuelve a desplegarse.
 */
export default function InviteFriendPromoBanner() {
  const { session } = useUserRole();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setReady(false);
      return;
    }
    setCollapsed(readCollapsed());
    setReady(true);
  }, [session?.user]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        writeCollapsed(false);
        setCollapsed(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const collapse = () => {
    setCollapsed(true);
    writeCollapsed(true);
  };

  const expand = () => {
    setCollapsed(false);
    writeCollapsed(false);
  };

  if (!session?.user || !ready) return null;

  if (collapsed) {
    return (
      <div className="invite-promo-banner invite-promo-banner--home invite-promo-banner--folded">
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
      className="invite-promo-banner invite-promo-banner--home"
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
        <Link href="/perfil?tab=settings&invite=1" className="invite-promo-banner__cta">
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
