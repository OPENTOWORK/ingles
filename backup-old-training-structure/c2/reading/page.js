"use client";
import Link from "next/link";

const levels = [
  { id: "basico", label: "🟢 Basic", description: "Basic phrases and vocabulary" },
  { id: "intermedio", label: "🟡 Intermediate", description: "Simple sentence structures" },
  { id: "avanzado", label: "🔵 Advanced", description: "Comprehension challenges" },
];

export default function C2ReadingPage() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
        minHeight: "100vh",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎓 Level C2</h1>
      <p style={{ marginBottom: "2rem", color: "#555" }}>Choose a set of exercises</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2rem",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        {levels.map(({ id, label, description }) => (
          <Link
            key={id}
            href={`/training/c2/reading/${id}`} // ✅ corrected route
            style={{
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "12px",
              width: "100%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textDecoration: "none",
              color: "#333",
              fontWeight: "bold",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "1.5rem" }}>{label}</div>
            <div style={{ fontSize: "0.9rem", marginTop: "0.5rem", fontWeight: "normal" }}>
              {description}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}



