'use client';

import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatSessionDuration } from '@/lib/userActivity';

const PERIOD_LABELS = {
  dias: 'Días',
  semanas: 'Semanas',
  meses: 'Meses',
  anios: 'Años',
};

function PeriodFilters({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClear,
  roleFilter,
  setRoleFilter,
  roles = [],
  showRoleFilter = false,
  userIdFilter,
  setUserIdFilter,
  onExecute,
  executing = false,
}) {
  const hasUserIdFilter = typeof setUserIdFilter === 'function';
  const gridCols = showRoleFilter && onExecute
    ? hasUserIdFilter
      ? 'md:grid-cols-7'
      : 'md:grid-cols-6'
    : showRoleFilter
      ? 'md:grid-cols-5'
      : 'md:grid-cols-4';

  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-4 mb-6`}>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Periodo</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        >
          {Object.entries(PERIOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha inicio</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">Fecha fin</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      {showRoleFilter && typeof setRoleFilter === 'function' ? (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Rol</label>
          <select
            value={roleFilter ?? 'all'}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="all">Todos los roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.nombre}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {hasUserIdFilter ? (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">ID de usuario</label>
          <input
            type="text"
            value={userIdFilter ?? ''}
            onChange={(e) => setUserIdFilter(e.target.value)}
            placeholder="Opcional"
            className="w-full border rounded px-3 py-2 text-sm bg-white font-mono"
          />
        </div>
      ) : null}
      {onExecute ? (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onExecute}
            disabled={executing}
            className="w-full px-3 py-2 rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {executing ? 'Ejecutando…' : 'Ejecutar'}
          </button>
        </div>
      ) : null}
      {onClear && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="w-full px-3 py-2 rounded border border-gray-300 text-sm bg-white hover:bg-gray-100"
          >
            Limpiar fechas
          </button>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="p-4 rounded border bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ConnectionUsersActivityPanel({
  users = [],
  onLoadUserPages,
  queryKey = '',
  emptyLabel = 'Sin usuarios con actividad en el rango.',
}) {
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [pagesByUser, setPagesByUser] = useState({});
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setExpandedUserId(null);
    setPagesByUser({});
    setLoadError('');
  }, [queryKey]);

  const toggleUser = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setLoadError('');
      return;
    }

    setExpandedUserId(userId);
    setLoadError('');

    if (pagesByUser[userId]) return;

    if (typeof onLoadUserPages !== 'function') return;

    setLoadingUserId(userId);
    try {
      const pageViews = await onLoadUserPages(userId);
      setPagesByUser((prev) => ({ ...prev, [userId]: pageViews }));
    } catch (err) {
      setLoadError(err?.message || 'Error al cargar las páginas.');
    } finally {
      setLoadingUserId(null);
    }
  };

  return (
    <div className="rounded border p-4 h-full flex flex-col min-h-[18rem]">
      <h3 className="text-md font-semibold mb-1">Usuarios con actividad</h3>
      <p className="text-xs text-gray-500 mb-3">
        Franjas horarias de conexión. Pulsa un usuario para ver las páginas visitadas.
      </p>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {users.length === 0 && <p className="text-sm text-gray-500">{emptyLabel}</p>}
        {users.map((user) => {
          const isExpanded = expandedUserId === user.userId;
          const pages = pagesByUser[user.userId];
          const isLoading = loadingUserId === user.userId;

          return (
            <div key={user.userId} className="rounded border border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => toggleUser(user.userId)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name !== '—' ? user.name : user.email}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">{user.userId}</p>
                    {user.email !== '—' && user.name !== '—' ? (
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    ) : null}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">{user.totalLabel}</p>
                    <p className="text-xs text-gray-500">{user.sessionCount} sesión(es)</p>
                  </div>
                </div>
                {user.timeSlots?.length > 0 ? (
                  <p className="text-xs text-gray-600 mt-2">
                    Franjas:{' '}
                    {user.timeSlots
                      .slice(0, 6)
                      .map((slot) => `${slot.slot} (${slot.count})`)
                      .join(' · ')}
                    {user.timeSlots.length > 6 ? '…' : ''}
                  </p>
                ) : null}
              </button>

              {isExpanded ? (
                <div className="border-t border-gray-200 px-3 py-2 bg-white rounded-b">
                  {isLoading ? (
                    <p className="text-sm text-gray-500">Cargando páginas…</p>
                  ) : loadError && expandedUserId === user.userId ? (
                    <p className="text-sm text-red-600">{loadError}</p>
                  ) : pages?.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin páginas registradas en el rango.</p>
                  ) : (
                    <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(pages || []).map((page) => (
                        <li key={page.id} className="text-sm border-b border-gray-100 pb-1.5 last:border-0">
                          <p className="font-medium text-gray-800">{page.pageTitle}</p>
                          <p className="text-xs text-gray-500 font-mono truncate">{page.path}</p>
                          <p className="text-xs text-gray-500">
                            {page.visitedLabel}
                            {page.durationLabel ? ` · ${page.durationLabel}` : ''}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PatternsPanel({ horaPico, diaPico, heatmap, emptyLabel = 'Sin datos.' }) {
  return (
    <div className="rounded border p-4 h-full">
      <h3 className="text-md font-semibold mb-3">Identificar patrones</h3>
      <p className="text-sm text-gray-700">
        Hora pico de actividad: <strong>{horaPico}</strong>
      </p>
      <p className="text-sm text-gray-700">
        Día pico de actividad: <strong>{diaPico}</strong>
      </p>
      <h4 className="text-sm font-semibold mt-4 mb-2">Puntos de calor (top)</h4>
      <div className="space-y-1 text-sm">
        {heatmap.length === 0 && <p className="text-gray-500">{emptyLabel}</p>}
        {heatmap.map((item) => (
          <p key={item.slot}>
            {item.slot}: {item.total}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalyticsPanels({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  analytics,
  chartPeriod,
  setChartPeriod,
  chartStartDate,
  setChartStartDate,
  chartEndDate,
  setChartEndDate,
  sessionChart,
  connectionAnalytics,
  connectionActiveUsers = [],
  connectionRoleFilter,
  setConnectionRoleFilter,
  connectionUserIdFilter,
  setConnectionUserIdFilter,
  appliedConnectionRoleFilter = 'all',
  appliedConnectionUserIdFilter = '',
  onRunConnectionQuery,
  onLoadConnectionUserPages,
  connectionQueryLoading = false,
  connectionQueryKey = '',
  roles = [],
}) {
  const totalIncorporaciones = analytics.incorporaciones.reduce((acc, row) => acc + row.total, 0);
  const selectedConnectionRole =
    appliedConnectionRoleFilter && appliedConnectionRoleFilter !== 'all'
      ? roles.find((role) => String(role.id) === String(appliedConnectionRoleFilter))?.nombre
      : null;
  const selectedConnectionUserId = appliedConnectionUserIdFilter?.trim() || '';

  return (
    <div className="bg-white rounded-lg shadow mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Analíticas</h2>
      </div>
      <div className="p-6 space-y-12">
        <section>
          <h3 className="text-md font-semibold text-gray-900 mb-1">Incorporaciones y accesos</h3>
          <p className="text-sm text-gray-600 mb-4">
            Altas de usuario, abandonos y patrones de inicio de sesión en el rango seleccionado.
          </p>
          <PeriodFilters
            period={period}
            setPeriod={setPeriod}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Número de incorporaciones" value={totalIncorporaciones} />
            <KpiCard label="Número de abandonos" value={analytics.abandonos} />
            <KpiCard label="Tasa de éxito en accesos" value={`${analytics.patrones.tasaExito}%`} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="rounded border p-4">
              <h3 className="text-md font-semibold mb-3">Evolución de incorporaciones</h3>
              {analytics.incorporaciones.length === 0 ? (
                <p className="text-sm text-gray-500">Sin datos en el rango seleccionado.</p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.incorporaciones} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [value, 'Incorporaciones']}
                        labelFormatter={(label) => `Periodo: ${label}`}
                      />
                      <Bar dataKey="total" name="Incorporaciones" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <PatternsPanel
              horaPico={analytics.patrones.horaPico}
              diaPico={analytics.patrones.diaPico}
              heatmap={analytics.heatmap}
            />
          </div>
          <div className="rounded border p-4">
            <h3 className="text-md font-semibold mb-3">Usuarios por nivel</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {analytics.usuariosPorNivel.length === 0 && (
                <p className="text-gray-500 col-span-full">Sin datos de niveles asignados.</p>
              )}
              {analytics.usuariosPorNivel.map((row) => (
                <div key={row.nivel} className="p-3 rounded bg-gray-50 border">
                  <p className="text-gray-600">{row.nivel}</p>
                  <p className="text-lg font-semibold">{row.total}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-gray-200 pt-10">
          <h3 className="text-md font-semibold text-gray-900 mb-1">Tiempo de conexión</h3>
          <p className="text-sm text-gray-600 mb-4">
            Sesiones en la app: usuarios activos por intervalo y tiempo medio por usuario con actividad.
            {selectedConnectionRole ? (
              <>
                {' '}
                Filtrado por rol: <strong>{selectedConnectionRole}</strong>.
              </>
            ) : null}
            {selectedConnectionUserId ? (
              <>
                {' '}
                Usuario: <strong className="font-mono">{selectedConnectionUserId}</strong>.
              </>
            ) : null}
          </p>
          <PeriodFilters
            period={chartPeriod}
            setPeriod={setChartPeriod}
            startDate={chartStartDate}
            setStartDate={setChartStartDate}
            endDate={chartEndDate}
            setEndDate={setChartEndDate}
            roleFilter={connectionRoleFilter}
            setRoleFilter={setConnectionRoleFilter}
            userIdFilter={connectionUserIdFilter}
            setUserIdFilter={setConnectionUserIdFilter}
            roles={roles}
            showRoleFilter
            onExecute={onRunConnectionQuery}
            executing={connectionQueryLoading}
            onClear={() => {
              setChartStartDate('');
              setChartEndDate('');
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <KpiCard label="Tiempo total de conexión" value={connectionAnalytics.totalSessionLabel} />
            <KpiCard label="Usuarios con actividad" value={connectionAnalytics.activeUsers} />
            <KpiCard label="Tiempo medio por usuario" value={connectionAnalytics.avgPerUserLabel} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded border p-4">
              <h3 className="text-md font-semibold mb-3">Usuarios activos y tiempo de sesión medio</h3>
              {sessionChart.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Sin datos de sesión en el rango. Los usuarios generan actividad al navegar con la sesión
                  iniciada.
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={sessionChart} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="users" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        yAxisId="time"
                        orientation="right"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => formatSessionDuration(v)}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === 'Tiempo medio / usuario') {
                            return [formatSessionDuration(value), 'Tiempo medio / usuario'];
                          }
                          return [value, 'Usuarios activos'];
                        }}
                        labelFormatter={(label) => `Periodo: ${label}`}
                      />
                      <Legend />
                      <Bar
                        yAxisId="users"
                        dataKey="userCount"
                        name="Usuarios activos"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        yAxisId="time"
                        type="monotone"
                        dataKey="avgSessionSeconds"
                        name="Tiempo medio / usuario"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <ConnectionUsersActivityPanel
              users={connectionActiveUsers}
              onLoadUserPages={onLoadConnectionUserPages}
              queryKey={connectionQueryKey}
              emptyLabel="Sin usuarios con actividad en el rango."
            />
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Sesiones registradas en el rango: {connectionAnalytics.sessionCount}
          </p>
        </section>
      </div>
    </div>
  );
}
