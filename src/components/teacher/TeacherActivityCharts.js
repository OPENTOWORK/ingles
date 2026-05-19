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

export default function TeacherActivityCharts({
  sessionChart,
  chartPeriod,
  setChartPeriod,
  chartStartDate,
  setChartStartDate,
  chartEndDate,
  setChartEndDate,
  connectionAnalytics,
  onApply,
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h2 className="text-lg font-medium text-gray-900">Tiempo de conexión de alumnos</h2>
      <p className="text-sm text-gray-600">
        Sesiones en la app, frecuencia de conexión y tiempo medio por alumno activo.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Periodo</label>
          <select
            value={chartPeriod}
            onChange={(e) => setChartPeriod(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            {Object.entries(PERIOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Desde</label>
          <input
            type="date"
            value={chartStartDate}
            onChange={(e) => setChartStartDate(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Hasta</label>
          <input
            type="date"
            value={chartEndDate}
            onChange={(e) => setChartEndDate(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onApply}
            className="px-4 py-2 bg-indigo-600 text-white rounded text-sm"
          >
            Aplicar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi label="Tiempo total" value={connectionAnalytics.totalSessionLabel} />
        <Kpi label="Alumnos con actividad" value={connectionAnalytics.activeUsers} />
        <Kpi label="Tiempo medio / alumno" value={connectionAnalytics.avgPerUserLabel} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded border p-4">
          <h3 className="font-semibold mb-3 text-sm">Actividad por periodo</h3>
          {sessionChart.length === 0 ? (
            <p className="text-sm text-gray-500">Sin datos en el rango.</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={sessionChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="users" allowDecimals={false} />
                  <YAxis
                    yAxisId="time"
                    orientation="right"
                    tickFormatter={(v) => formatSessionDuration(v)}
                  />
                  <Tooltip
                    formatter={(value, name) =>
                      name === 'Tiempo medio / usuario'
                        ? [formatSessionDuration(value), name]
                        : [value, 'Alumnos activos']
                    }
                  />
                  <Legend />
                  <Bar yAxisId="users" dataKey="userCount" name="Alumnos activos" fill="#6366f1" />
                  <Line
                    yAxisId="time"
                    type="monotone"
                    dataKey="avgSessionSeconds"
                    name="Tiempo medio / usuario"
                    stroke="#10b981"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="rounded border p-4">
          <h3 className="font-semibold mb-3 text-sm">Patrones</h3>
          <p className="text-sm">
            Hora pico: <strong>{connectionAnalytics.horaPico}</strong>
          </p>
          <p className="text-sm">
            Día pico: <strong>{connectionAnalytics.diaPico}</strong>
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Sesiones en rango: {connectionAnalytics.sessionCount}
          </p>
          <ul className="mt-3 text-sm space-y-1">
            {(connectionAnalytics.heatmap || []).slice(0, 8).map((item) => (
              <li key={item.slot}>
                {item.slot}: {item.total}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="p-4 rounded border bg-gray-50">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
