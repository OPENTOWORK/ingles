'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function CentroEmpresaPage() {
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
      if (!(await mayEnterStaffModule(role, 'centroEmpresa'))) {
        router.push('/perfil');
        return;
      }
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <RouteLoadingMascot label="Cargando…" variant={5} />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <PageHero
        eyebrow="Organización"
        title="Panel Centro/Empresa"
        description="Espacio para la gestión de usuarios agrupados por centro educativo o empresa."
        mascotVariant={5}
        mascotWidth={140}
        accent="amber"
      />
    </main>
  );
}
