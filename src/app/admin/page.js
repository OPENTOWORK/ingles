'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { supabase } from '@/utils/supabaseClient';
import { getClientAuth } from '@/utils/getClientAuth';
import { formatSessionDuration } from '@/lib/userActivity';
import { userHasRole, normalizeRoleName } from '@/utils/authRoles';
import { ADMIN_ASSIGNABLE_PLAN_OPTIONS } from '@/data/financialPlanConfig';
import AdminUserManagementList from '@/components/admin/AdminUserManagementList';
import AdminOverviewStats from '@/components/admin/AdminOverviewStats';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const AdminAnalyticsPanels = dynamic(
  () => import('@/components/admin/AdminAnalyticsPanels'),
  {
    ssr: false,
    loading: () => (
      <div
        className="mb-8 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500"
        role="status"
        aria-label="Cargando analíticas"
      >
        Cargando gráficos…
      </div>
    ),
  },
);

const AdminClarityPanel = dynamic(() => import('@/components/admin/AdminClarityPanel'), {
  ssr: false,
});

const PERIOD_OPTIONS = ['dias', 'semanas', 'meses', 'anios'];

/** Cabeceras admin: JWT actualizado + cookies para APIs en producción. */
async function getAdminFetchHeaders() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    throw new Error('Sesión no válida. Cierra sesión y vuelve a entrar.');
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let accessToken = sessionData?.session?.access_token || null;

  if (!accessToken) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError) {
      throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
    }
    accessToken = refreshed?.session?.access_token || null;
  }

  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

function formatRegistrationDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

