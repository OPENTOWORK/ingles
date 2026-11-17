'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ItResponsivePreviewPanel from '@/components/informatico/ItResponsivePreviewPanel';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import { mayEnterStaffModule } from '@/lib/staffModuleGate';
import { getRoleNameByUserId } from '@/utils/authRoles';
import { supabase } from '@/utils/supabaseClient';

const ACCESS_KEYS = ['profesor', 'profesorAdmin', 'coordinador', 'coordinadorAdmin', 'ejercicios', 'informatico'];

export default function AppPreviewPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      const role = await getRoleNameByUserId(user.id, user.email);
      if (!(await mayEnterStaffModule(role, ACCESS_KEYS))) {
        router.push('/perfil');
        return;
      }
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <RouteLoadingMascot label="Cargando la app…" variant={6} width={130} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <ItResponsivePreviewPanel variant="app" />
    </div>
  );
}
