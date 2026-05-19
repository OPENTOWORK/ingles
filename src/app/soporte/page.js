'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { userHasRole } from '@/utils/authRoles';
import SupportTicketsPanel from '@/components/support/SupportTicketsPanel';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function SoportePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const canAccess = await userHasRole(user.id, ['soporte', 'admin', 'administrador']);
      if (!canAccess) {
        router.push('/perfil');
        return;
      }
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        <RouteLoadingMascot label="Cargando soporte…" variant={8} />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <PageHero
        eyebrow="Soporte"
        title="Centro de ayuda"
        description="Gestiona tickets y consultas de usuarios."
        mascotVariant={8}
        mascotWidth={130}
        accent="ocean"
      />
      <SupportTicketsPanel />
    </main>
  );
}
