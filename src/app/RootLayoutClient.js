'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';
import { ExamProvider } from '../context/ExamContext';
import ExamNavigationGuard from '../components/ExamNavigationGuard';

export default function RootLayoutClient({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/', '/login', '/registro', '/reset-password'];
  

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    
    getSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // incluye subrutas (p.ej. /reset-password/xyz)
  const isPublic = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // ⚠️ Redirige DESPUÉS del render
  useEffect(() => {
    if (!loading && !isPublic && !session) {
      router.replace('/login');
    }
  }, [loading, isPublic, session, router]);

  // Mientras resolvemos sesión o estamos redirigiendo, no pintes nada
  if (!isPublic && (loading || !session)) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <ExamProvider>
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
        <ExamNavigationGuard>
          {children}
        </ExamNavigationGuard>
      </main>

      <footer className="footer" style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', color: '#666' }}>
        <p style={{ margin: 0 }}>
          Exercises designed to practice your English skills. <br />
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#777' }}>
          © {new Date().getFullYear()} Dralo
        </p>
      </footer>
    </ExamProvider>
  );
}
