'use client';

import { useCallback, useEffect, useState } from 'react';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

function formatEur(value) {
  const n = Number(value) || 0;
  return `€${n.toFixed(2)}`;
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-gray-500">{sub}</p> : null}
    </div>
  );
}

function KeyValueTable({ title, data, valueFormatter = (v) => v }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-800">{title}</h3>
      <table className="w-full text-sm">
        <tbody>
          {entries.map(([key, val]) => (
            <tr key={key} className="border-t border-gray-100 first:border-t-0">
              <td className="py-2 pr-4 text-gray-700">{key}</td>
              <td className="py-2 text-right font-medium text-gray-900">{valueFormatter(val)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Admin panel: AI usage and estimated costs for the current month.
 * Wire into an admin page when needed — not exposed in public nav.
 */
export default function AiUsageAdminPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(buildClientApiUrl('/api/admin/ai-usage'), {
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
      }
      setPayload(data);
    } catch (e) {
      setError(e?.message || 'Could not load AI usage data.');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = payload?.summary || {};
  const spend = payload?.spend || {};
  const budget = payload?.budget || {};

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI usage &amp; costs</h2>
          <p className="text-sm text-gray-600">
            Month: {payload?.monthKey || '—'}
            {budget.budgetEur != null ? ` · Budget: ${formatEur(budget.budgetEur)}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && payload ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total spend (EUR)" value={formatEur(summary.totalCostEur ?? spend.totalEur)} />
            <StatCard label="Total calls" value={summary.totalCalls ?? spend.callCount ?? 0} />
            <StatCard
              label="Input tokens"
              value={(summary.totalInputTokens ?? 0).toLocaleString()}
            />
            <StatCard
              label="Output tokens"
              value={(summary.totalOutputTokens ?? 0).toLocaleString()}
            />
            <StatCard label="OpenAI errors" value={summary.errorCount ?? 0} />
            <StatCard
              label="Budget status"
              value={budget.allowed === false ? 'Hard stop active' : budget.nearBudget ? 'Near limit' : 'OK'}
              sub={
                budget.spendEur != null && budget.budgetEur != null
                  ? `${formatEur(budget.spendEur)} of ${formatEur(budget.budgetEur)}`
                  : undefined
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <KeyValueTable title="Spend by action (EUR)" data={summary.byAction} valueFormatter={formatEur} />
            <KeyValueTable title="Spend by product area (EUR)" data={summary.byProductArea} valueFormatter={formatEur} />
            <KeyValueTable title="Spend by model (EUR)" data={summary.byModel} valueFormatter={formatEur} />
          </div>

          {summary.topUsers?.length ? (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-gray-800">Top users by spend</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="pb-2 font-medium">User ID</th>
                    <th className="pb-2 text-right font-medium">EUR</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.topUsers.map((row) => (
                    <tr key={row.userId} className="border-t border-gray-100">
                      <td className="py-2 font-mono text-xs text-gray-700">{row.userId}</td>
                      <td className="py-2 text-right font-medium">{formatEur(row.costEur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
