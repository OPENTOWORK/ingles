'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { supabase } from '@/utils/supabaseClient';

export default function Niveles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  if (loading) return <p style={{ textAlign: 'center' }}>Cargando...</p>;

  const niveles = [
    { nivel: "A1", nombre: "Key" },
    { nivel: "A2", nombre: "Key" },
    { nivel: "B1", nombre: "Preliminary" },
    { nivel: "B2", nombre: "First" },
    { nivel: "C1", nombre: "Advanced" },
    { nivel: "C2", nombre: "Proficiency" },
  ];

  return (
    <main>
      <h1 style={{ textAlign: "center", marginBottom: "1rem" }}>Selecciona un nivel</h1>
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        alignItems: "center",
        paddingTop: "1rem",
      }}>
        {niveles.map(({ nivel, nombre }) => (
          <Link
            key={nivel}
            href={`/niveles/${nivel.toLowerCase()}`}
            style={{
              padding: "1rem",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              textAlign: "center",
              textDecoration: "none",
              color: "#000",
              fontWeight: "bold",
              width: "200px",
            }}
          >
            {nivel} – {nombre}
          </Link>
        ))}
      </div>
    </main>
  );
}
