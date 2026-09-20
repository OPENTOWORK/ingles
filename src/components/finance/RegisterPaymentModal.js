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
import { financeFetch, newIdempotencyKey } from '@/lib/finance/client';
import { formatCurrency, formatDate, roundAmount } from '@/lib/finance/money';

/**
 * Registro de cobros y pagos, totales o parciales.
 *
 * La clave de idempotencia se genera al abrir el modal, de modo que un doble
 * clic o un reintento de red no puede duplicar el cobro: el servidor devuelve
 * el pago ya existente en lugar de crear uno nuevo.
 */
export default function RegisterPaymentModal({
  open,
  onClose,
  onRegistered,
  invoice,
  treasuryAccounts = [],
  direction = 'sale',
}) {
  const isCollection = direction === 'sale';
  const pending = useMemo(
    () => roundAmount(Number(invoice?.total || 0) - Number(invoice?.paid_amount || 0)),
    [invoice],
  );

  const [form, setForm] = useState({
    treasury_account_id: '',
    payment_date: new Date().toISOString().slice(0, 10),
    amount: '',
    reference: '',
    notes: '',
  });
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const activeAccounts = useMemo(
    () => treasuryAccounts.filter((account) => account.is_active !== false),
    [treasuryAccounts],
  );

  useEffect(() => {
    if (!open) return;
    setError('');
    setIdempotencyKey(newIdempotencyKey(isCollection ? 'collection' : 'payment'));
    setForm({
      treasury_account_id: activeAccounts[0]?.id || '',
      payment_date: new Date().toISOString().slice(0, 10),
      amount: pending > 0 ? String(pending) : '',
      reference: invoice?.invoice_number || '',
      notes: '',
    });
  }, [open, pending, invoice?.invoice_number, activeAccounts, isCollection]);

  const amountValue = Number(String(form.amount).replace(',', '.'));
  const amountValid = Number.isFinite(amountValue) && amountValue > 0 && amountValue <= pending + 0.001;
  const remainingAfter = amountValid ? roundAmount(pending - amountValue) : pending;

  async function submit() {
    if (!amountValid || !form.treasury_account_id) return;
    setSaving(true);
    setError('');

    try {
      const endpoint = isCollection
        ? '/api/admin/finanzas/tesoreria/cobros'
        : '/api/admin/finanzas/tesoreria/pagos';

      const result = await financeFetch(endpoint, {
        method: 'POST',
        body: {
          invoice_id: invoice.id,
          treasury_account_id: form.treasury_account_id,
          amount: amountValue,
          payment_date: form.payment_date,
          reference: form.reference,
          notes: form.notes,
          idempotency_key: idempotencyKey,
        },
      });

      onRegistered?.(result);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={isCollection ? 'Registrar cobro' : 'Registrar pago'}
      subtitle={`${invoice.invoice_number || 'Factura'} · ${invoice.party_name || ''}`}
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={submit}
            disabled={saving || !amountValid || !form.treasury_account_id}
          >
            {saving ? 'Registrando…' : isCollection ? 'Registrar cobro' : 'Registrar pago'}
          </Button>
        </>
      }
    >
      <ErrorBanner>{error}</ErrorBanner>

      <div className={styles.grid3}>
        <div>
          <p className={styles.definitionTerm}>Total factura</p>
          <p className={styles.definitionValue}>{formatCurrency(invoice.total)}</p>
        </div>
        <div>
          <p className={styles.definitionTerm}>{isCollection ? 'Cobrado' : 'Pagado'}</p>
          <p className={styles.definitionValue}>{formatCurrency(invoice.paid_amount)}</p>
        </div>
        <div>
          <p className={styles.definitionTerm}>Pendiente</p>
          <p className={styles.definitionValue}>
            <strong>{formatCurrency(pending)}</strong>
          </p>
        </div>
      </div>

      {activeAccounts.length === 0 ? (
        <InfoBanner>
          No hay cuentas de tesorería activas. Crea una en Tesorería → Cuentas antes de registrar
          {isCollection ? ' cobros' : ' pagos'}.
        </InfoBanner>
      ) : (
        <>
          <div className={styles.filters}>
            <Field label={isCollection ? 'Cuenta destino' : 'Cuenta de origen'} htmlFor="payment-account">
              <Select
                id="payment-account"
                value={form.treasury_account_id}
                onChange={(e) => setForm((p) => ({ ...p, treasury_account_id: e.target.value }))}
              >
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} · {formatCurrency(account.current_balance)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Fecha" htmlFor="payment-date">
              <TextInput
                id="payment-date"
                type="date"
                value={form.payment_date}
                onChange={(e) => setForm((p) => ({ ...p, payment_date: e.target.value }))}
              />
            </Field>

            <Field
              label="Importe"
              htmlFor="payment-amount"
              error={
                form.amount && !amountValid
                  ? `Indica un importe entre 0 y ${formatCurrency(pending)}.`
                  : ''
              }
            >
              <NumberInput
                id="payment-amount"
                step="0.01"
                min="0"
                max={pending}
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              />
            </Field>

            <Field label="Referencia" htmlFor="payment-reference">
              <TextInput
                id="payment-reference"
                value={form.reference}
                placeholder="Nº de operación bancaria"
                onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
              />
            </Field>
          </div>

          <div className={styles.row}>
            <Button
              size="small"
              onClick={() => setForm((p) => ({ ...p, amount: String(pending) }))}
              disabled={pending <= 0}
            >
              Importe total ({formatCurrency(pending)})
            </Button>
            {invoice.due_date && (
              <span className={styles.kpiHint}>Vencimiento: {formatDate(invoice.due_date)}</span>
            )}
          </div>

          <Field label="Notas" htmlFor="payment-notes">
            <TextArea
              id="payment-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </Field>

          {amountValid && (
            <InfoBanner>
              Tras registrar quedará un pendiente de <strong>{formatCurrency(remainingAfter)}</strong> y la
              factura pasará a{' '}
              <strong>
                {remainingAfter <= 0.001 ? (isCollection ? 'Cobrada' : 'Pagada') : 'Parcial'}
              </strong>
              . Se creará el movimiento de tesorería y su asiento contable.
            </InfoBanner>
          )}
        </>
      )}
    </Modal>
  );
}
