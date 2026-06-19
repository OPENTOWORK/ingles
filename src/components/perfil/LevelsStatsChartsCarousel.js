'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const BAR_GRADIENTS = {
  high: ['#22c55e', '#15803d'],
  mid: ['#60a5fa', '#2563eb'],
  low: ['#f87171', '#dc2626'],
  empty: ['#e2e8f0', '#cbd5e1'],
};

function scoreTone(score) {
  if (score == null) return 'empty';
  if (score >= 80) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

function barFillId(entry, index) {
  return `bar-${scoreTone(entry.scorePct)}-${index}`;
}

function ChartTooltip({ active, payload, variant = 'skills' }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const examMode = variant === 'exam-mode';
  return (
    <div className="lsp-chart-tip">
      <div className="lsp-chart-tip__head">
        <strong>{d.name}</strong>
        {d.skillZone ? <span className="lsp-chart-tip__zone">{d.skillZone}</span> : null}
      </div>
      {d.scorePct != null ? (
        <>
          <p className="lsp-chart-tip__score">{d.scorePct}%</p>
          {examMode && d.evaluadas > 0 ? (
            <p className="lsp-chart-tip__items">
              {d.correctas}/{d.evaluadas} items
            </p>
          ) : null}
        </>
      ) : (
        <p className="lsp-chart-tip__empty">
          {examMode ? 'Not completed in exam mode yet' : 'No practice logged yet'}
        </p>
      )}
      {!examMode && d.evaluadas > 0 ? (
        <p>
          {d.evaluadas} evaluadas ·{' '}
          <span className="lsp-chart-tip__ok">✓ {d.correctas}</span>
          {' · '}
          <span className="lsp-chart-tip__ko">✗ {d.incorrectas}</span>
        </p>
      ) : null}
    </div>
  );
}

function renderBarLabel(props) {
  const { x, y, width, value, index, payload } = props;
  if (payload?.scorePct == null || value <= 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#334155"
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
    >
      {payload.scorePct}%
    </text>
  );
}

export default function LevelsStatsChartsCarousel({ charts = [], variant = 'skills' }) {
  const examMode = variant === 'exam-mode';
  const slides = useMemo(() => charts || [], [charts]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const firstWithData = slides.findIndex((s) => s.hasData);
    const b2Idx = slides.findIndex((s) => s.levelSlug === 'b2' || s.levelName === 'B2');
    setIndex(firstWithData >= 0 ? firstWithData : b2Idx >= 0 ? b2Idx : 0);
  }, [slides]);

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  if (slides.length === 0) return null;

  const current = slides[index] || slides[0];
  const chartData = (current.bars || []).map((b) => ({
    ...b,
    displayScore: b.scorePct ?? 0,
    hasScore: b.scorePct != null,
  }));

  const practicedCount = chartData.filter((b) => b.hasScore).length;
  const avgScore =
    practicedCount > 0
      ? Math.round(
          chartData.filter((b) => b.hasScore).reduce((s, b) => s + b.scorePct, 0) / practicedCount,
        )
      : null;

  const chartWidth = Math.max(720, chartData.length * 42);

  const go = (delta) => {
    setIndex((i) => (i + delta + slides.length) % slides.length);
  };

  const copy = examMode
    ? {
        title: 'Exam mode performance by part',
        subtitle: (levelName, partMax) =>
          `${partMax} exam parts for ${levelName}. Each bar uses the skill colour for that section.`,
        partsPractised: 'parts completed',
        examParts: 'exam parts',
        avgLabel: 'average completed',
        empty: (levelName) =>
          `No exam mode attempts logged in ${levelName} yet. Complete a full exam simulation and your scores will appear here.`,
        hint: 'Scroll horizontally if you cannot see all parts.',
      }
    : {
        title: 'Performance by part',
        subtitle: (levelName, partMax) =>
          `${partMax} exam parts for ${levelName}. Hover over each bar for details.`,
        partsPractised: 'parts practised',
        examParts: 'exam parts',
        avgLabel: 'average practised',
        empty: (levelName) =>
          `No practice logged in ${levelName} yet. When you practise in Levels, your scores will appear here automatically.`,
        hint: 'Desliza horizontalmente si no ves todas las partes.',
      };

  return (
    <div className={`lsp-chart${examMode ? ' lsp-chart--exam-mode' : ''}`}>
      <div className="lsp-chart__head">
        <div>
          <h3 className="lsp-chart__title">{copy.title}</h3>
          <p className="lsp-chart__subtitle">
            {copy.subtitle(current.levelName, current.partMax || chartData.length)}
          </p>
        </div>
        <div className="lsp-chart__nav">
          <button
            type="button"
            className="lsp-chart__nav-btn"
            onClick={() => go(-1)}
            disabled={slides.length <= 1}
            aria-label="Previous level"
          >
            ‹
          </button>
          <span className="lsp-chart__level-badge">{current.levelName}</span>
          <button
            type="button"
            className="lsp-chart__nav-btn"
            onClick={() => go(1)}
            disabled={slides.length <= 1}
            aria-label="Next level"
          >
            ›
          </button>
        </div>
      </div>

      <div className="lsp-chart__summary">
        <div className="lsp-chart__summary-item">
          <span className="lsp-chart__summary-value">{practicedCount}</span>
          <span className="lsp-chart__summary-label">{copy.partsPractised}</span>
        </div>
        <div className="lsp-chart__summary-divider" aria-hidden />
        <div className="lsp-chart__summary-item">
          <span className="lsp-chart__summary-value">{current.partMax || chartData.length}</span>
          <span className="lsp-chart__summary-label">{copy.examParts}</span>
        </div>
        {avgScore != null ? (
          <>
            <div className="lsp-chart__summary-divider" aria-hidden />
            <div className="lsp-chart__summary-item">
              <span className="lsp-chart__summary-value">{avgScore}%</span>
              <span className="lsp-chart__summary-label">{copy.avgLabel}</span>
            </div>
          </>
        ) : null}
      </div>

      {current.skillZones?.length ? (
        <div className="lsp-chart__zones">
          {current.skillZones.map((zone) => (
            <span
              key={zone.label}
              className="lsp-chart__zone-chip"
              style={{ backgroundColor: zone.color, borderColor: zone.color }}
            >
              {zone.label}
              <em>
                {zone.from}–{zone.to}
              </em>
            </span>
          ))}
        </div>
      ) : null}

      {examMode ? null : (
        <div className="lsp-chart__legend">
          <span className="lsp-chart__legend-item">
            <i className="lsp-chart__dot lsp-chart__dot--high" />
            Excellent ≥80%
          </span>
          <span className="lsp-chart__legend-item">
            <i className="lsp-chart__dot lsp-chart__dot--mid" />
            In progress 50–79%
          </span>
          <span className="lsp-chart__legend-item">
            <i className="lsp-chart__dot lsp-chart__dot--low" />
            Needs work &lt;50%
          </span>
          <span className="lsp-chart__legend-item">
            <i className="lsp-chart__dot lsp-chart__dot--empty" />
            No data
          </span>
        </div>
      )}

      {examMode ? (
        <div className="lsp-chart__legend lsp-chart__legend--exam">
          <span className="lsp-chart__legend-item">Solid bar = section completed in exam mode</span>
          <span className="lsp-chart__legend-item">
            <i className="lsp-chart__dot lsp-chart__dot--empty" />
            Not attempted yet
          </span>
        </div>
      ) : null}

      {slides.length > 1 ? (
        <div className="lsp-chart__tabs" role="tablist" aria-label="Levels">
          {slides.map((slide, i) => (
            <button
              key={slide.levelId || slide.levelSlug || slide.levelName}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`lsp-chart__tab${i === index ? ' is-active' : ''}${slide.hasData ? '' : ' is-empty'}`}
              onClick={() => setIndex(i)}
            >
              {slide.levelName}
              {!slide.hasData ? <span className="lsp-chart__tab-note">No data</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      {!current.hasData ? (
        <p className="lsp-chart__no-data">{copy.empty(current.levelName)}</p>
      ) : null}

      <div className="lsp-chart__scroll">
        <div className="lsp-chart__canvas" style={{ minWidth: chartWidth }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={chartData} margin={{ top: 28, right: 8, left: 0, bottom: 4 }}>
              {!examMode ? (
                <defs>
                  {chartData.map((entry, i) => {
                    const tone = scoreTone(entry.scorePct);
                    const [c1, c2] = BAR_GRADIENTS[tone];
                    return (
                      <linearGradient key={barFillId(entry, i)} id={barFillId(entry, i)} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c1} />
                        <stop offset="100%" stopColor={c2} />
                      </linearGradient>
                    );
                  })}
                </defs>
              ) : null}

              {(current.skillZones || []).map((zone) => (
                <ReferenceArea
                  key={zone.label}
                  x1={zone.from - 0.5}
                  x2={zone.to + 0.5}
                  y1={0}
                  y2={100}
                  fill={zone.color}
                  fillOpacity={0.4}
                  ifOverflow="extendDomain"
                />
              ))}

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
              <ReferenceLine
                y={60}
                stroke="#94a3b8"
                strokeDasharray="6 4"
                label={{
                  value: 'Target 60%',
                  position: 'insideTopRight',
                  fill: '#64748b',
                  fontSize: 10,
                }}
              />
              <XAxis
                dataKey="partSort"
                type="category"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                interval={0}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tickFormatter={(v) => String(v)}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}%`}
                width={36}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<ChartTooltip variant={variant} />}
                cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
              />
              <Bar dataKey="displayScore" radius={[8, 8, 4, 4]} maxBarSize={32}>
                <LabelList dataKey="displayScore" content={renderBarLabel} />
                {chartData.map((entry, i) => {
                  const fill = examMode
                    ? entry.hasScore
                      ? entry.zoneBarColor || '#64748b'
                      : entry.zoneEmptyColor || '#e2e8f0'
                    : `url(#${barFillId(entry, i)})`;
                  return (
                    <Cell
                      key={entry.parteId}
                      fill={fill}
                      fillOpacity={entry.hasScore ? 1 : examMode ? 0.85 : 0.55}
                      stroke={entry.hasScore ? 'transparent' : examMode ? entry.zoneBarColor || '#94a3b8' : '#94a3b8'}
                      strokeWidth={entry.hasScore ? 0 : 1}
                      strokeDasharray={entry.hasScore ? undefined : '4 3'}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="lsp-chart__hint">{copy.hint}</p>

      <style jsx global>{`
        .lsp-chart-tip {
          padding: 14px 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);
          font-size: 0.8125rem;
          line-height: 1.45;
          font-family: 'Segoe UI', system-ui, sans-serif;
          min-width: 160px;
        }
        .lsp-chart-tip__head {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
        }
        .lsp-chart-tip__zone {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .lsp-chart-tip__score {
          margin: 8px 0 0;
          font-size: 1.125rem;
          font-weight: 800;
          color: #0f172a;
        }
        .lsp-chart-tip__items {
          margin: 4px 0 0;
          font-size: 0.8125rem;
          color: #475569;
          font-weight: 600;
        }
        .lsp-chart-tip p {
          margin: 4px 0 0;
          color: #475569;
        }
        .lsp-chart-tip__ok {
          color: #15803d;
          font-weight: 600;
        }
        .lsp-chart-tip__ko {
          color: #b91c1c;
          font-weight: 600;
        }
      `}</style>

      <style jsx>{`
        .lsp-chart {
          padding: 24px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 2px 16px rgba(15, 23, 42, 0.05);
        }

        .lsp-chart__head {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 18px;
        }

        .lsp-chart__title {
          margin: 0;
          font-size: 1.0625rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .lsp-chart__subtitle {
          margin: 6px 0 0;
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
          max-width: 34rem;
        }

        .lsp-chart__nav {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .lsp-chart__nav-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: #fff;
          color: #334155;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .lsp-chart__nav-btn:hover:not(:disabled) {
          border-color: #2563eb;
          color: #2563eb;
          background: #eff6ff;
        }

        .lsp-chart__nav-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .lsp-chart__level-badge {
          min-width: 3rem;
          padding: 8px 16px;
          text-align: center;
          font-weight: 800;
          font-size: 0.875rem;
          color: #fff;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
        }

        .lsp-chart__summary {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
        }

        .lsp-chart__summary-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lsp-chart__summary-value {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          line-height: 1;
        }

        .lsp-chart__summary-label {
          font-size: 0.6875rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .lsp-chart__summary-divider {
          width: 1px;
          height: 32px;
          background: #e2e8f0;
        }

        .lsp-chart__zones {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .lsp-chart__zone-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 0.6875rem;
          font-weight: 700;
          color: #334155;
          border: 1px solid transparent;
        }

        .lsp-chart__zone-chip em {
          font-style: normal;
          font-weight: 600;
          opacity: 0.75;
        }

        .lsp-chart__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 14px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #64748b;
        }

        .lsp-chart__legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .lsp-chart__dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 3px;
        }

        .lsp-chart__dot--high {
          background: linear-gradient(180deg, #22c55e, #15803d);
        }

        .lsp-chart__dot--mid {
          background: linear-gradient(180deg, #60a5fa, #2563eb);
        }

        .lsp-chart__dot--low {
          background: linear-gradient(180deg, #f87171, #dc2626);
        }

        .lsp-chart__dot--empty {
          background: #e2e8f0;
          border: 1px dashed #94a3b8;
        }

        .lsp-chart__tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 16px;
        }

        .lsp-chart__tab {
          padding: 7px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          background: #fff;
          color: #64748b;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .lsp-chart__tab:hover {
          border-color: #cbd5e1;
          color: #334155;
        }

        .lsp-chart__tab.is-active {
          background: #0f172a;
          border-color: #0f172a;
          color: #fff;
        }

        .lsp-chart__tab.is-empty:not(.is-active) {
          border-style: dashed;
          color: #94a3b8;
        }

        .lsp-chart__tab-note {
          margin-left: 6px;
          font-size: 0.625rem;
          font-weight: 600;
          opacity: 0.85;
        }

        .lsp-chart__no-data {
          margin: 0 0 14px;
          padding: 12px 14px;
          border-radius: 10px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          font-size: 0.8125rem;
          color: #64748b;
          line-height: 1.5;
        }

        .lsp-chart__scroll {
          overflow-x: auto;
          overflow-y: hidden;
          margin: 0 -4px;
          padding: 0 4px 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }

        .lsp-chart__scroll::-webkit-scrollbar {
          height: 6px;
        }

        .lsp-chart__scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 999px;
        }

        .lsp-chart__canvas {
          width: 100%;
          min-height: 360px;
          padding: 12px 8px 4px;
          background: #fafbfc;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .lsp-chart__hint {
          margin: 10px 0 0;
          font-size: 0.6875rem;
          color: #94a3b8;
          text-align: center;
        }

        @media (min-width: 960px) {
          .lsp-chart__hint {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
