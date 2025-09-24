'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { supabase } from '@/utils/supabaseClient';

// ====== Datos ======
const NIVELES = [
  { nivel: "A1", nombre: "Key", descripcion: "Nivel básico - Principiante" },
  { nivel: "A2", nombre: "Key", descripcion: "Nivel básico - Elemental" },
  { nivel: "B1", nombre: "Preliminary", descripcion: "Nivel intermedio - Intermedio bajo" },
  { nivel: "B2", nombre: "First", descripcion: "Nivel intermedio - Intermedio alto" },
  { nivel: "C1", nombre: "Advanced", descripcion: "Nivel avanzado - Avanzado" },
  { nivel: "C2", nombre: "Proficiency", descripcion: "Nivel avanzado - Maestría" },
];

// ====== Página ======
export default function Niveles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Auth
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

  if (loading) {
    return (
      <main className="shell niveles-page center">
        <div className="loader" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="shell niveles-page">
      <header className="header">
        <h1>Choose your level</h1>
        <p>Selecciona tu nivel de inglés para acceder a los ejercicios correspondientes.</p>
      </header>

      {/* Contenido */}
      <div className="sections">
        <section className="section">
          <div className="section__head">
            <h2>Niveles disponibles</h2>
            <span className="count">{NIVELES.length}</span>
          </div>
          <ul className="grid">
            {NIVELES.map(({ nivel, nombre, descripcion }) => (
              <li key={nivel}>
                <Link href={`/niveles/${nivel.toLowerCase()}`} className="card">
                  <div className="card__title">{nivel} – {nombre}</div>
                  <div className="card__description">{descripcion}</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <GlobalStyles />
    </main>
  );
}

// ====== Estilos (styled-jsx global + locales) ======
function GlobalStyles() {
  return (
    <style jsx global>{`
      .niveles-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .shell{min-height:100svh;max-width:1100px;margin:0 auto;padding:32px 20px}
      .center{display:grid;place-items:center}
      .header h1{font-size:44px;margin:0 0 6px;color:var(--text)}
      .header p{margin:0;color:#666}
      .sections{display:flex;flex-direction:column;gap:28px}
      .section{padding:6px}
      .section__head{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .section__head h2{margin:0;font-size:22px;color:var(--text)}
      .count{display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9999px;border:1px solid #eaeaea;background:var(--card);font-size:12px;color:#666}
      .grid{list-style:none;margin:0;padding:0;display:grid;gap:12px;grid-template-columns:repeat(1,minmax(0,1fr))}
      @media (min-width:640px){ .grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
      @media (min-width:980px){ .grid{grid-template-columns:repeat(3,minmax(0,1fr));} }
      .card{display:block;height:100%;border:1px solid #eaeaea;border-radius:18px;background:var(--card);padding:18px;transition:transform .2s, box-shadow .2s, border-color .2s}
      .card:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,0,0,.1);border-color:#0070f3;background:#b0d6fa}
      .card:focus{outline:none;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .card__title{font-size:18px;font-weight:600;line-height:1.25;color:var(--text);margin-bottom:8px}
      .card__description{font-size:14px;color:#666;line-height:1.4}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
