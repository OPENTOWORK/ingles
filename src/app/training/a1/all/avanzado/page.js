'use client';
import Link from "next/link";

export default function AvanzadoPage() {
  const niveles = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
        background: "linear-gradient(to right, #fff0f0, #ffe6e6)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        🔴 Nivel Avanzado - All Together
      </h1>
      <p style={{ color: "#555", marginBottom: "2rem" }}>
        Desafíate con ejercicios avanzados. Selecciona un nivel:
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {niveles.map((nivel) => (
          <Link
            key={nivel}
            href={`/training/a1/all/avanzado/level-${nivel}`}
            style={{
              padding: "1rem",
              backgroundColor: "#f8d7da",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: "bold",
              color: "#8b0000",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
              display: "inline-block",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            Nivel {nivel}
          </Link>
        ))}
      </div>
    </main>
  );
}
