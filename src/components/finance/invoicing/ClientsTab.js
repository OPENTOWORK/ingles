'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  DefinitionList,
  ErrorBanner,
  Field,
  Filters,
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
import { formatPartyAddress } from '@/lib/finance/party';
import { DEFAULT_PAGE_SIZE, PAYMENT_METHODS } from '@/lib/finance/constants';
import { invoiceFunctionalStatus, statusLabel, statusTone } from '@/components/finance/statusHelpers';

const EMPTY_FORM = {
  kind: 'customer',
  legal_name: '',
  trade_name: '',
  tax_id: '',
  email: '',
  phone: '',
  address_line: '',
  postal_code: '',
  city: '',
  province: '',
  country: 'ES',
  payment_terms_days: 30,
  payment_method: '',
  accounting_account_code: '',
  notes: '',
};

/**
 * Clientes y proveedores.
 * Es la única base de terceros del sistema: facturación, tesorería y
 * contabilidad referencian estos registros, no copias propias.
 */
export default function ClientsTab({ kind = 'customer', onChanged, reloadToken = 0 }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '', parties: [], total: 0 });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/clientes', {
        params: { search, kind, page, pageSize: DEFAULT_PAGE_SIZE },
      });
      setState({
        loading: false,
        error: '',
        parties: data.parties || [],
        total: data.pagination?.total || 0,
      });
    } catch (err) {
      setState({ loading: false, error: err.message, parties: [], total: 0 });
    }
  }, [search, kind, page]);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, kind });
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(party) {
    setEditingId(party.id);
    setForm({
      kind: party.kind || 'customer',
      legal_name: party.legal_name || '',
      trade_name: party.trade_name || '',
      tax_id: party.tax_id || '',
      email: party.email || '',
      phone: party.phone || '',
      address_line: party.address_line || '',
      postal_code: party.postal_code || '',
      city: party.city || '',
      province: party.province || '',
      country: party.country || 'ES',
      payment_terms_days: party.payment_terms_days ?? 30,
      payment_method: party.payment_method || '',
      accounting_account_code: party.accounting_account_code || '',
      notes: party.notes || '',
    });
    setFormError('');
    setFormOpen(true);
  }

  async function save() {
    if (!form.legal_name.trim()) {
      setFormError('La razón social es obligatoria.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        await financeFetch(`/api/admin/finanzas/clientes/${editingId}`, { method: 'PATCH', body: form });
      } else {
        await financeFetch('/api/admin/finanzas/clientes', { method: 'POST', body: form });
      }
      setFormOpen(false);
      load();
      onChanged?.();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isSupplier = kind === 'supplier';

  return (
    <>
      <Card title="Búsqueda">
        <Filters>
          <Field label="Nombre, NIF o email" htmlFor="party-search">
            <TextInput
              id="party-search"
              value={search}
              placeholder="Buscar…"
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </Field>
        </Filters>
      </Card>

      <Card
        flush
        title={isSupplier ? 'Proveedores' : 'Clientes'}
        description={`${state.total} ficha(s) · datos fiscales, facturación y saldo pendiente`}
        actions={
          <Button variant="primary" onClick={openCreate}>
            {isSupplier ? '+ Nuevo proveedor' : '+ Nuevo cliente'}
          </Button>
        }
      >
        <DataTable
          columns={[
            {
              key: 'legal_name',
              label: 'Razón social',
              render: (row) => (
                <div>
                  <button type="button" className={styles.link} onClick={() => setDetailId(row.id)}>
                    {row.legal_name}
                  </button>
                  {row.trade_name && <div className={styles.muted}>{row.trade_name}</div>}
                </div>
              ),
            },
            { key: 'tax_id', label: 'NIF/CIF', render: (row) => row.tax_id || '—' },
            { key: 'email', label: 'Email', render: (row) => row.email || '—' },
            { key: 'phone', label: 'Teléfono', render: (row) => row.phone || '—' },
            {
              key: 'payment_terms_days',
              label: 'Pago',
              render: (row) => `${row.payment_terms_days} días`,
            },
            { key: 'invoice_count', label: 'Facturas', numeric: true },
            {
              key: 'invoiced_total',
              label: 'Total facturado',
              numeric: true,
              render: (row) => formatCurrency(row.invoiced_total),
            },
            {
              key: 'pending_amount',
              label: isSupplier ? 'Pdte. pago' : 'Pdte. cobro',
              numeric: true,
              render: (row) =>
                Number(row.pending_amount) > 0 ? (
                  <span className={row.overdue_amount > 0 ? styles.negative : ''}>
                    {formatCurrency(row.pending_amount)}
                  </span>
                ) : (
                  <span className={styles.muted}>—</span>
                ),
            },
            {
              key: 'is_active',
              label: 'Estado',
              render: (row) => (
                <Badge tone={row.is_active ? 'success' : 'neutral'}>
                  {row.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              ),
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (row) => (
                <div className={styles.rowActions}>
                  <Button size="small" onClick={() => setDetailId(row.id)}>
                    Ver
                  </Button>
                  <Button size="small" onClick={() => openEdit(row)}>
                    Editar
                  </Button>
                </div>
              ),
            },
          ]}
          rows={state.parties}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle={isSupplier ? 'Sin proveedores' : 'Sin clientes'}
          emptyDescription="Da de alta el primer tercero para poder facturar."
          emptyAction={
            <Button variant="primary" onClick={openCreate}>
              {isSupplier ? 'Crear proveedor' : 'Crear cliente'}
            </Button>
          }
        />
        <Pagination page={page} pageSize={DEFAULT_PAGE_SIZE} total={state.total} onPageChange={setPage} />
      </Card>

      <Modal
        open={formOpen}
        wide
        onClose={saving ? undefined : () => setFormOpen(false)}
        title={editingId ? 'Editar ficha' : isSupplier ? 'Nuevo proveedor' : 'Nuevo cliente'}
        subtitle="Los datos fiscales se congelan en cada factura en el momento de emitirla."
        footer={
          <>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <ErrorBanner>{formError}</ErrorBanner>

        <div className={styles.filters}>
          <Field label="Tipo" htmlFor="party-kind">
            <Select
              id="party-kind"
              value={form.kind}
              onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
            >
              <option value="customer">Cliente</option>
              <option value="supplier">Proveedor</option>
              <option value="both">Cliente y proveedor</option>
            </Select>
          </Field>

          <Field label="Razón social *" htmlFor="party-legal-name">
            <TextInput
              id="party-legal-name"
              value={form.legal_name}
              onChange={(e) => setForm((p) => ({ ...p, legal_name: e.target.value }))}
            />
          </Field>

          <Field label="Nombre comercial" htmlFor="party-trade-name">
            <TextInput
              id="party-trade-name"
              value={form.trade_name}
              onChange={(e) => setForm((p) => ({ ...p, trade_name: e.target.value }))}
            />
          </Field>

          <Field label="NIF / CIF / VAT" htmlFor="party-tax-id">
            <TextInput
              id="party-tax-id"
              value={form.tax_id}
              onChange={(e) => setForm((p) => ({ ...p, tax_id: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Email" htmlFor="party-email">
            <TextInput
              id="party-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </Field>

          <Field label="Teléfono" htmlFor="party-phone">
            <TextInput
              id="party-phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </Field>

          <Field label="Dirección" htmlFor="party-address">
            <TextInput
              id="party-address"
              value={form.address_line}
              onChange={(e) => setForm((p) => ({ ...p, address_line: e.target.value }))}
            />
          </Field>

          <Field label="Código postal" htmlFor="party-postal">
            <TextInput
              id="party-postal"
              value={form.postal_code}
              onChange={(e) => setForm((p) => ({ ...p, postal_code: e.target.value }))}
            />
          </Field>

          <Field label="Población" htmlFor="party-city">
            <TextInput
              id="party-city"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
            />
          </Field>

          <Field label="Provincia" htmlFor="party-province">
            <TextInput
              id="party-province"
              value={form.province}
              onChange={(e) => setForm((p) => ({ ...p, province: e.target.value }))}
            />
          </Field>

          <Field label="País" htmlFor="party-country">
            <TextInput
              id="party-country"
              value={form.country}
              maxLength={2}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Días de pago" htmlFor="party-terms">
            <NumberInput
              id="party-terms"
              min="0"
              value={form.payment_terms_days}
              onChange={(e) => setForm((p) => ({ ...p, payment_terms_days: e.target.value }))}
            />
          </Field>

          <Field label="Forma de pago" htmlFor="party-method">
            <Select
              id="party-method"
              value={form.payment_method}
              onChange={(e) => setForm((p) => ({ ...p, payment_method: e.target.value }))}
            >
              <option value="">Sin especificar</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Cuenta contable"
            htmlFor="party-account"
            hint="Subcuenta propia, p. ej. 43000001"
          >
            <TextInput
              id="party-account"
              value={form.accounting_account_code}
              onChange={(e) => setForm((p) => ({ ...p, accounting_account_code: e.target.value }))}
            />
          </Field>
        </div>

        <Field label="Notas" htmlFor="party-notes">
          <TextArea
            id="party-notes"
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          />
        </Field>
      </Modal>

      <PartyDetailModal
        partyId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
        isSupplier={isSupplier}
      />
    </>
  );
}

/** Ficha de cliente: datos fiscales, totales y últimas operaciones. */
function PartyDetailModal({ partyId, open, onClose, isSupplier }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    if (!open || !partyId) return;
    let cancelled = false;
    setState({ loading: true, error: '', data: null });

    financeFetch(`/api/admin/finanzas/clientes/${partyId}`)
      .then((data) => !cancelled && setState({ loading: false, error: '', data }))
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: null }));

    return () => {
      cancelled = true;
    };
  }, [open, partyId]);

  const party = state.data?.party;

  return (
    <Modal
      open={open}
      wide
      onClose={onClose}
      title={party?.legal_name || 'Ficha'}
      subtitle={party?.tax_id || ''}
      footer={<Button onClick={onClose}>Cerrar</Button>}
    >
      {state.loading ? (
        <div className={styles.skeleton} style={{ height: 260 }} />
      ) : state.error ? (
        <ErrorBanner>{state.error}</ErrorBanner>
      ) : (
        <>
          <DefinitionList
            items={[
              { label: 'Nombre comercial', value: party.trade_name },
              { label: 'NIF/CIF', value: party.tax_id },
              { label: 'Dirección', value: formatPartyAddress(party) },
              { label: 'Email', value: party.email },
              { label: 'Teléfono', value: party.phone },
              { label: 'Forma de pago', value: party.payment_method },
              { label: 'Días de pago', value: `${party.payment_terms_days} días` },
              { label: 'Cuenta contable', value: party.accounting_account_code },
            ]}
          />

          <div className={styles.grid3}>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>Total facturado</p>
              <p className={styles.kpiValue}>{formatCurrency(state.data.summary.invoiced_total)}</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>{isSupplier ? 'Pagado' : 'Cobrado'}</p>
              <p className={styles.kpiValue}>{formatCurrency(state.data.summary.paid_total)}</p>
            </div>
            <div className={styles.kpi}>
              <p className={styles.kpiLabel}>{isSupplier ? 'Pdte. pago' : 'Pdte. cobro'}</p>
              <p className={styles.kpiValue}>{formatCurrency(state.data.summary.pending_amount)}</p>
              {state.data.summary.overdue_amount > 0 && (
                <p className={styles.kpiHint}>
                  Vencido: {formatCurrency(state.data.summary.overdue_amount)}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
              Facturas
            </p>
            <DataTable
              columns={[
                { key: 'invoice_number', label: 'Número', render: (r) => r.invoice_number || 'Borrador' },
                { key: 'issue_date', label: 'Fecha', render: (r) => formatDate(r.issue_date) },
                { key: 'due_date', label: 'Vencimiento', render: (r) => formatDate(r.due_date) },
                { key: 'total', label: 'Total', numeric: true, render: (r) => formatCurrency(r.total) },
                {
                  key: 'pending_amount',
                  label: 'Pendiente',
                  numeric: true,
                  render: (r) => formatCurrency(r.pending_amount),
                },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (r) => {
                    const status = invoiceFunctionalStatus(r);
                    return <Badge tone={statusTone(status)}>{statusLabel(status, r.direction)}</Badge>;
                  },
                },
              ]}
              rows={state.data.invoices.slice(0, 15)}
              emptyTitle="Sin facturas"
              emptyDescription="Este tercero todavía no tiene documentos asociados."
            />
          </div>

          {state.data.payments.length > 0 && (
            <div>
              <p className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
                Últimas operaciones
              </p>
              <DataTable
                columns={[
                  { key: 'payment_date', label: 'Fecha', render: (r) => formatDate(r.payment_date) },
                  {
                    key: 'direction',
                    label: 'Tipo',
                    render: (r) => (r.direction === 'sale' ? 'Cobro' : 'Pago'),
                  },
                  { key: 'reference', label: 'Referencia', render: (r) => r.reference || '—' },
                  {
                    key: 'amount',
                    label: 'Importe',
                    numeric: true,
                    render: (r) => formatCurrency(r.amount),
                  },
                ]}
                rows={state.data.payments}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
