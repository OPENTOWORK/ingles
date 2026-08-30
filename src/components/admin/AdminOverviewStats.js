'use client';

import {
  Activity,
  CheckCircle2,
  GraduationCap,
  Users,
  Wifi,
} from 'lucide-react';
import styles from './AdminOverviewStats.module.css';

function StatCard({ icon: Icon, label, value, hint, accent = 'indigo' }) {
  return (
    <article className={`${styles.card} ${styles[`accent${accent}`]}`}>
      <div className={styles.iconWrap}>
        <Icon size={18} aria-hidden />
      </div>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </article>
  );
}

export default function AdminOverviewStats({
  totalUsers = 0,
  activeUsers = 0,
  onlineUsers = 0,
  placementDone = 0,
  loginSuccessRate = 0,
  roleStats = {},
}) {
  const placementPct = totalUsers > 0 ? Math.round((placementDone / totalUsers) * 100) : 0;
  const topRoles = Object.entries(roleStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([role, count]) => `${role} (${count})`)
    .join(' · ');

  return (
    <section className={styles.grid} aria-label="Resumen del panel">
      <StatCard
        icon={Users}
        label="Usuarios registrados"
        value={totalUsers.toLocaleString('es-ES')}
        hint={`${activeUsers.toLocaleString('es-ES')} cuentas activas`}
        accent="Indigo"
      />
      <StatCard
        icon={Wifi}
        label="Conectados ahora"
        value={onlineUsers.toLocaleString('es-ES')}
        hint="Presencia en tiempo real"
        accent="Emerald"
      />
      <StatCard
        icon={GraduationCap}
        label="Placement completado"
        value={`${placementPct}%`}
        hint={`${placementDone} de ${totalUsers} usuarios`}
        accent="Sky"
      />
      <StatCard
        icon={CheckCircle2}
        label="Éxito en accesos"
        value={`${loginSuccessRate}%`}
        hint="Inicios de sesión correctos"
        accent="Violet"
      />
      <StatCard
        icon={Activity}
        label="Distribución de roles"
        value={Object.keys(roleStats).length}
        hint={topRoles || 'Sin roles asignados'}
        accent="Amber"
      />
    </section>
  );
}
