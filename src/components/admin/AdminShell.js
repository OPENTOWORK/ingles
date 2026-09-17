'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAdminShellMenuSections } from '@/config/appNavMenu';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { getClientAuth } from '@/utils/getClientAuth';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import AdminShellNav from '@/components/admin/AdminShellNav';
import styles from './AdminShell.module.css';

const SIDEBAR_COLLAPSED_KEY = 'dralo_admin_sidebar_collapsed';

function normalizePath(path = '') {
  if (!path) return '/';
  const trimmed = path.replace(/\/$/, '');
  return trimmed || '/';
}

function isAdminNavActive(href, pathname) {
  const target = normalizePath(href);
  const current = normalizePath(pathname);
  if (target === '/admin') return current === '/admin';
  return current === target || current.startsWith(`${target}/`);
}

export default function AdminShell({ children, userRole: userRoleProp = '' }) {
  const pathname = usePathname() ?? '';
  const [loading, setLoading] = useState(!userRoleProp);
  const [userRole, setUserRole] = useState(userRoleProp || '');
  const [collapsed, setCollapsed] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState({});
  const menuSections = getAdminShellMenuSections(userRole, permissionOverrides);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
    } catch {
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/staff/role-permissions', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setPermissionOverrides(data?.overrides || {});
      } catch {
        if (!cancelled) setPermissionOverrides({});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userRole]);

  useEffect(() => {
    if (userRoleProp) {
      setUserRole(userRoleProp);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      const { user } = await getClientAuth();
      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }
      const role = await getRoleNameByUserId(user.id, user.email);
      if (!cancelled) {
        setUserRole(role);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userRoleProp]);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      } catch {
        // ignore
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="admin-shell-page admin-shell-page--full-bleed">
        <div className={styles.loading}>
          <RouteLoadingMascot label="Cargando administración…" variant={5} width={120} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`admin-shell-page admin-shell-page--full-bleed${collapsed ? ' admin-shell-page--collapsed' : ''}`}
    >
      <div className={styles.layout}>
        <aside
          className={`${styles.sidebar}${collapsed ? ` ${styles.sidebarCollapsed}` : ''}`}
          aria-label="Módulos de administración"
        >
          <div className={styles.sidebarTop}>
            {!collapsed ? (
              <div className={styles.sidebarHeader}>
                <p className={styles.sidebarEyebrow}>Administración</p>
                <h1 className={styles.sidebarTitle}>Módulos</h1>
              </div>
            ) : (
              <p className={styles.sidebarCollapsedLabel} aria-hidden>A</p>
            )}
            <button
              type="button"
              className={styles.collapseBtn}
              onClick={toggleCollapsed}
              aria-expanded={!collapsed}
              aria-label={collapsed ? 'Expandir menú de administración' : 'Minimizar menú de administración'}
              title={collapsed ? 'Expandir menú' : 'Minimizar menú'}
            >
              <span aria-hidden>{collapsed ? '›' : '‹'}</span>
            </button>
          </div>

          <AdminShellNav
            menuSections={menuSections}
            pathname={pathname}
            userRole={userRole}
            collapsed={collapsed}
            isAdminNavActive={isAdminNavActive}
          />
        </aside>

        <div className={`${styles.main} admin-shell__main`}>{children}</div>
      </div>
    </div>
  );
}
