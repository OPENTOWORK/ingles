'use client';

import Link from 'next/link';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ProfileCollapsibleSection from '@/components/perfil/ProfileCollapsibleSection';

const LEVEL_COLORS = {
  A2: '#82ca9d',
  B1: '#ffc658',
  B2: '#ff7300',
  C1: '#00ff00',
  C2: '#ff0000',
};

export default function ProfileProgressCharts({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="charts-section">
        <p className="section-desc">Loading charts…</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const levelDistribution = [
    { name: 'A2', value: stats.stats?.levelCounts?.A2 || 0, color: LEVEL_COLORS.A2 },
    { name: 'B1', value: stats.stats?.levelCounts?.B1 || 0, color: LEVEL_COLORS.B1 },
    { name: 'B2', value: stats.stats?.levelCounts?.B2 || 0, color: LEVEL_COLORS.B2 },
    { name: 'C1', value: stats.stats?.levelCounts?.C1 || 0, color: LEVEL_COLORS.C1 },
    { name: 'C2', value: stats.stats?.levelCounts?.C2 || 0, color: LEVEL_COLORS.C2 },
  ];

  const chartData = (stats.exams || []).map((e) => ({
    fecha: new Date(e.date).toLocaleDateString(),
    score: e.total_score,
  }));

  return (
    <div className="charts-section">
      <ProfileCollapsibleSection title="📈 Score history" className="chart-section">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid stroke="#eaeaea" />
              <XAxis dataKey="fecha" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#0070f3"
                fill="#0070f3"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <div className="empty-icon">📊</div>
            <p>Not enough data to show the chart.</p>
            <Link href="/training" className="btn">
              🚀 Start training
            </Link>
          </div>
        )}
      </ProfileCollapsibleSection>

      <ProfileCollapsibleSection title="🎯 Distribution by level" className="chart-section">
        {levelDistribution.some((item) => item.value > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelDistribution.filter((item) => item.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {levelDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-chart">
            <div className="empty-icon">🎯</div>
            <p>Complete some exams to see the distribution by level.</p>
          </div>
        )}
      </ProfileCollapsibleSection>
    </div>
  );
}
