'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Field,
  Filters,
  NumberInput,
  Pagination,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { DEFAULT_PAGE_SIZE } from '@/lib/finance/constants';
import {
  availableInvoiceActions,
  invoiceFunctionalStatus,
  statusLabel,
  statusTone,
} from '@/components/finance/statusHelpers';

const INITIAL_FILTERS = {
  search: '',
  partyId: 'all',
  status: 'all',
  paymentStatus: 'all',
  seriesId: 'all',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  maxAmount: '',
  overdue: false,
};

/** Listado de facturas con filtrado, ordenación y paginación en servidor. */
export default function InvoiceListTab({
  catalog,
  direction = 'sale',
  reloadToken = 0,
  onView,
  onEdit,
  onRegisterPayment,
  onCreate,
}) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sort, setSort] = useState({ by: 'issue_date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', invoices: [], total: 0 });
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/facturas', {
        params: {
          direction,
          page,
          pageSize: DEFAULT_PAGE_SIZE,
          sortBy: sort.by,
          sortDir: sort.dir,
          search: filters.search,
          partyId: filters.partyId,
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          seriesId: filters.seriesId,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          minAmount: filters.minAmount,
          maxAmount: filters.maxAmount,
          overdue: filters.overdue ? 'true' : '',
        },
      });
      setState({
        loading: false,
        error: '',
        invoices: data.invoices || [],
        total: data.pagination?.total || 0,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, invoices: [], total: 0 });
    }
  }, [direction, page, sort, filters]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters, direction]);

  function updateFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function toggleSort(key) {
    setSort((prev) => ({ by: key, dir: prev.by === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  }

  async function issueInvoice(invoice) {
    setActionError('');
    try {
      await financeFetch(`/api/admin/finanzas/facturas/${invoice.id}/acciones`, {
        method: 'POST',
        body: { action: 'issue' },
      });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function deleteDraft(invoice) {
    setActionError('');
    try {
      await financeFetch(`/api/admin/finanzas/facturas/${invoice.id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setActionError(err.message);
    }
  }

  const isPurchase = direction === 'purchase';

  const columns = [
    {
      key: 'invoice_number',
      label: 'Número',
      sortable: true,
      render: (row) => (
        <button type="button" className={styles.link} onClick={() => onView?.(row.id)}>
          {row.invoice_number || 'Borrador'}
        </button>
      ),
    },
    { key: 'party_name', label: isPurchase ? 'Proveedor' : 'Cliente', sortable: true },
    { key: 'issue_date', label: 'Fecha', sortable: true, render: (row) => formatDate(row.issue_date) },
    {
      key: 'due_date',
      label: 'Vencimiento',
      sortable: true,
      render: (row) => formatDate(row.due_date),
    },
    {
      key: 'subtotal',
      label: 'Base',
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
      sortable: true,
      render: (row) => <span className={styles.strong}>{formatCurrency(row.total)}</span>,
    },
    {
      key: 'pending_amount',
      label: 'Pendiente',
      numeric: true,
      sortable: true,
      render: (row) =>
        Number(row.pending_amount) > 0 ? (
          formatCurrency(row.pending_amount)
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => {
        const status = invoiceFunctionalStatus(row);
        return <Badge tone={statusTone(status)}>{statusLabel(status, direction)}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => {
        const actions = availableInvoiceActions({ ...row, direction });
        return (
          <div className={styles.rowActions}>
            <Button size="small" onClick={() => onView?.(row.id)}>
              Ver
            </Button>
            {actions.includes('edit') && (
              <Button size="small" onClick={() => onEdit?.(row.id)}>
                Editar
              </Button>
            )}
            {actions.includes('issue') && (
              <Button size="small" variant="primary" onClick={() => issueInvoice(row)}>
                Emitir
              </Button>
            )}
            {(actions.includes('registerCollection') || actions.includes('registerPayment')) && (
              <Button size="small" variant="primary" onClick={() => onRegisterPayment?.(row)}>
                {isPurchase ? 'Pagar' : 'Cobrar'}
              </Button>
            )}
            {actions.includes('delete') && (
              <Button size="small" variant="danger" onClick={() => deleteDraft(row)}>
                Eliminar
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const partyOptions = (catalog?.parties || []).filter((p) =>
    isPurchase ? p.kind !== 'customer' : p.kind !== 'supplier',
  );
  const seriesOptions = (catalog?.series || []).filter((s) => s.direction === direction);

  return (
    <>
      <Card title="Filtros">
        <Filters>
          <Field label="Búsqueda" htmlFor="invoice-filter-search">
            <TextInput
              id="invoice-filter-search"
              value={filters.search}
              placeholder="Número o nombre"
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </Field>

          <Field label={isPurchase ? 'Proveedor' : 'Cliente'} htmlFor="invoice-filter-party">
            <Select
              id="invoice-filter-party"
              value={filters.partyId}
              onChange={(e) => updateFilter('partyId', e.target.value)}
            >
              <option value="all">Todos</option>
              {partyOptions.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.legal_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Estado documento" htmlFor="invoice-filter-status">
            <Select
              id="invoice-filter-status"
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="draft">Borrador</option>
              <option value="issued">Emitida</option>
              <option value="cancelled">Anulada</option>
            </Select>
          </Field>

          <Field label={isPurchase ? 'Estado de pago' : 'Estado de cobro'} htmlFor="invoice-filter-payment">
            <Select
              id="invoice-filter-payment"
              value={filters.paymentStatus}
              onChange={(e) => updateFilter('paymentStatus', e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
              <option value="paid">{isPurchase ? 'Pagada' : 'Cobrada'}</option>
            </Select>
          </Field>

          <Field label="Serie" htmlFor="invoice-filter-series">
            <Select
              id="invoice-filter-series"
              value={filters.seriesId}
              onChange={(e) => updateFilter('seriesId', e.target.value)}
            >
              <option value="all">Todas</option>
              {seriesOptions.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.code}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Desde" htmlFor="invoice-filter-from">
            <TextInput
              id="invoice-filter-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
            />
          </Field>

          <Field label="Hasta" htmlFor="invoice-filter-to">
            <TextInput
              id="invoice-filter-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
            />
          </Field>

          <Field label="Importe mínimo" htmlFor="invoice-filter-min">
            <NumberInput
              id="invoice-filter-min"
              step="0.01"
              value={filters.minAmount}
              onChange={(e) => updateFilter('minAmount', e.target.value)}
            />
          </Field>

          <Field label="Importe máximo" htmlFor="invoice-filter-max">
            <NumberInput
              id="invoice-filter-max"
              step="0.01"
              value={filters.maxAmount}
              onChange={(e) => updateFilter('maxAmount', e.target.value)}
            />
          </Field>

          <div className={styles.field}>
            <span className={styles.label}>Vencidas</span>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => updateFilter('overdue', e.target.checked)}
              />
              Solo vencidas
            </label>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>&nbsp;</span>
            <Button onClick={() => setFilters(INITIAL_FILTERS)}>Limpiar filtros</Button>
          </div>
        </Filters>
      </Card>

      {actionError && <p className={styles.errorBox}>{actionError}</p>}

      <Card
        flush
        title={isPurchase ? 'Facturas recibidas' : 'Facturas emitidas'}
        description={`${state.total} documento(s)`}
        actions={
          <Button variant="primary" onClick={onCreate}>
            {isPurchase ? '+ Nueva factura recibida' : '+ Nueva factura'}
          </Button>
        }
      >
        <DataTable
          columns={columns}
          rows={state.invoices}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          sortBy={sort.by}
          sortDir={sort.dir}
          onSort={toggleSort}
          emptyTitle="No hay facturas"
          emptyDescription={
            filters === INITIAL_FILTERS
              ? 'Crea la primera factura para empezar a facturar.'
              : 'Ninguna factura coincide con los filtros aplicados.'
          }
          emptyAction={
            <Button variant="primary" onClick={onCreate}>
              Crear factura
            </Button>
          }
        />
        <Pagination
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={state.total}
          onPageChange={setPage}
        />
      </Card>
    </>
  );
}
