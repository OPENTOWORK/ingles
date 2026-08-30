'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Gift, X } from 'lucide-react';
import { useUserRole } from '@/context/UserRoleContext';

const STORAGE_KEY = 'dralo_invite_friend_promo_dismissed_v1';

function isDismissed() {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export default function InviteFriendPromoBanner() {
  const { session } = useUserRole();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!session?.user) {
      setVisible(false);
      return;
    }
    setVisible(!isDismissed());
  }, [session?.user]);

  if (!visible) return null;

  return (
    <div className="invite-promo-banner" role="region" aria-label="Referral offer">
      <div className="invite-promo-banner__inner">
        <span className="invite-promo-banner__icon" aria-hidden>
          <Gift size={20} strokeWidth={2.25} />
        </span>
        <p className="invite-promo-banner__text">
          <strong>Invite a friend and get 2 months free</strong>
          <span className="invite-promo-banner__detail">
            when they join a paid plan.
          </span>
        </p>
        <Link href="/perfil?tab=settings&invite=1" className="invite-promo-banner__cta">
          Invite now
        </Link>
        <button
          type="button"
          className="invite-promo-banner__close"
          onClick={() => {
            markDismissed();
            setVisible(false);
          }}
          aria-label="Dismiss referral offer"
        >
          <X size={18} aria-hidden />
        </button>
      </div>
    </div>
  );
}
