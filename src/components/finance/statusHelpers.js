import {
  FUNCTIONAL_STATUS_LABELS,
  FUNCTIONAL_STATUS_TONE,
  PAYABLE_STATUS_LABELS,
} from '@/lib/finance/constants';

/**
 * Estado funcional de una fila de factura tal y como llega de `fin_invoice_overview`.
 * La vista ya resuelve `is_overdue` en base de datos.
 */
export function invoiceFunctionalStatus(invoice = {}) {
  if (invoice.status === 'draft') return 'draft';
  if (invoice.status === 'cancelled') return 'cancelled';
  if (invoice.payment_status === 'paid') return 'paid';
  if (invoice.is_overdue) return 'overdue';
  if (invoice.payment_status === 'partial') return 'partial';
  return 'pending';
}

export function statusLabel(status, direction = 'sale') {
  const labels = direction === 'purchase' ? PAYABLE_STATUS_LABELS : FUNCTIONAL_STATUS_LABELS;
  return labels[status] || status || '—';
}

export function statusTone(status) {
  return FUNCTIONAL_STATUS_TONE[status] || 'neutral';
}

/** Acciones disponibles según el estado real de la factura. */
export function availableInvoiceActions(invoice = {}) {
  const actions = ['view'];

  if (invoice.status === 'draft') {
    actions.push('edit', 'issue', 'delete');
    return actions;
  }

  if (invoice.status === 'issued') {
    actions.push('download');
    if (invoice.payment_status !== 'paid') {
      actions.push(invoice.direction === 'purchase' ? 'registerPayment' : 'registerCollection');
    }
    if (!invoice.rectified_by_invoice_id) actions.push('rectify');
    if (Number(invoice.paid_amount) === 0) actions.push('cancel');
  }

  return actions;
}
