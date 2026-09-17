'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { canAccessRolePermissionsAdmin } from '@/lib/staffRolePermissions';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './AdminRolePermissionsPanel.module.css';

async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;
  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    accessToken = refreshed?.session?.access_token || null;
  }
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

export default function AdminRolePermissionsPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [draftByRole, setDraftByRole] = useState({});
  const [activeRoleKey, setActiveRoleKey] = useState('');

  const load = useCallback(async () => {
    setError('');
    const headers = await getAdminFetchHeaders();
    const res = await fetch('/api/admin/role-permissions', { headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || 'No se pudieron cargar los permisos.');
    setData(json);
    const nextDraft = {};
    for (const role of json.roles || []) {
      nextDraft[role.key] = [...(json.resolved?.[role.key] || [])];
    }
    setDraftByRole(nextDraft);
    setActiveRoleKey((current) => current || json.roles?.[0]?.key || '');
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { session, user } = await getClientAuth();
      if (!session?.user || !user) {
        router.push('/login?next=/admin/configuracion');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessRolePermissionsAdmin(role)) {
        router.push('/perfil');
        return;
      }

      try {
        await load();
      } catch (e) {
        if (!cancelled) setError(e.message || 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, load]);

  const permissionsByCategory = useMemo(() => {
    const groups = new Map();
    for (const permission of data?.permissions || []) {
      const category = permission.category || 'Otros';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(permission);
    }
    return [...groups.entries()];
  }, [data?.permissions]);

  const activeRole = (data?.roles || []).find((role) => role.key === activeRoleKey);
  const activeDraft = new Set(draftByRole[activeRoleKey] || []);
  const savedDraft = new Set(data?.resolved?.[activeRoleKey] || []);
  const isDirty =
    activeRoleKey &&
    (draftByRole[activeRoleKey] || []).join('|') !== (data?.resolved?.[activeRoleKey] || []).join('|');

  const togglePermission = (permissionKey) => {
    if (!activeRoleKey) return;
    setDraftByRole((prev) => {
      const current = new Set(prev[activeRoleKey] || []);
      if (current.has(permissionKey)) current.delete(permissionKey);
      else current.add(permissionKey);
      return { ...prev, [activeRoleKey]: [...current] };
    });
  };

  const restoreDefaults = () => {
    if (!activeRoleKey || !data?.defaults) return;
    setDraftByRole((prev) => ({
      ...prev,
      [activeRoleKey]: [...(data.defaults[activeRoleKey] || [])],
    }));
  };

  const handleSave = async () => {
    if (!activeRoleKey) return;
    setSavingRole(activeRoleKey);
    setError('');
    try {
      const headers = await getAdminFetchHeaders();
      const res = await fetch('/api/admin/role-permissions', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          roleKey: activeRoleKey,
          permissionKeys: draftByRole[activeRoleKey] || [],
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'No se pudieron guardar los permisos.');
      setData(json);
      const nextDraft = {};
      for (const role of json.roles || []) {
        nextDraft[role.key] = [...(json.resolved?.[role.key] || [])];
      }
      setDraftByRole(nextDraft);
      toast.success(`Permisos guardados para ${activeRole?.label || activeRoleKey}.`);
    } catch (e) {
      setError(e.message || 'Error al guardar');
      toast.error(e.message || 'Error al guardar');
    } finally {
      setSavingRole('');
    }
  };

  if (loading) {
    return <RouteLoadingMascot label="Cargando configuración…" variant={5} width={120} />;
  }

  return (
    <div className={`admin-module ${styles.wrap}`}>
      <PanelPageHeader
        title="Permisos"
        subtitle="Define qué paneles y módulos puede ver cada rol del equipo."
        mascotVariant={5}
      />

      <p className={styles.hint}>
        Los cambios se aplican al menú lateral y al hub de paneles. El rol{' '}
        <strong>Administrador</strong> siempre tiene acceso completo.
      </p>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.layout}>
        <aside className={styles.roleList} aria-label="Roles configurables">
          {(data?.roles || []).map((role) => {
            const draft = draftByRole[role.key] || [];
            const saved = data?.resolved?.[role.key] || [];
            const dirty = draft.join('|') !== saved.join('|');
            return (
              <button
                key={role.key}
                type="button"
                className={activeRoleKey === role.key ? styles.roleActive : styles.roleBtn}
                onClick={() => setActiveRoleKey(role.key)}
              >
                <span>{role.label}</span>
                <span className={styles.roleMeta}>
                  {draft.length} paneles{dirty ? ' · sin guardar' : ''}
                </span>
              </button>
            );
          })}
        </aside>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div>
              <h2 className={styles.panelTitle}>{activeRole?.label || 'Rol'}</h2>
              <p className={styles.panelDesc}>
                Marca los módulos a los que este rol tendrá acceso.
              </p>
            </div>
            <div className={styles.actions}>
              <button type="button" className={styles.btnGhost} onClick={restoreDefaults}>
                Restaurar valores por defecto
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={handleSave}
                disabled={!isDirty || savingRole === activeRoleKey}
              >
                {savingRole === activeRoleKey ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>

          {permissionsByCategory.map(([category, permissions]) => (
            <div key={category} className={styles.category}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <div className={styles.permissionGrid}>
                {permissions.map((permission) => {
                  const checked = activeDraft.has(permission.key);
                  const wasSaved = savedDraft.has(permission.key);
                  return (
                    <label key={permission.key} className={styles.permissionItem}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePermission(permission.key)}
                      />
                      <span className={styles.permissionLabel}>{permission.label}</span>
                      {checked !== wasSaved ? (
                        <span className={styles.permissionChanged}>modificado</span>
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
