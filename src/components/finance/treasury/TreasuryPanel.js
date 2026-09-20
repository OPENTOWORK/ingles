'use client';

import { useCallback, useEffect, useState } from 'react';
import FinanceShell from '@/components/finance/FinanceShell';
import RegisterPaymentModal from '@/components/finance/RegisterPaymentModal';
import { ErrorBanner, SuccessBanner } from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import TreasuryDashboardTab from './TreasuryDashboardTab';
import TreasuryAccountsTab from './TreasuryAccountsTab';
import MovementsTab from './MovementsTab';
import OpenItemsTab from './OpenItemsTab';
import ReconciliationTab from './ReconciliationTab';
import ForecastTab from './ForecastTab';

const TABS = [
  { id: 'dashboard', label: 'Resumen' },
  { id: 'accounts', label: 'Cuentas' },
  { id: 'movements', label: 'Movimientos' },
  { id: 'collections', label: 'Cobros' },
  { id: 'payments', label: 'Pagos' },
  { id: 'reconciliation', label: 'Conciliación' },
  { id: 'forecast', label: 'Previsión' },
];

/** Módulo de Tesorería completo. */
export default function TreasuryPanel() {
  const [tab, setTab] = useState('dashboard');
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [notice, setNotice] = useState('');
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [unreconciled, setUnreconciled] = useState(0);

  const loadCatalog = useCallback(async () => {
    try {
      const [catalogData, summary] = await Promise.all([
        financeFetch('/api/admin/finanzas/catalogo'),
        financeFetch('/api/admin/finanzas/tesoreria').catch(() => null),
      ]);
      setCatalog(catalogData);
      setUnreconciled(summary?.summary?.unreconciled_count || 0);
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

  const paymentDirection = tab === 'payments' ? 'purchase' : 'sale';

  return (
    <FinanceShell
      module="tesoreria"
      title="Tesorería"
      subtitle="Control de liquidez, cobros y pagos."
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tabCounts={{ reconciliation: unreconciled }}
    >
      <ErrorBanner>{catalogError}</ErrorBanner>
      <SuccessBanner>{notice}</SuccessBanner>

      {tab === 'dashboard' && <TreasuryDashboardTab reloadToken={reloadToken} />}

      {tab === 'accounts' && <TreasuryAccountsTab reloadToken={reloadToken} onChanged={refresh} />}

      {tab === 'movements' && (
        <MovementsTab catalog={catalog} reloadToken={reloadToken} onChanged={refresh} />
      )}

      {tab === 'collections' && (
        <OpenItemsTab
          direction="sale"
          catalog={catalog}
          reloadToken={reloadToken}
          onRegister={setPaymentTarget}
        />
      )}

      {tab === 'payments' && (
        <OpenItemsTab
          direction="purchase"
          catalog={catalog}
          reloadToken={reloadToken}
          onRegister={setPaymentTarget}
        />
      )}

      {tab === 'reconciliation' && (
        <ReconciliationTab catalog={catalog} reloadToken={reloadToken} onChanged={refresh} />
      )}

      {tab === 'forecast' && <ForecastTab reloadToken={reloadToken} />}

      <RegisterPaymentModal
        open={Boolean(paymentTarget)}
        invoice={paymentTarget}
        direction={paymentTarget?.direction || paymentDirection}
        treasuryAccounts={catalog?.treasuryAccounts || []}
        onClose={() => setPaymentTarget(null)}
        onRegistered={() =>
          refresh(
            paymentDirection === 'purchase'
              ? 'Pago registrado. Saldo y contabilidad actualizados.'
              : 'Cobro registrado. Saldo y contabilidad actualizados.',
          )
        }
      />
    </FinanceShell>
  );
}
