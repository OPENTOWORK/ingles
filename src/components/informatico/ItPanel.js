'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { canAccessItPanel, getRoleNameByUserId, isAdminRole } from '@/utils/authRoles';
import TeacherActivityCharts from '@/components/teacher/TeacherActivityCharts';
import SupportHub from '@/components/support/SupportHub';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import ItResponsivePreviewPanel from '@/components/informatico/ItResponsivePreviewPanel';

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'sistema', label: 'Sistema' },
  { id: 'actividad', label: 'Actividad' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'herramientas', label: 'Herramientas' },
  { id: 'supabase', label: 'Supabase' },
  { id: 'responsive', label: 'Visualización en móvil y tablet' },
];

async function itFetch(path, options = {}, { soft = false } = {}) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    if (soft) return { error: 'Sesión no válida.' };
    throw new Error('Sesión no válida.');
  }
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (soft) return { ...payload, error: payload?.error || 'Error en la petición.' };
    throw new Error(payload?.error || 'Error en la petición.');
  }
  return payload;
}

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 border border-gray-100">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
      {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
    </div>
  );
}

function StatusBadge({ ok }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
        ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {ok ? 'OK' : 'Revisar'}
    </span>
  );
}

export default function ItPanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('resumen');
  const [overview, setOverview] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [sessionChart, setSessionChart] = useState([]);
  const [connectionAnalytics, setConnectionAnalytics] = useState({
    totalSessionLabel: '0 s',
    sessionCount: 0,
    activeUsers: 0,
    avgPerUserLabel: '0 s',
    horaPico: '-',
    diaPico: '-',
    heatmap: [],
  });
  const [chartPeriod, setChartPeriod] = useState('meses');
  const [chartStartDate, setChartStartDate] = useState('');
  const [chartEndDate, setChartEndDate] = useState('');
  const [serviceRoleConfigured, setServiceRoleConfigured] = useState(null);
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [supabaseTables, setSupabaseTables] = useState([]);
  const [supabaseTablesLoading, setSupabaseTablesLoading] = useState(false);
  const [supabaseTablesError, setSupabaseTablesError] = useState('');
  const [supabaseTableFilter, setSupabaseTableFilter] = useState('');
  const [supabaseProjectUrl, setSupabaseProjectUrl] = useState(null);

  const loadOverview = useCallback(async () => {
    const data = await itFetch('/api/informatico/overview', {}, { soft: true });
    if (!data.error) setOverview(data);
  }, []);

  const loadSystemStatus = useCallback(async () => {
    const data = await itFetch('/api/informatico/system-status', {}, { soft: true });
    if (!data.error) setSystemStatus(data);
  }, []);

  const loadActivity = useCallback(async () => {
    const params = new URLSearchParams({ period: chartPeriod });
    if (chartStartDate) params.set('startDate', chartStartDate);
    if (chartEndDate) params.set('endDate', chartEndDate);
    const data = await itFetch(`/api/informatico/user-activity?${params}`, {}, { soft: true });
    if (data.error) return;
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
  }, [chartPeriod, chartStartDate, chartEndDate]);

  const loadSupabaseTables = useCallback(async () => {
    setSupabaseTablesLoading(true);
    setSupabaseTablesError('');
    const data = await itFetch('/api/informatico/supabase-tables', {}, { soft: true });
    setSupabaseTablesLoading(false);
    if (data.error) {
      setSupabaseTablesError(data.error);
      setSupabaseTables([]);
      return;
    }
    setSupabaseTables(data.tables || []);
    setSupabaseProjectUrl(data.projectUrl || null);
  }, []);

  const loadServiceRoleStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/configure-service-role');
      const data = await res.json().catch(() => ({}));
      setServiceRoleConfigured(Boolean(data.configured));
    } catch {
      setServiceRoleConfigured(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { user: u },
        error,
      } = await supabase.auth.getUser();
      if (error || !u) {
        router.push('/login');
        return;
      }
      const role = await getRoleNameByUserId(u.id, u.email);
      if (!canAccessItPanel(role)) {
        router.push('/perfil');
        return;
      }
      setUser(u);
      setIsAdmin(isAdminRole(role));
      await Promise.allSettled([
        loadOverview(),
        loadSystemStatus(),
        loadActivity(),
        loadServiceRoleStatus(),
      ]);
      setLoading(false);
    })();
  }, [router, loadOverview, loadSystemStatus, loadActivity, loadServiceRoleStatus]);

  useEffect(() => {
    if (!loading && tab === 'actividad') loadActivity().catch(console.error);
  }, [loading, tab, loadActivity]);

  useEffect(() => {
    if (!loading && tab === 'supabase' && !supabaseTables.length && !supabaseTablesLoading) {
      loadSupabaseTables().catch(console.error);
    }
  }, [loading, tab, supabaseTables.length, supabaseTablesLoading, loadSupabaseTables]);

  const saveServiceRole = async (e) => {
    e.preventDefault();
    setSavingKey(true);
    try {
      const res = await fetch('/api/admin/configure-service-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceRoleKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar.');
      alert(data.message || 'Clave guardada.');
      setServiceRoleKey('');
      setServiceRoleConfigured(true);
      await loadSystemStatus();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingKey(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando panel informático…" variant={6} width={130} />
      </div>
    );
  }

  const roleEntries = Object.entries(overview?.roleCounts || {});
  const filteredSupabaseTables = supabaseTables.filter((table) => {
    const q = supabaseTableFilter.trim().toLowerCase();
    if (!q) return true;
    return table.name.toLowerCase().includes(q) || String(table.schema || '').toLowerCase().includes(q);
  });

  const supabaseDashboardTablesUrl = (() => {
    if (!supabaseProjectUrl) return 'https://supabase.com/dashboard';
    try {
      const ref = new URL(supabaseProjectUrl).hostname.split('.')[0];
      if (ref) return `https://supabase.com/dashboard/project/${ref}/editor`;
    } catch {
      /* ignore */
    }
    return 'https://supabase.com/dashboard';
  })();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <PanelPageHeader
            title="Panel informático"
            subtitle="Mantenimiento, infraestructura y monitorización"
            mascotVariant={6}
            mascotWidth={92}
          >
            <span className="text-sm text-slate-500">{user?.email}</span>
          </PanelPageHeader>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-t text-sm font-medium ${
                tab === t.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'resumen' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Usuarios totales" value={overview?.totalUsers ?? '—'} />
              <StatCard label="Usuarios activos" value={overview?.activeUsers ?? '—'} />
              <StatCard
                label="Conectados ahora"
                value={overview?.onlineNow ?? '—'}
                hint="Últimos 90 s"
              />
              <StatCard
                label="Tickets sin responder"
                value={overview?.pendingTickets ?? '—'}
                hint="Soporte"
              />
              <StatCard
                label="Logins fallidos (24 h)"
                value={overview?.failedLogins24h ?? '—'}
              />
              <StatCard
                label="Sesiones app (24 h)"
                value={overview?.appSessions24h ?? '—'}
              />
            </div>
            {roleEntries.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 border border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Usuarios por rol</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roleEntries.map(([role, count]) => (
                    <div key={role} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide">{role}</p>
                      <p className="text-xl font-semibold text-slate-900">{count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'sistema' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 border border-slate-100">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Estado de servicios</h2>
                <span className="text-xs text-slate-500">
                  Entorno: {systemStatus?.environment || '—'}
                  {systemStatus?.isLocal ? ' · local' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => loadSystemStatus()}
                className="mb-4 text-sm text-slate-600 hover:text-slate-900 underline"
              >
                Actualizar comprobaciones
              </button>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Servicio</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2 text-left">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(systemStatus?.checks || []).map((c) => (
                      <tr key={c.id}>
                        <td className="px-3 py-2 font-medium text-slate-800">{c.label}</td>
                        <td className="px-3 py-2">
                          <StatusBadge ok={c.ok} />
                        </td>
                        <td className="px-3 py-2 text-slate-600 break-all">{c.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!systemStatus?.checks?.length && (
                  <p className="text-sm text-slate-500 py-4">No hay datos de estado.</p>
                )}
              </div>
            </div>

            {systemStatus?.isLocal && (
              <div className="bg-white rounded-lg shadow p-6 border border-amber-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  Service role (solo desarrollo local)
                </h2>
                <p className="text-sm text-slate-600 mb-4">
                  Necesaria para crear usuarios y algunas APIs de administración. No subas esta
                  clave a Git.
                </p>
                {serviceRoleConfigured && (
                  <p className="text-sm text-green-700 mb-3">✓ Clave configurada en este entorno.</p>
                )}
                <form onSubmit={saveServiceRole} className="max-w-xl space-y-3">
                  <textarea
                    value={serviceRoleKey}
                    onChange={(e) => setServiceRoleKey(e.target.value)}
                    placeholder="Pega la service_role key de Supabase…"
                    rows={3}
                    className="w-full border rounded px-3 py-2 text-sm font-mono"
                  />
                  <button
                    type="submit"
                    disabled={savingKey || !serviceRoleKey.trim()}
                    className="px-4 py-2 bg-slate-800 text-white rounded text-sm disabled:opacity-50"
                  >
                    {savingKey ? 'Guardando…' : 'Guardar clave'}
                  </button>
                </form>
                <p className="text-xs text-slate-500 mt-3">
                  <a
                    href="https://supabase.com/dashboard/project/qnazrzvwvkwhkfbqsbmr/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:underline"
                  >
                    Abrir API Keys en Supabase →
                  </a>
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'actividad' && (
          <div className="space-y-6">
            <TeacherActivityCharts
              sessionChart={sessionChart}
              chartPeriod={chartPeriod}
              setChartPeriod={setChartPeriod}
              chartStartDate={chartStartDate}
              setChartStartDate={setChartStartDate}
              chartEndDate={chartEndDate}
              setChartEndDate={setChartEndDate}
              connectionAnalytics={connectionAnalytics}
              onApply={() => loadActivity()}
            />
          </div>
        )}

        {tab === 'tickets' && (
          <div className="bg-white rounded-lg shadow border border-slate-100 p-4 md:p-6">
            <SupportHub />
          </div>
        )}

        {tab === 'herramientas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolCard
              title="Tickets de soporte"
              description="Gestionar incidencias de usuarios."
              href="/soporte"
            />
            <ToolCard
              title="Configurar correo SMTP"
              description="Credenciales para envío de emails."
              href="/contacto/configurar-correo"
            />
            {isAdmin && (
              <>
                <ToolCard
                  title="Panel de profesor"
                  description="Alumnos, tareas y calificaciones."
                  href="/admin/profesor"
                />
                <ToolCard
                  title="Configurar Supabase"
                  description="Página dedicada para service role."
                  href="/admin/configurar-supabase"
                />
              </>
            )}
            <ToolCard
              title="Documentación SQL profesor"
              description="Migración tablas profesor_alumnos, tareas, calificaciones."
              href="#"
              onClick={() =>
                alert('Ejecuta scripts/teacher_panel_tables.sql en Supabase SQL Editor.')
              }
            />
          </div>
        )}

        {tab === 'supabase' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6 border border-slate-100">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Tablas de Supabase</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Schema <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">public</code>{' '}
                    expuesto vía PostgREST · {supabaseTables.length} tablas
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={supabaseDashboardTablesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-sky-600 hover:underline"
                  >
                    Abrir en Supabase →
                  </a>
                  <button
                    type="button"
                    onClick={() => loadSupabaseTables()}
                    disabled={supabaseTablesLoading}
                    className="px-3 py-1.5 text-sm rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                  >
                    {supabaseTablesLoading ? 'Actualizando…' : 'Actualizar'}
                  </button>
                </div>
              </div>

              <input
                type="search"
                value={supabaseTableFilter}
                onChange={(e) => setSupabaseTableFilter(e.target.value)}
                placeholder="Buscar tabla…"
                className="w-full max-w-md border border-slate-200 rounded px-3 py-2 text-sm mb-4"
              />

              {supabaseTablesError ? (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded p-3">
                  {supabaseTablesError}
                </p>
              ) : null}

              {supabaseTablesLoading && !supabaseTables.length ? (
                <p className="text-sm text-slate-500 py-6">Cargando tablas…</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left">Tabla</th>
                        <th className="px-3 py-2 text-left">Schema</th>
                        <th className="px-3 py-2 text-left">Columnas</th>
                        <th className="px-3 py-2 text-left">Filas (aprox.)</th>
                        <th className="px-3 py-2 text-left">Acceso API</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredSupabaseTables.map((table) => (
                        <tr key={table.name}>
                          <td className="px-3 py-2 font-mono text-slate-800">{table.name}</td>
                          <td className="px-3 py-2 text-slate-600">{table.schema || 'public'}</td>
                          <td className="px-3 py-2 text-slate-600">
                            {table.columnCount ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-slate-600">
                            {table.rowCount != null ? table.rowCount.toLocaleString('es-ES') : '—'}
                          </td>
                          <td className="px-3 py-2">
                            {table.accessible === false ? (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-900">
                                Revisar
                              </span>
                            ) : (
                              <StatusBadge ok={table.accessible !== false} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!filteredSupabaseTables.length && !supabaseTablesLoading ? (
                    <p className="text-sm text-slate-500 py-4">
                      {supabaseTableFilter.trim()
                        ? 'Ninguna tabla coincide con la búsqueda.'
                        : 'No hay tablas listadas.'}
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'responsive' && <ItResponsivePreviewPanel />}
      </div>
    </div>
  );
}

function ToolCard({ title, description, href, onClick }) {
  const inner = (
    <>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-3">{description}</p>
      <span className="text-sm font-medium text-sky-600">Abrir →</span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-left rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors w-full"
      >
        {inner}
      </button>
    );
  }
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-colors"
    >
      {inner}
    </Link>
  );
}
