'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  BarChart,
  Card,
  DataTable,
  EmptyState,
  ErrorState,
  Kpi,
  KpiGrid,
  KpiSkeleton,
  MoneyKpi,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatShortDate, maskIban } from '@/lib/finance/money';
import { TREASURY_ACCOUNT_KIND_LABELS } from '@/lib/finance/constants';

/**
 * Dashboard de Tesorería.
 * Separa de forma explícita el saldo real del previsto: una factura futura
 * no altera el saldo bancario, solo la previsión.
 */
export default function TreasuryDashboardTab({ reloadToken = 0 }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      setState({ loading: false, error: '', data: await financeFetch('/api/admin/finanzas/tesoreria') });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (state.loading) {
    return (
      <>
        <KpiSkeleton count={4} />
        <div className={styles.skeleton} style={{ height: 220, borderRadius: '1rem' }} />
      </>
    );
  }

  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { summary, accounts, forecast, evolution, upcoming } = state.data;

  return (
    <>
      <KpiGrid>
        <MoneyKpi
          label="Saldo actual"
          amount={summary.real_balance}
          hint="Dinero realmente disponible"
          accent
        />
        <MoneyKpi
          label="Pendiente de cobro"
          amount={summary.pending_in}
          hint={`${summary.receivable_count} factura(s)`}
        />
        <MoneyKpi
          label="Pendiente de pago"
          amount={summary.pending_out}
          hint={`${summary.payable_count} factura(s)`}
        />
        <MoneyKpi
          label="Previsión a 30 días"
          amount={summary.forecast_30}
          hint="Saldo previsto, no real"
          signed
        />
      </KpiGrid>

      <KpiGrid>
        <MoneyKpi label="Cobrado este mes" amount={summary.collected_this_month} />
        <MoneyKpi label="Pagado este mes" amount={summary.paid_this_month} />
        <MoneyKpi
          label="Vencido por cobrar"
          amount={summary.overdue_in}
          signed={summary.overdue_in > 0}
        />
        <Kpi
          label="Sin conciliar"
          value={summary.unreconciled_count}
          hint={summary.unreconciled_count > 0 ? 'Revisa la conciliación' : 'Todo conciliado'}
          tone={summary.unreconciled_count > 0 ? 'negative' : 'positive'}
        />
      </KpiGrid>

      <Card
        flush
        title="Cuentas de tesorería"
        description="El saldo solo cambia con movimientos reales registrados."
      >
        <DataTable
          columns={[
            { key: 'name', label: 'Cuenta', render: (r) => <strong>{r.name}</strong> },
            {
              key: 'kind',
              label: 'Tipo',
              render: (r) => TREASURY_ACCOUNT_KIND_LABELS[r.kind] || r.kind,
            },
            { key: 'bank_name', label: 'Entidad', render: (r) => r.bank_name || '—' },
            { key: 'iban', label: 'IBAN', render: (r) => (r.iban ? maskIban(r.iban) : '—') },
            { key: 'currency', label: 'Moneda' },
            {
              key: 'current_balance',
              label: 'Saldo',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.current_balance, r.currency)}</strong>,
            },
            {
              key: 'is_active',
              label: 'Estado',
              render: (r) => (
                <Badge tone={r.is_active ? 'success' : 'neutral'}>
                  {r.is_active ? 'Activa' : 'Inactiva'}
                </Badge>
              ),
            },
          ]}
          rows={accounts}
          emptyTitle="Sin cuentas de tesorería"
          emptyDescription="Crea una cuenta en la pestaña Cuentas para poder registrar cobros y pagos."
        />
      </Card>

      <div className={styles.grid2}>
        <Card
          title="Evolución de tesorería"
          description="Saldo real acumulado según los movimientos de los últimos meses."
        >
          {evolution.length ? (
            <BarChart
              data={evolution.slice(-24).map((point) => ({
                label: formatShortDate(point.date),
                balance: point.balance,
              }))}
              series={[{ key: 'balance', label: 'Saldo real', color: '#6366f1' }]}
            />
          ) : (
            <EmptyState
              title="Sin movimientos"
              description="Aún no hay movimientos de tesorería registrados."
            />
          )}
        </Card>

        <Card
          title="Próximos movimientos"
          description="Diferencia entre lo ya registrado y lo solo previsto."
        >
          {upcoming.length ? (
            <div className={styles.timeline}>
              {upcoming.map((item) => (
                <div key={item.id} className={styles.timelineRow}>
                  <span className={styles.timelineDate}>{formatShortDate(item.date)}</span>
                  <span className={styles.timelineLabel}>
                    {item.label}
                    <span className={styles.timelineMeta}>
                      {item.invoice_number ? `${item.invoice_number} · ` : ''}
                      {item.nature === 'real' ? 'Real' : 'Previsto'}
                    </span>
                  </span>
                  <span
                    className={`${styles.timelineAmount} ${item.amount >= 0 ? styles.positive : styles.negative}`}
                  >
                    {item.amount >= 0 ? '+' : ''}
                    {formatCurrency(item.amount)}
                    {item.nature === 'forecast' && (
                      <Badge tone="warning">
                        <span style={{ fontSize: '0.6rem' }}>Previsto</span>
                      </Badge>
                    )}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sin movimientos próximos"
              description="No hay vencimientos ni movimientos programados."
            />
          )}
        </Card>
      </div>

      <Card
        flush
        title="Previsión por horizonte"
        description="Saldo real más los vencimientos pendientes dentro de cada plazo."
      >
        <DataTable
          columns={[
            { key: 'days', label: 'Horizonte', render: (r) => (r.days === 0 ? 'Hoy' : `${r.days} días`) },
            {
              key: 'real_balance',
              label: 'Saldo real',
              numeric: true,
              render: (r) => formatCurrency(r.real_balance),
            },
            {
              key: 'expected_in',
              label: 'Entradas previstas',
              numeric: true,
              render: (r) => <span className={styles.positive}>+{formatCurrency(r.expected_in)}</span>,
            },
            {
              key: 'expected_out',
              label: 'Salidas previstas',
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
          rows={forecast}
          getRowKey={(row) => row.days}
          emptyTitle="Sin previsión"
          emptyDescription="No hay facturas pendientes que proyectar."
        />
      </Card>
    </>
  );
}
