'use client';

import Link from "next/link";

const cardStyle = {
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 60%, #ffffff 100%)",
  padding: "1.5rem",
  borderRadius: "16px",
  color: "white",
  textDecoration: "none",
  fontWeight: "600",
  textAlign: "center",
  transition: "all 0.3s ease",
  boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  minWidth: "160px",
  fontSize: "1rem",
};

export default function Home() {
  return (
    <main
      style={{
        padding: "2rem",
        fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        backgroundAttachment: "fixed",
        color: "#fff",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <h1 
          style={{
            fontSize: "3.5rem",
            fontWeight: "800",
            marginBottom: "1rem",
            background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.025em",
            textShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          Welcome to Dralo
        </h1>
        <p 
          style={{ 
            fontSize: "1.3rem", 
            marginTop: "1rem",
            color: "rgba(255, 255, 255, 0.9)",
            fontWeight: "400",
            letterSpacing: "0.025em",
          }}
        >
          Prepare for the smart and interactive way to learn English.
        </p>

        <blockquote
          style={{
            marginTop: "3rem",
            fontStyle: "italic",
            fontSize: "1.2rem",
            color: "rgba(255, 255, 255, 0.95)",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            padding: "2rem",
            borderLeft: "4px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "12px",
            maxWidth: "700px",
            marginLeft: "auto",
            marginRight: "auto",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          "The best preparation for tomorrow is doing your best today."
          <br />
          <span style={{ fontWeight: "600", marginTop: "0.5rem", display: "block" }}>
            – Your time is now
          </span>
        </blockquote>

        <div style={{ marginTop: "3rem" }}>
          <Link
            href="/niveles"
            style={{
              display: "inline-block",
              padding: "1rem 2rem",
              background: "rgba(255, 255, 255, 0.2)",
              color: "#fff",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "1.1rem",
              transition: "all 0.3s ease",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 12px 40px rgba(0, 0, 0, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 32px rgba(0, 0, 0, 0.1)";
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
            gap: "1.5rem",
            justifyContent: "center",
            maxWidth: "1000px",
            marginInline: "auto",
          }}
        >
          <Link 
            href="/teoria" 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.3)";
            }}
          >
            📖 Theory
          </Link>
          <Link 
            href="/niveles" 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.3)";
            }}
          >
            📚 Levels
          </Link>
          <Link 
            href="/prueba-nivel" 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.3)";
            }}
          >
            🧪 Placement Test
          </Link>
          <Link 
            href="/training" 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.3)";
            }}
          >
            🎮 Training
          </Link>
          <Link 
            href="/login" 
            style={cardStyle}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-4px) scale(1.02)";
              e.target.style.boxShadow = "0 12px 40px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 8px 32px rgba(102, 126, 234, 0.3)";
            }}
          >
            🔐 Login
          </Link>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "4rem",
          left: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "0.75rem",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "1.5rem",
          borderRadius: "12px",
          fontSize: "0.95rem",
          maxWidth: "280px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        }}
      >
        {[
          "✅ Interactive",
          "✅ Automatic correction",
          "✅ Free to use",
        ].map((item, i) => (
          <div 
            key={i} 
            style={{
              color: "rgba(255, 255, 255, 0.95)",
              fontWeight: "500",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </main>
  );
}