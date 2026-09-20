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
import { DEFAULT_TAX_RATES } from '@/lib/finance/constants';

const EMPTY_FORM = {
  code: '',
  name: '',
  direction: 'sale',
  prefix: '',
  padding: 4,
  include_year: true,
  is_rectificative: false,
  default_income_account_code: '',
  default_tax_rate: 21,
};

/** Series de facturación y su numeración. */
export default function SeriesTab({ catalog, onChanged }) {
  const [state, setState] = useState({ loading: true, error: '', series: [] });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/series');
      setState({ loading: false, error: '', series: data.series || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, series: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setFormError('');
    try {
      await financeFetch('/api/admin/finanzas/series', { method: 'POST', body: form });
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

  async function toggleActive(series) {
    try {
      await financeFetch('/api/admin/finanzas/series', {
        method: 'PATCH',
        body: { id: series.id, is_active: !series.is_active },
      });
      load();
      onChanged?.();
    } catch (err) {
      setState((prev) => ({ ...prev, error: err.message }));
    }
  }

  const accountOptions = catalog?.accounts || [];

  return (
    <>
      <InfoBanner>
        La numeración se asigna en el momento de emitir, dentro de una transacción que bloquea la
        serie. Por eso no puede haber huecos ni números duplicados aunque se emitan varias facturas a
        la vez.
      </InfoBanner>

      <Card
        flush
        title="Series de facturación"
        description="Cada serie lleva su propio contador y su cuenta de ingreso o gasto por defecto."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormError('');
              setFormOpen(true);
            }}
          >
            + Nueva serie
          </Button>
        }
      >
        <DataTable
          columns={[
            { key: 'code', label: 'Código', render: (r) => <strong>{r.code}</strong> },
            { key: 'name', label: 'Nombre' },
            {
              key: 'direction',
              label: 'Tipo',
              render: (r) => (r.direction === 'sale' ? 'Emitidas' : 'Recibidas'),
            },
            {
              key: 'format',
              label: 'Formato',
              render: (r) =>
                `${r.prefix ? `${r.prefix}-` : ''}${r.include_year ? 'AAAA-' : ''}${'0'.repeat(r.padding)}`,
            },
            { key: 'next_number', label: 'Siguiente nº', numeric: true },
            {
              key: 'default_tax_rate',
              label: 'IVA por defecto',
              numeric: true,
              render: (r) => `${Number(r.default_tax_rate)}%`,
            },
            {
              key: 'default_income_account_code',
              label: 'Cuenta',
              render: (r) => r.default_income_account_code || '—',
            },
            {
              key: 'is_rectificative',
              label: 'Rectificativa',
              render: (r) => (r.is_rectificative ? <Badge tone="info">Sí</Badge> : '—'),
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
                  <Button size="small" onClick={() => toggleActive(r)}>
                    {r.is_active ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              ),
            },
          ]}
          rows={state.series}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin series"
          emptyDescription="Crea una serie para poder emitir facturas."
        />
      </Card>

      <Modal
        open={formOpen}
        onClose={saving ? undefined : () => setFormOpen(false)}
        title="Nueva serie"
        subtitle="El código no se puede cambiar una vez creada la serie."
        footer={
          <>
            <Button onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={save} disabled={saving || !form.code || !form.name}>
              {saving ? 'Creando…' : 'Crear serie'}
            </Button>
          </>
        }
      >
        <ErrorBanner>{formError}</ErrorBanner>

        <div className={styles.filters}>
          <Field label="Código *" htmlFor="series-code">
            <TextInput
              id="series-code"
              value={form.code}
              maxLength={10}
              placeholder="OTW"
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Nombre *" htmlFor="series-name">
            <TextInput
              id="series-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </Field>

          <Field label="Tipo" htmlFor="series-direction">
            <Select
              id="series-direction"
              value={form.direction}
              onChange={(e) => setForm((p) => ({ ...p, direction: e.target.value }))}
            >
              <option value="sale">Facturas emitidas</option>
              <option value="purchase">Facturas recibidas</option>
            </Select>
          </Field>

          <Field label="Prefijo" htmlFor="series-prefix" hint="Vacío usa el código">
            <TextInput
              id="series-prefix"
              value={form.prefix}
              onChange={(e) => setForm((p) => ({ ...p, prefix: e.target.value.toUpperCase() }))}
            />
          </Field>

          <Field label="Dígitos" htmlFor="series-padding">
            <NumberInput
              id="series-padding"
              min="1"
              max="10"
              value={form.padding}
              onChange={(e) => setForm((p) => ({ ...p, padding: e.target.value }))}
            />
          </Field>

          <Field label="IVA por defecto" htmlFor="series-tax">
            <Select
              id="series-tax"
              value={form.default_tax_rate}
              onChange={(e) => setForm((p) => ({ ...p, default_tax_rate: e.target.value }))}
            >
              {DEFAULT_TAX_RATES.map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Cuenta por defecto" htmlFor="series-account">
            <Select
              id="series-account"
              value={form.default_income_account_code}
              onChange={(e) => setForm((p) => ({ ...p, default_income_account_code: e.target.value }))}
            >
              <option value="">Sin definir</option>
              {accountOptions.map((account) => (
                <option key={account.code} value={account.code}>
                  {account.code} · {account.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className={styles.row}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.include_year}
              onChange={(e) => setForm((p) => ({ ...p, include_year: e.target.checked }))}
            />
            Incluir el año en el número
          </label>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={form.is_rectificative}
              onChange={(e) => setForm((p) => ({ ...p, is_rectificative: e.target.checked }))}
            />
            Serie para rectificativas
          </label>
        </div>

        <InfoBanner>
          Ejemplo de numeración:{' '}
          <strong>
            {form.prefix || form.code || 'SER'}-{form.include_year ? `${new Date().getFullYear()}-` : ''}
            {'1'.padStart(Number(form.padding) || 4, '0')}
          </strong>
        </InfoBanner>
      </Modal>
    </>
  );
}
