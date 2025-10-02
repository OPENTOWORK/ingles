"use client";
import Link from "next/link";

export default function B2IntermedioPage() {
  const niveles = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", textAlign: "center" }}>
      <h1>🟡 Nivel Intermedio - listening</h1>
      <p>Selecciona un nivel para comenzar tu práctica:</p>

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
        {niveles.map((num) => (
          <Link
            key={num}
            href={`/training/b2/listening/intermedio/level-${num}`}
            style={{
              padding: "1rem",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
              color: "#92400e",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            Nivel {num}
          </Link>
        ))}
      </div>
    </main>
  );
}
