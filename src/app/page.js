import Link from "next/link";

const cardStyle = {
  backgroundColor: "#cce4ff",
  padding: "1rem",
  borderRadius: "8px",
  color: "#003366",
  textDecoration: "none",
  fontWeight: "bold",
  textAlign: "center",
  transition: "background 0.3s",
};

export default function Home() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: "Arial",
        textAlign: "center",
        minHeight: "100vh",
        backgroundImage: 'url("/hero-background.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "#fff",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h1>Welcome to English Practice</h1>
        <p style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
          Prepare for Cambridge exams the smart and interactive way.
        </p>

        <blockquote
          style={{
            marginTop: "2rem",
            fontStyle: "italic",
            fontSize: "1.1rem",
            color: "#eee",
            backgroundColor: "rgba(0,0,0,0.4)",
            padding: "1rem",
            borderLeft: "5px solid #0070f3",
            borderRadius: "6px",
            maxWidth: "600px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          "The best preparation for tomorrow is doing your best today."
          <br />
          <span style={{ fontWeight: "bold" }}>– Your time is now</span>
        </blockquote>

        <div style={{ marginTop: "3rem" }}>
          <Link
            href="/niveles"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#0070f3",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Start Practicing
          </Link>
        </div>

        {/* Nuevo diseño horizontal con Flexbox */}
        <div
          style={{
            marginTop: "4rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            maxWidth: "1000px",
            marginInline: "auto",
          }}
        >
          <Link href="/teoria" style={cardStyle}>📖 Theory</Link>
          <Link href="/niveles" style={cardStyle}>📚 Levels</Link>
          <Link href="/prueba-nivel" style={cardStyle}>🧪 Test</Link>
          <Link href="/training" style={cardStyle}>🎮 Training</Link>
          <Link href="/login" style={cardStyle}>🔐 Login</Link>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "4rem",
          left: "1rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.5rem",
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: "1rem",
          borderRadius: "8px",
          fontSize: "0.9rem",
          maxWidth: "240px",
        }}
      >
        {[
          "✅ Interactive",
          "✅ Automatic correction",
          "✅ Cambridge-style format",
          "✅ Free to use",
        ].map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    </main>
  );
}
