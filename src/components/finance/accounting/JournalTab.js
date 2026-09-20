'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Field,
  Filters,
  Pagination,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { DEFAULT_PAGE_SIZE, JOURNAL_ORIGIN_LABELS } from '@/lib/finance/constants';

const INITIAL_FILTERS = {
  fiscalYearId: 'all',
  dateFrom: '',
  dateTo: '',
  origin: 'all',
  accountCode: '',
  search: '',
};

/** Libro diario: cada fila es un asiento con sus líneas desplegables. */
export default function JournalTab({ catalog, reloadToken = 0, onOpenEntry, onCreate }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(() => new Set());
  const [state, setState] = useState({ loading: true, error: '', entries: [], total: 0 });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/contabilidad/diario', {
        params: { ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        entries: data.entries || [],
        total: data.pagination?.total || 0,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, entries: [], total: 0 });
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <>
      <Card title="Filtros">
        <Filters>
          <Field label="Ejercicio" htmlFor="journal-year">
            <Select
              id="journal-year"
              value={filters.fiscalYearId}
              onChange={(e) => updateFilter('fiscalYearId', e.target.value)}
            >
              <option value="all">Todos</option>
              {(catalog?.fiscalYears || []).map((year) => (
                <option key={year.id} value={year.id}>
                  {year.year}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Desde" htmlFor="journal-from">
            <TextInput
              id="journal-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </Field>

          <Field label="Hasta" htmlFor="journal-to">
            <TextInput
              id="journal-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </Field>

          <Field label="Origen" htmlFor="journal-origin">
            <Select
              id="journal-origin"
              value={filters.origin}
              onChange={(e) => updateFilter('origin', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="invoice">Factura</option>
              <option value="payment">Cobro/Pago</option>
              <option value="manual">Manual</option>
              <option value="adjustment">Ajuste</option>
            </Select>
          </Field>

          <Field label="Cuenta" htmlFor="journal-account">
            <TextInput
              id="journal-account"
              value={filters.accountCode}
              placeholder="430000"
              onChange={(e) => updateFilter('accountCode', e.target.value)}
            />
          </Field>

          <Field label="Texto" htmlFor="journal-search">
            <TextInput
              id="journal-search"
              value={filters.search}
              placeholder="Concepto o documento"
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </Field>

          <div className={styles.field}>
            <span className={styles.label}>&nbsp;</span>
            <Button onClick={() => setFilters(INITIAL_FILTERS)}>Limpiar filtros</Button>
          </div>
        </Filters>
      </Card>

      <Card
        flush
        title="Libro diario"
        description={`${state.total} asiento(s). Todo asiento contabilizado cumple DEBE = HABER.`}
        actions={
          <Button variant="primary" onClick={onCreate}>
            + Nuevo asiento
          </Button>
        }
      >
        <DataTable
          columns={[
            {
              key: 'expand',
              label: '',
              render: (row) => (
                <Button size="small" variant="ghost" onClick={() => toggleExpanded(row.id)}>
                  {expanded.has(row.id) ? '▾' : '▸'}
                </Button>
              ),
            },
            { key: 'entry_date', label: 'Fecha', render: (row) => formatDate(row.entry_date) },
            {
              key: 'entry_number',
              label: 'Nº asiento',
              render: (row) => (
                <button type="button" className={styles.link} onClick={() => onOpenEntry?.(row.id)}>
                  {row.entry_number ?? '—'}
                </button>
              ),
            },
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
            {
              key: 'status',
              label: 'Estado',
              render: (row) => (
                <Badge tone={row.status === 'posted' ? 'success' : 'neutral'}>
                  {row.status === 'posted' ? 'Contabilizado' : row.status}
                </Badge>
              ),
            },
          ]}
          rows={state.entries}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin asientos"
          emptyDescription="Los asientos aparecen al emitir facturas, registrar cobros o crearlos manualmente."
        />

        {/* Las líneas se renderizan como tabla anidada bajo cada asiento expandido. */}
        {state.entries
          .filter((entry) => expanded.has(entry.id))
          .map((entry) => (
            <div key={`${entry.id}-detail`} style={{ padding: '0 1.2rem 1rem' }}>
              <p className={styles.kpiHint} style={{ marginBottom: '0.35rem' }}>
                Asiento {entry.entry_number} · {entry.concept}
              </p>
              <DataTable
                columns={[
                  { key: 'account_code', label: 'Cuenta', render: (l) => <strong>{l.account_code}</strong> },
                  { key: 'account_name', label: 'Nombre' },
                  { key: 'line_concept', label: 'Concepto', render: (l) => l.line_concept || '—' },
                  {
                    key: 'debit',
                    label: 'Debe',
                    numeric: true,
                    render: (l) => (Number(l.debit) > 0 ? formatCurrency(l.debit) : '—'),
                  },
                  {
                    key: 'credit',
                    label: 'Haber',
                    numeric: true,
                    render: (l) => (Number(l.credit) > 0 ? formatCurrency(l.credit) : '—'),
                  },
                ]}
                rows={entry.lines}
                getRowKey={(line) => line.line_id}
                emptyTitle="Sin líneas"
              />
            </div>
          ))}

        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>
    </>
  );
}
