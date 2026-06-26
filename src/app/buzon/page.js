'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { canAccessStaffBuzon, getRoleNameByUserId } from '@/utils/authRoles';
import StaffBuzonPanelPage from '@/components/buzon/StaffBuzonPanelPage';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function BuzonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/buzon');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessStaffBuzon(role)) {
        router.push('/perfil');
        return;
      }

      setUserId(user.id);
      setLoading(false);
    };

    void checkAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="max-w-6xl mx-auto p-4 md:p-8 staff-buzon-page">
        <RouteLoadingMascot label="Cargando buzón y reuniones…" variant={3} />
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 staff-buzon-page">
      <PageHero
        eyebrow="Comunicación interna"
        title="Buzón y reuniones"
        description="Mensajería instantánea del equipo y planificación de reuniones con orden del día."
        mascotVariant={3}
        mascotWidth={120}
        accent="violet"
      />
      <StaffBuzonPanelPage currentUserId={userId} />
    </main>
  );
}
