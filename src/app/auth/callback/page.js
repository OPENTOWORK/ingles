'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRedirectPathByUserId } from '@/utils/authRoles';
import { normalizePostAuthPath } from '@/utils/postAuthNavigation';
import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import toast from 'react-hot-toast';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('Completando inicio de sesión...');

  useEffect(() => {
    let cancelled = false;

    const finishAuth = async () => {
      try {
        const errorDescription =
          searchParams.get('error_description') || searchParams.get('error');
        if (errorDescription) {
          throw new Error(errorDescription);
        }

        // Flujo PKCE: Supabase devuelve ?code=... que hay que canjear por sesión.
        // El cliente de navegador ya canjea el código automáticamente al
        // detectarlo en la URL, así que este intento suele fallar por verifier
        // consumido. No es un error real: solo cuenta si al final no hay sesión.
        const code = searchParams.get('code');
        let exchangeError = null;
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            exchangeError = error;
            console.warn('[auth/callback] canje PKCE no necesario o ya realizado:', error.message);
          }
        }

        // Flujo implicit: el token llega en el hash (#access_token=...).
        // supabase-js lo detecta automáticamente al inicializarse, así que basta
        // con esperar a tener sesión.
        let session = null;
        for (let i = 0; i < 20; i++) {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            session = data.session;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 150));
          if (cancelled) return;
        }

        if (!session) {
          throw exchangeError || new Error('No se pudo recuperar la sesión tras el login.');
        }

        const user = session.user;

        // Quien entra por Google no pasa por /registro, así que su fila de
        // aplicación puede no existir todavía.
        await ensureAppUserProfile().catch(() => {});

        const redirectPath = await getRedirectPathByUserId(user?.id, user?.email);
        const destination = normalizePostAuthPath(redirectPath);

        if (cancelled) return;
        toast.success('Sesión iniciada correctamente');
        router.replace(destination);
      } catch (err) {
        console.error('Error en /auth/callback:', err);
        if (cancelled) return;
        toast.error(
          'No se pudo completar el inicio de sesión. ' +
            (err?.message || 'Inténtalo de nuevo.')
        );
        setMessage('Error iniciando sesión. Redirigiendo al login...');
        setTimeout(() => router.replace('/login'), 1500);
      }
    };

    finishAuth();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main
      style={{
        maxWidth: 480,
        margin: '6rem auto',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'Segoe UI, sans-serif',
      }}
    >
      <h2 style={{ marginBottom: '1rem' }}>Conectando con tu proveedor...</h2>
      <p style={{ color: '#666' }}>{message}</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            maxWidth: 480,
            margin: '6rem auto',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'Segoe UI, sans-serif',
          }}
        >
          <h2>Conectando con tu proveedor...</h2>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
