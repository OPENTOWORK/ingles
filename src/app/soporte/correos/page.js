'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import AutomatedEmailsPanel from '@/components/support/AutomatedEmailsPanel';
import GuideRequestsPanel from '@/components/marketing/GuideRequestsPanel';
import MarketingAudiencePanel from '@/components/marketing/MarketingAudiencePanel';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function CorreosAutomaticosPage() {
  const [loading, setLoading] = useState(true);
  const [access, setAccess] = useState({ templates: false, audience: false });
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      const [templates, audience] = await Promise.all([
        mayEnterStaffModule(role, 'soporte'),
        mayEnterStaffModule(role, 'planMarketing'),
      ]);
      if (!templates && !audience) {
        router.push('/perfil');
        return;
      }
      setAccess({ templates, audience });
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <RouteLoadingMascot label="Cargando correos…" variant={8} />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <PageHero
        eyebrow="Comercial"
        title="Correos automáticos"
        description="Plantillas que la plataforma envía sola: cuándo salen, a quién y con qué texto."
        mascotVariant={8}
        mascotWidth={130}
        accent="ocean"
      />
      {access.templates ? <AutomatedEmailsPanel /> : null}
      {access.audience ? (
        <div className={access.templates ? 'mt-10' : undefined}>
          <MarketingAudiencePanel />
          <div className="mt-4">
            <GuideRequestsPanel />
          </div>
        </div>
      ) : null}
    </main>
  );
}
