'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Card,
  DataTable,
  ErrorState,
  InfoBanner,
  Kpi,
  KpiGrid,
  KpiSkeleton,
  MoneyKpi,
  Select,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { ACCOUNT_TYPE_LABELS, JOURNAL_ORIGIN_LABELS } from '@/lib/finance/constants';

/** Dashboard de Contabilidad sobre el ejercicio seleccionado. */
export default function AccountingDashboardTab({ reloadToken = 0, onOpenEntry }) {
  const [fiscalYearId, setFiscalYearId] = useState('');
  const [state, setState] = useState({ loading: true, error: '', data: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/contabilidad', {
        params: { fiscalYearId },
      });
      setState({ loading: false, error: '', data });
      if (!fiscalYearId && data.activeFiscalYear) setFiscalYearId(data.activeFiscalYear.id);
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [fiscalYearId]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  if (state.loading) return <KpiSkeleton count={6} />;
  if (state.error) return <ErrorState message={state.error} onRetry={load} />;

  const { summary, byType, recentEntries, fiscalYears, activeFiscalYear } = state.data;

  if (!activeFiscalYear) {
    return (
      <InfoBanner>
        No hay ningún ejercicio contable creado. Crea uno en la pestaña Ejercicios para empezar a
        contabilizar.
      </InfoBanner>
    );
  }

  return (
    <>
      <Card
        title={`Ejercicio ${activeFiscalYear.year}`}
        description={
          activeFiscalYear.status === 'closed'
            ? 'Ejercicio cerrado: no admite nuevos asientos.'
            : 'Ejercicio abierto.'
        }
        actions={
          <Select
            value={fiscalYearId}
            onChange={(e) => setFiscalYearId(e.target.value)}
            aria-label="Ejercicio contable"
          >
            {fiscalYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.year} · {year.status === 'closed' ? 'Cerrado' : 'Abierto'}
              </option>
            ))}
          </Select>
        }
      >
        <KpiGrid>
          <MoneyKpi label="Ingresos" amount={summary.income} accent />
          <MoneyKpi label="Gastos" amount={summary.expenses} />
          <MoneyKpi label="Resultado" amount={summary.result} signed />
          <MoneyKpi label="Total debe" amount={summary.total_debit} />
          <MoneyKpi label="Total haber" amount={summary.total_credit} />
          <Kpi
            label="Cuadre"
            value={summary.balanced ? 'Cuadrado' : 'Descuadrado'}
            tone={summary.balanced ? 'positive' : 'negative'}
            hint={summary.balanced ? 'Debe = Haber' : 'Revisa el libro diario'}
          />
        </KpiGrid>
      </Card>

      {summary.assets !== null && (
        <Card
          title="Situación patrimonial"
          description="Calculada a partir de los saldos reales de las cuentas de balance."
        >
          <KpiGrid>
            <MoneyKpi label="Activo" amount={summary.assets} />
            <MoneyKpi label="Pasivo" amount={summary.liabilities} />
            <MoneyKpi label="Patrimonio neto" amount={summary.equity} />
          </KpiGrid>
        </Card>
      )}

      <Card
        flush
        title="Saldos por naturaleza"
        description="Agregado de todas las cuentas del ejercicio agrupadas por tipo."
      >
        <DataTable
          columns={[
            {
              key: 'account_type',
              label: 'Tipo',
              render: (row) => ACCOUNT_TYPE_LABELS[row.account_type] || row.account_type,
            },
            { key: 'debit', label: 'Debe', numeric: true, render: (r) => formatCurrency(r.debit) },
            { key: 'credit', label: 'Haber', numeric: true, render: (r) => formatCurrency(r.credit) },
            {
              key: 'balance',
              label: 'Saldo',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.balance)}</strong>,
            },
          ]}
          rows={byType}
          emptyTitle="Sin movimientos contables"
          emptyDescription="Emite una factura o crea un asiento manual para ver datos aquí."
        />
      </Card>

      <Card flush title="Últimos asientos">
        <DataTable
          columns={[
            {
              key: 'entry_number',
              label: 'Nº',
              render: (row) => (
                <button type="button" className={styles.link} onClick={() => onOpenEntry?.(row.id)}>
                  {row.entry_number}
                </button>
              ),
            },
            { key: 'entry_date', label: 'Fecha', render: (row) => formatDate(row.entry_date) },
            { key: 'concept', label: 'Concepto' },
            {
              key: 'origin',
              label: 'Origen',
              render: (row) => (
                <Badge tone={row.origin === 'manual' ? 'neutral' : 'info'}>
                  {JOURNAL_ORIGIN_LABELS[row.origin] || row.origin}
                </Badge>
              ),
            },
            { key: 'document_ref', label: 'Documento', render: (row) => row.document_ref || '—' },
            {
              key: 'total_debit',
              label: 'Debe',
              numeric: true,
              render: (row) => formatCurrency(row.total_debit),
            },
            {
              key: 'total_credit',
              label: 'Haber',
              numeric: true,
              render: (row) => formatCurrency(row.total_credit),
            },
          ]}
          rows={recentEntries}
          emptyTitle="Todavía no hay asientos"
          emptyDescription="Los asientos se generan automáticamente al emitir facturas y registrar cobros."
        />
      </Card>
    </>
  );
}
