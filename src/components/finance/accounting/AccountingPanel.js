'use client';

import { useCallback, useEffect, useState } from 'react';
import FinanceShell from '@/components/finance/FinanceShell';
import { ErrorBanner, SuccessBanner } from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import AccountingDashboardTab from './AccountingDashboardTab';
import JournalTab from './JournalTab';
import LedgerTab from './LedgerTab';
import ChartOfAccountsTab from './ChartOfAccountsTab';
import FiscalYearsTab from './FiscalYearsTab';
import JournalEntryModal from './JournalEntryModal';
import JournalEntryDetailModal from './JournalEntryDetailModal';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'journal', label: 'Libro diario' },
  { id: 'ledger', label: 'Libro mayor' },
  { id: 'chart', label: 'Plan contable' },
  { id: 'years', label: 'Ejercicios' },
];

/** Módulo de Contabilidad completo. */
export default function AccountingPanel() {
  const [tab, setTab] = useState('dashboard');
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [notice, setNotice] = useState('');
  const [entryId, setEntryId] = useState(null);
  const [newEntryOpen, setNewEntryOpen] = useState(false);
  const [ledgerAccount, setLedgerAccount] = useState('');

  const loadCatalog = useCallback(async () => {
    try {
      setCatalog(await financeFetch('/api/admin/finanzas/catalogo'));
      setCatalogError('');
    } catch (err) {
      setCatalogError(err.message);
    }
  }, []);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const refresh = useCallback(
    (message) => {
      setReloadToken((token) => token + 1);
      loadCatalog();
      if (message) {
        setNotice(message);
        setTimeout(() => setNotice(''), 5000);
      }
    },
    [loadCatalog],
  );

  function openLedger(accountCode) {
    setLedgerAccount(accountCode);
    setTab('ledger');
  }

  return (
    <FinanceShell
      module="contabilidad"
      title="Contabilidad"
      subtitle="Libro diario, mayor, plan contable y ejercicios."
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <ErrorBanner>{catalogError}</ErrorBanner>
      <SuccessBanner>{notice}</SuccessBanner>

      {tab === 'dashboard' && (
        <AccountingDashboardTab reloadToken={reloadToken} onOpenEntry={setEntryId} />
      )}

      {tab === 'journal' && (
        <JournalTab
          catalog={catalog}
          reloadToken={reloadToken}
          onOpenEntry={setEntryId}
          onCreate={() => setNewEntryOpen(true)}
        />
      )}

      {tab === 'ledger' && (
        <LedgerTab
          catalog={catalog}
          initialAccount={ledgerAccount}
          reloadToken={reloadToken}
          onOpenEntry={setEntryId}
        />
      )}

      {tab === 'chart' && (
        <ChartOfAccountsTab reloadToken={reloadToken} onChanged={refresh} onOpenLedger={openLedger} />
      )}

      {tab === 'years' && <FiscalYearsTab reloadToken={reloadToken} onChanged={refresh} />}

      <JournalEntryModal
        open={newEntryOpen}
        catalog={catalog}
        onClose={() => setNewEntryOpen(false)}
        onSaved={() => refresh('Asiento contabilizado.')}
      />

      <JournalEntryDetailModal entryId={entryId} onClose={() => setEntryId(null)} />
    </FinanceShell>
  );
}
