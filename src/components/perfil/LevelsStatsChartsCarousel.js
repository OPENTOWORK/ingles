'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function barColor(score) {
  if (score == null) return '#cbd5e1';
  if (score >= 80) return '#16a34a';
  if (score >= 50) return '#2563eb';
  return '#dc2626';
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="levels-chart-tooltip">
      <strong>{d.name}</strong>
      <p>{d.scorePct != null ? `Mejor media: ${d.scorePct}%` : 'Sin puntuación aún'}</p>
      <p>Accesos: {d.accesos} · Evaluadas: {d.evaluadas}</p>
      <p>
        <span className="levels-chart-tooltip__ok">✓ {d.correctas}</span>
        {' · '}
        <span className="levels-chart-tooltip__ko">✗ {d.incorrectas}</span>
      </p>
    </div>
  );
}

export default function LevelsStatsChartsCarousel({ charts = [] }) {
  const slides = useMemo(() => charts.filter((c) => c.bars?.length > 0), [charts]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.levelId]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index] || slides[0];
  const chartData = current.bars.map((b) => ({
    ...b,
    displayScore: b.scorePct ?? 0,
    hasScore: b.scorePct != null,
  }));

  const go = (delta) => {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  };

  return (
    <div className="levels-charts-carousel">
      <div className="levels-charts-carousel__head">
        <div>
          <h3 className="levels-charts-carousel__title">Rendimiento por parte</h3>
          <p className="levels-charts-carousel__subtitle">
            Mejor porcentaje medio por parte del examen (cada barra = una parte del nivel).
          </p>
        </div>
        <div className="levels-charts-carousel__nav">
          <button type="button" className="levels-charts-carousel__btn" onClick={() => go(-1)} aria-label="Nivel anterior">
            ‹
          </button>
          <span className="levels-charts-carousel__level" aria-live="polite">
            {current.levelName}
          </span>
          <button type="button" className="levels-charts-carousel__btn" onClick={() => go(1)} aria-label="Siguiente nivel">
            ›
          </button>
        </div>
      </div>

      <div className="levels-charts-carousel__dots" role="tablist" aria-label="Niveles">
        {slides.map((slide, i) => (
          <button
            key={slide.levelId}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Nivel ${slide.levelName}`}
            className={`levels-charts-carousel__dot${i === index ? ' is-active' : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      <div className="levels-charts-carousel__chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#475569' }}
              interval={0}
              angle={chartData.length > 6 ? -32 : 0}
              textAnchor={chartData.length > 6 ? 'end' : 'middle'}
              height={chartData.length > 6 ? 56 : 32}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={40} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.06)' }} />
            <Bar dataKey="displayScore" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry) => (
                <Cell key={entry.parteId} fill={barColor(entry.scorePct)} fillOpacity={entry.hasScore ? 1 : 0.35} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="levels-charts-carousel__foot">
        {index + 1} / {slides.length} niveles con datos
      </p>

      <style jsx>{`
        .levels-charts-carousel {
          margin-bottom: 1.25rem;
          padding: 1rem 1rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
        }
        .levels-charts-carousel__head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .levels-charts-carousel__title {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .levels-charts-carousel__subtitle {
          margin: 0.25rem 0 0;
          font-size: 0.8rem;
          color: #64748b;
          max-width: 28rem;
        }
        .levels-charts-carousel__nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .levels-charts-carousel__btn {
          width: 2rem;
          height: 2rem;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          color: #0f172a;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
        }
        .levels-charts-carousel__btn:hover {
          border-color: #2563eb;
          color: #2563eb;
        }
        .levels-charts-carousel__level {
          min-width: 2.5rem;
          text-align: center;
          font-weight: 700;
          font-size: 1.1rem;
          color: #2563eb;
        }
        .levels-charts-carousel__dots {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-bottom: 0.5rem;
        }
        .levels-charts-carousel__dot {
          width: 0.5rem;
          height: 0.5rem;
          padding: 0;
          border: none;
          border-radius: 999px;
          background: #cbd5e1;
          cursor: pointer;
        }
        .levels-charts-carousel__dot.is-active {
          width: 1.25rem;
          background: #2563eb;
        }
        .levels-charts-carousel__chart-wrap {
          width: 100%;
          min-height: 280px;
        }
        .levels-charts-carousel__foot {
          margin: 0.35rem 0 0;
          font-size: 0.75rem;
          color: #94a3b8;
          text-align: center;
        }
        .levels-chart-tooltip {
          padding: 0.5rem 0.65rem;
          border-radius: 8px;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .levels-chart-tooltip p {
          margin: 0.2rem 0 0;
          color: #475569;
        }
        .levels-chart-tooltip__ok {
          color: #15803d;
        }
        .levels-chart-tooltip__ko {
          color: #b91c1c;
        }
      `}</style>
    </div>
  );
}
