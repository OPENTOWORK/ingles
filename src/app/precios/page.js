'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import SubscriptionPlansSection from '@/components/subscriptions/SubscriptionPlansSection';
import PageHero from '@/components/PageHero';
import { useUserRole } from '@/context/UserRoleContext';
import { canViewPricing } from '@/utils/pricingAccess';

function PreciosContent() {
  const searchParams = useSearchParams();
  const selected = searchParams.get('plan') || '';
  const router = useRouter();
  const { userRole } = useUserRole();
  const allowed = canViewPricing(userRole);

  useEffect(() => {
    if (!allowed) router.replace('/niveles');
  }, [allowed, router]);

  if (!allowed) {
    return (
      <main className="dralo-ai-page precios-page">
        <p style={{ padding: 24, color: '#64748b' }}>Redirigiendo…</p>
      </main>
    );
  }

  return (
    <main className="dralo-ai-page precios-page" style={{ '--dralo-accent-solid': '#6366f1' }}>
      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <span>Precios</span>
        </nav>
      </div>

      <PageHero
        eyebrow="Planes Dralo"
        title="Elige el plan que necesitas"
        description="Empieza gratis con A2, sube a STARTER o PREMIUM para preparar el examen, o desbloquea PRO con IA ilimitada y coaches avanzados."
        accent="indigo"
        showMascot
        mascotVariant={9}
        stats={[
          { value: '4', label: 'Planes' },
          { value: 'PREMIUM', label: 'Más popular' },
          { value: 'Stripe', label: 'Próximamente' },
        ]}
      />

      <SubscriptionPlansSection
        selectedSlug={selected}
        title="Compara y elige"
        subtitle="Todos los planes incluyen Placement Test. Los pagos online se activarán en cuanto conectemos Stripe."
        showCta
      />
    </main>
  );
}

export default function PreciosPage() {
  return (
    <Suspense fallback={<main className="dralo-ai-page"><p style={{ padding: 24 }}>Cargando…</p></main>}>
      <PreciosContent />
    </Suspense>
  );
}
