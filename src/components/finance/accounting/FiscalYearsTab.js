'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  DataTable,
  ErrorBanner,
  InfoBanner,
  Modal,
  NumberInput,
  Field,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';

/** Ejercicios contables: apertura y cierre. */
export default function FiscalYearsTab({ reloadToken = 0, onChanged }) {
  const [state, setState] = useState({ loading: true, error: '', fiscalYears: [] });
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newYear, setNewYear] = useState(() => new Date().getFullYear() + 1);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const data = await financeFetch('/api/admin/finanzas/contabilidad/ejercicios');
      setState({ loading: false, error: '', fiscalYears: data.fiscalYears || [] });
    } catch (err) {
      setState({ loading: false, error: err.message, fiscalYears: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, reloadToken]);

  async function setStatus(year, status) {
    setBusy(year.year);
    setActionError('');
    try {
      await financeFetch('/api/admin/finanzas/contabilidad/ejercicios', {
        method: 'PATCH',
        body: { year: year.year, status },
      });
      load();
      onChanged?.(status === 'closed' ? `Ejercicio ${year.year} cerrado.` : `Ejercicio ${year.year} reabierto.`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function createYear() {
    setSaving(true);
    setActionError('');
    try {
      await financeFetch('/api/admin/finanzas/contabilidad/ejercicios', {
        method: 'POST',
        body: { year: Number(newYear) },
      });
      setCreateOpen(false);
      load();
      onChanged?.(`Ejercicio ${newYear} creado.`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <InfoBanner>
        Un ejercicio cerrado rechaza cualquier asiento nuevo. La restricción está implementada con un
        trigger en base de datos, de modo que también bloquea escrituras que no pasen por esta pantalla.
      </InfoBanner>

      <ErrorBanner>{actionError}</ErrorBanner>

      <Card
        flush
        title="Ejercicios contables"
        actions={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            + Nuevo ejercicio
          </Button>
        }
      >
        <DataTable
          columns={[
            { key: 'year', label: 'Ejercicio', render: (r) => <strong>{r.year}</strong> },
            { key: 'starts_on', label: 'Inicio', render: (r) => formatDate(r.starts_on) },
            { key: 'ends_on', label: 'Fin', render: (r) => formatDate(r.ends_on) },
            { key: 'entry_count', label: 'Asientos', numeric: true },
            {
              key: 'total_debit',
              label: 'Debe',
              numeric: true,
              render: (r) => formatCurrency(r.total_debit),
            },
            {
              key: 'total_credit',
              label: 'Haber',
              numeric: true,
              render: (r) => formatCurrency(r.total_credit),
            },
            {
              key: 'balanced',
              label: 'Cuadre',
              render: (r) => (
                <Badge tone={r.balanced ? 'success' : 'danger'}>
                  {r.balanced ? 'Cuadrado' : 'Descuadrado'}
                </Badge>
              ),
            },
            {
              key: 'status',
              label: 'Estado',
              render: (r) => (
                <Badge tone={r.status === 'open' ? 'success' : 'neutral'}>
                  {r.status === 'open' ? 'Abierto' : 'Cerrado'}
                </Badge>
              ),
            },
            {
              key: 'closed_at',
              label: 'Cerrado el',
              render: (r) => (r.closed_at ? formatDate(r.closed_at) : '—'),
            },
            {
              key: 'actions',
              label: 'Acciones',
              render: (r) => (
                <div className={styles.rowActions}>
                  {r.status === 'open' ? (
                    <Button
                      size="small"
                      variant="danger"
                      disabled={busy === r.year}
                      onClick={() => setStatus(r, 'closed')}
                    >
                      {busy === r.year ? 'Cerrando…' : 'Cerrar'}
                    </Button>
                  ) : (
                    <Button size="small" disabled={busy === r.year} onClick={() => setStatus(r, 'open')}>
                      {busy === r.year ? 'Abriendo…' : 'Reabrir'}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          rows={state.fiscalYears}
          getRowKey={(row) => row.year}
          loading={state.loading}
          error={state.error}
          onRetry={load}
          emptyTitle="Sin ejercicios"
          emptyDescription="Crea un ejercicio contable para poder registrar asientos."
        />
      </Card>

      <Modal
        open={createOpen}
        onClose={saving ? undefined : () => setCreateOpen(false)}
        title="Nuevo ejercicio contable"
        subtitle="Se crea del 1 de enero al 31 de diciembre, en estado abierto."
        footer={
          <>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={createYear} disabled={saving}>
              {saving ? 'Creando…' : 'Crear ejercicio'}
            </Button>
          </>
        }
      >
        <Field label="Año" htmlFor="fiscal-year">
          <NumberInput
            id="fiscal-year"
            min="2000"
            max="2100"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
          />
        </Field>
      </Modal>
    </>
  );
}
