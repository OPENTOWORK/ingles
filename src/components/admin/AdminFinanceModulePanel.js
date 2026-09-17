'use client';

import PanelPageHeader from '@/components/PanelPageHeader';
import styles from './AdminFinanceModulePanel.module.css';

export default function AdminFinanceModulePanel({ title, subtitle, moduleKey }) {
  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader title={title} subtitle={subtitle} mascotVariant={5} />
      <div className={styles.card}>
        <p className={styles.lead}>
          Módulo de <strong>{title}</strong> en preparación. Aquí centralizaremos la gestión de{' '}
          {moduleKey}.
        </p>
        <p className={styles.meta}>
          Mientras tanto, el <strong>Plan financiero</strong> en Dirección y Estrategia recoge la
          proyección y los planes de suscripción.
        </p>
      </div>
    </div>
  );
}
