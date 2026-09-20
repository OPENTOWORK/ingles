import { formatCurrency, formatDate } from '@/lib/finance/money';
import { formatPartyAddress } from '@/lib/finance/party';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Documento imprimible de la factura a partir de los datos ya emitidos.
 * Usa el snapshot fiscal congelado en la emisión, no los datos actuales del cliente.
 */
export function buildInvoiceHtml(invoice = {}, lines = []) {
  const snapshot = invoice.party_snapshot || {};
  const number = escapeHtml(invoice.invoice_number || 'BORRADOR');

  const lineRows = lines
    .map(
      (line) => `
        <tr>
          <td>${escapeHtml(line.description)}</td>
          <td class="num">${Number(line.quantity)}</td>
          <td class="num">${formatCurrency(line.unit_price)}</td>
          <td class="num">${Number(line.discount_percent)}%</td>
          <td class="num">${Number(line.tax_rate)}%</td>
          <td class="num">${formatCurrency(line.subtotal)}</td>
          <td class="num strong">${formatCurrency(line.total)}</td>
        </tr>`,
    )
    .join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Factura ${number}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #0f172a; margin: 0; padding: 40px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .muted { color: #64748b; font-size: 13px; }
  .head { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
  .box { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; min-width: 240px; }
  .box h2 { font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #64748b; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 13px; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: #64748b; border-bottom: 1px solid #cbd5e1; padding: 8px 6px; }
  td { padding: 8px 6px; border-bottom: 1px solid #f1f5f9; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .strong { font-weight: 700; }
  .totals { margin-top: 20px; margin-left: auto; width: 300px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 5px 0; }
  .totals .grand { border-top: 2px solid #0f172a; margin-top: 6px; padding-top: 10px; font-size: 17px; font-weight: 700; }
  .notes { margin-top: 28px; font-size: 12px; color: #475569; white-space: pre-wrap; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="head">
    <div>
      <h1>Factura ${number}</h1>
      <p class="muted">
        Fecha de emisión: ${formatDate(invoice.issue_date)}<br />
        Vencimiento: ${formatDate(invoice.due_date)}<br />
        ${invoice.payment_method ? `Forma de pago: ${escapeHtml(invoice.payment_method)}` : ''}
      </p>
    </div>
    <div class="box">
      <h2>${invoice.direction === 'purchase' ? 'Proveedor' : 'Cliente'}</h2>
      <strong>${escapeHtml(snapshot.legal_name)}</strong><br />
      <span class="muted">
        ${snapshot.tax_id ? `${escapeHtml(snapshot.tax_id)}<br />` : ''}
        ${escapeHtml(formatPartyAddress(snapshot))}
      </span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th class="num">Cant.</th>
        <th class="num">Precio</th>
        <th class="num">Dto.</th>
        <th class="num">IVA</th>
        <th class="num">Base</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>${lineRows}</tbody>
  </table>

  <div class="totals">
    <div><span>Base imponible</span><span>${formatCurrency(invoice.subtotal)}</span></div>
    <div><span>Impuestos</span><span>${formatCurrency(invoice.tax_total)}</span></div>
    <div class="grand"><span>Total</span><span>${formatCurrency(invoice.total)}</span></div>
  </div>

  ${invoice.notes ? `<div class="notes">${escapeHtml(invoice.notes)}</div>` : ''}

  <script>window.addEventListener('load', () => window.print());</script>
</body>
</html>`;
}
