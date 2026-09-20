'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  ErrorBanner,
  Field,
  InfoBanner,
  Modal,
  NumberInput,
  Select,
  TextArea,
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { calculateDueDate, calculateInvoiceTotals, validateInvoiceDraft } from '@/lib/finance/invoiceCalc';
import { formatCurrency } from '@/lib/finance/money';
import { DEFAULT_TAX_RATES, PAYMENT_METHODS } from '@/lib/finance/constants';

function emptyLine(taxRate = 21) {
  return {
    description: '',
    quantity: 1,
    unit_price: 0,
    discount_percent: 0,
    tax_rate: taxRate,
    income_account_code: '',
  };
}

/**
 * Alta y edición de facturas en borrador.
 * Los totales se recalculan en cliente para dar feedback inmediato y el
 * servidor los vuelve a calcular antes de persistir.
 */
export default function InvoiceFormModal({
  open,
  onClose,
  onSaved,
  catalog,
  direction = 'sale',
  invoiceId = null,
}) {
  const [form, setForm] = useState(() => ({
    party_id: '',
    series_id: '',
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: '',
    payment_method: '',
    notes: '',
    internal_notes: '',
  }));
  const [lines, setLines] = useState([emptyLine()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableSeries = useMemo(
    () => (catalog?.series || []).filter((s) => s.direction === direction && !s.is_rectificative),
    [catalog, direction],
  );

  const availableParties = useMemo(
    () =>
      (catalog?.parties || []).filter((p) =>
        direction === 'sale' ? p.kind !== 'supplier' : p.kind !== 'customer',
      ),
    [catalog, direction],
  );

  const accountOptions = useMemo(
    () =>
      (catalog?.accounts || []).filter((a) =>
        direction === 'sale' ? a.account_type === 'income' : a.account_type === 'expense',
      ),
    [catalog, direction],
  );

  useEffect(() => {
    if (!open) return;
    setError('');

    if (!invoiceId) {
      const defaultSeries = availableSeries[0];
      setForm({
        party_id: '',
        series_id: defaultSeries?.id || '',
        issue_date: new Date().toISOString().slice(0, 10),
        due_date: '',
        payment_method: '',
        notes: '',
        internal_notes: '',
      });
      setLines([emptyLine(Number(defaultSeries?.default_tax_rate) || 21)]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    financeFetch(`/api/admin/finanzas/facturas/${invoiceId}`)
      .then((data) => {
        if (cancelled) return;
        setForm({
          party_id: data.invoice.party_id || '',
          series_id: data.invoice.series_id || '',
          issue_date: String(data.invoice.issue_date || '').slice(0, 10),
          due_date: String(data.invoice.due_date || '').slice(0, 10),
          payment_method: data.invoice.payment_method || '',
          notes: data.invoice.notes || '',
          internal_notes: data.invoice.internal_notes || '',
        });
        setLines(
          (data.lines || []).map((line) => ({
            description: line.description || '',
            quantity: Number(line.quantity) || 1,
            unit_price: Number(line.unit_price) || 0,
            discount_percent: Number(line.discount_percent) || 0,
            tax_rate: Number(line.tax_rate) || 0,
            income_account_code: line.income_account_code || '',
          })),
        );
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [open, invoiceId, availableSeries]);

  const totals = useMemo(() => calculateInvoiceTotals(lines), [lines]);
  const validation = useMemo(() => validateInvoiceDraft(form, lines), [form, lines]);

  function updateField(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      // Al elegir cliente se propone el vencimiento según sus condiciones de pago.
      if (field === 'party_id') {
        const party = availableParties.find((p) => p.id === value);
        if (party && next.issue_date) {
          next.due_date = calculateDueDate(next.issue_date, party.payment_terms_days) || '';
          if (!next.payment_method && party.payment_method) next.payment_method = party.payment_method;
        }
      }
      if (field === 'issue_date' && prev.party_id) {
        const party = availableParties.find((p) => p.id === prev.party_id);
        next.due_date = calculateDueDate(value, party?.payment_terms_days ?? 30) || '';
      }

      return next;
    });
  }

  function updateLine(index, field, value) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  async function submit(shouldIssue) {
    setSaving(true);
    setError('');

    const payload = {
      direction,
      party_id: form.party_id,
      series_id: form.series_id,
      issue_date: form.issue_date,
      due_date: form.due_date || null,
      payment_method: form.payment_method,
      notes: form.notes,
      internal_notes: form.internal_notes,
      lines: lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
        discount_percent: Number(line.discount_percent) || 0,
        tax_rate: Number(line.tax_rate) || 0,
        income_account_code: line.income_account_code || null,
      })),
    };

    try {
      if (invoiceId) {
        await financeFetch(`/api/admin/finanzas/facturas/${invoiceId}`, { method: 'PATCH', body: payload });
        if (shouldIssue) {
          await financeFetch(`/api/admin/finanzas/facturas/${invoiceId}/acciones`, {
            method: 'POST',
            body: { action: 'issue' },
          });
        }
      } else {
        await financeFetch('/api/admin/finanzas/facturas', {
          method: 'POST',
          body: { ...payload, issue: shouldIssue },
        });
      }
      onSaved?.(shouldIssue ? 'issued' : 'saved');
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const isPurchase = direction === 'purchase';

  return (
    <Modal
      open={open}
      wide
      onClose={saving ? undefined : onClose}
      title={invoiceId ? 'Editar borrador' : isPurchase ? 'Nueva factura recibida' : 'Nueva factura'}
      subtitle={
        isPurchase
          ? 'Registra una factura de proveedor: generará su cuenta por pagar y su asiento al emitirla.'
          : 'Al emitir se asigna el número definitivo y se genera el asiento contable.'
      }
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={() => submit(false)} disabled={saving || loading || !validation.valid}>
            {saving ? 'Guardando…' : 'Guardar borrador'}
          </Button>
          <Button
            variant="primary"
            onClick={() => submit(true)}
            disabled={saving || loading || !validation.valid}
          >
            {saving ? 'Procesando…' : 'Emitir'}
          </Button>
        </>
      }
    >
      <ErrorBanner>{error}</ErrorBanner>

      {loading ? (
        <div className={styles.skeleton} style={{ height: 320 }} />
      ) : (
        <>
          <div className={styles.filters}>
            <Field label={isPurchase ? 'Proveedor' : 'Cliente'} htmlFor="invoice-party">
              <Select
                id="invoice-party"
                value={form.party_id}
                onChange={(e) => updateField('party_id', e.target.value)}
              >
                <option value="">Selecciona…</option>
                {availableParties.map((party) => (
                  <option key={party.id} value={party.id}>
                    {party.legal_name}
                    {party.tax_id ? ` · ${party.tax_id}` : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Serie" htmlFor="invoice-series">
              <Select
                id="invoice-series"
                value={form.series_id}
                onChange={(e) => updateField('series_id', e.target.value)}
              >
                <option value="">Selecciona…</option>
                {availableSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.code} · {series.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Número" hint="Se asigna al emitir">
              <TextInput value="Pendiente de emisión" disabled readOnly />
            </Field>

            <Field label="Fecha de emisión" htmlFor="invoice-issue-date">
              <TextInput
                id="invoice-issue-date"
                type="date"
                value={form.issue_date}
                onChange={(e) => updateField('issue_date', e.target.value)}
              />
            </Field>

            <Field label="Vencimiento" htmlFor="invoice-due-date">
              <TextInput
                id="invoice-due-date"
                type="date"
                value={form.due_date}
                min={form.issue_date}
                onChange={(e) => updateField('due_date', e.target.value)}
              />
            </Field>

            <Field label="Forma de pago" htmlFor="invoice-payment-method">
              <Select
                id="invoice-payment-method"
                value={form.payment_method}
                onChange={(e) => updateField('payment_method', e.target.value)}
              >
                <option value="">Sin especificar</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ minWidth: 220 }}>Descripción</th>
                  <th className={styles.numeric} style={{ width: 90 }}>
                    Cantidad
                  </th>
                  <th className={styles.numeric} style={{ width: 110 }}>
                    Precio
                  </th>
                  <th className={styles.numeric} style={{ width: 90 }}>
                    Dto. %
                  </th>
                  <th className={styles.numeric} style={{ width: 90 }}>
                    IVA %
                  </th>
                  <th style={{ width: 170 }}>Cuenta</th>
                  <th className={styles.numeric}>Subtotal</th>
                  <th className={styles.numeric}>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => {
                  const computed = totals.lines[index] || { subtotal: 0, total: 0 };
                  return (
                    <tr key={index}>
                      <td>
                        <TextInput
                          value={line.description}
                          placeholder="Concepto facturado"
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <NumberInput
                          step="0.01"
                          value={line.quantity}
                          onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        <NumberInput
                          step="0.01"
                          min="0"
                          value={line.unit_price}
                          onChange={(e) => updateLine(index, 'unit_price', e.target.value)}
                        />
                      </td>
                      <td>
                        <NumberInput
                          step="0.01"
                          min="0"
                          max="100"
                          value={line.discount_percent}
                          onChange={(e) => updateLine(index, 'discount_percent', e.target.value)}
                        />
                      </td>
                      <td>
                        <Select
                          value={line.tax_rate}
                          onChange={(e) => updateLine(index, 'tax_rate', e.target.value)}
                        >
                          {DEFAULT_TAX_RATES.map((rate) => (
                            <option key={rate} value={rate}>
                              {rate}%
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        <Select
                          value={line.income_account_code}
                          onChange={(e) => updateLine(index, 'income_account_code', e.target.value)}
                        >
                          <option value="">Por defecto</option>
                          {accountOptions.map((account) => (
                            <option key={account.code} value={account.code}>
                              {account.code} · {account.name}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td className={styles.numeric}>{formatCurrency(computed.subtotal)}</td>
                      <td className={`${styles.numeric} ${styles.strong}`}>
                        {formatCurrency(computed.total)}
                      </td>
                      <td>
                        <Button
                          size="small"
                          variant="danger"
                          disabled={lines.length === 1}
                          onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                          aria-label={`Eliminar línea ${index + 1}`}
                        >
                          ×
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.rowBetween}>
            <Button
              size="small"
              onClick={() => {
                const series = availableSeries.find((s) => s.id === form.series_id);
                setLines((prev) => [...prev, emptyLine(Number(series?.default_tax_rate) || 21)]);
              }}
            >
              + Añadir línea
            </Button>

            <div className={styles.row}>
              <span className={styles.kpiHint}>Base imponible</span>
              <strong>{formatCurrency(totals.subtotal)}</strong>
              <span className={styles.kpiHint}>Impuestos</span>
              <strong>{formatCurrency(totals.tax_total)}</strong>
              <span className={styles.kpiHint}>Total</span>
              <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>
                {formatCurrency(totals.total)}
              </strong>
            </div>
          </div>

          {totals.taxBreakdown.length > 1 && (
            <InfoBanner>
              Desglose de IVA:{' '}
              {totals.taxBreakdown
                .map((entry) => `${entry.rate}% sobre ${formatCurrency(entry.base)} = ${formatCurrency(entry.amount)}`)
                .join(' · ')}
            </InfoBanner>
          )}

          <div className={styles.grid2}>
            <Field label="Notas (visibles en la factura)" htmlFor="invoice-notes">
              <TextArea
                id="invoice-notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Condiciones, referencias del cliente…"
              />
            </Field>
            <Field label="Observaciones internas" htmlFor="invoice-internal-notes">
              <TextArea
                id="invoice-internal-notes"
                value={form.internal_notes}
                onChange={(e) => updateField('internal_notes', e.target.value)}
                placeholder="No se muestran al cliente"
              />
            </Field>
          </div>

          {!validation.valid && (
            <InfoBanner>
              Para poder guardar: {validation.errors.slice(0, 3).join(' · ')}
            </InfoBanner>
          )}
        </>
      )}
    </Modal>
  );
}
