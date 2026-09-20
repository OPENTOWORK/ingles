'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  Field,
  Filters,
  KpiGrid,
  MoneyKpi,
  Pagination,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { DEFAULT_PAGE_SIZE } from '@/lib/finance/constants';
import { invoiceFunctionalStatus, statusLabel, statusTone } from '@/components/finance/statusHelpers';

/**
 * Cuentas por cobrar y por pagar.
 * Es la misma pantalla para ambos sentidos: cambia el endpoint y los rótulos.
 */
export default function OpenItemsTab({ direction = 'sale', reloadToken = 0, onRegister, catalog }) {
  const isCollection = direction === 'sale';
  const endpoint = isCollection
    ? '/api/admin/finanzas/tesoreria/cobros'
    : '/api/admin/finanzas/tesoreria/pagos';

  const [filters, setFilters] = useState({ status: 'open', partyId: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', items: [], total: 0, totals: null });

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch(endpoint, {
        params: { ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        items: data.items || [],
        total: data.pagination?.total || 0,
        totals: data.totals || null,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, items: [], total: 0, totals: null });
    }
  }, [endpoint, filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters, direction]);

  const partyOptions = (catalog?.parties || []).filter((p) =>
    isCollection ? p.kind !== 'supplier' : p.kind !== 'customer',
  );

  return (
    <>
      {state.totals && (
        <KpiGrid>
          <MoneyKpi label="Total facturado" amount={state.totals.total} />
          <MoneyKpi label={isCollection ? 'Cobrado' : 'Pagado'} amount={state.totals.paid} />
          <MoneyKpi label="Pendiente" amount={state.totals.pending} accent />
          <MoneyKpi label="Vencido" amount={state.totals.overdue} signed={state.totals.overdue > 0} />
        </KpiGrid>
      )}

      <Card title="Filtros">
        <Filters>
          <Field label="Estado" htmlFor="open-status">
            <Select
              id="open-status"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="open">Abiertas</option>
              <option value="pending">Pendientes</option>
              <option value="partial">Parciales</option>
              <option value="overdue">Vencidas</option>
              <option value="paid">{isCollection ? 'Cobradas' : 'Pagadas'}</option>
              <option value="all">Todas</option>
            </Select>
          </Field>

          <Field label={isCollection ? 'Cliente' : 'Proveedor'} htmlFor="open-party">
            <Select
              id="open-party"
              value={filters.partyId}
              onChange={(e) => setFilters((p) => ({ ...p, partyId: e.target.value }))}
            >
              <option value="all">Todos</option>
              {partyOptions.map((party) => (
                <option key={party.id} value={party.id}>
                  {party.legal_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Búsqueda" htmlFor="open-search">
            <TextInput
              id="open-search"
              value={filters.search}
              placeholder="Número o nombre"
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </Field>
        </Filters>
      </Card>

      <Card
        flush
        title={isCollection ? 'Cuentas por cobrar' : 'Cuentas por pagar'}
        description={`${state.total} factura(s)`}
      >
        <DataTable
          columns={[
            { key: 'party_name', label: isCollection ? 'Cliente' : 'Proveedor' },
            {
              key: 'invoice_number',
              label: 'Factura',
              render: (r) => <strong>{r.invoice_number || '—'}</strong>,
            },
            { key: 'issue_date', label: 'Fecha', render: (r) => formatDate(r.issue_date) },
            {
              key: 'due_date',
              label: 'Vencimiento',
              render: (r) => (
                <span className={r.is_overdue ? styles.negative : ''}>{formatDate(r.due_date)}</span>
              ),
            },
            { key: 'total', label: 'Total', numeric: true, render: (r) => formatCurrency(r.total) },
            {
              key: 'paid_amount',
              label: isCollection ? 'Cobrado' : 'Pagado',
              numeric: true,
              render: (r) => formatCurrency(r.paid_amount),
            },
            {
              key: 'pending_amount',
              label: 'Pendiente',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.pending_amount)}</strong>,
            },
            {
              key: 'status',
              label: 'Estado',
              render: (r) => {
                const status = invoiceFunctionalStatus(r);
                return <Badge tone={statusTone(status)}>{statusLabel(status, direction)}</Badge>;
              },
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (r) =>
                Number(r.pending_amount) > 0 ? (
                  <div className={styles.rowActions}>
                    <Button size="small" variant="primary" onClick={() => onRegister?.(r)}>
                      {isCollection ? 'Registrar cobro' : 'Registrar pago'}
                    </Button>
                  </div>
                ) : (
                  <span className={styles.muted}>—</span>
                ),
            },
          ]}
          rows={state.items}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle={isCollection ? 'Nada pendiente de cobro' : 'Nada pendiente de pago'}
          emptyDescription={
            isCollection
              ? 'Todas las facturas emitidas están cobradas.'
              : 'No hay facturas de proveedor pendientes de pago.'
          }
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>
    </>
  );
}
