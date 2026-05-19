'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { normalizeRoleName, getRoleNameByUserId, peekCachedRoleName } from '@/utils/authRoles';
import { isPublicPath } from '@/utils/publicRoutes';
import Link from 'next/link';
import { UserRoleProvider } from '../context/UserRoleContext';
import ExamNavigationGuard from '../components/ExamNavigationGuard';
import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import DeferredSiteAssistant from '@/components/chat/DeferredSiteAssistant';
import DeferredAppSideMenu from '@/components/layout/DeferredAppSideMenu';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';

const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  { ssr: false },
);
const AppNav = dynamic(() => import('@/components/layout/AppNav'), { ssr: false });

export default function RootLayoutClient({ children }) {
  /** Solo bloquea hasta conocer la sesión; el rol se resuelve en segundo plano. */
  const [authPending, setAuthPending] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !isPublicPath(window.location.pathname);
  });
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [cookieConsent, setCookieConsent] = useState(null);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    personalization: false,
  });
  const router = useRouter();
  const pathname = usePathname();
  const roleFetchedForUserIdRef = useRef(null);
  const lastAccessTokenRef = useRef(null);

  useActivityHeartbeat(session);

  const isPublic = isPublicPath(pathname);
  const isNivelesRoute =
    pathname === '/niveles' || (pathname && pathname.startsWith('/niveles/'));
  const allowWithoutAuth = isPublic || isNivelesRoute;

  useEffect(() => {
    if (allowWithoutAuth) setAuthPending(false);
  }, [allowWithoutAuth]);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async (newSession) => {
      if (cancelled) return;

      const accessToken = newSession?.access_token ?? null;
      const uid = newSession?.user?.id ?? null;
      const sameSession =
        accessToken &&
        accessToken === lastAccessTokenRef.current &&
        uid &&
        roleFetchedForUserIdRef.current === uid;

      lastAccessTokenRef.current = accessToken;
      setSession(newSession);

      if (!allowWithoutAuth) setAuthPending(false);

      if (!uid) {
        roleFetchedForUserIdRef.current = null;
        setUserRole('student');
        return;
      }

      const cachedRole = peekCachedRoleName(uid);
      if (cachedRole) {
        setUserRole(normalizeRoleName(cachedRole));
      }

      if (sameSession) return;

      void getRoleNameByUserId(uid, newSession.user.email).then((roleName) => {
        if (cancelled) return;
        roleFetchedForUserIdRef.current = uid;
        setUserRole(normalizeRoleName(roleName));
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void hydrateAuth(session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      void hydrateAuth(newSession);
    });
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [allowWithoutAuth]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dralo_cookie_consent');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.preferences) {
        setCookiePreferences({
          necessary: true,
          analytics: Boolean(parsed.preferences.analytics),
          personalization: Boolean(parsed.preferences.personalization),
        });
      }
      setCookieConsent(parsed);
    } catch (_error) {
      setCookieConsent(null);
    }
  }, []);

  // ⚠️ Redirige DESPUÉS del render (no aplica a rutas públicas ni /niveles/*)
  useEffect(() => {
    if (!authPending && !allowWithoutAuth && !session) {
      router.replace('/login');
    }
  }, [authPending, allowWithoutAuth, session, router]);

  if (!allowWithoutAuth && authPending) {
    return (
      <>
        <Toaster position="top-center" reverseOrder={false} />
        <header className="site-header">
          <div className="site-header__bar">
            <Link href="/" className="site-header__logo">
              <img src="/uk-flag.png" alt="UK Flag" className="site-header__flag bandera" />
              <span>Dralo</span>
            </Link>
          </div>
        </header>
        <main className="page-content">
          <RouteLoadingMascot label="Cargando" variant={3} />
        </main>
      </>
    );
  }

  if (!allowWithoutAuth && !session) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const saveCookieConsent = (preferences, mode) => {
    const payload = {
      mode,
      updatedAt: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(preferences.analytics),
        personalization: Boolean(preferences.personalization),
      },
    };

    localStorage.setItem('dralo_cookie_consent', JSON.stringify(payload));
    setCookiePreferences(payload.preferences);
    setCookieConsent(payload);
    setShowCookieSettings(false);
  };

  const acceptAllCookies = () => {
    saveCookieConsent(
      {
        analytics: true,
        personalization: true,
      },
      'all'
    );
  };

  const acceptNecessaryCookies = () => {
    saveCookieConsent(
      {
        analytics: false,
        personalization: false,
      },
      'necessary_only'
    );
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      <header className="site-header">
        <div className="site-header__bar">
          <Link href="/" className="site-header__logo">
            <img src="/uk-flag.png" alt="UK Flag" className="site-header__flag bandera" />
            <span>Dralo</span>
          </Link>

          <AppNav session={session} userRole={userRole} onLogout={handleLogout} />
        </div>
      </header>

      <main className="page-content">
        <UserRoleProvider userRole={userRole} session={session}>
          <ExamNavigationGuard>
            {children}
          </ExamNavigationGuard>
          {pathname === '/' && <DeferredAppSideMenu defaultOpen />}
        </UserRoleProvider>
      </main>

      <DeferredSiteAssistant enabled={Boolean(session)} />

      {!cookieConsent && (
        <div className="cookie-banner" role="dialog" aria-label="Configuracion de cookies">
          <div className="cookie-banner-content">
            <p>
              Este sitio web utiliza cookies y herramientas relacionadas.
              Diferenciamos entre cookies necesarias y otras opcionales para
              mejorar la experiencia. Puedes encontrar mas informacion en nuestra{' '}
              <Link href="/politica-cookies">Politica de cookies</Link> y{' '}
              <Link href="/politica-privacidad">Politica de privacidad</Link>.
            </p>
            <div className="cookie-banner-actions">
              <button onClick={acceptAllCookies} className="cookie-btn cookie-btn-primary" type="button">
                Aceptar todas las cookies
              </button>
              <button onClick={acceptNecessaryCookies} className="cookie-btn cookie-btn-secondary" type="button">
                Solo cookies necesarias
              </button>
              <button onClick={() => setShowCookieSettings((prev) => !prev)} className="cookie-btn cookie-btn-link" type="button">
                Ajustar la configuracion de cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {showCookieSettings && (
        <div className="cookie-settings-panel" role="dialog" aria-label="Ajustes de cookies">
          <h4>Configuracion de cookies</h4>
          <label>
            <input type="checkbox" checked disabled />
            Cookies necesarias (siempre activas)
          </label>
          <label>
            <input
              type="checkbox"
              checked={cookiePreferences.analytics}
              onChange={(e) =>
                setCookiePreferences((prev) => ({
                  ...prev,
                  analytics: e.target.checked,
                }))
              }
            />
            Cookies analiticas
          </label>
          <label>
            <input
              type="checkbox"
              checked={cookiePreferences.personalization}
              onChange={(e) =>
                setCookiePreferences((prev) => ({
                  ...prev,
                  personalization: e.target.checked,
                }))
              }
            />
            Cookies de personalizacion
          </label>
          <div className="cookie-settings-actions">
            <button
              type="button"
              className="cookie-btn cookie-btn-primary"
              onClick={() =>
                saveCookieConsent(
                  {
                    analytics: cookiePreferences.analytics,
                    personalization: cookiePreferences.personalization,
                  },
                  'custom'
                )
              }
            >
              Guardar configuracion
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn-secondary"
              onClick={() => setShowCookieSettings(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="footer legal-footer">
        <div className="legal-footer-content">
          <div className="legal-footer-column">
            <h3>Privacidad</h3>
            <ul>
              <li>
                <Link href="/politica-privacidad">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/politica-cookies">Política de cookies</Link>
              </li>
              <li>
                <Link href="/proteccion-datos">Protección de datos</Link>
              </li>
            </ul>
            <button
              type="button"
              className="legal-cookie-settings-link"
              onClick={() => setShowCookieSettings(true)}
            >
              Ajustes de cookies
            </button>
          </div>
          <div className="legal-footer-column">
            <h3>Legal</h3>
            <ul>
              <li>
                <Link href="/terminos-condiciones">Términos y condiciones</Link>
              </li>
              <li>
                <Link href="/aviso-legal">Aviso legal</Link>
              </li>
              <li>
                <Link href="/politica-reembolsos">Política de reembolsos</Link>
              </li>
              <li>
                <Link href="/normas-comunidad">Normas de comunidad</Link>
              </li>
              <li>
                <Link href="/contacto">Contacta con nosotros</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="legal-footer-copy">
          Ejercicios disenados para practicar tus habilidades en ingles.
        </p>
        <p className="legal-footer-copy">
          © {new Date().getFullYear()} Dralo
        </p>
      </footer>
    </>
  );
}
