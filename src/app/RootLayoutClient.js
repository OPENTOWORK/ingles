'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import Link from 'next/link';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { Toaster } from 'react-hot-toast';
import { ExamProvider } from '../context/ExamContext';

export default function RootLayoutClient({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const publicRoutes = ['/', '/login', '/registro', '/reset-password'];
  // Normalizar pathname removiendo barra final para comparación
  const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const isPublic = publicRoutes.includes(normalizedPathname);

  // Debug: agregar logging temporal
  console.log('Current pathname:', pathname);
  console.log('Normalized pathname:', normalizedPathname);
  console.log('Is public route:', isPublic);
  console.log('Loading:', loading);
  console.log('Session:', session);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };
    
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    console.log('Redirect check:', { loading, session: !!session, isPublic, pathname: normalizedPathname });
    if (!loading && !session && !isPublic) {
      console.log('Redirecting to login from:', pathname);
      router.replace('/login');
    }
  }, [loading, session, isPublic, router, normalizedPathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>;
  }

  return (
    <ExamProvider>
      <Toaster position="top-center" reverseOrder={false} />

      <header className="header">
        <div className="container">
          <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>
            <img src="/uk-flag.png" alt="UK Flag" className="bandera" />
            <span>English Practice</span>
          </Link>

          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/teoria">Theory</Link>
            <Link href="/niveles">Levels</Link>
            <Link href="/prueba-nivel">Placement Test</Link>
            <Link href="/training">Training</Link>
            <Link href="/contacto">Contact</Link>

            {session ? (
              <>
                <Link href="/perfil">Profile</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0070f3',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    padding: 0,
                    marginLeft: '1rem',
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login">Login</Link>
            )}
          </nav>

          <LanguageSwitcher />
        </div>
      </header>

      <main className="page-content">
        {children}
      </main>

      <footer
        className="footer"
        style={{
          textAlign: "center",
          padding: "1rem",
          fontSize: "0.85rem",
          color: "#666",
        }}
      >
        <p style={{ margin: 0 }}>
          Exercises designed to practice the same format as Cambridge exams. <br />
          Not affiliated with or endorsed by Cambridge English.
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#777" }}>
          © {new Date().getFullYear()} English Practice
        </p>
      </footer>
    </ExamProvider>
  );
}
