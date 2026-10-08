'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import SupportHub from '@/components/support/SupportHub';
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

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!(await mayEnterStaffModule(role, 'soporte'))) {
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
        description="Gestiona tickets, consultas y correos automáticos de la plataforma."
        mascotVariant={8}
        mascotWidth={130}
        accent="ocean"
      />
      <SupportHub />
    </main>
  );
}
