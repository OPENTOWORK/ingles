'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { normalizeRoleName, getRoleNameByUserId, ROLE_ROUTE_MAP } from '@/utils/authRoles';
import Link from 'next/link';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';
import { UserRoleProvider } from '../context/UserRoleContext';
import ExamNavigationGuard from '../components/ExamNavigationGuard';

const DRALO_MENU_ITEMS = [
  { label: 'Use of English', href: '/dralo-ai/use-of-english' },
  { label: 'Reading', href: '/dralo-ai/reading' },
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking', href: '/speaking' },
];

export default function RootLayoutClient({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [cookieConsent, setCookieConsent] = useState(null);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showDraloMenu, setShowDraloMenu] = useState(false);
  const draloMenuTimerRef = useRef(null);

  const openDraloMenu = () => {
    if (draloMenuTimerRef.current) {
      clearTimeout(draloMenuTimerRef.current);
      draloMenuTimerRef.current = null;
    }
    setShowDraloMenu(true);
  };
  const scheduleCloseDraloMenu = () => {
    if (draloMenuTimerRef.current) clearTimeout(draloMenuTimerRef.current);
    draloMenuTimerRef.current = setTimeout(() => setShowDraloMenu(false), 150);
  };
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    personalization: false,
  });
  const router = useRouter();
  const pathname = usePathname();
  const roleFetchedForUserIdRef = useRef(null);

  const publicRoutes = [
    '/',
    '/login',
    '/auth/callback',
    '/registro',
    '/reset-password',
    '/contacto',
    '/speaking',
    '/teoria',
    '/politica-privacidad',
    '/politica-cookies',
    '/terminos-condiciones',
    '/proteccion-datos',
  ];
  

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async (newSession) => {
      if (cancelled) return;
      setSession(newSession);
      if (!newSession?.user?.id) {
        roleFetchedForUserIdRef.current = null;
        setUserRole('student');
        if (!cancelled) setLoading(false);
        return;
      }
      const uid = newSession.user.id;
      if (roleFetchedForUserIdRef.current === uid) {
        if (!cancelled) setLoading(false);
        return;
      }
      const roleName = await getRoleNameByUserId(uid, newSession.user.email);
      if (cancelled) return;
      roleFetchedForUserIdRef.current = uid;
      setUserRole(normalizeRoleName(roleName));
      setLoading(false);
    };
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await hydrateAuth(data.session);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (cancelled) return;
      await hydrateAuth(newSession);
    });
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

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

  // incluye subrutas (p.ej. /reset-password/xyz)
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  /** Contenido Cambridge / niveles: debe verse sin login (cabecera sigue mostrando login si no hay sesión). */
  const isNivelesRoute =
    pathname === '/niveles' || (pathname && pathname.startsWith('/niveles/'));

  const allowWithoutAuth = isPublic || isNivelesRoute;

  // ⚠️ Redirige DESPUÉS del render (no aplica a rutas públicas ni /niveles/*)
  useEffect(() => {
    if (!loading && !allowWithoutAuth && !session) {
      router.replace('/login');
    }
  }, [loading, allowWithoutAuth, session, router]);

  // Mientras resolvemos sesión o estamos redirigiendo, no pintes nada (excepto públicas y niveles)
  if (!allowWithoutAuth && (loading || !session)) return null;

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

      <header 
        className="header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
        }}
      >
        <div 
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          <Link 
            href="/" 
            className="logo" 
            style={{ 
              textDecoration: 'none', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: '700',
              fontSize: '1.5rem',
              letterSpacing: '-0.025em',
            }}
          >
            <img 
              src="/uk-flag.png" 
              alt="UK Flag" 
              className="bandera" 
              style={{
                width: '32px',
                height: '24px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              }}
            />
            <span>Dralo</span>
          </Link>

          <nav 
            className="nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}
          >
            <Link 
              href="/"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Home</Link>
            <Link 
              href="/teoria"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Theory</Link>
            <Link 
              href="/niveles"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Levels</Link>
            <div
              style={{ position: 'relative' }}
              onMouseEnter={openDraloMenu}
              onMouseLeave={scheduleCloseDraloMenu}
            >
              <button
                type="button"
                onClick={() => setShowDraloMenu((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={showDraloMenu}
                style={{
                  background: showDraloMenu ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  border: 'none',
                  color: showDraloMenu ? 'white' : 'rgba(255, 255, 255, 0.9)',
                  cursor: 'pointer',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontFamily: 'inherit',
                }}
              >
                Dralo AI
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.2s ease',
                    transform: showDraloMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    fontSize: '0.7rem',
                  }}
                >
                  ▼
                </span>
              </button>
              {showDraloMenu && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'white',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)',
                    padding: '0.5rem',
                    minWidth: '210px',
                    zIndex: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                  }}
                >
                  {DRALO_MENU_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      onClick={() => setShowDraloMenu(false)}
                      style={{
                        color: '#374151',
                        textDecoration: 'none',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                        padding: '0.6rem 0.85rem',
                        borderRadius: '8px',
                        transition: 'background 0.2s ease, color 0.2s ease',
                        display: 'block',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.12)';
                        e.currentTarget.style.color = '#4f46e5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link 
              href="/prueba-nivel"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Placement Test</Link>
            <Link 
              href="/training"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Training</Link>
            <Link 
              href="/contacto"
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                fontSize: '0.95rem',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >Contact</Link>
            {session ? (
              <>
                {Object.entries(ROLE_ROUTE_MAP)
                  .filter(([role]) =>
                    ['admin', 'administrador', 'teacher', 'profesor', 'soporte', 'informatico', 'centro_empresa', 'centro/empresa', 'clases_grupos', 'clases/grupos']
                      .includes(role)
                  )
                  .filter(([role]) => role === userRole)
                  .map(([role, href]) => (
                    <Link
                      key={role}
                      href={href}
                      style={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        textDecoration: 'none',
                        fontWeight: '500',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        fontSize: '0.95rem',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      {role === 'admin' || role === 'administrador'
                        ? 'Admin'
                        : role === 'teacher' || role === 'profesor'
                          ? 'Profesor'
                          : role === 'soporte'
                            ? 'Soporte'
                            : role === 'informatico'
                              ? 'Informatico'
                              : role === 'centro_empresa' || role === 'centro/empresa'
                                ? 'Centro/Empresa'
                                : 'Clases/Grupos'}
                    </Link>
                  ))}
                <Link 
                  href="/perfil"
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'rgba(255, 255, 255, 0.9)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >Profile</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '500',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  fontSize: '0.95rem',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >Login</Link>
            )}
          </nav>

          <div style={{ marginLeft: '1rem' }}>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="page-content">
        <UserRoleProvider userRole={userRole} session={session}>
          <ExamNavigationGuard>
            {children}
          </ExamNavigationGuard>
        </UserRoleProvider>
      </main>

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
                <Link href="/politica-privacidad">Politica de privacidad</Link>
              </li>
              <li>
                <Link href="/politica-cookies">Politica de cookies</Link>
              </li>
              <li>
                <Link href="/terminos-condiciones">Terminos y condiciones</Link>
              </li>
              <li>
                <Link href="/proteccion-datos">Proteccion de datos</Link>
              </li>
              <li>
                <Link href="/contacto">Contacta con nosotros</Link>
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
