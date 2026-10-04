'use client';

import {
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  MailWarning,
  UserRoundX,
  Users,
  Wifi,
} from 'lucide-react';
import styles from './AdminOverviewStats.module.css';

function StatCard({ icon: Icon, label, value, hint, accent = 'indigo', onClick }) {
  return (
    <button
      type="button"
      className={`${styles.card} ${styles[`accent${accent}`]}`}
      onClick={onClick}
    >
      <div className={styles.iconWrap}>
        <Icon size={18} aria-hidden />
      </div>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </button>
  );
}

function formatCount(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('es-ES');
}

export default function AdminOverviewStats({
  totalUsers = 0,
  activeUsers = 0,
  onlineUsers = 0,
  accessProblems = null,
  passwordResetProblems = null,
  unconfirmedEmails = null,
  registrationProblems = null,
  loginSuccessRate = 0,
  onOpen,
}) {
  return (
    <section className={styles.grid} aria-label="Resumen del panel">
      <StatCard
        icon={Users}
        label="Usuarios registrados"
        value={totalUsers.toLocaleString('es-ES')}
        hint={`${activeUsers.toLocaleString('es-ES')} cuentas activas, sin el equipo`}
        accent="Indigo"
        onClick={() => onOpen?.('registered')}
      />
      <StatCard
        icon={Wifi}
        label="Conectados ahora"
        value={onlineUsers.toLocaleString('es-ES')}
        hint="Presencia en tiempo real"
        accent="Emerald"
        onClick={() => onOpen?.('online')}
      />
      <StatCard
        icon={KeyRound}
        label="Problemas con el acceso"
        value={formatCount(accessProblems)}
        hint="Falló el envío del correo de confirmación"
        accent="Rose"
        onClick={() => onOpen?.('access')}
      />
      <StatCard
        icon={LockKeyhole}
        label="Problemas al restablecer"
        value={formatCount(passwordResetProblems)}
        hint="Falló el envío del correo de nueva contraseña"
        accent="Sky"
        onClick={() => onOpen?.('passwordReset')}
      />
      <StatCard
        icon={UserRoundX}
        label="Problema con el registro"
        value={formatCount(registrationProblems)}
        hint="Cuentas creadas que no aparecen en el listado"
        accent="Orange"
        onClick={() => onOpen?.('registration')}
      />
      <StatCard
        icon={CheckCircle2}
        label="Éxito en accesos"
        value={loginSuccessRate == null ? '—' : `${loginSuccessRate}%`}
        hint={
          loginSuccessRate == null
            ? 'Inicios de sesión correctos'
            : loginSuccessRate >= 100
              ? 'Sin problemas de inicio de sesión'
              : 'Pulsa para ver quién y por qué'
        }
        accent="Violet"
        onClick={() => onOpen?.('logins')}
      />
      <StatCard
        icon={MailWarning}
        label="Correos sin confirmar"
        value={formatCount(unconfirmedEmails)}
        hint="Tienen ficha y no han confirmado el correo"
        accent="Amber"
        onClick={() => onOpen?.('unconfirmed')}
      />
    </section>
  );
}
