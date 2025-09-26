'use client';
import Link from "next/link";

const skills = [
  { id: "use-of-english", label: "Use of English", emoji: "📘" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "listening", label: "Listening", emoji: "🎧" },
  { id: "speaking", label: "Speaking", emoji: "🗣️" },
  { id: "reading", label: "Reading", emoji: "📖" },
  { id: "vocabulary", label: "Vocabulary", emoji: "🧠" },
  { id: "all", label: "All Together", emoji: "🧩" },
  { id: "challenge", label: "Challenge", emoji: "🏆" }, // <- Nueva opción
];

export default function B1LevelPage() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Segoe UI, sans-serif",
        textAlign: "center",
        background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌟 Level B1</h1>
      <p style={{ marginBottom: "2rem", color: "#444" }}>Choose a skill:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {skills.map((skill) => (
          <Link
            key={skill.id}
            href={`/training/b1/${skill.id}`} // Cambia "b1" si es otro nivel
            style={{
              padding: "2rem 1rem",
              backgroundColor: "#d6eaff",
              borderRadius: "16px",
              textDecoration: "none",
              fontWeight: "bold",
              color: "#003366",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>{skill.emoji}</div>
            {skill.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
