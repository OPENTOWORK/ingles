'use client';

import { useEffect, useState } from 'react';
import {
  Badge,
  Button,
  DataTable,
  DefinitionList,
  ErrorBanner,
  Modal,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, formatDate } from '@/lib/finance/money';
import { JOURNAL_ORIGIN_LABELS } from '@/lib/finance/constants';

/** Detalle de un asiento con enlace al documento que lo originó. */
export default function JournalEntryDetailModal({ entryId, onClose }) {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  useEffect(() => {
    if (!entryId) return;
    let cancelled = false;
    setState({ loading: true, error: '', data: null });

    financeFetch(`/api/admin/finanzas/contabilidad/diario/${entryId}`)
      .then((data) => !cancelled && setState({ loading: false, error: '', data }))
      .catch((err) => !cancelled && setState({ loading: false, error: err.message, data: null }));

    return () => {
      cancelled = true;
    };
  }, [entryId]);

  const entry = state.data?.entry;
  const source = state.data?.sourceDocument;

  return (
    <Modal
      open={Boolean(entryId)}
      wide
      onClose={onClose}
      title={entry ? `Asiento ${entry.entry_number}` : 'Asiento'}
      subtitle={entry?.concept || ''}
      footer={<Button onClick={onClose}>Cerrar</Button>}
    >
      {state.loading ? (
        <div className={styles.skeleton} style={{ height: 240 }} />
      ) : state.error ? (
        <ErrorBanner>{state.error}</ErrorBanner>
      ) : (
        <>
          <div className={styles.rowBetween}>
            <Badge tone={entry.status === 'posted' ? 'success' : 'neutral'}>
              {entry.status === 'posted' ? 'Contabilizado' : entry.status}
            </Badge>
            <Badge tone={entry.origin === 'manual' ? 'neutral' : 'info'}>
              {JOURNAL_ORIGIN_LABELS[entry.origin] || entry.origin}
            </Badge>
          </div>

          <DefinitionList
            items={[
              { label: 'Número', value: String(entry.entry_number ?? '—') },
              { label: 'Fecha', value: formatDate(entry.entry_date) },
              { label: 'Ejercicio', value: String(entry.fiscal_year?.year ?? '—') },
              { label: 'Concepto', value: entry.concept },
              { label: 'Documento origen', value: entry.document_ref },
              { label: 'Usuario', value: state.data.author?.nombre || state.data.author?.email },
              { label: 'Fecha de creación', value: formatDate(entry.created_at) },
              { label: 'Total debe', value: formatCurrency(entry.total_debit) },
              { label: 'Total haber', value: formatCurrency(entry.total_credit) },
            ]}
          />

          {source?.type === 'invoice' && (
            <p className={styles.infoBox}>
              Procede de la factura <strong>{source.invoice_number}</strong> de {source.party_name} por{' '}
              {formatCurrency(source.total)} (emitida el {formatDate(source.issue_date)}).
            </p>
          )}

          {source?.type === 'payment' && (
            <p className={styles.infoBox}>
              Procede de un {source.direction === 'sale' ? 'cobro' : 'pago'} de{' '}
              {formatCurrency(source.amount)} del {formatDate(source.payment_date)}
              {source.invoice ? ` sobre la factura ${source.invoice.invoice_number}` : ''}
              {source.reference ? ` · Ref. ${source.reference}` : ''}.
            </p>
          )}

          <DataTable
            columns={[
              { key: 'account_code', label: 'Cuenta', render: (l) => <strong>{l.account_code}</strong> },
              { key: 'account_name', label: 'Nombre', render: (l) => l.account_name || '—' },
              { key: 'line_concept', label: 'Concepto', render: (l) => l.line_concept || '—' },
              {
                key: 'debit',
                label: 'Debe',
                numeric: true,
                render: (l) => (Number(l.debit) > 0 ? formatCurrency(l.debit) : '—'),
              },
              {
                key: 'credit',
                label: 'Haber',
                numeric: true,
                render: (l) => (Number(l.credit) > 0 ? formatCurrency(l.credit) : '—'),
              },
            ]}
            rows={state.data.lines}
            getRowKey={(line) => line.line_id}
            footer={
              <tr>
                <td colSpan={3}>Totales</td>
                <td className={styles.numeric}>{formatCurrency(entry.total_debit)}</td>
                <td className={styles.numeric}>{formatCurrency(entry.total_credit)}</td>
              </tr>
            }
          />
        </>
      )}
    </Modal>
  );
}
