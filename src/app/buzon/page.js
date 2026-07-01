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
      <main className="niveles-level-page niveles-level-page--b2 shell staff-buzon-page">
        <div className="levels-b2-page-content">
          <RouteLoadingMascot label="Cargando buzón y reuniones…" variant={3} />
        </div>
      </main>
    );
  }

  return (
    <main className="niveles-level-page niveles-level-page--b2 shell staff-buzon-page">
      <div className="levels-b2-page-content">
        <PageHero
          eyebrow="Comunicación interna"
          title="Buzón y reuniones"
          description="Mensajería instantánea del equipo y planificación de reuniones con orden del día."
          showMascot
          mascotVariant={3}
          mascotWidth={146}
          accent="violet"
        />
        <StaffBuzonPanelPage currentUserId={userId} />
      </div>
    </main>
  );
}
