'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import { getClientAuth } from '@/utils/getClientAuth';
import { getRoleNameByUserId, isAdminRole } from '@/utils/authRoles';
import {
  resolvePermissionKeysForRole,
  resolveStaffRolePermissionKey,
} from '@/lib/staffRolePermissions';
import { supabase } from '@/utils/supabaseClient';
import styles from './FinanceShell.module.css';

export const FINANCE_MODULES = [
  { key: 'facturacion', href: '/admin/finanzas/facturacion', label: 'Facturación', permission: 'facturacion' },
  { key: 'contabilidad', href: '/admin/finanzas/contabilidad', label: 'Contabilidad', permission: 'contabilidad' },
  { key: 'tesoreria', href: '/admin/finanzas/tesoreria', label: 'Tesorería', permission: 'tesoreria' },
];

function normalizePath(pathname = '') {
  return String(pathname || '').split('?')[0].replace(/\/$/, '') || '/';
}

/** Carga los overrides de permisos publicados para el rol del usuario. */
async function loadRolePermissions(userId, email) {
  const roleName = await getRoleNameByUserId(userId, email);
  if (isAdminRole(roleName)) {
    return { isAdmin: true, permissions: FINANCE_MODULES.map((m) => m.permission) };
  }

  let overrides = {};
  try {
    const { data } = await supabase.from('staff_role_permissions').select('role_key, permission_keys');
    for (const row of data || []) {
      if (row?.role_key) overrides[row.role_key] = row.permission_keys || [];
    }
  } catch {
    overrides = {};
  }

  const roleKey = resolveStaffRolePermissionKey(roleName);
  return { isAdmin: false, permissions: resolvePermissionKeysForRole(roleKey, overrides) };
}

/**
 * Contenedor común del área financiera: cabecera, conmutador de módulo y
 * pestañas internas. Incluye el guardarraíl de permisos en cliente; el backend
 * vuelve a comprobarlo en cada petición.
 */
export default function FinanceShell({
  module: moduleKey,
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  tabCounts = {},
  headerActions = null,
  children,
  mascotVariant = 5,
}) {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [state, setState] = useState({ checking: true, authorized: false, permissions: [] });

  const requiredPermission = useMemo(
    () => FINANCE_MODULES.find((m) => m.key === moduleKey)?.permission,
    [moduleKey],
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push(`/login?next=${encodeURIComponent(pathname || '/admin/finanzas/facturacion')}`);
        return;
      }

      const { permissions } = await loadRolePermissions(user.id, user.email);
      if (cancelled) return;

      if (requiredPermission && !permissions.includes(requiredPermission)) {
        router.push('/perfil');
        return;
      }

      setState({ checking: false, authorized: true, permissions });
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router, requiredPermission]);

  if (state.checking || !state.authorized) {
    return <RouteLoadingMascot label="Cargando área financiera…" variant={mascotVariant} />;
  }

  const visibleModules = FINANCE_MODULES.filter((m) => state.permissions.includes(m.permission));
  const currentPath = normalizePath(pathname);

  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader title={title} subtitle={subtitle} mascotVariant={mascotVariant}>
        {headerActions}
      </PanelPageHeader>

      {visibleModules.length > 1 && (
        <div className={styles.moduleSwitch}>
          {visibleModules.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.moduleLink} ${
                currentPath === normalizePath(item.href) ? styles.moduleLinkActive : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {tabs.length > 0 && (
        <nav className={styles.nav} aria-label={title}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`${styles.navLink} ${activeTab === tab.id ? styles.navLinkActive : ''}`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
              {tabCounts[tab.id] > 0 && <span className={styles.navCount}>{tabCounts[tab.id]}</span>}
            </button>
          ))}
        </nav>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  );
}
