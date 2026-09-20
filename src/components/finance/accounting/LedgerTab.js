'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  Field,
  Filters,
  Kpi,
  KpiGrid,
  MoneyKpi,
  Pagination,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { ACCOUNT_TYPE_LABELS, DEFAULT_PAGE_SIZE } from '@/lib/finance/constants';

/** Libro mayor de una cuenta con saldo acumulado. */
export default function LedgerTab({ catalog, initialAccount = '', reloadToken = 0, onOpenEntry }) {
  const [accountCode, setAccountCode] = useState(initialAccount);
  const [accountOptions, setAccountOptions] = useState([]);
  const [filters, setFilters] = useState({ fiscalYearId: 'all', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: false, error: '', data: null });

  useEffect(() => {
    if (initialAccount) setAccountCode(initialAccount);
  }, [initialAccount]);

  // Solo se ofrecen cuentas con movimientos reales para no llenar el desplegable de ruido.
  useEffect(() => {
    let cancelled = false;
    financeFetch('/api/admin/finanzas/contabilidad/plan', { params: { pageSize: 200, activeOnly: 'true' } })
      .then((data) => !cancelled && setAccountOptions(data.accounts || []))
      .catch(() => !cancelled && setAccountOptions([]));
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    if (!accountCode) {
      setState({ loading: false, error: '', data: null });
      return;
    }
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/contabilidad/mayor', {
        params: { accountCode, ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({ loading: false, error: '', data });
    } catch (err) {
      setState({ loading: false, error: err.message, data: null });
    }
  }, [accountCode, filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [accountCode, filters]);

  return (
    <>
      <Card title="Selección de cuenta">
        <Filters>
          <Field label="Cuenta contable" htmlFor="ledger-account">
            <Select
              id="ledger-account"
              value={accountCode}
              onChange={(e) => setAccountCode(e.target.value)}
            >
              <option value="">Selecciona una cuenta…</option>
              {accountOptions.map((account) => (
                <option key={account.code} value={account.code}>
                  {account.code} · {account.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Ejercicio" htmlFor="ledger-year">
            <Select
              id="ledger-year"
              value={filters.fiscalYearId}
              onChange={(e) => setFilters((p) => ({ ...p, fiscalYearId: e.target.value }))}
            >
              <option value="all">Todos</option>
              {(catalog?.fiscalYears || []).map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Desde" htmlFor="ledger-from">
            <TextInput
              id="ledger-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
            />
          </Field>

          <Field label="Hasta" htmlFor="ledger-to">
            <TextInput
              id="ledger-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
            />
          </Field>

          <div className={styles.field}>
            <span className={styles.label}>&nbsp;</span>
            <Button onClick={() => setFilters({ fiscalYearId: 'all', dateFrom: '', dateTo: '' })}>
              Limpiar fechas
            </Button>
          </div>
        </Filters>
      </Card>

      {!accountCode ? (
        <Card>
          <EmptyState
            title="Selecciona una cuenta"
            description="Elige una cuenta del plan contable para consultar su libro mayor y su saldo acumulado."
          />
        </Card>
      ) : (
        <>
          {state.data && (
            <KpiGrid>
              <Kpi
                label="Cuenta"
                value={state.data.account.code}
                hint={state.data.account.name}
                accent
              />
              <Kpi
                label="Naturaleza"
                value={ACCOUNT_TYPE_LABELS[state.data.account.account_type] || '—'}
              />
              <MoneyKpi label="Saldo anterior" amount={state.data.openingBalance} />
              <MoneyKpi label="Saldo final" amount={state.data.closingBalance} signed />
            </KpiGrid>
          )}

          <Card
            flush
            title={`Libro mayor · ${state.data?.account?.name || accountCode}`}
            description={`${state.data?.pagination?.total ?? 0} apunte(s)`}
          >
            <DataTable
              columns={[
                { key: 'entry_date', label: 'Fecha', render: (r) => formatDate(r.entry_date) },
                {
                  key: 'entry_number',
                  label: 'Asiento',
                  render: (r) => (
                    <button type="button" className={styles.link} onClick={() => onOpenEntry?.(r.entry_id)}>
                      {r.entry_number}
                    </button>
                  ),
                },
                {
                  key: 'concept',
                  label: 'Concepto',
                  render: (r) => r.line_concept || r.entry_concept || '—',
                },
                { key: 'document_ref', label: 'Documento', render: (r) => r.document_ref || '—' },
                {
                  key: 'debit',
                  label: 'Debe',
                  numeric: true,
                  render: (r) => (Number(r.debit) > 0 ? formatCurrency(r.debit) : '—'),
                },
                {
                  key: 'credit',
                  label: 'Haber',
                  numeric: true,
                  render: (r) => (Number(r.credit) > 0 ? formatCurrency(r.credit) : '—'),
                },
                {
                  key: 'balance',
                  label: 'Saldo acumulado',
                  numeric: true,
                  render: (r) => <strong>{formatCurrency(r.balance)}</strong>,
                },
              ]}
              rows={state.data?.movements || []}
              getRowKey={(row) => row.line_id}
              loading={state.loading}
              error={state.error}
              onRetry={load}
              emptyTitle="Sin movimientos"
              emptyDescription="Esta cuenta no tiene apuntes en el periodo seleccionado."
              footer={
                state.data ? (
                  <tr>
                    <td colSpan={4}>Totales de la página</td>
                    <td className={styles.numeric}>{formatCurrency(state.data.pageTotals.debit)}</td>
                    <td className={styles.numeric}>{formatCurrency(state.data.pageTotals.credit)}</td>
                    <td className={styles.numeric}>{formatCurrency(state.data.closingBalance)}</td>
                  </tr>
                ) : null
              }
            />
            <Pagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              total={state.data?.pagination?.total || 0}
              onPageChange={setPage}
            />
          </Card>
        </>
      )}
    </>
  );
}
