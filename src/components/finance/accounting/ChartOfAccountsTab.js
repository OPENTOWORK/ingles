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
  Pagination,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { ACCOUNT_TYPE_LABELS, DEFAULT_PAGE_SIZE } from '@/lib/finance/constants';

const EMPTY_FORM = { code: '', name: '', account_type: 'asset' };

/** Plan General Contable con alta de subcuentas. */
export default function ChartOfAccountsTab({ reloadToken = 0, onChanged, onOpenLedger }) {
  const [filters, setFilters] = useState({ search: '', accountType: 'all' });
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', accounts: [], total: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/contabilidad/plan', {
        params: { ...filters, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        accounts: data.accounts || [],
        total: data.pagination?.total || 0,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, accounts: [], total: 0 });
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  async function save() {
    setSaving(true);
    setFormError('');
    try {
      await financeFetch('/api/admin/finanzas/contabilidad/plan', { method: 'POST', body: form });
      setFormOpen(false);
      setForm(EMPTY_FORM);
      load();
      onChanged?.();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <InfoBanner>
        Las cuentas del Plan General Contable vienen precargadas y no se pueden renombrar ni eliminar.
        Puedes crear subcuentas propias, por ejemplo <strong>43000001</strong> para un cliente concreto.
      </InfoBanner>

      <Card title="Búsqueda">
        <Filters>
          <Field label="Código o nombre" htmlFor="chart-search">
            <TextInput
              id="chart-search"
              value={filters.search}
              placeholder="430 o Clientes"
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </Field>

          <Field label="Tipo" htmlFor="chart-type">
            <Select
              id="chart-type"
              value={filters.accountType}
              onChange={(e) => setFilters((p) => ({ ...p, accountType: e.target.value }))}
            >
              <option value="all">Todos</option>
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </Filters>
      </Card>

      <Card
        flush
        title="Plan contable"
        description={`${state.total} cuenta(s)`}
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormError('');
              setFormOpen(true);
            }}
          >
            + Nueva subcuenta
          </Button>
        }
      >
        <DataTable
          columns={[
            { key: 'code', label: 'Código', render: (r) => <strong>{r.code}</strong> },
            { key: 'name', label: 'Nombre' },
            {
              key: 'account_type',
              label: 'Tipo',
              render: (r) => ACCOUNT_TYPE_LABELS[r.account_type] || r.account_type,
            },
            { key: 'level', label: 'Nivel', numeric: true },
            { key: 'parent_code', label: 'Cuenta padre', render: (r) => r.parent_code || '—' },
            {
              key: 'is_seed',
              label: 'Origen',
              render: (r) => (r.is_seed ? <Badge tone="neutral">PGC</Badge> : <Badge tone="info">Propia</Badge>),
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
            {
              key: 'actions',
              label: 'Acciones',
              render: (r) => (
                <div className={styles.rowActions}>
                  <Button size="small" onClick={() => onOpenLedger?.(r.code)}>
                    Ver mayor
                  </Button>
                </div>
              ),
            },
          ]}
          rows={state.accounts}
          getRowKey={(row) => row.code}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin cuentas"
          emptyDescription="Ninguna cuenta coincide con la búsqueda."
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>

      <Modal
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        title="Nueva subcuenta"
        subtitle="El tipo debe coincidir con el de la cuenta de tres dígitos de la que cuelga."
        footer={
          <>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save} disabled={saving || !form.code || !form.name}>
              {saving ? 'Creando…' : 'Crear cuenta'}
            </Button>
          </>
        }
      >
        <ErrorBanner>{formError}</ErrorBanner>

        <div className={styles.filters}>
          <Field label="Código *" htmlFor="account-code" hint="Entre 3 y 8 dígitos">
            <TextInput
              id="account-code"
              value={form.code}
              placeholder="43000001"
              inputMode="numeric"
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.replace(/\D/g, '') }))}
            />
          </Field>

          <Field label="Nombre *" htmlFor="account-name">
            <TextInput
              id="account-name"
              value={form.name}
              placeholder="Cliente ABC"
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>

          <Field label="Tipo *" htmlFor="account-type">
            <Select
              id="account-type"
              value={form.account_type}
              onChange={(e) => setForm((p) => ({ ...p, account_type: e.target.value }))}
            >
              {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </>
  );
}
