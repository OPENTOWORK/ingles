'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './StaffTasksKanban.module.css';

function personKey(task) {
  return task.asignado_id || task.asignado?.id || 'unassigned';
}

function personName(task) {
  return task.asignado?.nombre || task.asignado?.email || 'Sin asignar';
}

export function buildAssigneeTaskChart(tasks = []) {
  const byPerson = new Map();

  for (const task of tasks) {
    const key = personKey(task);
    const row = byPerson.get(key) || { name: personName(task), pendientes: 0, completadas: 0 };
    if (task.estado === 'completada') row.completadas += 1;
    else if (task.estado !== 'cancelada') row.pendientes += 1;
    byPerson.set(key, row);
  }

  return [...byPerson.values()]
    .filter((row) => row.pendientes + row.completadas > 0)
    .sort((a, b) => b.pendientes + b.completadas - (a.pendientes + a.completadas));
}

export default function StaffTasksAssigneeChart({ tasks }) {
  const data = useMemo(() => buildAssigneeTaskChart(tasks), [tasks]);
  const height = Math.max(168, data.length * 36 + 36);

  return (
    <section className={styles.assigneeChart} aria-label="Tareas pendientes y completadas por persona">
      <h3 className={styles.assigneeChartTitle}>Pendientes y completadas</h3>
      {data.length === 0 ? (
        <p className={styles.assigneeChartEmpty}>Todavía no hay tareas para mostrar.</p>
      ) : (
        <div className={styles.assigneeChartPlot} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={132}
                tick={{ fill: '#334155', fontSize: 12 }}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="pendientes" name="Pendientes" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              <Bar dataKey="completadas" name="Completadas" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
