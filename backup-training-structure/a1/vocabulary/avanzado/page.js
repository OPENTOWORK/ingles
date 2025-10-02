"use client";
import Link from "next/link";

export default function AvanzadoPage() {
  const niveles = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", textAlign: "center" }}>
      <h1>🔴 Nivel Avanzado - Vocabulary</h1>
      <p>Desafíate con ejercicios avanzados. Selecciona un nivel:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
          maxWidth: "600px",
          marginInline: "auto",
        }}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <Link
            key={i}
            href={`/training/a1/vocabulary/avanzado/level-${i + 1}`}
            style={{
              padding: "1rem",
              backgroundColor: "#f8d7da",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              color: "#8b0000",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            Nivel {i + 1}
          </Link>
        ))}
      </div>
    </main>
  );
}
