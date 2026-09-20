'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorBanner,
  Field,
  InfoBanner,
  Modal,
  NumberInput,
  Select,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, maskIban } from '@/lib/finance/money';
import { TREASURY_ACCOUNT_KIND_LABELS } from '@/lib/finance/constants';

const EMPTY_FORM = {
  name: '',
  kind: 'bank',
  bank_name: '',
  iban: '',
  currency: 'EUR',
  opening_balance: 0,
};

/** Cuentas bancarias, cajas y otros medios de pago. */
export default function TreasuryAccountsTab({ reloadToken = 0, onChanged }) {
  const [state, setState] = useState({ loading: true, error: '', accounts: [] });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/tesoreria/cuentas');
      setState({ loading: false, error: '', accounts: data.accounts || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, accounts: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(account) {
    setEditingId(account.id);
    setForm({
      name: account.name,
      kind: account.kind,
      bank_name: account.bank_name || '',
      // El IBAN completo no se envía al cliente: se reintroduce solo si se quiere cambiar.
      iban: '',
      currency: account.currency,
      opening_balance: account.opening_balance,
    });
    setFormError('');
    setFormOpen(true);
  }

  async function save() {
    setSaving(true);
    setFormError('');
    try {
      if (editingId) {
        const payload = { id: editingId, name: form.name, bank_name: form.bank_name };
        if (form.iban) payload.iban = form.iban;
        await financeFetch('/api/admin/finanzas/tesoreria/cuentas', { method: 'PATCH', body: payload });
      } else {
        await financeFetch('/api/admin/finanzas/tesoreria/cuentas', { method: 'POST', body: form });
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

  async function toggleActive(account) {
    try {
      await financeFetch('/api/admin/finanzas/tesoreria/cuentas', {
        method: 'PATCH',
        body: { id: account.id, is_active: !account.is_active },
      });
      load();
      onChanged?.();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  }

  return (
    <>
      <InfoBanner>
        El IBAN se muestra siempre enmascarado y el servidor nunca lo envía completo al navegador. El
        saldo de cada cuenta lo recalcula la base de datos a partir de sus movimientos reales.
      </InfoBanner>

      <Card
        flush
        title="Cuentas de tesorería"
        description={`${state.accounts.length} cuenta(s)`}
        actions={
          <Button variant="primary" onClick={openCreate}>
            + Nueva cuenta
          </Button>
        }
      >
        <DataTable
          columns={[
            { key: 'name', label: 'Nombre', render: (r) => <strong>{r.name}</strong> },
            {
              key: 'kind',
              label: 'Tipo',
              render: (r) => TREASURY_ACCOUNT_KIND_LABELS[r.kind] || r.kind,
            },
            { key: 'bank_name', label: 'Entidad', render: (r) => r.bank_name || '—' },
            { key: 'iban', label: 'IBAN', render: (r) => (r.iban ? maskIban(r.iban) : '—') },
            { key: 'currency', label: 'Moneda' },
            {
              key: 'accounting_account_code',
              label: 'Cuenta contable',
              render: (r) => r.accounting_account_code || '—',
            },
            {
              key: 'opening_balance',
              label: 'Saldo inicial',
              numeric: true,
              render: (r) => formatCurrency(r.opening_balance, r.currency),
            },
            {
              key: 'current_balance',
              label: 'Saldo actual',
              numeric: true,
              render: (r) => <strong>{formatCurrency(r.current_balance, r.currency)}</strong>,
            },
            { key: 'movement_count', label: 'Movimientos', numeric: true },
            {
              key: 'unreconciled_count',
              label: 'Sin conciliar',
              numeric: true,
              render: (r) =>
                r.unreconciled_count > 0 ? (
                  <span className={styles.negative}>{r.unreconciled_count}</span>
                ) : (
                  <span className={styles.muted}>0</span>
                ),
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
                  <Button size="small" onClick={() => openEdit(r)}>
                    Editar
                  </Button>
                  <Button size="small" onClick={() => toggleActive(r)}>
                    {r.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              ),
            },
          ]}
          rows={state.accounts}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin cuentas de tesorería"
          emptyDescription="Crea tu primera cuenta bancaria o caja para registrar cobros y pagos."
          emptyAction={
            <Button variant="primary" onClick={openCreate}>
              Crear cuenta
            </Button>
          }
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        title={editingId ? 'Editar cuenta' : 'Nueva cuenta de tesorería'}
        subtitle={
          editingId
            ? 'El tipo, la moneda y el saldo inicial no se modifican una vez hay movimientos.'
            : 'El saldo inicial es el punto de partida; a partir de ahí lo calculan los movimientos.'
        }
        footer={
          <>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save} disabled={saving || !form.name.trim()}>
              {saving ? 'Guardando…' : 'Guardar'}
            </Button>
          </>
        }
      >
        <ErrorBanner>{formError}</ErrorBanner>

        <div className={styles.filters}>
          <Field label="Nombre *" htmlFor="account-name">
            <TextInput
              id="account-name"
              value={form.name}
              placeholder="BBVA principal"
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>

          <Field label="Tipo" htmlFor="account-kind">
            <Select
              id="account-kind"
              value={form.kind}
              disabled={Boolean(editingId)}
              onChange={(e) => setForm((p) => ({ ...p, kind: e.target.value }))}
            >
              {Object.entries(TREASURY_ACCOUNT_KIND_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Entidad" htmlFor="account-bank">
            <TextInput
              id="account-bank"
              value={form.bank_name}
              onChange={(e) => setForm((p) => ({ ...p, bank_name: e.target.value }))}
            />
          </Field>

          <Field
            label="IBAN"
            htmlFor="account-iban"
            hint={editingId ? 'Déjalo vacío para no cambiarlo' : 'Opcional'}
          >
            <TextInput
              id="account-iban"
              value={form.iban}
              placeholder="ES91 2100 0418 4502 0005 1332"
              onChange={(e) => setForm((p) => ({ ...p, iban: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Moneda" htmlFor="account-currency">
            <TextInput
              id="account-currency"
              value={form.currency}
              maxLength={3}
              disabled={Boolean(editingId)}
              onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Saldo inicial" htmlFor="account-opening">
            <NumberInput
              id="account-opening"
              step="0.01"
              value={form.opening_balance}
              disabled={Boolean(editingId)}
              onChange={(e) => setForm((p) => ({ ...p, opening_balance: e.target.value }))}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
