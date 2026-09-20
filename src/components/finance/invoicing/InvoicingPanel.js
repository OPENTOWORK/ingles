'use client';

import { useCallback, useEffect, useState } from 'react';
import FinanceShell from '@/components/finance/FinanceShell';
import RegisterPaymentModal from '@/components/finance/RegisterPaymentModal';
import { ErrorBanner, SuccessBanner } from '@/components/finance/ui';
import { financeFetch } from '@/lib/finance/client';
import InvoiceDashboardTab from './InvoiceDashboardTab';
import InvoiceListTab from './InvoiceListTab';
import InvoiceFormModal from './InvoiceFormModal';
import InvoiceDetailModal from './InvoiceDetailModal';
import ClientsTab from './ClientsTab';
import SeriesTab from './SeriesTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'invoices', label: 'Facturas emitidas' },
  { id: 'purchases', label: 'Facturas recibidas' },
  { id: 'clients', label: 'Clientes' },
  { id: 'suppliers', label: 'Proveedores' },
  { id: 'series', label: 'Series' },
];

/** Módulo de Facturación completo. */
export default function InvoicingPanel() {
  const [tab, setTab] = useState('dashboard');
  const [catalog, setCatalog] = useState(null);
  const [catalogError, setCatalogError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [notice, setNotice] = useState('');

  const [formState, setFormState] = useState({ open: false, invoiceId: null, direction: 'sale' });
  const [detailId, setDetailId] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);

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

  const direction = tab === 'purchases' ? 'purchase' : 'sale';

  function openCreate(nextDirection = direction) {
    setFormState({ open: true, invoiceId: null, direction: nextDirection });
  }

  function openEdit(invoiceId) {
    setDetailId(null);
    setFormState({ open: true, invoiceId, direction });
  }

  return (
    <FinanceShell
      module="facturacion"
      title="Facturación"
      subtitle="Emisión, seguimiento y cobro de facturas."
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      <ErrorBanner>{catalogError}</ErrorBanner>
      <SuccessBanner>{notice}</SuccessBanner>

      {tab === 'dashboard' && (
        <InvoiceDashboardTab
          direction="sale"
          reloadToken={reloadToken}
          onView={setDetailId}
          onCreate={() => openCreate('sale')}
        />
      )}

      {(tab === 'invoices' || tab === 'purchases') && (
        <InvoiceListTab
          catalog={catalog}
          direction={direction}
          reloadToken={reloadToken}
          onView={setDetailId}
          onEdit={openEdit}
          onRegisterPayment={setPaymentTarget}
          onCreate={() => openCreate(direction)}
        />
      )}

      {tab === 'clients' && (
        <ClientsTab kind="customer" reloadToken={reloadToken} onChanged={() => refresh()} />
      )}

      {tab === 'suppliers' && (
        <ClientsTab kind="supplier" reloadToken={reloadToken} onChanged={() => refresh()} />
      )}

      {tab === 'series' && <SeriesTab catalog={catalog} onChanged={() => refresh()} />}

      <InvoiceFormModal
        open={formState.open}
        invoiceId={formState.invoiceId}
        direction={formState.direction}
        catalog={catalog}
        onClose={() => setFormState((prev) => ({ ...prev, open: false }))}
        onSaved={(result) =>
          refresh(result === 'issued' ? 'Factura emitida correctamente.' : 'Borrador guardado.')
        }
      />

      <InvoiceDetailModal
        open={Boolean(detailId)}
        invoiceId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={openEdit}
        onChanged={(action) =>
          refresh(
            action === 'issue'
              ? 'Factura emitida correctamente.'
              : action === 'rectify'
                ? 'Factura rectificativa emitida.'
                : action === 'cancel'
                  ? 'Factura anulada.'
                  : '',
          )
        }
        onRegisterPayment={(invoice) => {
          setDetailId(null);
          setPaymentTarget(invoice);
        }}
      />

      <RegisterPaymentModal
        open={Boolean(paymentTarget)}
        invoice={paymentTarget}
        direction={paymentTarget?.direction || 'sale'}
        treasuryAccounts={catalog?.treasuryAccounts || []}
        onClose={() => setPaymentTarget(null)}
        onRegistered={() =>
          refresh(
            paymentTarget?.direction === 'purchase'
              ? 'Pago registrado. Se ha creado el movimiento de tesorería.'
              : 'Cobro registrado. Se ha creado el movimiento de tesorería.',
          )
        }
      />
    </FinanceShell>
  );
}
