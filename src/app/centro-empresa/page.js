'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { userHasRole } from '@/utils/authRoles';

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

      const canAccess = await userHasRole(user.id, ['centro/empresa', 'centro_empresa', 'organization', 'admin', 'administrador']);
      if (!canAccess) {
        router.push('/perfil');
        return;
      }
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) return null;

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Panel Centro/Empresa</h1>
      <p className="text-gray-700">
        Espacio para la gestion de usuarios agrupados por centro educativo o empresa.
      </p>
    </main>
  );
}
