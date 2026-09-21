'use client';

import { usePathname } from 'next/navigation';
import ItPreviewRoleBanner from '@/components/layout/ItPreviewRoleBanner';
import DeferredAppSideMenu from '@/components/layout/DeferredAppSideMenu';
import PlacementTestNotice from '@/components/layout/PlacementTestNotice';
import ExamNavigationGuard from '@/components/ExamNavigationGuard';
import { UserRoleProvider } from '@/context/UserRoleContext';
import { GuidedTourProvider } from '@/context/GuidedTourContext';
import { PlacementAccessProvider } from '@/context/PlacementAccessContext';
import { useItPreviewRole } from '@/hooks/useItPreviewRole';
import { useItPreviewAdminBuzonLayout } from '@/hooks/useItPreviewAdminBuzonLayout';
import AppNav from '@/components/layout/AppNav';
import AdminShell from '@/components/admin/AdminShell';
import { shouldShowAdminShell } from '@/config/appNavMenu';
import StudySessionBarGate from '@/components/study/StudySessionBarGate';
import ProfileStudyTimerPill from '@/components/study/ProfileStudyTimerPill';

function SiteHeaderBrand({ nav = null }) {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <a href="/" className="site-header__logo">
          <img src="/uk-flag.png" alt="UK Flag" className="site-header__flag bandera" />
          <span>Dralo Academy</span>
        </a>
        {nav ? <div className="site-header__nav">{nav}</div> : null}
      </div>
    </header>
  );
}

export default function AuthenticatedAppShell({
  session,
  userRole,
  roleConfirmedForUserId = null,
  onLogout,
  children,
}) {
  const pathname = usePathname();
  const preview = useItPreviewRole(userRole, session);
  useItPreviewAdminBuzonLayout();
  const showAdminShell = shouldShowAdminShell(pathname, preview.userRole);
  const showStudyBar = Boolean(preview.session?.access_token) && !showAdminShell;

  return (
    <>
      {preview.isActive ? <ItPreviewRoleBanner option={preview.option} /> : null}

      <SiteHeaderBrand
        nav={<AppNav session={preview.session} userRole={preview.userRole} onLogout={onLogout} />}
      />
      <ProfileStudyTimerPill />

      <UserRoleProvider
        userRole={preview.userRole}
        session={preview.session}
        roleConfirmedForUserId={roleConfirmedForUserId}
      >
        <GuidedTourProvider>
          <PlacementAccessProvider session={preview.session} userRole={preview.userRole}>
            <PlacementTestNotice />
            <main className="page-content">
              <ExamNavigationGuard>
                {showAdminShell ? (
                  <AdminShell userRole={preview.userRole}>{children}</AdminShell>
                ) : (
                  children
                )}
              </ExamNavigationGuard>
              {pathname === '/' && <DeferredAppSideMenu defaultOpen={false} />}
            </main>
            {showStudyBar ? (
              <StudySessionBarGate session={preview.session} userRole={preview.userRole} />
            ) : null}
          </PlacementAccessProvider>
        </GuidedTourProvider>
      </UserRoleProvider>
    </>
  );
}
