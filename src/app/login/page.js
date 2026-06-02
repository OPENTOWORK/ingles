'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRedirectPathByUserId } from '@/utils/authRoles';
import { completeSignIn } from '@/utils/completeSignIn';
import { getClientAuth } from '@/utils/getClientAuth';
import { clearLogoutPending } from '@/utils/logout';
import toast from 'react-hot-toast';
import SiteMascot from '@/components/SiteMascot';
import PasswordInput from '@/components/PasswordInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      clearLogoutPending();
      const { user } = await getClientAuth();
      if (cancelled || !user) return;
      const path = await getRedirectPathByUserId(user.id, user.email);
      if (!cancelled) router.replace(path);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setFailedAttempts(0);
      setLockoutUntil(null);
    }
  }, [lockoutUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast.error("Demasiados intentos fallidos. Intenta de nuevo en unos segundos.");
      return;
    }

    if (!email || !password) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Por favor, introduce un email válido.");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Iniciando sesión...");
    clearLogoutPending();

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.dismiss(loadingToast);
      setLoading(false);
      const message = error.message.toLowerCase();

      setFailedAttempts((prev) => {
        const next = prev + 1;
        if (next >= 5) {
          setLockoutUntil(Date.now() + 30 * 1000);
          toast.error("Has superado el número de intentos. Espera 30 segundos.");
        }
        return next;
      });

      if (message.includes("invalid login credentials")) {
        toast.error("Credenciales incorrectas. Intenta de nuevo.");
      } else if (message.includes("user not found")) {
        toast.error("Usuario no encontrado.");
      } else if (message.includes("email not confirmed")) {
        toast.error("Debes confirmar tu correo electrónico antes de iniciar sesión.");
      } else {
        console.error("Error desconocido de Supabase:", error);
        toast.error("Ha ocurrido un error inesperado. Intenta más tarde.");
      }
      return;
    }

    const result = await completeSignIn(signInData);

    toast.dismiss(loadingToast);
    setLoading(false);

    if (!result.ok) {
      console.error('completeSignIn failed:', result.reason, result.error);
      toast.error('No se pudo guardar la sesión. Inténtalo de nuevo.');
      return;
    }

    toast.success("Inicio de sesión exitoso");
    setFailedAttempts(0);

    try {
      const { ensureAppUserProfile } = await import('@/utils/ensureAppUserProfile');
      await ensureAppUserProfile();
    } catch {
      /* no bloquear login */
    }

    const path = await getRedirectPathByUserId(result.user.id, result.user.email);
    window.location.href = path;
  };

  const handleOAuthLogin = async (provider) => {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error(`Error OAuth (${provider}):`, error);
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('provider is not enabled') || msg.includes('unsupported provider')) {
        toast.error(
          `El proveedor ${provider} no está habilitado en Supabase. Actívalo en Authentication → Providers.`
        );
      } else {
        toast.error('No se pudo iniciar sesión con ' + provider + '. ' + error.message);
      }
    }
  };

  return (
    <main style={styles.main}>
      <div style={{ textAlign: "center", marginBottom: "1rem", lineHeight: 0 }}>
        <SiteMascot variant={3} width={132} alt="Dralo te da la bienvenida" />
      </div>
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login / Register</h2>

      <form onSubmit={handleLogin}>
        <label htmlFor="email" style={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password" style={{ ...styles.label, marginTop: "1rem" }}>Password</label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: loading ? "#999" : styles.button.backgroundColor,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Cargando..." : "Login"}
        </button>

        <p style={styles.linkText}>
          <a href="/reset-password" style={styles.link}>¿Has olvidado tu contraseña?</a>
        </p>
        <p style={styles.linkText}>
          ¿No tienes cuenta? <a href="/registro" style={styles.link}>Regístrate</a>
        </p>
      </form>

      <hr style={{ margin: "2rem 0" }} />

      <div>
        <button
          type="button"
          onClick={() => handleOAuthLogin('google')}
          style={{
            ...styles.button,
            backgroundColor: "#db4437",
          }}
        >
          Continuar con Google
        </button>
      </div>
    </main>
  );
}

const styles = {
  main: {
    maxWidth: "400px",
    margin: "4rem auto",
    padding: "2rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    fontFamily: "Segoe UI, sans-serif",
  },
  label: { display: "block", marginBottom: "0.5rem" },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    marginTop: "1.5rem",
    backgroundColor: "#0070f3",
    color: "white",
    fontWeight: "bold",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  linkText: { marginTop: "1rem", fontSize: "0.9rem", textAlign: "center", color: "#666" },
  link: { color: "#0070f3", textDecoration: "none" }
};
