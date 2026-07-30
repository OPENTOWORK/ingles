'use client';

import { useState } from 'react';
import BuzonPushNotifications from '@/components/buzon/BuzonPushNotifications';
import StaffBuzonPanel from '@/components/buzon/StaffBuzonPanel';
import StaffMeetingsPanel from '@/components/coordinator/StaffMeetingsPanel';
import styles from './StaffBuzonPanelPage.module.css';

const TABS = [
  { id: 'buzon', label: 'Buzón' },
  { id: 'reuniones', label: 'Reuniones' },
];

export default function StaffBuzonPanelPage({ currentUserId }) {
  const [tab, setTab] = useState('buzon');

  return (
    <div className={styles.shell}>
      <div className={styles.digestCard} role="note">
        <div className={styles.digestIcon} aria-hidden>
          ✉
        </div>
        <div className={styles.digestBody}>
          <p className={styles.digestTitle}>Resumen diario por correo</p>
          <p className={styles.digestText}>
            Cada día (~21:00, hora peninsular) recibes un email con el resumen de tus chats directos y
            grupos del Buzón cuando ha habido mensajes.
          </p>
        </div>
      </div>

      <BuzonPushNotifications />

      <nav className={styles.tabNav} aria-label="Secciones del buzón y reuniones">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`${styles.tabBtn}${tab === item.id ? ` ${styles.tabBtnActive}` : ''}`}
            aria-current={tab === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className={styles.panelWrap}>
        {tab === 'buzon' ? <StaffBuzonPanel currentUserId={currentUserId} /> : null}
        {tab === 'reuniones' ? <StaffMeetingsPanel /> : null}
      </div>
    </div>
  );
}
