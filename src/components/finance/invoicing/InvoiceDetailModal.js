'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  DefinitionList,
  ErrorBanner,
  Modal,
  TextArea,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { formatPartyAddress } from '@/lib/finance/party';
import { invoiceFunctionalStatus, statusLabel, statusTone } from '@/components/finance/statusHelpers';
import { buildInvoiceHtml } from '@/lib/finance/invoiceDocument';

/** Detalle completo de la factura con sus acciones fiscales. */
export default function InvoiceDetailModal({
  open,
  invoiceId,
  onClose,
  onChanged,
  onRegisterPayment,
  onEdit,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);

  const load = useCallback(async () => {
    if (!invoiceId) return;
    setLoading(true);
    setError('');
    try {
      setData(await financeFetch(`/api/admin/finanzas/facturas/${invoiceId}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    if (open) {
      setShowCancel(false);
      setCancelReason('');
      load();
    }
  }, [open, load]);

  async function runAction(action, body = {}) {
    setBusy(action);
    setError('');
    try {
      await financeFetch(`/api/admin/finanzas/facturas/${invoiceId}/acciones`, {
        method: 'POST',
        body: { action, ...body },
      });
      await load();
      onChanged?.(action);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  function downloadInvoice() {
    if (!data) return;
    const html = buildInvoiceHtml(data.invoice, data.lines);
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      setError('El navegador ha bloqueado la ventana de impresión. Permite las ventanas emergentes.');
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
  }

  const invoice = data?.invoice;
  const status = invoice ? invoiceFunctionalStatus(invoice) : 'draft';
  const snapshot = invoice?.party_snapshot || {};
  const isDraft = invoice?.status === 'draft';
  const isIssued = invoice?.status === 'issued';

  return (
    <Modal
      open={open}
      wide
      onClose={onClose}
      title={invoice?.invoice_number || 'Factura en borrador'}
      subtitle={invoice ? `${snapshot.legal_name || invoice.party?.legal_name || ''}` : ''}
      footer={
        <>
          <Button onClick={onClose}>Cerrar</Button>
          {isIssued && <Button onClick={downloadInvoice}>Descargar</Button>}
          {isDraft && (
            <Button onClick={() => onEdit?.(invoiceId)} disabled={Boolean(busy)}>
              Editar
            </Button>
          )}
          {isDraft && (
            <Button variant="primary" onClick={() => runAction('issue')} disabled={Boolean(busy)}>
              {busy === 'issue' ? 'Emitiendo…' : 'Emitir'}
            </Button>
          )}
          {isIssued && invoice.payment_status !== 'paid' && (
            <Button variant="primary" onClick={() => onRegisterPayment?.(invoice)}>
              {invoice.direction === 'purchase' ? 'Registrar pago' : 'Registrar cobro'}
            </Button>
          )}
          {isIssued && !invoice.rectified_by_invoice_id && (
            <Button onClick={() => runAction('rectify')} disabled={Boolean(busy)}>
              {busy === 'rectify' ? 'Rectificando…' : 'Rectificar'}
            </Button>
          )}
          {isIssued && Number(invoice.paid_amount) === 0 && (
            <Button variant="danger" onClick={() => setShowCancel((v) => !v)}>
              Anular
            </Button>
          )}
        </>
      }
    >
      <ErrorBanner>{error}</ErrorBanner>

      {loading || !invoice ? (
        <div className={styles.skeleton} style={{ height: 300 }} />
      ) : (
        <>
          <div className={styles.rowBetween}>
            <Badge tone={statusTone(status)}>{statusLabel(status, invoice.direction)}</Badge>
            <span className={styles.kpiHint}>
              Creada el {formatDate(invoice.created_at)}
              {invoice.issued_at ? ` · Emitida el ${formatDate(invoice.issued_at)}` : ''}
            </span>
          </div>

          {showCancel && (
            <div className={styles.card}>
              <p className={styles.cardTitle}>Anular factura</p>
              <p className={styles.cardDesc}>
                La factura se marca como anulada y se genera un asiento inverso. El número no se
                reutiliza, para no romper la trazabilidad fiscal.
              </p>
              <TextArea
                value={cancelReason}
                placeholder="Motivo de la anulación (obligatorio)"
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className={styles.row} style={{ marginTop: '0.6rem' }}>
                <Button
                  variant="danger"
                  disabled={!cancelReason.trim() || Boolean(busy)}
                  onClick={() => runAction('cancel', { reason: cancelReason })}
                >
                  {busy === 'cancel' ? 'Anulando…' : 'Confirmar anulación'}
                </Button>
                <Button onClick={() => setShowCancel(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          <DefinitionList
            items={[
              { label: 'Razón social', value: snapshot.legal_name || invoice.party?.legal_name },
              { label: 'NIF/CIF', value: snapshot.tax_id || invoice.party?.tax_id },
              { label: 'Dirección', value: formatPartyAddress(snapshot) },
              { label: 'Serie', value: invoice.series?.code },
              { label: 'Fecha de emisión', value: formatDate(invoice.issue_date) },
              { label: 'Vencimiento', value: formatDate(invoice.due_date) },
              { label: 'Forma de pago', value: invoice.payment_method },
              { label: 'Total', value: formatCurrency(invoice.total) },
              { label: 'Cobrado', value: formatCurrency(invoice.paid_amount) },
              { label: 'Pendiente', value: formatCurrency(invoice.pending_amount) },
            ]}
          />

          {(data.originalInvoice || data.rectificativeInvoice) && (
            <p className={styles.infoBox}>
              {data.originalInvoice &&
                `Esta factura rectifica a ${data.originalInvoice.invoice_number} (${formatCurrency(data.originalInvoice.total)}).`}
              {data.rectificativeInvoice &&
                `Rectificada por ${data.rectificativeInvoice.invoice_number} (${formatCurrency(data.rectificativeInvoice.total)}).`}
            </p>
          )}

          <DataTable
            columns={[
              { key: 'description', label: 'Descripción' },
              { key: 'quantity', label: 'Cant.', numeric: true, render: (r) => Number(r.quantity) },
              {
                key: 'unit_price',
                label: 'Precio',
                numeric: true,
                render: (r) => formatCurrency(r.unit_price),
              },
              {
                key: 'discount_percent',
                label: 'Dto.',
                numeric: true,
                render: (r) => `${Number(r.discount_percent)}%`,
              },
              { key: 'tax_rate', label: 'IVA', numeric: true, render: (r) => `${Number(r.tax_rate)}%` },
              {
                key: 'subtotal',
                label: 'Base',
                numeric: true,
                render: (r) => formatCurrency(r.subtotal),
              },
              {
                key: 'total',
                label: 'Total',
                numeric: true,
                render: (r) => <strong>{formatCurrency(r.total)}</strong>,
              },
            ]}
            rows={data.lines}
            emptyTitle="Sin líneas"
            footer={
              <tr>
                <td colSpan={5}>Totales</td>
                <td className={styles.numeric}>{formatCurrency(invoice.subtotal)}</td>
                <td className={styles.numeric}>{formatCurrency(invoice.total)}</td>
              </tr>
            }
          />

          {invoice.notes && <p className={styles.infoBox}>{invoice.notes}</p>}

          {data.payments.length > 0 && (
            <div>
              <p className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
                {invoice.direction === 'purchase' ? 'Pagos registrados' : 'Cobros registrados'}
              </p>
              <DataTable
                columns={[
                  { key: 'payment_date', label: 'Fecha', render: (r) => formatDate(r.payment_date) },
                  { key: 'account', label: 'Cuenta', render: (r) => r.treasury_account?.name || '—' },
                  { key: 'reference', label: 'Referencia', render: (r) => r.reference || '—' },
                  {
                    key: 'amount',
                    label: 'Importe',
                    numeric: true,
                    render: (r) => <strong>{formatCurrency(r.amount)}</strong>,
                  },
                ]}
                rows={data.payments}
              />
            </div>
          )}

          {data.journalEntries.length > 0 && (
            <div>
              <p className={styles.cardTitle} style={{ marginBottom: '0.5rem' }}>
                Asientos contables
              </p>
              <DataTable
                columns={[
                  { key: 'entry_number', label: 'Nº asiento' },
                  { key: 'entry_date', label: 'Fecha', render: (r) => formatDate(r.entry_date) },
                  { key: 'concept', label: 'Concepto' },
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
                ]}
                rows={data.journalEntries}
              />
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
