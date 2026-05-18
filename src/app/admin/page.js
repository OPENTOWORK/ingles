'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { supabase } from '@/utils/supabaseClient';
import { formatSessionDuration } from '@/lib/userActivity';
import { userHasRole, normalizeRoleName } from '@/utils/authRoles';
import AdminAnalyticsPanels from '@/components/admin/AdminAnalyticsPanels';

const PERIOD_OPTIONS = ['dias', 'semanas', 'meses', 'anios'];

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
  const [savingByUser, setSavingByUser] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [mailSubject, setMailSubject] = useState('');
  const [mailMessage, setMailMessage] = useState('');
  const [mailing, setMailing] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRoleId, setNewUserRoleId] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
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
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        router.push('/login');
        return;
      }

      const isAdmin = await userHasRole(currentUser.id, ['admin', 'administrador'], currentUser.email);
      if (!isAdmin) {
        router.push('/perfil');
        return;
      }

      setUser(currentUser);
      await Promise.all([loadRoles(), loadUsers()]);
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
        marketingAccepted:
          consentFromDirectColumn === null ? consentFromMetadata : consentFromDirectColumn,
      };
    });

    setUsers(normalizedUsers);
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
    async (adminUser = user) => {
      if (!adminUser) return;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) return;

        const params = new URLSearchParams({ period: chartPeriod });
        if (chartStartDate) params.set('startDate', chartStartDate);
        if (chartEndDate) params.set('endDate', chartEndDate);

        const res = await fetch(`/api/admin/user-activity?${params}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
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
      } catch (error) {
        console.error('Error loading user activity:', error);
      }
    },
    [user, chartPeriod, chartStartDate, chartEndDate],
  );

  useEffect(() => {
    if (!user) return;
    loadUserActivity(user);
  }, [chartPeriod, chartStartDate, chartEndDate, user, loadUserActivity]);

  useEffect(() => {
    if (!user) return undefined;
    const interval = setInterval(() => loadUserActivity(user), 45_000);
    return () => clearInterval(interval);
  }, [user, loadUserActivity]);

  const getRoleNameById = (roleId) => {
    const role = roles.find((item) => item.id === roleId);
    return role?.nombre || 'sin_rol';
  };

  const handleRoleChange = async (targetUserId, newRoleId) => {
    setSavingByUser((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ rol_id: newRoleId })
        .eq('id', targetUserId);

      if (error) throw error;
      await loadUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('No se pudo cambiar el rol. Revisa permisos RLS del admin.');
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
      await Promise.all([loadUsers(), loadAnalytics()]);
    } catch (error) {
      console.error('Error toggling user active state:', error);
      alert('No se pudo cambiar el estado de la cuenta.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const deleteUserAccount = async (targetUser) => {
    if (targetUser.id === user?.id) {
      alert('No puedes eliminar tu propia cuenta de administrador.');
      return;
    }

    const confirmed = window.confirm(`Se eliminara la cuenta de ${targetUser.email}. Esta accion no se puede deshacer. Continuar?`);
    if (!confirmed) return;

    setSavingByUser((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', targetUser.id);

      if (error) throw error;
      await Promise.all([loadUsers(), loadAnalytics()]);
    } catch (error) {
      console.error('Error deleting user account:', error);
      alert('No se pudo eliminar la cuenta.');
    } finally {
      setSavingByUser((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
        </div>
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

  const filteredUsers = users.filter((item) => {
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

    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const exportUsersToCSV = () => {
    const rows = filteredUsers.map((item) => ({
      nombre: item.nombre || '',
      email: item.email || '',
      rol: getRoleNameById(item.rol_id),
      acepta_comercial: item.marketingAccepted ? 'Si' : 'No',
      conectado: userActivityByUser[item.id]?.online ? 'Si' : 'No',
      tiempo_sesion: userActivityByUser[item.id]?.totalSessionLabel || '0 s',
      creado_en: item.creado_en || '',
    }));
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

  const exportUsersToExcel = () => {
    const rows = filteredUsers.map((item) => ({
      nombre: item.nombre || '',
      email: item.email || '',
      rol: getRoleNameById(item.rol_id),
      acepta_comercial: item.marketingAccepted ? 'Si' : 'No',
      conectado: userActivityByUser[item.id]?.online ? 'Si' : 'No',
      tiempo_sesion: userActivityByUser[item.id]?.totalSessionLabel || '0 s',
      creado_en: item.creado_en || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');
    XLSX.writeFile(workbook, 'usuarios_admin.xlsx');
  };

  const sendMail = async (emails, subject, message) => {
    if (!emails.length) {
      alert('Selecciona al menos un usuario con email válido.');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      alert('Debes completar asunto y mensaje.');
      return;
    }

    setMailing(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('No se pudo obtener sesión para enviar correos.');
      }

      const mailUrl =
        (typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_ADMIN_SEND_MAIL_URL?.trim()) ||
        '/api/admin/send-mail';

      const res = await fetch(mailUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
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

      alert(`Correo enviado correctamente a ${payload.sent || emails.length} usuario(s).`);
      setMailSubject('');
      setMailMessage('');
    } catch (error) {
      console.error('Error sending mail:', error);
      alert(error.message || 'Error enviando correos.');
    } finally {
      setMailing(false);
    }
  };

  const handleMassMailSend = async () => {
    const emails = selectedUsers.map((u) => u.email).filter(Boolean);
    await sendMail(emails, mailSubject, mailMessage);
  };

  const handleSingleMail = async (targetUser) => {
    if (!targetUser?.email) {
      alert('Este usuario no tiene email válido.');
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
      alert('Introduce un email válido para el nuevo usuario.');
      return;
    }
    if (!newUserRoleId) {
      alert('Selecciona un rol para el nuevo usuario.');
      return;
    }

    setCreatingUser(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        throw new Error('No se pudo obtener sesión para crear usuarios.');
      }

      const tempPassword = generateTemporaryPassword();
      const createUserUrl =
        (typeof process !== 'undefined' &&
          process.env.NEXT_PUBLIC_ADMIN_CREATE_USER_URL?.trim()) ||
        '/api/admin/create-user';

      const res = await fetch(createUserUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
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

      alert(`Usuario creado correctamente: ${email}. Se envió email de acceso.`);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRoleId('');
      await Promise.all([loadUsers(), loadAnalytics()]);
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message || 'Error creando usuario.');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido, {user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Link href="/admin/speaking-tasks/" className="text-sky-600 underline font-medium">
          Speaking tasks (CMS)
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total usuarios</p>
            <p className="text-2xl font-semibold text-gray-900">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Roles disponibles</p>
            <p className="text-2xl font-semibold text-gray-900">{roles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Distribucion por rol</p>
            <div className="mt-2 text-sm text-gray-700 space-y-1">
              {Object.entries(roleStats).map(([role, count]) => (
                <p key={role}>
                  {role}: {count}
                </p>
              ))}
            </div>
          </div>
        </div>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={allFilteredSelected}
                        onChange={toggleSelectAllFiltered}
                        aria-label="Seleccionar todos"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cambiar rol</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conexión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo sesión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comercial</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(item.id)}
                          onChange={() => toggleSelectUser(item.id)}
                          aria-label={`Seleccionar ${item.email}`}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.nombre || 'Sin nombre'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getRoleNameById(item.rol_id)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <select
                          defaultValue={item.rol_id || ''}
                          onChange={(event) => handleRoleChange(item.id, event.target.value)}
                          disabled={Boolean(savingByUser[item.id])}
                          className="border rounded px-3 py-2 text-sm"
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
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {userActivityByUser[item.id]?.online ? (
                          <span className="inline-flex items-center gap-2 text-green-700 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" aria-hidden />
                            Conectado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-gray-500">
                            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" aria-hidden />
                            Desconectado
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                        {userActivityByUser[item.id]?.totalSessionLabel ||
                          formatSessionDuration(0)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {item.marketingAccepted ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 font-bold">
                            V
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-700 font-bold">
                            X
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleUserActive(item)}
                            disabled={Boolean(savingByUser[item.id])}
                            className="px-3 py-2 rounded bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            {item.activo === false ? 'Reactivar' : 'Pausar'}
                          </button>
                          <button
                            onClick={() => deleteUserAccount(item)}
                            disabled={Boolean(savingByUser[item.id])}
                            className="px-3 py-2 rounded bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleSingleMail(item)}
                            disabled={mailing || !mailSubject.trim() || !mailMessage.trim()}
                            className="px-3 py-2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 disabled:opacity-50"
                          >
                            Enviar mail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-6 py-6 text-center text-sm text-gray-500">
                        No hay usuarios que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
          setEndDate={setChartEndDate}
          sessionChart={sessionChart}
          connectionAnalytics={connectionAnalytics}
        />
      </div>
    </div>
  );
}
