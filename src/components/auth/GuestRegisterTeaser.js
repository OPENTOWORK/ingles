'use client';

import Link from 'next/link';
import { GUEST_PREVIEW_REGISTER_LABEL, getGuestRegisterHref } from '@/lib/guestPreviewAccess';
import styles from './GuestRegisterTeaser.module.css';

export default function GuestRegisterTeaser({
  title = GUEST_PREVIEW_REGISTER_LABEL,
  message = 'Create a free account to continue.',
  nextHref = '/login',
  compact = false,
}) {
  const href = getGuestRegisterHref(nextHref);

  if (compact) {
    return (
      <Link href={href} className={styles.compact}>
        {GUEST_PREVIEW_REGISTER_LABEL}
      </Link>
    );
  }

  return (
    <div className={styles.card} role="region" aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.message}>{message}</p>
      <Link href={href} className={styles.cta}>
        Sign up / Log in
      </Link>
    </div>
  );
}
