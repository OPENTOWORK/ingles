'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
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

const AppNav = dynamic(() => import('@/components/layout/AppNav'), {
  ssr: true,
  loading: () => <div className="site-header__nav site-header__nav--loading" aria-hidden="true" />,
});

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

function AuthenticatedAppShellInner({ session, userRole, onLogout, children }) {
  const pathname = usePathname();
  const preview = useItPreviewRole(userRole, session);
  useItPreviewAdminBuzonLayout();

  return (
    <>
      {preview.isActive ? <ItPreviewRoleBanner option={preview.option} /> : null}

      <SiteHeaderBrand
        nav={<AppNav session={preview.session} userRole={preview.userRole} onLogout={onLogout} />}
      />

      <UserRoleProvider userRole={preview.userRole} session={preview.session}>
        <GuidedTourProvider>
          <PlacementAccessProvider session={preview.session} userRole={preview.userRole}>
            <PlacementTestNotice />
            <main className="page-content">
              <ExamNavigationGuard>{children}</ExamNavigationGuard>
              {pathname === '/' && <DeferredAppSideMenu defaultOpen={false} />}
            </main>
          </PlacementAccessProvider>
        </GuidedTourProvider>
      </UserRoleProvider>
    </>
  );
}

export default function AuthenticatedAppShell(props) {
  return (
    <Suspense fallback={null}>
      <AuthenticatedAppShellInner {...props} />
    </Suspense>
  );
}
