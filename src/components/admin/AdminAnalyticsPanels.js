'use client';

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

function PeriodFilters({ period, setPeriod, startDate, setStartDate, endDate, setEndDate, onClear }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
}) {
  const totalIncorporaciones = analytics.incorporaciones.reduce((acc, row) => acc + row.total, 0);

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
          </p>
          <PeriodFilters
            period={chartPeriod}
            setPeriod={setChartPeriod}
            startDate={chartStartDate}
            setStartDate={setChartStartDate}
            endDate={chartEndDate}
            setEndDate={setChartEndDate}
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
            <PatternsPanel
              horaPico={connectionAnalytics.horaPico}
              diaPico={connectionAnalytics.diaPico}
              heatmap={connectionAnalytics.heatmap}
              emptyLabel="Sin datos de sesión en el rango."
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
