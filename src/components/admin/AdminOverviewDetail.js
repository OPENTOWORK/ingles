'use client';

import { useEffect } from 'react';
import styles from './AdminOverviewDetail.module.css';

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
}

function personName(user) {
  return user?.nombre || user?.email || '—';
}

export function buildOverviewDetail(kind, source) {
  const users = source.users || [];
  const activityByUser = source.activityByUser || {};
  const confirmedByUser = source.emailConfirmedByUser;
  const authAccounts = source.authAccounts;
  const loginAttempts = source.loginAttempts;
  const roleName = source.roleName || (() => 'sin_rol');

  if (kind === 'registered') {
    return {
      title: 'Usuarios registrados',
      hint: `${users.length} fichas, sin el equipo`,
      columns: ['Nombre', 'Correo', 'Rol', 'Estado', 'Alta'],
      rows: users.map((user) => [
        personName(user),
        user.email || '—',
        roleName(user),
        user.activo === false ? 'Inactiva' : 'Activa',
        formatWhen(user.creado_en),
      ]),
    };
  }

  if (kind === 'online') {
    const online = users.filter((user) => activityByUser[user.id]?.online);
    return {
      title: 'Conectados ahora',
      hint: 'Presencia en tiempo real',
      columns: ['Nombre', 'Correo', 'Rol'],
      rows: online.map((user) => [personName(user), user.email || '—', roleName(user)]),
      empty: 'Nadie está conectado ahora.',
    };
  }

  if (kind === 'access') {
    const problems = source.accessCodeProblems;
    return {
      title: 'Problemas con el acceso',
      hint: 'El correo de confirmación no se pudo enviar por un fallo del servidor. No es que la persona no lo haya abierto.',
      columns: ['Correo', 'Qué falló', 'Cuándo', 'Después'],
      rows: problems
        ? problems.map((row) => [
            row.email || '—',
            row.error || 'Error al enviar el correo',
            formatWhen(row.failedAt),
            row.resent ? 'Luego se reenvió bien' : 'No consta un reenvío correcto',
          ])
        : null,
      empty: 'No hay fallos de envío del correo de confirmación.',
    };
  }

  if (kind === 'passwordReset') {
    const problems = source.passwordResetProblems;
    return {
      title: 'Problemas al restablecer',
      hint: 'El correo para crear una contraseña nueva no se pudo enviar por un fallo del servidor. No es que la persona no lo haya abierto.',
      columns: ['Correo', 'Qué falló', 'Cuándo', 'Después'],
      rows: problems
        ? problems.map((row) => [
            row.email || '—',
            row.error || 'Error al enviar el correo',
            formatWhen(row.failedAt),
            row.resent ? 'Luego se reenvió bien' : 'No consta un reenvío correcto',
          ])
        : null,
      empty: 'No hay fallos de envío del correo de nueva contraseña.',
    };
  }

  if (kind === 'unconfirmed') {
    const blocked = confirmedByUser
      ? users.filter((user) => confirmedByUser[user.id] === false)
      : null;
    return {
      title: 'Correos sin confirmar',
      hint: 'Tienen ficha, pero no han confirmado el correo y no pueden entrar.',
      columns: ['Nombre', 'Correo', 'Rol', 'Alta'],
      rows: blocked
        ? blocked.map((user) => [
            personName(user),
            user.email || '—',
            roleName(user),
            formatWhen(user.creado_en),
          ])
        : null,
      empty: 'No hay correos sin confirmar.',
    };
  }

  if (kind === 'registration') {
    if (!authAccounts || !confirmedByUser) {
      return {
        title: 'Problema con el registro',
        hint: 'Cuentas de acceso y fichas que no coinciden.',
        columns: ['Correo', 'Qué pasa', 'Detalle', 'Fecha'],
        rows: null,
      };
    }
    const profileIds = new Set(users.map((user) => user.id));
    const authIds = new Set(authAccounts.map((account) => account.id));
    const withoutProfile = authAccounts
      .filter((account) => !profileIds.has(account.id))
      .map((account) => [
        account.email || '—',
        'No aparece en el listado',
        account.confirmed ? 'Acceso creado, sin ficha' : 'Acceso sin confirmar y sin ficha',
        formatWhen(account.createdAt),
      ]);
    const withoutAuth = users
      .filter((user) => !authIds.has(user.id))
      .map((user) => [
        user.email || personName(user),
        'Sí está en el listado',
        'La ficha no está unida a la cuenta de acceso',
        formatWhen(user.creado_en),
      ]);
    return {
      title: 'Problema con el registro',
      hint: 'Unas no tienen ficha y por eso no salen. Otras sí salen, pero la ficha quedó desconectada del acceso.',
      columns: ['Correo', 'Qué pasa', 'Detalle', 'Fecha'],
      rows: [...withoutProfile, ...withoutAuth],
      empty: 'No hay desajustes entre el acceso y el listado.',
    };
  }

  if (kind === 'logins') {
    return {
      title: 'Éxito en accesos',
      hint:
        loginAttempts == null
          ? 'Inicios de sesión'
          : loginAttempts.length
            ? 'Estas personas no pudieron entrar.'
            : 'No hay problemas de inicio de sesión.',
      columns: ['Fecha', 'Quién', 'Por qué'],
      rows:
        loginAttempts == null
          ? null
          : loginAttempts.map((row) => [
              formatWhen(row.at),
              row.who || row.email || 'No identificado',
              row.reason || 'No se pudo iniciar sesión',
            ]),
      empty: 'No hay problemas de inicio de sesión.',
    };
  }

  return null;
}

export default function AdminOverviewDetail({ detail, onClose }) {
  useEffect(() => {
    if (!detail) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, onClose]);

  if (!detail) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.window}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-overview-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h3 id="admin-overview-detail-title" className={styles.title}>
              {detail.title}
            </h3>
            {detail.hint ? <p className={styles.hint}>{detail.hint}</p> : null}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>
        <div className={styles.body}>
          {detail.rows == null ? (
            <p className={styles.empty}>Cargando…</p>
          ) : detail.rows.length === 0 ? (
            <p className={styles.empty}>{detail.empty || 'No hay registros.'}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  {detail.columns.map((column) => (
                    <th key={column}>{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detail.rows.map((row, index) => (
                  <tr key={`${detail.title}-${index}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${detail.columns[cellIndex]}-${index}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
