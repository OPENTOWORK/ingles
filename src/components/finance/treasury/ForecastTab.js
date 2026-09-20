'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  BarChart,
  Card,
  DataTable,
  ErrorState,
  Field,
  Filters,
  KpiGrid,
  KpiSkeleton,
  MoneyKpi,
  Select,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatShortDate } from '@/lib/finance/money';
import { FORECAST_HORIZONS } from '@/lib/finance/treasury';

/** Previsión de tesorería sobre vencimientos reales. */
export default function ForecastTab({ reloadToken = 0 }) {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/tesoreria/prevision', { params: { days } });
      setState({ loading: false, error: '', data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (state.loading) return <KpiSkeleton count={4} />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { realBalance, horizons, timeline, accounts } = state.data;
  const selected = horizons.find((h) => h.days === days);

  return (
    <>
      <KpiGrid>
        <MoneyKpi label="Saldo real actual" amount={realBalance} hint="Solo movimientos registrados" accent />
        <MoneyKpi label={`Entradas previstas (${days} d)`} amount={selected?.expected_in ?? 0} />
        <MoneyKpi label={`Salidas previstas (${days} d)`} amount={selected?.expected_out ?? 0} />
        <MoneyKpi
          label={`Saldo previsto (${days} d)`}
          amount={selected?.forecast_balance ?? realBalance}
          signed
        />
      </KpiGrid>

      <Card title="Horizonte">
        <Filters>
          <Field label="Periodo" htmlFor="forecast-days">
            <Select id="forecast-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {FORECAST_HORIZONS.map((horizon) => (
                <option key={horizon} value={horizon}>
                  {horizon} días
                </option>
              ))}
            </Select>
          </Field>
        </Filters>
      </Card>

      <Card
        title="Evolución prevista del saldo"
        description="Cada punto incorpora los vencimientos de ese día al saldo real de partida."
      >
        <BarChart
          data={timeline.map((point) => ({
            label: formatShortDate(point.date),
            forecast: point.forecast_balance,
          }))}
          series={[{ key: 'forecast', label: 'Saldo previsto', color: '#6366f1' }]}
        />
      </Card>

      <Card
        flush
        title="Detalle por horizonte"
        description="Comparativa entre saldo real y saldo previsto en cada plazo."
      >
        <DataTable
          columns={[
            { key: 'days', label: 'Plazo', render: (r) => `${r.days} días` },
            { key: 'date', label: 'Hasta', render: (r) => formatShortDate(r.date) },
            {
              key: 'real_balance',
              label: 'Saldo real',
              numeric: true,
              render: (r) => formatCurrency(r.real_balance),
            },
            {
              key: 'expected_in',
              label: 'Entradas',
              numeric: true,
              render: (r) => <span className={styles.positive}>+{formatCurrency(r.expected_in)}</span>,
            },
            {
              key: 'expected_out',
              label: 'Salidas',
              numeric: true,
              render: (r) => <span className={styles.negative}>−{formatCurrency(r.expected_out)}</span>,
            },
            {
              key: 'forecast_balance',
              label: 'Saldo previsto',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.forecast_balance)}</strong>,
            },
          ]}
          rows={horizons}
          getRowKey={(row) => row.days}
          emptyTitle="Sin previsión"
          emptyDescription="No hay facturas pendientes en el horizonte."
        />
      </Card>

      <Card flush title={`Vencimientos en los próximos ${days} días`}>
        <DataTable
          columns={[
            { key: 'date', label: 'Fecha', render: (r) => formatShortDate(r.date) },
            {
              key: 'expected_in',
              label: 'Entradas',
              numeric: true,
              render: (r) =>
                r.expected_in > 0 ? (
                  <span className={styles.positive}>+{formatCurrency(r.expected_in)}</span>
                ) : (
                  <span className={styles.muted}>—</span>
                ),
            },
            {
              key: 'expected_out',
              label: 'Salidas',
              numeric: true,
              render: (r) =>
                r.expected_out > 0 ? (
                  <span className={styles.negative}>−{formatCurrency(r.expected_out)}</span>
                ) : (
                  <span className={styles.muted}>—</span>
                ),
            },
            {
              key: 'forecast_balance',
              label: 'Saldo previsto',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.forecast_balance)}</strong>,
            },
            {
              key: 'items',
              label: 'Documentos',
              render: (r) => (
                <div className={styles.row}>
                  {r.items.map((item) => (
                    <Badge
                      key={`${item.invoice_id}-${item.kind}`}
                      tone={item.overdue ? 'danger' : item.kind === 'collection' ? 'success' : 'warning'}
                    >
                      {item.invoice_number} · {item.party_name} · {formatCurrency(item.amount)}
                    </Badge>
                  ))}
                </div>
              ),
            },
          ]}
          rows={timeline}
          getRowKey={(row) => row.date}
          emptyTitle="Sin vencimientos"
          emptyDescription="No hay cobros ni pagos previstos en este periodo."
        />
      </Card>

      <Card flush title="Saldo por cuenta">
        <DataTable
          columns={[
            { key: 'name', label: 'Cuenta' },
            {
              key: 'current_balance',
              label: 'Saldo real',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.current_balance)}</strong>,
            },
          ]}
          rows={accounts}
          emptyTitle="Sin cuentas activas"
          emptyDescription="Crea una cuenta de tesorería para calcular la previsión."
        />
      </Card>
    </>
  );
}
