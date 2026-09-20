'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorBanner,
  Field,
  Filters,
  InfoBanner,
  Kpi,
  KpiGrid,
  Modal,
  Pagination,
  Select,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import {
  DEFAULT_PAGE_SIZE,
  MOVEMENT_KIND_LABELS,
  RECONCILIATION_LABELS,
  RECONCILIATION_TONE,
} from '@/lib/finance/constants';

/**
 * Conciliación de tesorería.
 * El sistema propone coincidencias por importe, nombre y número de factura;
 * la confirmación siempre es manual.
 */
export default function ReconciliationTab({ catalog, reloadToken = 0, onChanged }) {
  const [filters, setFilters] = useState({ status: 'pending', accountId: 'all' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    loading: true,
    error: '',
    movements: [],
    total: 0,
    counters: { pending: 0, unidentified: 0 },
  });
  const [target, setTarget] = useState(null);
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/tesoreria/conciliacion', {
        params: { ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        movements: data.movements || [],
        total: data.pagination?.total || 0,
        counters: data.counters || { pending: 0, unidentified: 0 },
      });
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false, error: err.message, movements: [] }));
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  async function markStatus(movement, status) {
    setActionError('');
    try {
      await financeFetch('/api/admin/finanzas/tesoreria/conciliacion', {
        method: 'POST',
        body: { movement_id: movement.id, status },
      });
      load();
      onChanged?.(status === 'reconciled' ? 'Movimiento conciliado.' : 'Movimiento marcado.');
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <>
      <InfoBanner>
        Los cobros y pagos registrados desde el sistema ya quedan enlazados a su factura. Esta pantalla
        resuelve los movimientos sueltos: ajustes, transferencias y, en el futuro, importaciones
        bancarias por CSV o PSD2, que se identificarán por su referencia externa.
      </InfoBanner>

      <ErrorBanner>{actionError}</ErrorBanner>

      <KpiGrid>
        <Kpi
          label="Pendientes de conciliar"
          value={state.counters.pending}
          tone={state.counters.pending > 0 ? 'negative' : 'positive'}
        />
        <Kpi
          label="No identificados"
          value={state.counters.unidentified}
          tone={state.counters.unidentified > 0 ? 'negative' : 'positive'}
        />
      </KpiGrid>

      <Card title="Filtros">
        <Filters>
          <Field label="Estado" htmlFor="recon-status">
            <Select
              id="recon-status"
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="pending">Pendientes</option>
              <option value="unidentified">No identificados</option>
              <option value="reconciled">Conciliados</option>
              <option value="all">Todos</option>
            </Select>
          </Field>

          <Field label="Cuenta" htmlFor="recon-account">
            <Select
              id="recon-account"
              value={filters.accountId}
              onChange={(e) => setFilters((p) => ({ ...p, accountId: e.target.value }))}
            >
              <option value="all">Todas</option>
              {(catalog?.treasuryAccounts || []).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </Field>
        </Filters>
      </Card>

      <Card flush title="Movimientos" description={`${state.total} movimiento(s)`}>
        <DataTable
          columns={[
            { key: 'movement_date', label: 'Fecha', render: (r) => formatDate(r.movement_date) },
            { key: 'concept', label: 'Concepto' },
            { key: 'account', label: 'Cuenta', render: (r) => r.treasury_account?.name || '—' },
            {
              key: 'kind',
              label: 'Tipo',
              render: (r) => MOVEMENT_KIND_LABELS[r.kind] || r.kind,
            },
            {
              key: 'amount',
              label: 'Importe',
              numeric: true,
              render: (r) =>
                Number(r.amount_in) > 0 ? (
                  <span className={styles.positive}>+{formatCurrency(r.amount_in)}</span>
                ) : (
                  <span className={styles.negative}>−{formatCurrency(r.amount_out)}</span>
                ),
            },
            {
              key: 'suggestions',
              label: 'Coincidencias',
              render: (r) =>
                r.suggestions?.length ? (
                  <Badge tone="info">{r.suggestions.length} posible(s)</Badge>
                ) : r.payment_id ? (
                  <span className={styles.muted}>Enlazado a factura</span>
                ) : (
                  <span className={styles.muted}>—</span>
                ),
            },
            {
              key: 'reconciliation_status',
              label: 'Estado',
              render: (r) => (
                <Badge tone={RECONCILIATION_TONE[r.reconciliation_status] || 'neutral'}>
                  {RECONCILIATION_LABELS[r.reconciliation_status] || r.reconciliation_status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (r) =>
                r.reconciliation_status === 'reconciled' ? (
                  <span className={styles.muted}>—</span>
                ) : (
                  <div className={styles.rowActions}>
                    {r.suggestions?.length > 0 && (
                      <Button size="small" variant="primary" onClick={() => setTarget(r)}>
                        Conciliar
                      </Button>
                    )}
                    <Button size="small" onClick={() => markStatus(r, 'reconciled')}>
                      Marcar conciliado
                    </Button>
                    {r.reconciliation_status !== 'unidentified' && (
                      <Button size="small" onClick={() => markStatus(r, 'unidentified')}>
                        No identificado
                      </Button>
                    )}
                  </div>
                ),
            },
          ]}
          rows={state.movements}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Nada que conciliar"
          emptyDescription="Todos los movimientos están conciliados."
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>

      <MatchModal
        movement={target}
        onClose={() => setTarget(null)}
        onReconciled={() => {
          load();
          onChanged?.('Movimiento conciliado con su factura.');
        }}
      />
    </>
  );
}

/** Selección de la factura con la que se concilia el movimiento. */
function MatchModal({ movement, onClose, onReconciled }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (movement) setError('');
  }, [movement]);

  async function reconcile(invoiceId) {
    setSaving(true);
    setError('');
    try {
      await financeFetch('/api/admin/finanzas/tesoreria/conciliacion', {
        method: 'POST',
        body: { movement_id: movement.id, invoice_id: invoiceId },
      });
      onReconciled?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!movement) return null;

  const isInflow = Number(movement.amount_in) > 0;
  const amount = isInflow ? movement.amount_in : movement.amount_out;

  return (
    <Modal
      open
      wide
      onClose={saving ? undefined : onClose}
      title="Conciliar movimiento"
      subtitle={`${movement.concept} · ${formatDate(movement.movement_date)}`}
      footer={<Button onClick={onClose}>Cerrar</Button>}
    >
      <ErrorBanner>{error}</ErrorBanner>

      <div className={styles.kpi}>
        <p className={styles.kpiLabel}>Importe del movimiento</p>
        <p className={`${styles.kpiValue} ${isInflow ? styles.positive : styles.negative}`}>
          {isInflow ? '+' : '−'}
          {formatCurrency(amount)}
        </p>
      </div>

      <p className={styles.cardDesc}>
        Al conciliar se registra el {isInflow ? 'cobro' : 'pago'} sobre la factura seleccionada, se
        actualiza su estado y se genera el asiento contable correspondiente.
      </p>

      <DataTable
        columns={[
          { key: 'invoice_number', label: 'Factura', render: (r) => <strong>{r.invoice_number}</strong> },
          { key: 'party_name', label: 'Tercero' },
          { key: 'due_date', label: 'Vencimiento', render: (r) => formatDate(r.due_date) },
          {
            key: 'pending_amount',
            label: 'Pendiente',
            numeric: true,
            render: (r) => formatCurrency(r.pending_amount),
          },
          {
            key: 'reasons',
            label: 'Motivo de la coincidencia',
            render: (r) => r.reasons?.join(' · ') || '—',
          },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <Button size="small" variant="primary" disabled={saving} onClick={() => reconcile(r.id)}>
                {saving ? 'Conciliando…' : 'Conciliar'}
              </Button>
            ),
          },
        ]}
        rows={movement.suggestions || []}
        emptyTitle="Sin coincidencias"
        emptyDescription="No hay facturas pendientes que encajen con este movimiento."
      />
    </Modal>
  );
}
