'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { canAccessStaffTasks, getRoleNameByUserId } from '@/utils/authRoles';
import StaffTasksPanelPage from '@/components/tasks/StaffTasksPanelPage';
import PageHero from '@/components/PageHero';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function TareasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login?next=/tareas');
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      if (!canAccessStaffTasks(role)) {
        router.push('/perfil');
        return;
      }

      setUserId(user.id);
      setUserRole(role);
      setLoading(false);
    };

    void checkAccess();
  }, [router]);

  if (loading) {
    return (
      <main className="niveles-level-page niveles-level-page--b2 shell staff-tareas-page">
        <div className="levels-b2-page-content">
          <div className="staff-tareas-panel staff-tareas-panel--loading">
            <RouteLoadingMascot label="Cargando panel de tareas…" variant={5} width={130} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="niveles-level-page niveles-level-page--b2 shell staff-tareas-page">
      <div className="levels-b2-page-content">
        <div className="staff-tareas-panel">
          <PageHero
            eyebrow="Organización del equipo"
            title="Panel de tareas"
            description="Organiza el trabajo del equipo, controla fechas límite y revisa el avance por fases."
            showMascot
            mascotVariant={5}
            mascotWidth={146}
            accent="violet"
          />
          <StaffTasksPanelPage currentUserId={userId} userRole={userRole} />
        </div>
      </div>
    </main>
  );
}
