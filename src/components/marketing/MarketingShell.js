'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getClientAuth } from '@/utils/getClientAuth';
import { canAccessMarketingPlanAdminPanel, getRoleNameByUserId } from '@/utils/authRoles';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './MarketingShell.module.css';

export const MARKETING_NAV = [
  { href: '/admin/marketing', label: 'Dashboard', exact: true },
  { href: '/admin/marketing/adquisicion', label: 'Adquisición' },
  { href: '/admin/marketing/customer-journey', label: 'Customer Journey' },
  { href: '/admin/marketing/campanas', label: 'Campañas' },
  { href: '/admin/marketing/conversiones', label: 'Conversiones' },
  { href: '/admin/marketing/roi', label: 'ROI' },
];

function isActive(pathname, item) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function MarketingShell({
  title,
  subtitle,
  children,
  mascotVariant = 5,
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push(`/login?next=${encodeURIComponent(pathname || '/admin/marketing')}`);
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessMarketingPlanAdminPanel(role)) {
        router.push('/perfil');
        return;
      }

      if (!cancelled) {
        setAuthorized(true);
        setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (checking || !authorized) {
    return <RouteLoadingMascot label="Cargando módulo de marketing…" variant={mascotVariant} />;
  }

  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader title={title} subtitle={subtitle} mascotVariant={mascotVariant} />

      <nav className={styles.nav} aria-label="Marketing">
        {MARKETING_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${isActive(pathname, item) ? styles.navLinkActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}

      <div className={styles.linkRow}>
        <Link href="/admin/plan-marketing" className={styles.inlineLink}>
          Promociones y plan de marketing →
        </Link>
      </div>
    </div>
  );
}

export function MarketingPlaceholder({ moduleName, description }) {
  return (
    <div className={styles.card}>
      <p className={styles.lead}>
        <strong>{moduleName}</strong>
        {description ? ` — ${description}` : ' — en preparación (Fase 1).'}
      </p>
      <p className={styles.meta}>
        La arquitectura de datos (visitantes, touchpoints, eventos, campañas y revenue) ya está
        preparada. En fases posteriores conectaremos GA4, Google Ads, Meta y otras fuentes.
      </p>
    </div>
  );
}
