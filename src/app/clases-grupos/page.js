'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { userHasRole } from '@/utils/authRoles';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function ClasesGruposPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const canAccess = await userHasRole(user.id, ['clases/grupos', 'clases_grupos', 'group', 'admin', 'administrador']);
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
      <main className="max-w-4xl mx-auto p-8">
        <RouteLoadingMascot label="Cargando…" variant={3} />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <PageHero
        eyebrow="Clases"
        title="Panel de Clases/Grupos"
        description="Espacio para organizar grupos de alumnos y su seguimiento."
        mascotVariant={3}
        mascotWidth={140}
        accent="emerald"
      />
    </main>
  );
}
