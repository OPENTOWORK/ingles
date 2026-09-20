'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  BarChart,
  Button,
  Card,
  DataTable,
  ErrorState,
  Kpi,
  KpiGrid,
  KpiSkeleton,
  MoneyKpi,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { invoiceFunctionalStatus, statusLabel, statusTone } from '@/components/finance/statusHelpers';

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function monthLabel(key) {
  const [, month] = String(key || '').split('-');
  const index = Number(month) - 1;
  return MONTH_LABELS[index] || key;
}

/** Dashboard de Facturación con métricas reales y últimas facturas. */
export default function InvoiceDashboardTab({ direction = 'sale', reloadToken = 0, onView, onCreate }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/facturacion', { params: { direction } });
      setState({ loading: false, error: '', data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [direction]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (state.loading) {
    return (
      <>
        <KpiSkeleton count={6} />
        <div className={styles.skeleton} style={{ height: 240, borderRadius: '1rem' }} />
      </>
    );
  }

  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { summary, monthlyEvolution, recentInvoices } = state.data;
  const isPurchase = direction === 'purchase';

  return (
    <>
      <KpiGrid>
        <MoneyKpi
          label={isPurchase ? 'Compras del mes' : 'Facturación del mes'}
          amount={summary.month_total}
          accent
        />
        <MoneyKpi
          label={isPurchase ? 'Compras del año' : 'Facturación acumulada'}
          amount={summary.year_total}
          hint="Año en curso"
        />
        <MoneyKpi
          label={isPurchase ? 'Pendiente de pago' : 'Pendiente de cobro'}
          amount={summary.pending_amount}
        />
        <MoneyKpi
          label="Vencido"
          amount={summary.overdue_amount}
          hint={`${summary.overdue_count} factura(s)`}
          signed={summary.overdue_amount > 0}
        />
        <Kpi label="Facturas emitidas" value={summary.invoice_count} hint="Últimos 12 meses" />
        <Kpi
          label="Borradores"
          value={summary.draft_count}
          hint={summary.draft_count > 0 ? 'Pendientes de emitir' : 'Nada pendiente'}
        />
      </KpiGrid>

      <Card
        title="Evolución mensual"
        description="Importe facturado frente a importe efectivamente cobrado."
      >
        <BarChart
          data={monthlyEvolution.map((point) => ({
            label: monthLabel(point.month),
            billed: point.billed,
            collected: point.collected,
          }))}
          series={[
            { key: 'billed', label: isPurchase ? 'Facturado' : 'Facturado', color: '#6366f1' },
            { key: 'collected', label: isPurchase ? 'Pagado' : 'Cobrado', color: '#14b8a6' },
          ]}
        />
      </Card>

      <Card
        flush
        title="Últimas facturas"
        description="Los ocho documentos más recientes."
        actions={
          <Button variant="primary" onClick={onCreate}>
            {isPurchase ? '+ Nueva factura recibida' : '+ Nueva factura'}
          </Button>
        }
      >
        <DataTable
          columns={[
            {
              key: 'invoice_number',
              label: 'Número',
              render: (row) => (
                <button type="button" className={styles.link} onClick={() => onView?.(row.id)}>
                  {row.invoice_number || 'Borrador'}
                </button>
              ),
            },
            { key: 'party_name', label: isPurchase ? 'Proveedor' : 'Cliente' },
            { key: 'issue_date', label: 'Fecha', render: (row) => formatDate(row.issue_date) },
            { key: 'due_date', label: 'Vencimiento', render: (row) => formatDate(row.due_date) },
            {
              key: 'subtotal',
              label: 'Base imponible',
              numeric: true,
              render: (row) => formatCurrency(row.subtotal),
            },
            {
              key: 'tax_total',
              label: 'Impuestos',
              numeric: true,
              render: (row) => formatCurrency(row.tax_total),
            },
            {
              key: 'total',
              label: 'Total',
              numeric: true,
              render: (row) => <span className={styles.strong}>{formatCurrency(row.total)}</span>,
            },
            {
              key: 'status',
              label: 'Estado',
              render: (row) => {
                const status = invoiceFunctionalStatus(row);
                return <Badge tone={statusTone(status)}>{statusLabel(status, direction)}</Badge>;
              },
            },
          ]}
          rows={recentInvoices}
          emptyTitle="Todavía no hay facturas"
          emptyDescription="Crea la primera factura para ver aquí la actividad reciente."
          emptyAction={
            <Button variant="primary" onClick={onCreate}>
              Crear factura
            </Button>
          }
        />
      </Card>
    </>
  );
}
