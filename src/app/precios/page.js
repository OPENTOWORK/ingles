'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import SubscriptionPlansSection from '@/components/subscriptions/SubscriptionPlansSection';
import PageHero from '@/components/PageHero';
import { DRALO_SUBSCRIPTION_PLANS } from '@/data/financialPlanConfig';
import { useUserRole } from '@/context/UserRoleContext';
import { canViewPricing } from '@/utils/pricingAccess';

function planHeroStatLabel(plan) {
  if (!plan.precio || plan.precio <= 0) return 'Gratis';
  if (plan.recommended) return 'Más popular';
  if (plan.badgeVariant === 'value') return 'Mejor valor';
  return plan.precioLabel?.replace('/mes', '') || `${plan.precio}€`;
}

const PLAN_HERO_STATS = DRALO_SUBSCRIPTION_PLANS.map((plan) => ({
  value: plan.nombre,
  label: planHeroStatLabel(plan),
}));

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
        accent="indigo"
        showMascot
        mascotVariant={9}
        stats={PLAN_HERO_STATS}
      />

      <SubscriptionPlansSection
        selectedSlug={selected}
        title="Compara y elige"
        showCta
        enableCheckout
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
