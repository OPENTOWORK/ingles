'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { supabase } from '@/utils/supabaseClient';

// ====== Datos ======
const NIVELES = [
  { 
    nivel: "A1", 
    nombre: "Acceso", 
    descripcion: "Principiante - Expresiones cotidianas básicas",
    color: "#7bed9f",
    habilidades: "Presentarse, información personal, necesidades inmediatas",
    duracion: "90 minutos",
    partes: "Reading & Writing (70 min), Listening (20 min), Speaking (8-10 min)"
  },
  { 
    nivel: "A2", 
    nombre: "Plataforma", 
    descripcion: "Elemental - Comunicación simple y directa",
    color: "#58cc02",
    habilidades: "Tareas rutinarias, intercambio de información, descripción del entorno",
    duracion: "100 minutos",
    partes: "Reading & Writing (70 min), Listening (30 min), Speaking (8-10 min)"
  },
  { 
    nivel: "B1", 
    nombre: "Umbral", 
    descripcion: "Intermedio - Temas familiares y situaciones cotidianas",
    color: "#ff9900",
    habilidades: "Viajes, experiencias, planes, opiniones justificadas",
    duracion: "140 minutos",
    partes: "Reading (45 min), Writing (45 min), Listening (30 min), Speaking (14 min)"
  },
  { 
    nivel: "B2", 
    nombre: "Avanzado", 
    descripcion: "Intermedio Alto - Textos complejos y fluidez",
    color: "#1cb0f6",
    habilidades: "Interacción fluida, textos detallados, argumentación",
    duracion: "209 minutos",
    partes: "Reading & Use of English (75 min), Writing (80 min), Listening (40 min), Speaking (14 min)"
  },
  { 
    nivel: "C1", 
    nombre: "Dominio Operativo", 
    descripcion: "Avanzado - Textos extensos y sentidos implícitos",
    color: "#8e44ad",
    habilidades: "Expresión fluida, uso flexible del idioma, textos complejos",
    duracion: "236 minutos",
    partes: "Reading & Use of English (90 min), Writing (90 min), Listening (40 min), Speaking (16 min)"
  },
  { 
    nivel: "C2", 
    nombre: "Maestría", 
    descripcion: "Experto - Comprensión total y expresión precisa",
    color: "#e74c3c",
    habilidades: "Comprensión total, expresión espontánea, matices de significado",
    duracion: "230 minutos",
    partes: "Reading & Use of English (90 min), Writing (90 min), Listening (40 min), Speaking (16 min)"
  }
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
            {NIVELES.map((nivelData) => (
              <li key={nivelData.nivel}>
                <Link href={`/niveles/${nivelData.nivel.toLowerCase()}`} className="card" style={{ borderColor: nivelData.color }}>
                  <div className="card__header" style={{ backgroundColor: nivelData.color }}>
                    <div className="card__title">{nivelData.nivel} – {nivelData.nombre}</div>
                  </div>
                  <div className="card__content">
                    <div className="card__description">{nivelData.descripcion}</div>
                    <div className="card__skills">
                      <strong>Habilidades:</strong> {nivelData.habilidades}
                    </div>
                    <div className="card__exam-info">
                      <div className="exam-detail">
                        <span className="exam-label">⏱️ Duración:</span>
                        <span>{nivelData.duracion}</span>
                      </div>
                      <div className="exam-detail">
                        <span className="exam-label">📋 Partes:</span>
                        <span>{nivelData.partes}</span>
                      </div>
                    </div>
                  </div>
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
      .card{display:block;height:100%;border:2px solid #eaeaea;border-radius:18px;background:var(--card);padding:0;transition:transform .2s, box-shadow .2s, border-color .2s;overflow:hidden}
      .card:hover{transform:translateY(-2px);box-shadow:0 18px 40px rgba(0,0,0,.15)}
      .card:focus{outline:none;box-shadow:0 0 0 6px rgba(0,112,243,.35)}
      .card__header{color:white;padding:16px 18px;font-weight:600}
      .card__title{font-size:16px;font-weight:600;line-height:1.25;color:white;margin:0}
      .card__content{padding:18px}
      .card__description{margin:0 0 12px;color:#666;font-size:14px;line-height:1.4}
      .card__skills{margin:0 0 16px;font-size:13px;color:#4a5568;line-height:1.4}
      .card__skills strong{color:#2d3748}
      .card__exam-info{display:flex;flex-direction:column;gap:8px}
      .exam-detail{display:flex;align-items:flex-start;gap:8px;font-size:12px}
      .exam-label{font-weight:600;color:#667eea;min-width:80px;flex-shrink:0}
      .exam-detail span:last-child{color:#4a5568;line-height:1.3}
      .loader{width:48px;height:48px;border-radius:50%;border:3px solid rgba(0,112,243,.2);border-top-color:#0070f3;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}
