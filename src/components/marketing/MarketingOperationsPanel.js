'use client';

import { useEffect, useState } from 'react';
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
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch(buildClientApiUrl('/api/admin/marketing/operations'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: 'include',
        });
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'No se pudieron cargar las métricas.');
          return;
        }
        setReport(json);
      } catch {
        if (!cancelled) setError('No se pudieron cargar las métricas.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <RouteLoadingMascot label="Cargando métricas…" variant={5} />;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!report) return null;

  const sample = `Sobre las últimas ${report.sampleSize} visitas, sin contar accesos locales.`;

  if (section === 'acquisition') {
    return (
      <section className={styles.card}>
        <p className={styles.lead}>De dónde llegan y cuántos acaban con cuenta o con un plan de pago.</p>
        <p className={styles.meta}>{sample}</p>
        <AcquisitionTable rows={report.acquisition || []} />
      </section>
    );
  }

  if (section === 'journey') {
    const rows = report.journeys || [];
    return (
      <section className={styles.card}>
        <p className={styles.lead}>Recorrido reciente de cada visita, de la primera página a la última.</p>
        <p className={styles.meta}>{sample}</p>
        {rows.length ? (
          <ul className={styles.journeyList}>
            {rows.map((row) => (
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
          <p className={styles.meta}>Todavía no hay recorridos.</p>
        )}
      </section>
    );
  }

  if (section === 'conversions') {
    return (
      <section className={styles.card}>
        <p className={styles.lead}>Embudo desde la visita hasta la suscripción de pago.</p>
        <p className={styles.meta}>{sample} El porcentaje es sobre el total de visitas.</p>
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
