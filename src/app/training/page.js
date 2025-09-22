'use client';
import { useEffect, useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';

const sortedLevels = [
  { level: "A1", color: "#7bed9f", emoji: "😁" },
  { level: "B1", color: "#ff9900", emoji: "😄" },
  { level: "C1", color: "#8e44ad", emoji: "😌" },
  { level: "A2", color: "#58cc02", emoji: "☺️" },
  { level: "B2", color: "#1cb0f6", emoji: "😊" },
  { level: "C2", color: "#e74c3c", emoji: "😉" },
];

export default function TrainingHome() {
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

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎯 Choose Your Practice Level</h1>
      <p style={{ color: "#444", marginBottom: "2rem" }}>
        Start training your English with interactive exercises by level.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.5rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {sortedLevels.map(({ level, color, emoji }) => (
          <Link
            key={level}
            href={`/training/${level.toLowerCase()}`}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1rem",
              borderRadius: "12px",
              backgroundColor: color,
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "2.5rem" }}>{emoji}</div>
            <div style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>Level {level}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
