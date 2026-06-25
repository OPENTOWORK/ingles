'use client';

import Link from 'next/link';
import { enrichStaffPanelMenuItem } from '@/config/staffPanelHub';
import StaffPanelHubIcon from '@/components/layout/StaffPanelHubIcon';
import styles from '@/components/layout/StaffPanelsHub.module.css';

const ACCENT_CLASS = {
  sky: styles.accentSky,
  violet: styles.accentViolet,
  indigo: styles.accentIndigo,
  emerald: styles.accentEmerald,
  purple: styles.accentPurple,
  amber: styles.accentAmber,
  cyan: styles.accentCyan,
  rose: styles.accentRose,
  lime: styles.accentLime,
  orange: styles.accentOrange,
  slate: styles.accentSlate,
  teal: styles.accentTeal,
};

export default function StaffPanelsHub({ items = [] }) {
  const enriched = items.map(enrichStaffPanelMenuItem);

  if (!enriched.length) {
    return (
      <div className={styles.empty}>
        No hay paneles disponibles para tu rol.
      </div>
    );
  }

  return (
    <div className={styles.staffPanelsHub}>
      {enriched.map((item) => (
        <Link key={item.href} href={item.href} className={styles.card}>
          <span className={`${styles.iconWrap} ${ACCENT_CLASS[item.accent] || styles.accentViolet}`}>
            <StaffPanelHubIcon name={item.icon} />
          </span>
          <span className={styles.label}>{item.label}</span>
          <span className={styles.description}>{item.description}</span>
        </Link>
      ))}
    </div>
  );
}
