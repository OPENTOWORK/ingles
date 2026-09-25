'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ADMIN_PANEL_ASSIGNABLE_PLAN_OPTIONS,
  ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS,
  getPlanDisplayLabel,
  isStripeManagedPlanSlug,
  normalizeUserPlanSlug,
} from '@/data/financialPlanConfig';
import { formatSessionDuration } from '@/lib/userActivity';
import styles from './AdminUserManagementList.module.css';

function getPlanBadgeClass(planSlug) {
  const slug = String(planSlug || 'free').toLowerCase();
  if (slug === 'friendly_premium') return styles.badgePlanFriendlyPremium;
  if (slug === 'friendly_plus') return styles.badgePlanFriendlyPlus;
  if (slug === 'pro') return styles.badgePlanPremium;
  if (slug === 'premium') return styles.badgePlanPlus;
  if (slug === 'starter') return styles.badgePlanStarter;
  return styles.badgePlanFree;
}

function PlanBadge({ planSlug, getPlanLabel }) {
  return (
    <span className={`${styles.badge} ${getPlanBadgeClass(planSlug)}`}>
      {getPlanLabel(planSlug)}
    </span>
  );
}

function EmailConfirmedMark({ confirmed }) {
  if (confirmed == null) return null;
  const yes = Boolean(confirmed);
  const label = yes ? 'Correo confirmado' : 'Correo sin confirmar';
  return (
    <span
      className={`${styles.badge} ${yes ? styles.badgeEmailYes : styles.badgeEmailNo}`}
      title={label}
      aria-label={label}
    >
      {yes ? 'V' : 'X'}
    </span>
  );
}

const TABLE_SORT_COLUMNS = {
  usuario: 'usuario',
  rol: 'rol',
  plan: 'plan',
  conexion: 'conexion',
  sesion: 'sesion',
  email: 'email',
};