const formatDateByPeriod = (dateValue, period) => {
  const date = new Date(dateValue);
  if (period === 'anios') return `${date.getFullYear()}`;
  if (period === 'meses') return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  if (period === 'semanas') {
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
    return `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
  return date.toISOString().slice(0, 10);
};

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [plansByUser, setPlansByUser] = useState({});
  const [placementByUser, setPlacementByUser] = useState({});
  const [savingByUser, setSavingByUser] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamStarFilter, setTeamStarFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [connectionFilter, setConnectionFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [marketingFilter, setMarketingFilter] = useState('all');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [mailing, setMailing] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [period, setPeriod] = useState('meses');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analytics, setAnalytics] = useState({
    incorporaciones: [],
    abandonos: 0,
    usuariosPorNivel: [],
    heatmap: [],
    patrones: {
      horaPico: '-',
      diaPico: '-',
      tasaExito: 0,
    },
  });
  const [userActivityByUser, setUserActivityByUser] = useState({});
  const [sessionChart, setSessionChart] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('meses');
  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');
  const [connectionRoleFilter, setConnectionRoleFilter] = useState('all');
  const [connectionUserIdFilter, setConnectionUserIdFilter] = useState('');
  const [appliedConnectionRoleFilter, setAppliedConnectionRoleFilter] = useState('all');
  const [appliedConnectionUserIdFilter, setAppliedConnectionUserIdFilter] = useState('');
  const [connectionQueryLoading, setConnectionQueryLoading] = useState(false);
  const [connectionActiveUsers, setConnectionActiveUsers] = useState([]);
  const [connectionQuery, setConnectionQuery] = useState({
    period: 'meses',
    startDate: '',
    endDate: '',
    roleId: 'all',
    userId: '',
  });
  const [connectionAnalytics, setConnectionAnalytics] = useState({
    totalSessionLabel: '0 s',
    sessionCount: 0,
    activeUsers: 0,
    avgPerUserLabel: '0 s',
    horaPico: '-',
    diaPico: '-',
    heatmap: [],
  });
  const router = useRouter();

  useEffect(() => {
    initAdminData();
  }, []);

  const initAdminData = async () => {
    try {
      const { user: currentUser } = await getClientAuth();
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const isAdmin = await userHasRole(currentUser.id, ['admin', 'administrador'], currentUser.email);
      if (!isAdmin) {
        router.push('/perfil');
        return;
      }

      setUser(currentUser);
      await Promise.all([loadRoles(), loadUsers(), loadPlacementByUser(), loadUserPlans()]);
      await Promise.all([loadAnalytics(), loadUserActivity(currentUser)]);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    const { data, error } = await supabase
      .from('Usuarios_y_Perfil_roles')
      .select('id, nombre, descripcion')
      .order('nombre', { ascending: true });

    if (error) throw error;
    setRoles(data || []);
  };

  const loadUsers = async () => {
    const selectVariants = [
      'id, email, nombre, rol_id, creado_en, activo, destacado_equipo, consentimiento_comercial',
      'id, email, nombre, rol_id, creado_en, activo, destacado_equipo, marketing_updates',
      'id, email, nombre, rol_id, creado_en, activo, destacado_equipo, metadata',
      'id, email, nombre, rol_id, creado_en, activo, destacado_equipo',
      'id, email, nombre, rol_id, creado_en, activo, consentimiento_comercial',
      'id, email, nombre, rol_id, creado_en, activo, marketing_updates',
      'id, email, nombre, rol_id, creado_en, activo, metadata',
      'id, email, nombre, rol_id, creado_en, activo',
    ];

    let rows = null;
    let lastError = null;
    for (const selectClause of selectVariants) {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(selectClause)
        .order('creado_en', { ascending: false });

      if (!error) {
        rows = data || [];
        lastError = null;
        break;
      }
      lastError = error;
    }

    if (lastError) throw lastError;

    const normalizedUsers = (rows || []).map((item) => {
      const consentFromDirectColumn =
        typeof item?.consentimiento_comercial === 'boolean'
          ? item.consentimiento_comercial
          : typeof item?.marketing_updates === 'boolean'
            ? item.marketing_updates
            : null;

      const consentFromMetadata =
        typeof item?.metadata?.legal_acceptance?.marketing_updates === 'boolean'
          ? item.metadata.legal_acceptance.marketing_updates
          : typeof item?.metadata?.marketing_updates === 'boolean'
            ? item.metadata.marketing_updates
            : false;

      return {
        ...item,
        destacado_equipo: Boolean(item.destacado_equipo),
        marketingAccepted:
          consentFromDirectColumn === null ? consentFromMetadata : consentFromDirectColumn,
      };
    });

    setUsers(normalizedUsers);
  };

  const loadUserPlans = async () => {
    try {
      const res = await fetch('/api/admin/users/plans', {
        credentials: 'include',
        headers: await getAdminFetchHeaders(),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'No se pudieron cargar los planes.');
      }
      setPlansByUser(payload.plansByUser || {});
    } catch (error) {
      console.error('Error loading user plans:', error);
      setPlansByUser({});
    }
  };

  const getPlanLabel = (planSlug) => {
    const option = ADMIN_ASSIGNABLE_PLAN_OPTIONS.find((item) => item.slug === planSlug);
    return option?.label || 'Plan FREE';
  };

  const getUserPlanSlug = (userId, fallbackPlanId) => {
    const fromApi = plansByUser[userId]?.planSlug;
    if (fromApi) return fromApi;
    return String(fallbackPlanId || 'free').toLowerCase();
  };

  const loadPlacementByUser = async () => {
    try {
      const { data, error } = await supabase
        .from('placement_results')
        .select('user_id, nivel_asignado, fecha')
        .order('fecha', { ascending: false });

      if (error) throw error;

      const map = {};
      for (const row of data || []) {
        if (!row.user_id || map[row.user_id]) continue;
        map[row.user_id] = {
          done: true,
          level: row.nivel_asignado || '—',
          date: row.fecha || null,
        };
      }
      setPlacementByUser(map);
    } catch (error) {
      console.error('Error loading placement results:', error);
      setPlacementByUser({});
    }
  };

  const withinClosedDates = (dateValue) => {
    if (!dateValue) return false;
    const target = new Date(dateValue).getTime();
    if (Number.isNaN(target)) return false;
    if (startDate) {
      const min = new Date(startDate).getTime();
      if (target < min) return false;
    }
    if (endDate) {
      const max = new Date(endDate).getTime() + (24 * 60 * 60 * 1000) - 1;
      if (target > max) return false;
    }
    return true;
  };

  const loadAnalytics = async () => {
    try {
      const [usersRes, sesionesNivelRes, placementRes, authRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('id, creado_en, activo'),
        supabase
          .from('sesiones_nivel')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'abandonada'),
        supabase
          .from('placement_results')
          .select('user_id, nivel_asignado, fecha')
          .order('fecha', { ascending: false }),
        supabase
          .from('auth_sesiones')
          .select('creado_en, exitoso, tipo_evento')
          .order('creado_en', { ascending: false }),
      ]);

      const userRows = usersRes.data || [];
      const filteredUsers = userRows.filter((u) => withinClosedDates(u.creado_en));
      const incorporacionesByPeriod = filteredUsers.reduce((acc, item) => {
        const key = formatDateByPeriod(item.creado_en, period);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const incorporaciones = Object.entries(incorporacionesByPeriod)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([bucket, total]) => ({ bucket, total }));

      const inactiveUsers = userRows.filter((u) => u.activo === false).length;
      const abandonos = (sesionesNivelRes.count || 0) + inactiveUsers;

      const latestLevelByUser = new Map();
      for (const row of placementRes.data || []) {
        if (!row.user_id || latestLevelByUser.has(row.user_id)) continue;
        latestLevelByUser.set(row.user_id, row.nivel_asignado || 'Sin nivel');
      }
      const usuariosPorNivelMap = {};
      for (const [, nivel] of latestLevelByUser.entries()) {
        usuariosPorNivelMap[nivel] = (usuariosPorNivelMap[nivel] || 0) + 1;
      }
      const usuariosPorNivel = Object.entries(usuariosPorNivelMap).map(([nivel, total]) => ({ nivel, total }));

      const authRows = (authRes.data || []).filter((row) => withinClosedDates(row.creado_en));
      const hours = {};
      const weekdays = {};
      const heatmapMap = {};
      let ok = 0;
      let totalAuth = 0;
      for (const row of authRows) {
        const d = new Date(row.creado_en);
        const hour = d.getHours();
        const day = d.toLocaleDateString('es-ES', { weekday: 'short' });
        hours[hour] = (hours[hour] || 0) + 1;
        weekdays[day] = (weekdays[day] || 0) + 1;
        const heatKey = `${day}-${hour}`;
        heatmapMap[heatKey] = (heatmapMap[heatKey] || 0) + 1;
        if (row.exitoso === true) ok += 1;
        totalAuth += 1;
      }
      const horaPico = Object.entries(hours).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
      const diaPico = Object.entries(weekdays).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
      const heatmap = Object.entries(heatmapMap)
        .map(([slot, total]) => ({ slot, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 12);

      setAnalytics({
        incorporaciones,
        abandonos,
        usuariosPorNivel,
        heatmap,
        patrones: {
          horaPico: horaPico === '-' ? '-' : `${horaPico}:00`,
          diaPico,
          tasaExito: totalAuth > 0 ? Math.round((ok / totalAuth) * 100) : 0,
        },
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAnalytics();
  }, [period, startDate, endDate, user]);

  const loadUserActivity = useCallback(
    async (adminUser = user, query = connectionQuery) => {
      if (!adminUser) return;
      setConnectionQueryLoading(true);
      try {
        const headers = await getAdminFetchHeaders();

        const params = new URLSearchParams({ period: query.period });
        if (query.startDate) params.set('startDate', query.startDate);
        if (query.endDate) params.set('endDate', query.endDate);
        if (query.roleId && query.roleId !== 'all') {
          params.set('roleId', query.roleId);
        }
        if (query.userId) {
          params.set('userId', query.userId);
        }

        const res = await fetch(`/api/admin/user-activity?${params}`, {
          credentials: 'include',
          headers,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error('[admin] user-activity', data.error);
          return;
        }
        setUserActivityByUser(data.byUser || {});
        setSessionChart(data.chart || []);
        setConnectionAnalytics(
          data.connection || {
            totalSessionLabel: '0 s',
            sessionCount: 0,
            activeUsers: 0,
            avgPerUserLabel: '0 s',
            horaPico: '-',
            diaPico: '-',
            heatmap: [],
          },
        );
        setAppliedConnectionRoleFilter(data.appliedRoleId || query.roleId || 'all');
        setAppliedConnectionUserIdFilter(data.appliedUserId || query.userId || '');
        setConnectionActiveUsers(data.activeUsers || []);
      } catch (error) {
        console.error('Error loading user activity:', error);
      } finally {
        setConnectionQueryLoading(false);
      }
    },
    [user, connectionQuery],
  );

  const runConnectionQuery = useCallback(() => {
    const nextQuery = {
      period: chartPeriod,
      startDate: chartStartDate,
      endDate: chartEndDate,
      roleId: connectionRoleFilter,
      userId: connectionUserIdFilter.trim(),
    };
    setConnectionQuery(nextQuery);
  }, [chartPeriod, chartStartDate, chartEndDate, connectionRoleFilter, connectionUserIdFilter]);

  const loadConnectionUserPages = useCallback(
    async (userId) => {
      const headers = await getAdminFetchHeaders();
      const params = new URLSearchParams({ navOnly: '1' });
      if (connectionQuery.startDate) params.set('startDate', connectionQuery.startDate);
      if (connectionQuery.endDate) params.set('endDate', connectionQuery.endDate);

      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}?${params}`, {
        credentials: 'include',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'No se pudieron cargar las páginas.');
      }
      return data.pageViews || [];
    },
    [connectionQuery.startDate, connectionQuery.endDate],
  );

  useEffect(() => {
    if (!user) return;
    loadUserActivity(user, connectionQuery);
  }, [user, connectionQuery, loadUserActivity]);

  useEffect(() => {
    if (!user) return undefined;
    const interval = setInterval(() => loadUserActivity(user, connectionQuery), 45_000);
    return () => clearInterval(interval);
  }, [user, connectionQuery, loadUserActivity]);

  const getRoleNameById = (roleId) => {
    const role = roles.find((item) => item.id === roleId);
    return role?.nombre || 'sin_rol';
  };

  const handlePlanChange = async (targetUserId, newPlanSlug) => {
    setSavingByUser((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/plan`, {
        method: 'PATCH',
        credentials: 'include',
        headers: await getAdminFetchHeaders(),
        body: JSON.stringify({ planSlug: newPlanSlug }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'No se pudo cambiar el plan.');
      }
      setPlansByUser((prev) => ({
        ...prev,
        [targetUserId]: {
          planSlug: payload.planSlug,
          assignedPlanSlug: payload.assignedPlanSlug,
          source: payload.source,
          stripeStatus: payload.stripeStatus || null,
        },
      }));
      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetUserId ? { ...item, plan_id: payload.assignedPlanSlug || newPlanSlug } : item,
        ),
      );
    } catch (error) {
      console.error('Error changing user plan:', error);
      toast.error(error.message || 'No se pudo cambiar el plan.');
      await loadUserPlans();
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleRoleChange = async (targetUserId, newRoleId) => {
    setSavingByUser((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ rol_id: newRoleId })
        .eq('id', targetUserId);

      if (error) throw error;
      await Promise.all([loadUsers(), loadPlacementByUser()]);
    } catch (error) {
      console.error('Error changing user role:', error);
      toast.error('No se pudo cambiar el rol. Revisa permisos RLS del admin.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleTeamStarToggle = async (targetUser) => {
    if (!targetUser?.id) return;
    const targetUserId = targetUser.id;
    const newValue = !Boolean(targetUser.destacado_equipo);
    setSavingByUser((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUserId)}/team-star`, {
        method: 'PATCH',
        credentials: 'include',
        headers: await getAdminFetchHeaders(),
        body: JSON.stringify({ starred: newValue }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.error || 'No se pudo actualizar la estrella del equipo.');
      }
      setUsers((prev) =>
        prev.map((item) =>
          item.id === targetUserId
            ? { ...item, destacado_equipo: Boolean(payload.destacado_equipo ?? newValue) }
            : item,
        ),
      );
    } catch (error) {
      console.error('Error toggling team star:', error);
      toast.error(error.message || 'No se pudo actualizar la estrella del equipo.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const toggleUserActive = async (targetUser) => {
    setSavingByUser((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ activo: !targetUser.activo })
        .eq('id', targetUser.id);

      if (error) throw error;
      await Promise.all([loadUsers(), loadPlacementByUser(), loadAnalytics()]);
    } catch (error) {
      console.error('Error toggling user active state:', error);
      toast.error('No se pudo cambiar el estado de la cuenta.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const deleteUserAccount = async (targetUser) => {
    if (targetUser.id === user?.id) {
      toast.error('No puedes eliminar tu propia cuenta de administrador.');
      return;
    }

    const confirmed = window.confirm(`Se eliminara la cuenta de ${targetUser.email}. Esta accion no se puede deshacer. Continuar?`);
    if (!confirmed) return;

    setSavingByUser((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(targetUser.id)}`, {
        method: 'DELETE',
        headers: await getAdminFetchHeaders(),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'No se pudo eliminar la cuenta.');
      }
      await Promise.all([loadUsers(), loadPlacementByUser(), loadAnalytics()]);
    } catch (error) {
      console.error('Error deleting user account:', error);
      toast.error(error.message || 'No se pudo eliminar la cuenta.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const getBulkActionTargets = () => selectedUsers.filter((item) => item.id !== user?.id);

  const bulkSetUsersActive = async (active) => {
    const targets = getBulkActionTargets();
    if (!targets.length) {
      toast.error('Selecciona al menos un usuario distinto de tu cuenta de administrador.');
      return;
    }

    const verb = active ? 'reactivar' : 'pausar';
    const confirmed = window.confirm(
      `¿Quieres ${verb} ${targets.length} cuenta(s)? Las cuentas pausadas no pueden acceder a la plataforma.`,
    );
    if (!confirmed) return;

    setBulkProcessing(true);
    const ids = targets.map((item) => item.id);
    try {
      const { error } = await supabase.from('user_profiles').update({ activo: active }).in('id', ids);
      if (error) throw error;
      await Promise.all([loadUsers(), loadPlacementByUser(), loadAnalytics()]);
      toast.success(`${active ? 'Reactivadas' : 'Pausadas'} ${targets.length} cuenta(s).`);
    } catch (error) {
      console.error(`Error bulk ${verb} users:`, error);
      toast.error(`No se pudieron ${active ? 'reactivar' : 'pausar'} las cuentas seleccionadas.`);
    } finally {
      setBulkProcessing(false);
    }
  };

  const bulkDeleteUsers = async () => {
    const targets = getBulkActionTargets();
    if (!targets.length) {
      toast.error('Selecciona al menos un usuario distinto de tu cuenta de administrador.');
      return;
    }

    const confirmed = window.confirm(
      `Se eliminarán ${targets.length} cuenta(s). Esta acción no se puede deshacer. ¿Continuar?`,
    );
    if (!confirmed) return;

    setBulkProcessing(true);
    const ids = targets.map((item) => item.id);
    try {
      const headers = await getAdminFetchHeaders();
      const results = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers,
          });
          const payload = await res.json().catch(() => ({}));
          return { id, ok: res.ok, error: payload.error || null };
        }),
      );
      const failed = results.filter((item) => !item.ok);
      if (failed.length === results.length) {
        throw new Error(failed[0]?.error || 'No se pudieron eliminar las cuentas seleccionadas.');
      }
      const deletedIds = results.filter((item) => item.ok).map((item) => item.id);
      setSelectedUserIds((prev) => prev.filter((id) => !deletedIds.includes(id)));
      await Promise.all([loadUsers(), loadPlacementByUser(), loadAnalytics()]);
      if (failed.length) {
        toast.success(`Eliminadas ${deletedIds.length} cuenta(s). ${failed.length} no se pudieron eliminar.`);
      } else {
        toast.success(`Eliminadas ${deletedIds.length} cuenta(s).`);
      }
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast.error(error.message || 'No se pudieron eliminar las cuentas seleccionadas.');
    } finally {
      setBulkProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando panel de administración…" variant={5} width={130} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleStats = users.reduce((acc, item) => {
    const roleName = normalizeRoleName(getRoleNameById(item.rol_id));
    acc[roleName] = (acc[roleName] || 0) + 1;
    return acc;
  }, {});

  const filteredUsers = users
    .filter((item) => {
      const text = `${item.nombre || ''} ${item.email || ''}`.toLowerCase();
      const matchesSearch = text.includes(searchTerm.toLowerCase().trim());
      const matchesRole =
        roleFilter === 'all' ? true : item.rol_id === roleFilter;
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? item.activo !== false
            : item.activo === false;
      const matchesTeamStar =
        teamStarFilter === 'all' ? true : Boolean(item.destacado_equipo);
      const planSlug = getUserPlanSlug(item.id, item.plan_id);
      const matchesPlan = planFilter === 'all' ? true : planSlug === planFilter;
      const isOnline = Boolean(userActivityByUser[item.id]?.online);
      const matchesConnection =
        connectionFilter === 'all'
          ? true
          : connectionFilter === 'online'
            ? isOnline
            : !isOnline;
      const placement = placementByUser[item.id];
      const matchesPlacement =
        placementFilter === 'all'
          ? true
          : placementFilter === 'done'
            ? Boolean(placement?.done)
            : !placement?.done;
      const matchesMarketing =
        marketingFilter === 'all'
          ? true
          : marketingFilter === 'yes'
            ? Boolean(item.marketingAccepted)
            : !item.marketingAccepted;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesTeamStar &&
        matchesPlan &&
        matchesConnection &&
        matchesPlacement &&
        matchesMarketing
      );
    })
    .sort((a, b) => {
      const aStar = a.destacado_equipo ? 0 : 1;
      const bStar = b.destacado_equipo ? 0 : 1;
      if (aStar !== bStar) return aStar - bStar;
      const aTime = new Date(a.creado_en || 0).getTime();
      const bTime = new Date(b.creado_en || 0).getTime();
      return bTime - aTime;
    });

  const starredTeamCount = users.filter((item) => item.destacado_equipo).length;

  const filterCounts = users.reduce(
    (acc, item) => {
      const planSlug = getUserPlanSlug(item.id, item.plan_id);
      if (planSlug === 'free') acc.planFree += 1;
      if (planSlug === 'premium') acc.planPlus += 1;
      if (planSlug === 'pro') acc.planPremium += 1;

      if (userActivityByUser[item.id]?.online) acc.online += 1;
      else acc.offline += 1;

      if (placementByUser[item.id]?.done) acc.placementDone += 1;
      else acc.placementPending += 1;

      if (item.marketingAccepted) acc.marketingYes += 1;
      else acc.marketingNo += 1;

      return acc;
    },
    {
      planFree: 0,
      planPlus: 0,
      planPremium: 0,
      online: 0,
      offline: 0,
      placementDone: 0,
      placementPending: 0,
      marketingYes: 0,
      marketingNo: 0,
    },
  );

  const hasActiveUserFilters =
    Boolean(searchTerm.trim()) ||
    roleFilter !== 'all' ||
    statusFilter !== 'all' ||
    teamStarFilter !== 'all' ||
    planFilter !== 'all' ||
    connectionFilter !== 'all' ||
    placementFilter !== 'all' ||
    marketingFilter !== 'all';

  const clearUserFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setTeamStarFilter('all');
    setPlanFilter('all');
    setConnectionFilter('all');
    setPlacementFilter('all');
    setMarketingFilter('all');
  };

  const selectedUsers = filteredUsers.filter((u) => selectedUserIds.includes(u.id));
  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !filteredUsers.some((u) => u.id === id)));
      return;
    }
    setSelectedUserIds((prev) => {
      const set = new Set(prev);
      filteredUsers.forEach((u) => set.add(u.id));
      return Array.from(set);
    });
  };

  const exportUsersToCSV = async () => {
    const XLSX = await import('xlsx');
    const rows = filteredUsers.map((item) => {
      const placement = placementByUser[item.id];
      return {
        nombre: item.nombre || '',
        email: item.email || '',
        fecha_registro: formatRegistrationDate(item.creado_en),
        placement_test: placement?.done ? 'Si' : 'No',
        nivel_placement: placement?.level || '—',
        rol: getRoleNameById(item.rol_id),
        plan: getPlanLabel(getUserPlanSlug(item.id, item.plan_id)),
        equipo_destacado: item.destacado_equipo ? 'Si' : 'No',
        acepta_comercial: item.marketingAccepted ? 'Si' : 'No',
        conectado: userActivityByUser[item.id]?.online ? 'Si' : 'No',
        tiempo_sesion: userActivityByUser[item.id]?.totalSessionLabel || '0 s',
        creado_en: item.creado_en || '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'usuarios_admin.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportUsersToExcel = async () => {
    const XLSX = await import('xlsx');
    const rows = filteredUsers.map((item) => {
      const placement = placementByUser[item.id];
      return {
        nombre: item.nombre || '',
        email: item.email || '',
        fecha_registro: formatRegistrationDate(item.creado_en),
        placement_test: placement?.done ? 'Si' : 'No',
        nivel_placement: placement?.level || '—',
        rol: getRoleNameById(item.rol_id),
        plan: getPlanLabel(getUserPlanSlug(item.id, item.plan_id)),
        equipo_destacado: item.destacado_equipo ? 'Si' : 'No',
        acepta_comercial: item.marketingAccepted ? 'Si' : 'No',
        conectado: userActivityByUser[item.id]?.online ? 'Si' : 'No',
        tiempo_sesion: userActivityByUser[item.id]?.totalSessionLabel || '0 s',
        creado_en: item.creado_en || '',
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, 'usuarios_admin.xlsx');
  };

  const sendMail = async (emails, subject, message) => {
    if (!emails.length) {
      toast.error('Selecciona al menos un usuario con email válido.');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error('Debes completar asunto y mensaje.');
      return;
    }

    setMailing(true);
    const loadingToast = toast.loading(
      emails.length === 1 ? 'Enviando correo…' : `Enviando correo a ${emails.length} usuarios…`,
    );
    try {
      const mailUrl =
        (typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_ADMIN_SEND_MAIL_URL?.trim()) ||
        '/api/admin/send-mail';

      const res = await fetch(mailUrl, {
        method: 'POST',
        credentials: 'include',
        headers: await getAdminFetchHeaders(),
        body: JSON.stringify({
          to: emails,
          subject,
          message,
        }),
      });

      let payload = {};
      try {
        payload = await res.json();
      } catch {
        /* HTML 404 u otra respuesta no JSON en hosting estático */
      }
      if (res.status === 404 && !process.env.NEXT_PUBLIC_ADMIN_SEND_MAIL_URL) {
        throw new Error(
          'El envío masivo no está disponible en la versión estática (carpeta out). Despliega la API en un servidor o define NEXT_PUBLIC_ADMIN_SEND_MAIL_URL al compilar.'
        );
      }
      if (!res.ok) throw new Error(payload?.error || 'No se pudo enviar el correo.');

      const sentCount = payload.sent || emails.length;
      const failedCount = payload.failed || 0;
      if (failedCount > 0) {
        toast.success(`Enviado a ${sentCount} usuario(s). ${failedCount} fallaron al enviar.`, {
          duration: 6000,
        });
      } else {
        toast.success(
          `Correo enviado a ${sentCount} usuario(s). Si no llega, puede estar en spam o bloqueado por el servidor del destinatario.`,
          { duration: 7000 },
        );
      }
      setMailSubject('');
      setMailMessage('');
    } catch (error) {
      console.error('Error sending mail:', error);
      toast.error(error.message || 'Error enviando correos.', { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setMailing(false);
    }
  };

  const handleMassMailSend = async () => {
    const emails = selectedUsers.map((u) => u.email).filter(Boolean);
    await sendMail(emails, mailSubject, mailMessage);
  };

  const handleSingleMail = async (targetUser) => {
    if (!targetUser?.email) {
      toast.error('Este usuario no tiene email válido.');
      return;
    }
    await sendMail([targetUser.email], mailSubject, mailMessage);
  };

  const generateTemporaryPassword = () => {
    const randomPart = Math.random().toString(36).slice(-8);
    return `Tmp-${randomPart}A1`;
  };

  const handleCreateUser = async () => {
    const email = newUserEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Introduce un email válido para el nuevo usuario.');
      return;
    }
    if (!newUserRoleId) {
      toast.error('Selecciona un rol para el nuevo usuario.');
      return;
    }

    setCreatingUser(true);
    try {
      const tempPassword = generateTemporaryPassword();
      const createUserUrl =
        (typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_ADMIN_CREATE_USER_URL?.trim()) ||
        '/api/admin/create-user';

      const res = await fetch(createUserUrl, {
        method: 'POST',
        credentials: 'include',
        headers: await getAdminFetchHeaders(),
        body: JSON.stringify({
          email,
          name: newUserName.trim() || null,
          roleId: newUserRoleId,
          temporaryPassword: tempPassword,
        }),
      });

      let payload = {};
      try {
        payload = await res.json();
      } catch {
        /* respuesta no JSON */
      }

      if (res.status === 404 && !process.env.NEXT_PUBLIC_ADMIN_CREATE_USER_URL) {
        throw new Error(
          'El alta de usuarios no está disponible en la versión estática. Despliega la API en un servidor o define NEXT_PUBLIC_ADMIN_CREATE_USER_URL al compilar.'
        );
      }

      if (!res.ok) {
        throw new Error(payload?.error || 'No se pudo crear el usuario.');
      }

      toast.success(`Usuario creado correctamente: ${email}. Se envió email de acceso.`, {
        duration: 6000,
      });
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRoleId('');
      await Promise.all([loadUsers(), loadPlacementByUser(), loadAnalytics()]);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Error creando usuario.');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <PanelPageHeader title="Panel de Administración" mascotVariant={5} mascotWidth={92}>
              <span className="text-sm text-gray-600">Bienvenido, {user.email}</span>
            </PanelPageHeader>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminOverviewStats
          totalUsers={users.length}
          activeUsers={users.filter((item) => item.activo !== false).length}
          onlineUsers={users.filter((item) => Boolean(userActivityByUser[item.id]?.online)).length}
          placementDone={Object.keys(placementByUser).length}
          loginSuccessRate={analytics.patrones.tasaExito}
          roleStats={roleStats}
        />

        <AdminAnalyticsPanels
          period={period}
          setPeriod={setPeriod}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          analytics={analytics}
          chartPeriod={chartPeriod}
          setChartPeriod={setChartPeriod}
          chartStartDate={chartStartDate}
          setChartStartDate={setChartStartDate}
          chartEndDate={chartEndDate}
          setChartEndDate={setChartEndDate}
          sessionChart={sessionChart}
          connectionAnalytics={connectionAnalytics}
          connectionActiveUsers={connectionActiveUsers}
          connectionRoleFilter={connectionRoleFilter}
          setConnectionRoleFilter={setConnectionRoleFilter}
          connectionUserIdFilter={connectionUserIdFilter}
          setConnectionUserIdFilter={setConnectionUserIdFilter}
          appliedConnectionRoleFilter={appliedConnectionRoleFilter}
          appliedConnectionUserIdFilter={appliedConnectionUserIdFilter}
          onRunConnectionQuery={runConnectionQuery}
          onLoadConnectionUserPages={loadConnectionUserPages}
          connectionQueryKey={`${connectionQuery.period}|${connectionQuery.startDate}|${connectionQuery.endDate}|${connectionQuery.roleId}|${connectionQuery.userId}`}
          connectionQueryLoading={connectionQueryLoading}
          roles={roles}
        />

        <AdminClarityPanel />

        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Gestion de usuarios y roles</h2>
          </div>
          <div className="p-6">
            <div className="border rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Alta de usuario por administrador</h3>
              <p className="text-sm text-gray-600 mb-3">
                Crea una cuenta nueva y envía automáticamente un correo con acceso inicial.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Nombre (opcional)"
                  className="border rounded px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="Email del usuario"
                  className="border rounded px-3 py-2 text-sm"
                />
                <select
                  value={newUserRoleId}
                  onChange={(e) => setNewUserRoleId(e.target.value)}
                  className="border rounded px-3 py-2 text-sm"
                >
                  <option value="">Selecciona rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCreateUser}
                disabled={creatingUser}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 mb-5"
              >
                {creatingUser ? 'Creando usuario...' : 'Crear usuario y enviar mail'}
              </button>

              <h3 className="text-md font-semibold text-gray-900 mb-3">Envio de correo masivo</h3>
              <p className="text-sm text-gray-600 mb-3">
                Selecciona usuarios con las casillas y envía un correo a todos los marcados.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Asunto del correo"
                  className="border rounded px-3 py-2 text-sm"
                />
                <div className="text-sm text-gray-700 self-center">
                  Seleccionados: <strong>{selectedUsers.length}</strong>
                </div>
              </div>
              <textarea
                value={mailMessage}
                onChange={(e) => setMailMessage(e.target.value)}
                placeholder="Mensaje del correo"
                rows={4}
                className="w-full border rounded px-3 py-2 text-sm mb-3"
              />
              <button
                onClick={handleMassMailSend}
                disabled={mailing || selectedUsers.length === 0}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {mailing ? 'Enviando...' : 'Enviar mail masivo'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Buscar usuario</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre o email"
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Filtrar por rol</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos los roles</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Filtrar por estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activa</option>
                  <option value="paused">Pausada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Equipo destacado</label>
                <select
                  value={teamStarFilter}
                  onChange={(e) => setTeamStarFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos ({users.length})</option>
                  <option value="starred">Solo con estrella ({starredTeamCount})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Filtrar por plan</label>
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos los planes ({users.length})</option>
                  <option value="free">Plan FREE ({filterCounts.planFree})</option>
                  <option value="premium">Plan PLUS ({filterCounts.planPlus})</option>
                  <option value="pro">Plan PREMIUM ({filterCounts.planPremium})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Conexión</label>
                <select
                  value={connectionFilter}
                  onChange={(e) => setConnectionFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos ({users.length})</option>
                  <option value="online">Conectados ({filterCounts.online})</option>
                  <option value="offline">Desconectados ({filterCounts.offline})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Placement test</label>
                <select
                  value={placementFilter}
                  onChange={(e) => setPlacementFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos ({users.length})</option>
                  <option value="done">Realizado ({filterCounts.placementDone})</option>
                  <option value="pending">Pendiente ({filterCounts.placementPending})</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Comercial</label>
                <select
                  value={marketingFilter}
                  onChange={(e) => setMarketingFilter(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  <option value="all">Todos ({users.length})</option>
                  <option value="yes">Acepta (V) ({filterCounts.marketingYes})</option>
                  <option value="no">No acepta (X) ({filterCounts.marketingNo})</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {hasActiveUserFilters ? (
                <button
                  type="button"
                  onClick={clearUserFilters}
                  className="px-3 py-2 rounded bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 text-sm"
                >
                  Limpiar filtros
                </button>
              ) : null}
              <span className="text-sm text-gray-600">
                Mostrando <strong>{filteredUsers.length}</strong> de {users.length} usuarios
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={exportUsersToCSV}
                className="px-3 py-2 rounded bg-green-100 text-green-800 hover:bg-green-200"
              >
                Exportar CSV
              </button>
              <button
                onClick={exportUsersToExcel}
                className="px-3 py-2 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
              >
                Exportar Excel
              </button>
            </div>

            {selectedUsers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-3 mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                <span className="text-sm font-medium text-indigo-900">
                  {selectedUsers.length} seleccionado(s)
                  {selectedUsers.some((item) => item.id === user?.id)
                    ? ' · tu cuenta se excluye de acciones masivas'
                    : ''}
                </span>
                <button
                  type="button"
                  onClick={() => bulkSetUsersActive(false)}
                  disabled={bulkProcessing || getBulkActionTargets().length === 0}
                  className="px-3 py-2 rounded bg-yellow-100 text-yellow-900 hover:bg-yellow-200 disabled:opacity-50"
                >
                  {bulkProcessing ? 'Procesando…' : 'Pausar seleccionados'}
                </button>
                <button
                  type="button"
                  onClick={() => bulkSetUsersActive(true)}
                  disabled={bulkProcessing || getBulkActionTargets().length === 0}
                  className="px-3 py-2 rounded bg-green-100 text-green-900 hover:bg-green-200 disabled:opacity-50"
                >
                  {bulkProcessing ? 'Procesando…' : 'Reanudar seleccionados'}
                </button>
                <button
                  type="button"
                  onClick={bulkDeleteUsers}
                  disabled={bulkProcessing || getBulkActionTargets().length === 0}
                  className="px-3 py-2 rounded bg-red-100 text-red-900 hover:bg-red-200 disabled:opacity-50"
                >
                  {bulkProcessing ? 'Procesando…' : 'Eliminar seleccionados'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserIds([])}
                  disabled={bulkProcessing}
                  className="px-3 py-2 rounded bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Quitar selección
                </button>
              </div>
            ) : null}

            <AdminUserManagementList
              users={filteredUsers}
              roles={roles}
              plansByUser={plansByUser}
              placementByUser={placementByUser}
              userActivityByUser={userActivityByUser}
              selectedUserIds={selectedUserIds}
              savingByUser={savingByUser}
              mailing={mailing}
              mailReady={Boolean(mailSubject.trim() && mailMessage.trim())}
              allFilteredSelected={allFilteredSelected}
              getRoleNameById={getRoleNameById}
              getPlanLabel={getPlanLabel}
              getUserPlanSlug={getUserPlanSlug}
              formatRegistrationDate={formatRegistrationDate}
              onToggleSelectAll={toggleSelectAllFiltered}
              onToggleSelectUser={toggleSelectUser}
              onRoleChange={handleRoleChange}
              onPlanChange={handlePlanChange}
              onTeamStarToggle={handleTeamStarToggle}
              onToggleActive={toggleUserActive}
              onDelete={deleteUserAccount}
              onSendMail={handleSingleMail}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
