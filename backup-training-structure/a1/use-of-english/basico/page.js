"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function BasicoPage() {
  const niveles = Array.from({ length: 12 }, (_, i) => i + 1);
  const [levelStars, setLevelStars] = useState({});
  
  useEffect(() => {
    try {
      const savedStars = localStorage.getItem('stars_a1_use-of-english_basico');
      if (savedStars) {
        setLevelStars(JSON.parse(savedStars));
      }
    } catch (error) {
      console.warn('Could not load stars:', error);
    }
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif", textAlign: "center" }}>
      <h1>🟢 Nivel Básico - Use of English</h1>
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
        {niveles.map((num) => {
          const stars = levelStars[`level-${num}`] || 0;
          
          return (
            <Link
              key={num}
              href={`/training/a1/use-of-english/basico/level-${num}`}
              style={{
                padding: "1rem",
                backgroundColor: "#d4f4dd",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
                color: "#1a5d1a",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <div>Nivel {num}</div>
              
              {/* Estrellas */}
              <div style={{ display: "flex", gap: "0.2rem" }}>
                {[1, 2, 3].map((star) => (
                  <span
                    key={star}
                    style={{
                      fontSize: "1rem",
                      color: star <= stars ? "#ffd700" : "#d1d5db",
                      opacity: star <= stars ? 1 : 0.3
                    }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
