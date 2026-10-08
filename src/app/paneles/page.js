'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRoleNameByUserId } from '@/utils/authRoles';
import {
  getStaffPanelMenuItemsForRole,
  getStaffPanelMenuLabel,
} from '@/config/appNavMenu';
import { fetchStaffPermissionOverrides } from '@/lib/staffModuleGate';
import { STAFF_PANELS_HUB_PATH } from '@/config/staffPanelHub';
import PanelPageHeader from '@/components/PanelPageHeader';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
import StaffPanelsHub from '@/components/layout/StaffPanelsHub';

export default function PanelesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [permissionOverrides, setPermissionOverrides] = useState({});

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=${encodeURIComponent(STAFF_PANELS_HUB_PATH)}`);
        return;
      }

      const role = await getRoleNameByUserId(user.id, user.email);
      const overrides = await fetchStaffPermissionOverrides();
      const items = getStaffPanelMenuItemsForRole(role, overrides);

      if (!items.length) {
        router.push('/perfil');
        return;
      }

      if (items.length === 1) {
        router.replace(items[0].href);
        return;
      }

      setUserRole(role);
      setPermissionOverrides(overrides);
      setUserEmail(user.email || '');
      setLoading(false);
    };

    void checkAccess();
  }, [router]);

  const panelItems = useMemo(
    () => getStaffPanelMenuItemsForRole(userRole, permissionOverrides),
    [userRole, permissionOverrides],
  );
  const menuLabel = getStaffPanelMenuLabel(userRole);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RouteLoadingMascot label="Cargando paneles…" variant={5} width={130} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <PanelPageHeader
            title={menuLabel === 'Admin' ? 'Paneles de administración' : 'Paneles'}
            subtitle="Accede rápidamente a todas las áreas de gestión disponibles para tu rol."
            mascotVariant={5}
            mascotWidth={92}
          >
            <span className="text-sm text-gray-600">{userEmail}</span>
          </PanelPageHeader>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StaffPanelsHub items={panelItems} />
      </main>
    </div>
  );
}
