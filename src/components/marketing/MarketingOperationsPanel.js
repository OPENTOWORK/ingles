'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { buildClientApiUrl } from '@/utils/clientApiUrl';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import styles from './MarketingShell.module.css';

function euros(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function whenLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function monthName(key) {
  if (!key || key === 'all') return 'Todo el histórico';
  const [year, month] = String(key).split('-').map(Number);
  if (!year || !month) return key;
  const label = new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function periodText(report, refreshError) {
  const count = report?.sampleSize ?? 0;
  const latest = report?.journeys?.[0]?.when ? ` La más reciente es del ${whenLabel(report.journeys[0].when)}.` : '';
  const updated = report?.generatedAt ? ` Actualizado a las ${whenLabel(report.generatedAt)}.` : '';
  const problem = refreshError ? ` ${refreshError}` : '';
  if (!report?.month || report.month === 'all') {
    return `Sobre todo el histórico (${count} visitas), sin contar accesos locales.${latest}${updated}${problem}`;
  }
  return `Sobre ${monthName(report.month).toLowerCase()} (${count} visitas), sin contar accesos locales.${latest}${updated}${problem}`;
}

function MonthControl({ month, months, onChange }) {
  return (
    <label className={styles.monthLabel}>
      Mes
      <select
        className={styles.monthSelect}
        value={month || 'all'}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">Todo el histórico</option>
        {(months || []).map((key) => (
          <option key={key} value={key}>{monthName(key)}</option>
        ))}
      </select>
    </label>
  );
}

function Stat({ label, value, hint }) {
  return (
    <article className={styles.stat}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {hint ? <p className={styles.statHint}>{hint}</p> : null}
    </article>
  );
}

function Funnel({ steps }) {
  const max = Math.max(1, ...steps.map((step) => step.count));
  return (
    <div className={styles.funnel}>
      {steps.map((step) => (
        <div key={step.key} className={styles.funnelRow}>
          <div className={styles.funnelMeta}>
            <span>{step.label}</span>
            <strong>
              {step.count} · {step.rateFromStart}%
            </strong>
          </div>
          <div className={styles.funnelTrack}>
            <span style={{ width: `${Math.max(4, Math.round((step.count / max) * 100))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AcquisitionTable({ rows }) {
  if (!rows.length) return <p className={styles.meta}>Todavía no hay visitas para agrupar por canal.</p>;
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Canal</th>
          <th>Visitas</th>
          <th>Cuentas</th>
          <th>De pago</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.source}>
            <td>{row.source}</td>
            <td>{row.visits}</td>
            <td>{row.accounts}</td>
            <td>{row.paying}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function MarketingOperationsPanel({ section }) {
  const monthEnabled = section !== 'roi';
  const [month, setMonth] = useState(section === 'journey' ? 'latest' : 'all');
  const [journeyLimit, setJourneyLimit] = useState(80);
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasReport = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;
    let retryTimer = null;

    async function load() {
      const id = ++requestId;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const monthQuery = monthEnabled ? `month=${encodeURIComponent(month)}&` : '';
        const res = await fetch(buildClientApiUrl(`/api/admin/marketing/operations?${monthQuery}t=${Date.now()}`), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
          cache: 'no-store',
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled || id !== requestId) return;
        if (!res.ok) {
          const message = json.error || 'No se pudieron actualizar las métricas.';
          if (!hasReport.current) setError(message);
          else setRefreshError('No se han podido actualizar. Estos datos no están al día.');
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(load, 15000);
          return;
        }
        hasReport.current = true;
        setError('');
        setRefreshError('');
        setReport(json);
      } catch {
        if (cancelled || id !== requestId) return;
        if (!hasReport.current) setError('No se pudieron cargar las métricas.');
        else setRefreshError('No se han podido actualizar. Estos datos no están al día.');
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(load, 15000);
      } finally {
        if (!cancelled && id === requestId) setLoading(false);
      }
    }

    hasReport.current = false;
    setLoading(true);
    setRefreshError('');
    load();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 30000);
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    window.addEventListener('focus', refreshIfVisible);
    document.addEventListener('visibilitychange', refreshIfVisible);

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (retryTimer) clearTimeout(retryTimer);
      window.removeEventListener('focus', refreshIfVisible);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [month, monthEnabled]);

  const selectedMonth = month === 'latest' ? (report?.month || 'all') : month;
  const changeMonth = (next) => {
    setJourneyLimit(80);
    setMonth(next);
  };

  if (loading) return <RouteLoadingMascot label="Cargando métricas…" variant={5} />;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!report) return null;

  const sample = periodText(report, refreshError);
  const monthControl = monthEnabled ? (
    <MonthControl month={selectedMonth} months={report.months || []} onChange={changeMonth} />
  ) : null;

  if (section === 'acquisition') {
    return (
      <section className={styles.card}>
        <div className={styles.toolbar}>
          <p className={styles.lead}>De dónde llegan y cuántos registros deja cada canal.</p>
          {monthControl}
        </div>
        <p className={styles.meta}>{sample} Cada cuenta cuenta una vez, en el canal con el que se registró.</p>
        <AcquisitionTable rows={report.acquisition || []} />
      </section>
    );
  }

  if (section === 'journey') {
    const rows = report.journeys || [];
    const visibleRows = rows.slice(0, journeyLimit);
    return (
      <section className={styles.card}>
        <div className={styles.toolbar}>
          <p className={styles.lead}>Recorrido de cada visita, de la primera página a la última.</p>
          {monthControl}
        </div>
        <p className={styles.meta}>{sample} Las que crearon cuenta llevan la marca «Cuenta».</p>
        {visibleRows.length ? (
          <ul className={styles.journeyList}>
            {visibleRows.map((row) => (
              <li key={row.id} className={styles.journeyItem}>
                <div className={styles.journeyHead}>
                  <strong>{row.source}</strong>
                  <span>{whenLabel(row.when)}</span>
                  {row.paying ? <em>De pago</em> : row.account ? <em>Cuenta</em> : null}
                </div>
                <p>{row.steps.length ? row.steps.join(' → ') : 'Sin páginas registradas'}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.meta}>Todavía no hay recorridos en este periodo.</p>
        )}
        {rows.length > visibleRows.length ? (
          <button type="button" className={styles.moreButton} onClick={() => setJourneyLimit((current) => current + 80)}>
            Ver más ({rows.length - visibleRows.length} restantes)
          </button>
        ) : null}
      </section>
    );
  }

  if (section === 'conversions') {
    return (
      <section className={styles.card}>
        <div className={styles.toolbar}>
          <p className={styles.lead}>Embudo desde la visita hasta la suscripción de pago.</p>
          {monthControl}
        </div>
        <p className={styles.meta}>{sample} El porcentaje es sobre el total de visitas del periodo.</p>
        <Funnel steps={report.funnel || []} />
      </section>
    );
  }

  if (section === 'roi') {
    const roi = report.roi || {};
    return (
      <section className={styles.stack}>
        <div className={styles.stats}>
          <Stat label="Ingreso mensual" value={euros(roi.monthlyRevenueEur)} hint="Suma de las suscripciones activas" />
          <Stat label="Clientes de pago" value={roi.payingCustomers ?? 0} />
          <Stat label="Friendly" value={roi.friendlyCustomers ?? 0} hint="Activos sin ingreso" />
          <Stat label="Ingreso por visita" value={euros(roi.revenuePerVisitEur)} hint={sample} />
        </div>
        <div className={styles.card}>
          <p className={styles.lead}>ROAS y CAC</p>
          <p className={styles.meta}>
            No hay gasto de anuncios cargado, así que ROAS y CAC no se pueden calcular. El ingreso de arriba
            es el de los planes de pago activos: Plus 3,99 €/mes y Premium 8,99 €/mes (o su equivalente anual).
          </p>
        </div>
      </section>
    );
  }

  const dash = report.dashboard || {};
  return (
    <section className={styles.stack}>
      <div className={styles.toolbar}>{monthControl}</div>
      <div className={styles.stats}>
        <Stat label="Visitas" value={dash.visits ?? 0} hint={sample} />
        <Stat label="Cuentas" value={dash.accounts ?? 0} hint={`${dash.visitToAccount ?? 0}% de las visitas`} />
        <Stat label="De pago en esas visitas" value={dash.payingVisits ?? 0} hint={`${dash.accountToPaying ?? 0}% de las cuentas`} />
        <Stat label="Ingreso mensual" value={euros(dash.monthlyRevenueEur)} hint={`${dash.payingCustomers ?? 0} suscripciones activas`} />
      </div>
      <div className={styles.card}>
        <p className={styles.lead}>Canal principal: {dash.topSource || '—'}</p>
        <Funnel steps={report.funnel || []} />
      </div>
    </section>
  );
}
