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
  TextInput,
  financeStyles as styles,
} from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import { formatCurrency, toCents } from '@/lib/finance/money';

function emptyLine() {
  return { account_code: '', concept: '', debit: '', credit: '' };
}

/**
 * Alta de asiento manual.
 * El botón de contabilizar se habilita solo con DEBE = HABER; el servidor y un
 * trigger de base de datos vuelven a comprobarlo antes de persistir.
 */
export default function JournalEntryModal({ open, onClose, onSaved, catalog }) {
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [concept, setConcept] = useState('');
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [accounts, setAccounts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setEntryDate(new Date().toISOString().slice(0, 10));
    setConcept('');
    setLines([emptyLine(), emptyLine()]);

    let cancelled = false;
    financeFetch('/api/admin/finanzas/contabilidad/plan', {
      params: { pageSize: 200, activeOnly: 'true' },
    })
      .then((data) => !cancelled && setAccounts(data.accounts || []))
      .catch(() => !cancelled && setAccounts([]));

    return () => {
      cancelled = true;
    };
  }, [open]);

  const totals = useMemo(() => {
    const debit = lines.reduce((acc, line) => acc + toCents(line.debit || 0), 0);
    const credit = lines.reduce((acc, line) => acc + toCents(line.credit || 0), 0);
    return { debit: debit / 100, credit: credit / 100, difference: (debit - credit) / 100 };
  }, [lines]);

  const balanced = Math.abs(totals.difference) < 0.005 && totals.debit > 0;
  const allAccountsSet = lines.every((line) => line.account_code);
  const canSubmit = balanced && allAccountsSet && concept.trim() && lines.length >= 2;

  function updateLine(index, field, value) {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        // Debe y haber son excluyentes dentro de una misma línea.
        if (field === 'debit' && value) return { ...line, debit: value, credit: '' };
        if (field === 'credit' && value) return { ...line, credit: value, debit: '' };
        return { ...line, [field]: value };
      }),
    );
  }

  async function submit() {
    setSaving(true);
    setError('');
    try {
      await financeFetch('/api/admin/finanzas/contabilidad/diario', {
        method: 'POST',
        body: {
          entry_date: entryDate,
          concept,
          lines: lines.map((line) => ({
            account_code: line.account_code,
            concept: line.concept || concept,
            debit: Number(line.debit) || 0,
            credit: Number(line.credit) || 0,
          })),
        },
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const openYears = (catalog?.fiscalYears || []).filter((year) => year.status === 'open');

  return (
    <Modal
      open={open}
      wide
      onClose={saving ? undefined : onClose}
      title="Nuevo asiento manual"
      subtitle="Un asiento contabilizado debe cuadrar: la suma del debe iguala la del haber."
      footer={
        <>
          <Button onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit} disabled={saving || !canSubmit}>
            {saving ? 'Contabilizando…' : 'Contabilizar'}
          </Button>
        </>
      }
    >
      <ErrorBanner>{error}</ErrorBanner>

      <div className={styles.filters}>
        <Field label="Fecha" htmlFor="entry-date">
          <TextInput
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </Field>
        <Field label="Concepto" htmlFor="entry-concept">
          <TextInput
            id="entry-concept"
            value={concept}
            placeholder="Descripción del asiento"
            onChange={(e) => setConcept(e.target.value)}
          />
        </Field>
      </div>

      {openYears.length === 0 && (
        <InfoBanner>
          No hay ejercicios abiertos. Abre uno en la pestaña Ejercicios para poder contabilizar.
        </InfoBanner>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ minWidth: 220 }}>Cuenta</th>
              <th>Concepto</th>
              <th className={styles.numeric} style={{ width: 130 }}>
                Debe
              </th>
              <th className={styles.numeric} style={{ width: 130 }}>
                Haber
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => (
              <tr key={index}>
                <td>
                  <Select
                    value={line.account_code}
                    onChange={(e) => updateLine(index, 'account_code', e.target.value)}
                  >
                    <option value="">Selecciona cuenta…</option>
                    {accounts.map((account) => (
                      <option key={account.code} value={account.code}>
                        {account.code} · {account.name}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <TextInput
                    value={line.concept}
                    placeholder="Opcional"
                    onChange={(e) => updateLine(index, 'concept', e.target.value)}
                  />
                </td>
                <td>
                  <NumberInput
                    step="0.01"
                    min="0"
                    value={line.debit}
                    onChange={(e) => updateLine(index, 'debit', e.target.value)}
                  />
                </td>
                <td>
                  <NumberInput
                    step="0.01"
                    min="0"
                    value={line.credit}
                    onChange={(e) => updateLine(index, 'credit', e.target.value)}
                  />
                </td>
                <td>
                  <Button
                    size="small"
                    variant="danger"
                    disabled={lines.length <= 2}
                    onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}
                    aria-label={`Eliminar línea ${index + 1}`}
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className={styles.tableFoot}>
            <tr>
              <td colSpan={2}>Totales</td>
              <td className={styles.numeric}>{formatCurrency(totals.debit)}</td>
              <td className={styles.numeric}>{formatCurrency(totals.credit)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={styles.rowBetween}>
        <Button size="small" onClick={() => setLines((prev) => [...prev, emptyLine()])}>
          + Añadir línea
        </Button>
        <span className={balanced ? styles.positive : styles.negative}>
          {balanced
            ? 'Asiento cuadrado'
            : `Descuadre de ${formatCurrency(Math.abs(totals.difference))}`}
        </span>
      </div>
    </Modal>
  );
}