function userInitials(name = '', email = '') {
  const source = String(name || email || '?').trim();
  if (!source) return '?';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function compareLocale(a, b, direction) {
  const result = String(a || '').localeCompare(String(b || ''), 'es', {
    sensitivity: 'base',
    numeric: true,
  });
  return direction === 'asc' ? result : -result;
}

function SortableHeader({ column, label, sortColumn, sortDirection, onSort }) {
  const active = sortColumn === column;
  const ariaSort = active ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none';
  const title = active
    ? sortDirection === 'asc'
      ? 'Ordenado A→Z. Clic para Z→A'
      : 'Ordenado Z→A. Clic para A→Z'
    : 'Clic para ordenar A→Z';

  return (
    <th className={styles.sortableTh} aria-sort={ariaSort}>
      <button
        type="button"
        className={`${styles.sortBtn}${active ? ` ${styles.sortBtnActive}` : ''}`}
        onClick={() => onSort(column)}
        title={title}
      >
        <span>{label}</span>
        <span className={styles.sortIcon} aria-hidden="true">
          {active ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
        </span>
      </button>
    </th>
  );
}

function UserFormResponses({ userId, loadFormResponses, formatRegistrationDate }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, items: [], error: '' });
    loadFormResponses(userId)
      .then((items) => {
        if (!cancelled) setState({ loading: false, items, error: '' });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            loading: false,
            items: [],
            error: err.message || 'No se pudieron cargar los formularios.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userId, loadFormResponses]);

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Formularios</h3>
      {state.loading ? (
        <p className={styles.stripeNote}>Cargando…</p>
      ) : state.error ? (
        <p className={styles.formError}>{state.error}</p>
      ) : state.items.length === 0 ? (
        <p className={styles.stripeNote}>Todavía no ha respondido ningún formulario.</p>
      ) : (
        <div className={styles.formResponses}>
          {state.items.map((item) => {
            const params = new URLSearchParams({
              vista: 'respuestas',
              usuario: userId,
            });
            if (item.formulario_id) params.set('formulario', item.formulario_id);
            return (
              <Link
                key={item.id}
                href={`/admin/plan-objetivos/?${params.toString()}`}
                className={styles.formResponseLink}
              >
                <span>Contestado: {item.formulario_titulo || 'Formulario'}</span>
                <span className={styles.formResponseDate}>
                  {formatRegistrationDate(item.completado_en)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function UserDrawer({
  user,
  roles,
  plansByUser,
  placement,
  activity,
  emailConfirmed,
  loadFormResponses,
  saving,
  mailing,
  mailReady,
  getRoleNameById,
  getPlanLabel,
  getUserPlanSlug,
  formatRegistrationDate,
  onClose,
  onRoleChange,
  onPlanChange,
  onTeamStarToggle,
  onToggleActive,
  onDelete,
  onSendMail,
}) {
  if (!user) return null;

  const planSlug = getUserPlanSlug(user.id, user.plan_id);
  const assignedPlanSlug = normalizeUserPlanSlug(
    plansByUser[user.id]?.assignedPlanSlug ?? user.plan_id,
  );
  const stripeLocked = plansByUser[user.id]?.source === 'stripe';
  const legacyManualPaid =
    !stripeLocked &&
    isStripeManagedPlanSlug(assignedPlanSlug) &&
    !ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS.includes(assignedPlanSlug);
  const selectValue = ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS.includes(assignedPlanSlug)
    ? assignedPlanSlug
    : 'free';
  const displayName = user.nombre || 'Sin nombre';

  return (
    <>
      <button type="button" className={styles.drawerBackdrop} aria-label="Cerrar ficha" onClick={onClose} />
      <aside className={styles.drawer} role="dialog" aria-modal="true" aria-labelledby="admin-user-drawer-title">
        <header className={styles.drawerHeader}>
          <div>
            <h2 id="admin-user-drawer-title" className={styles.drawerTitle}>
              {displayName}
            </h2>
            <p className={styles.drawerSubtitle}>{user.email}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className={styles.drawerBody}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Cuenta</h3>
            <div className={styles.field}>
              <label htmlFor={`drawer-role-${user.id}`}>Rol</label>
              <select
                id={`drawer-role-${user.id}`}
                value={user.rol_id || ''}
                onChange={(event) => onRoleChange(user.id, event.target.value)}
                disabled={saving}
              >
                <option value="" disabled>
                  Selecciona rol
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor={`drawer-plan-${user.id}`}>Plan (admin)</label>
              {stripeLocked ? (
                <>
                  <p className={styles.planReadonly} id={`drawer-plan-${user.id}`}>
                    {getPlanDisplayLabel(planSlug)}
                  </p>
                  <p className={styles.stripeNote}>
                    Suscripción Stripe activa. El plan de pago se gestiona en Stripe, no desde aquí.
                  </p>
                </>
              ) : (
                <>
                  <select
                    id={`drawer-plan-${user.id}`}
                    value={selectValue}
                    onChange={(event) => onPlanChange(user.id, event.target.value)}
                    disabled={saving}
                  >
                    {ADMIN_PANEL_ASSIGNABLE_PLAN_OPTIONS.map((plan) => (
                      <option key={plan.slug} value={plan.slug}>
                        {plan.label}
                      </option>
                    ))}
                  </select>
                  {legacyManualPaid ? (
                    <p className={styles.stripeNote}>
                      Plan actual en perfil: {getPlanDisplayLabel(assignedPlanSlug)} (legacy).
                      Elige FREE, Friendly PLUS o Friendly PREMIUM para sustituirlo.
                    </p>
                  ) : (
                    <p className={styles.stripeNote}>
                      Solo planes gratuitos admin: FREE, Friendly PLUS y Friendly PREMIUM. PLUS/PREMIUM
                      de pago solo vía Stripe.
                    </p>
                  )}
                </>
              )}
            </div>
            <div className={styles.field}>
              <label>Equipo destacado</label>
              <button
                type="button"
                className={styles.starBtn}
                onClick={() => onTeamStarToggle(user)}
                disabled={saving}
                aria-label={user.destacado_equipo ? 'Quitar estrella' : 'Marcar estrella'}
              >
                {user.destacado_equipo ? '★ Destacado' : '☆ Sin destacar'}
              </button>
            </div>
            <div className={styles.field}>
              <label>Registro desde</label>
              <p className={styles.planReadonly} id={`drawer-registration-device-${user.id}`}>
                {user.registrationDeviceLabel || '—'}
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Actividad</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Conexión</span>
                <span className={styles.infoValue}>
                  {activity?.online ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tiempo sesión</span>
                <span className={styles.infoValue}>
                  {activity?.totalSessionLabel || formatSessionDuration(0)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Registro</span>
                <span className={styles.infoValue}>{formatRegistrationDate(user.creado_en)}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Placement</span>
                <span className={styles.infoValue}>
                  {placement?.done ? placement.level : 'No realizado'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Correo</span>
                <span className={styles.infoValue}>
                  {emailConfirmed == null ? '—' : emailConfirmed ? 'Confirmado (V)' : 'Sin confirmar (X)'}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Comercial</span>
                <span className={styles.infoValue}>{user.marketingAccepted ? 'Sí (V)' : 'No (X)'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Estado cuenta</span>
                <span className={styles.infoValue}>{user.activo === false ? 'Pausada' : 'Activa'}</span>
              </div>
            </div>
          </section>

          {loadFormResponses ? (
            <UserFormResponses
              userId={user.id}
              loadFormResponses={loadFormResponses}
              formatRegistrationDate={formatRegistrationDate}
            />
          ) : null}

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Acciones</h3>
            <div className={styles.drawerActions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionWarn}`}
                onClick={() => onToggleActive(user)}
                disabled={saving}
              >
                {user.activo === false ? 'Reactivar cuenta' : 'Pausar cuenta'}
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionMail}`}
                onClick={() => onSendMail(user)}
                disabled={mailing || !mailReady || saving}
              >
                Enviar mail
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.actionDanger}`}
                onClick={() => onDelete(user)}
                disabled={saving}
              >
                Eliminar cuenta
              </button>
            </div>
            <Link href={`/admin/usuarios/${user.id}`} className={styles.fullLink}>
              Ver ficha completa (sesiones y navegación) →
            </Link>
          </section>
        </div>
      </aside>
    </>
  );
}

export default function AdminUserManagementList({
  users,
  roles,
  plansByUser,
  placementByUser,
  userActivityByUser,
  emailConfirmedByUser = null,
  loadFormResponses = null,
  selectedUserIds,
  savingByUser,
  mailing,
  mailReady,
  allFilteredSelected,
  getRoleNameById,
  getPlanLabel,
  getUserPlanSlug,
  formatRegistrationDate,
  onToggleSelectAll,
  onToggleSelectUser,
  onRoleChange,
  onPlanChange,
  onTeamStarToggle,
  onToggleActive,
  onDelete,
  onSendMail,
}) {
  const [viewMode, setViewMode] = useState('cards');
  const [activeUserId, setActiveUserId] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const activeUser = users.find((item) => item.id === activeUserId) || null;

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(column);
    setSortDirection('asc');
  };

  const tableUsers = useMemo(() => {
    if (!sortColumn) return users;

    const getSortValue = (item) => {
      const activity = userActivityByUser[item.id];
      const planSlug = getUserPlanSlug(item.id, item.plan_id);

      switch (sortColumn) {
        case TABLE_SORT_COLUMNS.usuario:
          return item.nombre || 'Sin nombre';
        case TABLE_SORT_COLUMNS.rol:
          return getRoleNameById(item.rol_id);
        case TABLE_SORT_COLUMNS.plan:
          return getPlanLabel(planSlug);
        case TABLE_SORT_COLUMNS.conexion:
          return activity?.online ? 'Conectado' : 'Desconectado';
        case TABLE_SORT_COLUMNS.sesion:
          return activity?.totalSessionSeconds ?? 0;
        case TABLE_SORT_COLUMNS.email:
          return item.email || '';
        default:
          return '';
      }
    };

    return [...users].sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (sortColumn === TABLE_SORT_COLUMNS.sesion) {
        const diff = Number(aValue) - Number(bValue);
        return sortDirection === 'asc' ? diff : -diff;
      }

      return compareLocale(aValue, bValue, sortDirection);
    });
  }, [
    users,
    sortColumn,
    sortDirection,
    userActivityByUser,
    getRoleNameById,
    getPlanLabel,
    getUserPlanSlug,
  ]);

  useEffect(() => {
    if (!activeUserId) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setActiveUserId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeUserId]);

  return (
    <>
      <div className={styles.toolbar}>
        <p className={styles.toolbarHint}>
          <strong>{users.length}</strong> usuario{users.length === 1 ? '' : 's'} · abre una ficha
          para gestionar sin desplazarte en horizontal
        </p>
        <div className={styles.viewToggle} role="group" aria-label="Vista de usuarios">
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'cards' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Fichas
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${viewMode === 'table' ? styles.viewBtnActive : ''}`}
            onClick={() => setViewMode('table')}
          >
            Tabla
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className={styles.cardGrid}>
          {users.length === 0 ? (
            <p className={styles.emptyState}>No hay usuarios que coincidan con los filtros.</p>
          ) : (
            users.map((item) => {
              const placement = placementByUser[item.id];
              const activity = userActivityByUser[item.id];
              const planSlug = getUserPlanSlug(item.id, item.plan_id);
              return (
                <article
                  key={item.id}
                  className={`${styles.userCard} ${item.destacado_equipo ? styles.userCardStarred : ''}`}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderMain}>
                      <input
                        type="checkbox"
                        className={styles.cardCheckbox}
                        checked={selectedUserIds.includes(item.id)}
                        onChange={() => onToggleSelectUser(item.id)}
                        aria-label={`Seleccionar ${item.email}`}
                      />
                      <div
                        className={styles.avatar}
                        aria-hidden="true"
                        title={item.nombre || item.email}
                      >
                        {userInitials(item.nombre, item.email)}
                      </div>
                      <div className={styles.cardIdentity}>
                        <h3 className={styles.cardName}>{item.nombre || 'Sin nombre'}</h3>
                        <p className={styles.cardEmail}>{item.email}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`${styles.starBtn} ${
                        item.destacado_equipo ? styles.starBtnActive : ''
                      }`}
                      onClick={() => onTeamStarToggle(item)}
                      disabled={Boolean(savingByUser[item.id])}
                      aria-label={item.destacado_equipo ? 'Quitar estrella' : 'Marcar estrella'}
                    >
                      {item.destacado_equipo ? '★' : '☆'}
                    </button>
                  </div>

                  <div className={styles.cardBadges}>
                    <span className={styles.badge}>{getRoleNameById(item.rol_id)}</span>
                    <PlanBadge planSlug={planSlug} getPlanLabel={getPlanLabel} />
                    <span
                      className={`${styles.badge} ${
                        activity?.online ? styles.badgeOnline : styles.badgeOffline
                      }`}
                    >
                      <span
                        className={`${styles.statusDot} ${
                          activity?.online ? styles.statusDotOnline : styles.statusDotOffline
                        }`}
                        aria-hidden="true"
                      />
                      {activity?.online ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>

                  <dl className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <dt>Sesión</dt>
                      <dd>{activity?.totalSessionLabel || formatSessionDuration(0)}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Registro</dt>
                      <dd>{formatRegistrationDate(item.creado_en)}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Desde</dt>
                      <dd>{item.registrationDeviceLabel || '—'}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Placement</dt>
                      <dd>{placement?.done ? placement.level : '—'}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Comercial</dt>
                      <dd>{item.marketingAccepted ? 'Sí' : 'No'}</dd>
                    </div>
                    <div className={styles.metaItem}>
                      <dt>Correo confirmado</dt>
                      <dd>
                        {emailConfirmedByUser == null ? (
                          '—'
                        ) : (
                          <EmailConfirmedMark confirmed={Boolean(emailConfirmedByUser[item.id])} />
                        )}
                      </dd>
                    </div>
                  </dl>

                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      className={styles.openBtn}
                      onClick={() => setActiveUserId(item.id)}
                    >
                      Gestionar
                      <span className={styles.openBtnIcon} aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={`min-w-full divide-y divide-gray-200 ${styles.compactTable}`}>
            <thead className="bg-gray-50">
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={onToggleSelectAll}
                    aria-label="Seleccionar todos"
                  />
                </th>
                <th>★</th>
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.usuario}
                  label="Usuario"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.rol}
                  label="Rol"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.plan}
                  label="Plan"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.conexion}
                  label="Conexión"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.sesion}
                  label="Sesión"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <SortableHeader
                  column={TABLE_SORT_COLUMNS.email}
                  label="Email"
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <th>Correo</th>
                <th />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableUsers.map((item) => {
                const activity = userActivityByUser[item.id];
                const planSlug = getUserPlanSlug(item.id, item.plan_id);
                return (
                  <tr key={item.id} className={item.destacado_equipo ? 'bg-amber-50/60' : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(item.id)}
                        onChange={() => onToggleSelectUser(item.id)}
                        aria-label={`Seleccionar ${item.email}`}
                      />
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className={styles.starBtn}
                        onClick={() => onTeamStarToggle(item)}
                        disabled={Boolean(savingByUser[item.id])}
                      >
                        {item.destacado_equipo ? '★' : '☆'}
                      </button>
                    </td>
                    <td className="font-medium text-indigo-700">{item.nombre || 'Sin nombre'}</td>
                    <td>{getRoleNameById(item.rol_id)}</td>
                    <td>
                      <PlanBadge planSlug={planSlug} getPlanLabel={getPlanLabel} />
                    </td>
                    <td>{activity?.online ? 'Conectado' : 'Desconectado'}</td>
                    <td>{activity?.totalSessionLabel || formatSessionDuration(0)}</td>
                    <td className="text-gray-600">{item.email}</td>
                    <td>
                      <EmailConfirmedMark
                        confirmed={
                          emailConfirmedByUser == null
                            ? null
                            : Boolean(emailConfirmedByUser[item.id])
                        }
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.openBtn}
                        onClick={() => setActiveUserId(item.id)}
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 py-6">
                    No hay usuarios que coincidan con los filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

      <UserDrawer
        user={activeUser}
        roles={roles}
        plansByUser={plansByUser}
        placement={activeUser ? placementByUser[activeUser.id] : null}
        activity={activeUser ? userActivityByUser[activeUser.id] : null}
        emailConfirmed={
          !activeUser || emailConfirmedByUser == null
            ? null
            : Boolean(emailConfirmedByUser[activeUser.id])
        }
        loadFormResponses={loadFormResponses}
        saving={activeUser ? Boolean(savingByUser[activeUser.id]) : false}
        mailing={mailing}
        mailReady={mailReady}
        getRoleNameById={getRoleNameById}
        getPlanLabel={getPlanLabel}
        getUserPlanSlug={getUserPlanSlug}
        formatRegistrationDate={formatRegistrationDate}
        onClose={() => setActiveUserId(null)}
        onRoleChange={onRoleChange}
        onPlanChange={onPlanChange}
        onTeamStarToggle={onTeamStarToggle}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
        onSendMail={onSendMail}
      />
    </>
  );
}
