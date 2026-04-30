'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { getRedirectPathByUserId } from '@/utils/authRoles';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const router = useRouter();

  // ✅ Paso 9: redirigir si ya hay sesión
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: { user } } = await supabase.auth.getUser();
        router.push(await getRedirectPathByUserId(user?.id, user?.email));
      }
    };
    checkSession();
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

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    toast.dismiss(loadingToast);
    setLoading(false);

    if (error) {
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
    } else {
      toast.success("Inicio de sesión exitoso");
      setFailedAttempts(0);

      const { data: { user } } = await supabase.auth.getUser();
      router.push(await getRedirectPathByUserId(user?.id, user?.email));
    }
  };

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast.error("Error con el inicio de sesión de " + provider);
    }
  };

  return (
    <main style={styles.main}>
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
        <input
          id="password"
          type="password"
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
          onClick={() => handleOAuthLogin('google')}
          style={{
            ...styles.button,
            backgroundColor: "#db4437",
            marginBottom: "1rem"
          }}
        >
          Continuar con Google
        </button>

        <button
          onClick={() => handleOAuthLogin('github')}
          style={{
            ...styles.button,
            backgroundColor: "#333"
          }}
        >
          Continuar con GitHub
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
