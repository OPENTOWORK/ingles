export const INVOICE_STATUS_LABELS = {
  draft: 'Borrador',
  issued: 'Emitida',
  cancelled: 'Anulada',
};

/** Estados funcionales de cobro mostrados en UI. */
export const FUNCTIONAL_STATUS_LABELS = {
  draft: 'Borrador',
  pending: 'Pendiente',
  partial: 'Parcial',
  paid: 'Cobrada',
  overdue: 'Vencida',
  cancelled: 'Anulada',
};

export const FUNCTIONAL_STATUS_TONE = {
  draft: 'neutral',
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'neutral',
};

export const PAYABLE_STATUS_LABELS = {
  ...FUNCTIONAL_STATUS_LABELS,
  paid: 'Pagada',
};

export const MOVEMENT_KIND_LABELS = {
  collection: 'Cobro',
  payment: 'Pago',
  transfer: 'Transferencia',
  adjustment: 'Ajuste',
};

export const RECONCILIATION_LABELS = {
  pending: 'Pendiente',
  reconciled: 'Conciliado',
  unidentified: 'No identificado',
};

export const RECONCILIATION_TONE = {
  pending: 'warning',
  reconciled: 'success',
  unidentified: 'danger',
};

export const TREASURY_ACCOUNT_KIND_LABELS = {
  bank: 'Cuenta bancaria',
  cash: 'Caja',
  other: 'Otros medios',
};

export const ACCOUNT_TYPE_LABELS = {
  asset: 'Activo',
  liability: 'Pasivo',
  equity: 'Patrimonio neto',
  income: 'Ingresos',
  expense: 'Gastos',
};

export const JOURNAL_ORIGIN_LABELS = {
  invoice: 'Factura',
  payment: 'Cobro/Pago',
  manual: 'Manual',
  adjustment: 'Ajuste',
  closing: 'Cierre',
};

export const FISCAL_YEAR_STATUS_LABELS = {
  open: 'Abierto',
  closed: 'Cerrado',
};

export const PAYMENT_METHODS = [
  'Transferencia bancaria',
  'Domiciliación',
  'Tarjeta',
  'Efectivo',
  'Bizum',
  'Stripe',
  'Otro',
];

export const DEFAULT_TAX_RATES = [0, 4, 10, 21];

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;
