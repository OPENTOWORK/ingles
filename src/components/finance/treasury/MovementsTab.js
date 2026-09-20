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
  Modal,
  NumberInput,
  Pagination,
  Select,
  TextArea,
  TextInput,
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

const INITIAL_FILTERS = {
  accountId: 'all',
  kind: 'all',
  reconciliation: 'all',
  dateFrom: '',
  dateTo: '',
  minAmount: '',
  search: '',
};

/** Movimientos reales de tesorería, con alta de ajustes y transferencias. */
export default function MovementsTab({ catalog, reloadToken = 0, onChanged }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', movements: [], total: 0, totals: null });
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/tesoreria/movimientos', {
        params: { ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        movements: data.movements || [],
        total: data.pagination?.total || 0,
        totals: data.pageTotals || null,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, movements: [], total: 0, totals: null });
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const accounts = catalog?.treasuryAccounts || [];
  const singleAccount = filters.accountId !== 'all';

  const columns = [
    { key: 'movement_date', label: 'Fecha', render: (r) => formatDate(r.movement_date) },
    { key: 'concept', label: 'Concepto' },
    { key: 'account', label: 'Cuenta', render: (r) => r.treasury_account?.name || '—' },
    {
      key: 'kind',
      label: 'Tipo',
      render: (r) => (
        <Badge tone={r.kind === 'collection' ? 'success' : r.kind === 'payment' ? 'warning' : 'neutral'}>
          {MOVEMENT_KIND_LABELS[r.kind] || r.kind}
        </Badge>
      ),
    },
    {
      key: 'document',
      label: 'Documento',
      render: (r) => r.reference || (r.document_type === 'invoice' ? 'Factura' : '—'),
    },
    {
      key: 'amount_in',
      label: 'Entrada',
      numeric: true,
      render: (r) =>
        Number(r.amount_in) > 0 ? (
          <span className={styles.positive}>+{formatCurrency(r.amount_in)}</span>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    {
      key: 'amount_out',
      label: 'Salida',
      numeric: true,
      render: (r) =>
        Number(r.amount_out) > 0 ? (
          <span className={styles.negative}>−{formatCurrency(r.amount_out)}</span>
        ) : (
          <span className={styles.muted}>—</span>
        ),
    },
    {
      key: 'reconciliation_status',
      label: 'Conciliación',
      render: (r) => (
        <Badge tone={RECONCILIATION_TONE[r.reconciliation_status] || 'neutral'}>
          {RECONCILIATION_LABELS[r.reconciliation_status] || r.reconciliation_status}
        </Badge>
      ),
    },
  ];

  if (singleAccount) {
    columns.splice(8, 0, {
      key: 'balance',
      label: 'Saldo',
      numeric: true,
      render: (r) => (r.balance === undefined ? '—' : <strong>{formatCurrency(r.balance)}</strong>),
    });
  }

  return (
    <>
      <Card title="Filtros">
        <Filters>
          <Field label="Cuenta" htmlFor="movement-account">
            <Select
              id="movement-account"
              value={filters.accountId}
              onChange={(e) => setFilters((p) => ({ ...p, accountId: e.target.value }))}
            >
              <option value="all">Todas</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Tipo" htmlFor="movement-kind">
            <Select
              id="movement-kind"
              value={filters.kind}
              onChange={(e) => setFilters((p) => ({ ...p, kind: e.target.value }))}
            >
              <option value="all">Todos</option>
              {Object.entries(MOVEMENT_KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Conciliación" htmlFor="movement-reconciliation">
            <Select
              id="movement-reconciliation"
              value={filters.reconciliation}
              onChange={(e) => setFilters((p) => ({ ...p, reconciliation: e.target.value }))}
            >
              <option value="all">Todos</option>
              {Object.entries(RECONCILIATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Desde" htmlFor="movement-from">
            <TextInput
              id="movement-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))}
            />
          </Field>

          <Field label="Hasta" htmlFor="movement-to">
            <TextInput
              id="movement-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))}
            />
          </Field>

          <Field label="Importe mínimo" htmlFor="movement-min">
            <NumberInput
              id="movement-min"
              step="0.01"
              value={filters.minAmount}
              onChange={(e) => setFilters((p) => ({ ...p, minAmount: e.target.value }))}
            />
          </Field>

          <Field label="Concepto" htmlFor="movement-search">
            <TextInput
              id="movement-search"
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </Field>

          <div className={styles.field}>
            <span className={styles.label}>&nbsp;</span>
            <Button onClick={() => setFilters(INITIAL_FILTERS)}>Limpiar filtros</Button>
          </div>
        </Filters>
      </Card>

      {!singleAccount && (
        <InfoBanner>
          Selecciona una cuenta concreta para ver la columna de saldo acumulado.
        </InfoBanner>
      )}

      <Card
        flush
        title="Movimientos"
        description={`${state.total} movimiento(s)`}
        actions={
          <Button variant="primary" onClick={() => setFormOpen(true)}>
            + Ajuste o transferencia
          </Button>
        }
      >
        <DataTable
          columns={columns}
          rows={state.movements}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin movimientos"
          emptyDescription="Los cobros y pagos generan movimientos automáticamente."
          footer={
            state.totals ? (
              <tr>
                <td colSpan={singleAccount ? 5 : 5}>Totales de la página</td>
                <td className={styles.numeric}>{formatCurrency(state.totals.amount_in)}</td>
                <td className={styles.numeric}>{formatCurrency(state.totals.amount_out)}</td>
                <td colSpan={singleAccount ? 2 : 1} />
              </tr>
            ) : null
          }
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>

      <MovementFormModal
        open={formOpen}
        accounts={accounts}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          load();
          onChanged?.('Movimiento registrado.');
        }}
      />
    </>
  );
}

/** Alta de ajuste o transferencia entre cuentas propias. */
function MovementFormModal({ open, accounts, onClose, onSaved }) {
  const [form, setForm] = useState({
    mode: 'adjustment',
    treasury_account_id: '',
    target_account_id: '',
    movement_date: new Date().toISOString().slice(0, 10),
    concept: '',
    direction: 'in',
    amount: '',
    reference: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({
      mode: 'adjustment',
      treasury_account_id: accounts[0]?.id || '',
      target_account_id: accounts[1]?.id || '',
      movement_date: new Date().toISOString().slice(0, 10),
      concept: '',
      direction: 'in',
      amount: '',
      reference: '',
      notes: '',
    });
  }, [open, accounts]);

  const amount = Number(String(form.amount).replace(',', '.'));
  const isTransfer = form.mode === 'transfer';
  const valid =
    Number.isFinite(amount) &&
    amount > 0 &&
    form.treasury_account_id &&
    form.concept.trim() &&
    (!isTransfer || (form.target_account_id && form.target_account_id !== form.treasury_account_id));

  async function submit() {
    setSaving(true);
    setError('');
    try {
      const body = isTransfer
        ? {
            kind: 'transfer',
            treasury_account_id: form.treasury_account_id,
            target_account_id: form.target_account_id,
            movement_date: form.movement_date,
            concept: form.concept,
            amount,
            reference: form.reference,
            notes: form.notes,
          }
        : {
            kind: 'adjustment',
            treasury_account_id: form.treasury_account_id,
            movement_date: form.movement_date,
            concept: form.concept,
            amount_in: form.direction === 'in' ? amount : 0,
            amount_out: form.direction === 'out' ? amount : 0,
            reference: form.reference,
            notes: form.notes,
          };

      await financeFetch('/api/admin/finanzas/tesoreria/movimientos', { method: 'POST', body });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title="Nuevo movimiento"
      subtitle="Los cobros y pagos de facturas se registran desde Cobros y Pagos para conservar la trazabilidad."
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving || !valid}>
            {saving ? 'Registrando…' : 'Registrar'}
          </Button>
        </>
      }
    >
      <ErrorBanner>{error}</ErrorBanner>

      <div className={styles.filters}>
        <Field label="Tipo de movimiento" htmlFor="mov-mode">
          <Select
            id="mov-mode"
            value={form.mode}
            onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
          >
            <option value="adjustment">Ajuste</option>
            <option value="transfer">Transferencia entre cuentas</option>
          </Select>
        </Field>

        <Field label={isTransfer ? 'Cuenta de origen' : 'Cuenta'} htmlFor="mov-account">
          <Select
            id="mov-account"
            value={form.treasury_account_id}
            onChange={(e) => setForm((p) => ({ ...p, treasury_account_id: e.target.value }))}
          >
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {formatCurrency(account.current_balance)}
              </option>
            ))}
          </Select>
        </Field>

        {isTransfer && (
          <Field label="Cuenta de destino" htmlFor="mov-target">
            <Select
              id="mov-target"
              value={form.target_account_id}
              onChange={(e) => setForm((p) => ({ ...p, target_account_id: e.target.value }))}
            >
              {accounts
                .filter((account) => account.id !== form.treasury_account_id)
                .map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
            </Select>
          </Field>
        )}

        {!isTransfer && (
          <Field label="Sentido" htmlFor="mov-direction">
            <Select
              id="mov-direction"
              value={form.direction}
              onChange={(e) => setForm((p) => ({ ...p, direction: e.target.value }))}
            >
              <option value="in">Entrada</option>
              <option value="out">Salida</option>
            </Select>
          </Field>
        )}

        <Field label="Fecha" htmlFor="mov-date">
          <TextInput
            id="mov-date"
            type="date"
            value={form.movement_date}
            onChange={(e) => setForm((p) => ({ ...p, movement_date: e.target.value }))}
          />
        </Field>

        <Field label="Importe" htmlFor="mov-amount">
          <NumberInput
            id="mov-amount"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
          />
        </Field>

        <Field label="Concepto" htmlFor="mov-concept">
          <TextInput
            id="mov-concept"
            value={form.concept}
            onChange={(e) => setForm((p) => ({ ...p, concept: e.target.value }))}
          />
        </Field>

        <Field label="Referencia" htmlFor="mov-reference">
          <TextInput
            id="mov-reference"
            value={form.reference}
            onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
          />
        </Field>
      </div>

      <Field label="Notas" htmlFor="mov-notes">
        <TextArea
          id="mov-notes"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        />
      </Field>
    </Modal>
  );
}
