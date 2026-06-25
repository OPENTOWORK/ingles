'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { canAccessStaffTasks, getRoleNameByUserId } from '@/utils/authRoles';
import StaffTasksPanelPage from '@/components/tasks/StaffTasksPanelPage';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

export default function TareasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');

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
      setUserEmail(user.email || '');
      setLoading(false);
    };

    void checkAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando panel de tareas…" variant={5} width={130} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <PanelPageHeader title="Panel de tareas" mascotVariant={5} mascotWidth={92}>
            <span className="text-sm text-gray-600">{userEmail}</span>
          </PanelPageHeader>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StaffTasksPanelPage currentUserId={userId} userRole={userRole} />
      </main>
    </div>
  );
}
