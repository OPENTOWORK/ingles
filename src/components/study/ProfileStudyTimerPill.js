'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfileStudyTimer } from '@/context/ProfileStudyTimerContext';
import styles from './ProfileStudyTimerPill.module.css';

function isProfilePath(pathname = '') {
  const path = String(pathname || '').split('?')[0].replace(/\/$/, '') || '/';
  return path === '/perfil' || path === '/profile';
}

export default function ProfileStudyTimerPill() {
  const pathname = usePathname() || '';
  const { isRunning, sessionTime, formatted, pause, hydrated } = useProfileStudyTimer();

  const visible = hydrated && (isRunning || sessionTime > 0) && !isProfilePath(pathname);

  if (!visible) {
    return null;
  }

  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-label={`Session time ${formatted}`}>
      <Link href="/perfil?tab=study-tools" className={styles.link} title="Open study tools">
        <span className={styles.dot} aria-hidden="true" />
        <span className={styles.label}>Session</span>
        <span className={styles.time}>{formatted}</span>
      </Link>
      {isRunning ? (
        <button type="button" className={styles.pauseBtn} onClick={pause} aria-label="Pause session timer">
          ⏸
        </button>
      ) : null}
    </div>
  );
}
