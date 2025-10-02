"use client";
import Link from "next/link";
import { use, useState, useEffect } from "react";

const levelNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

export default function DifficultyPage({ params }) {
  const { level, skill, difficulty } = use(params);
  const [levelStars, setLevelStars] = useState({});
  
  // Cargar estrellas guardadas desde localStorage
  useEffect(() => {
    try {
      const savedStars = localStorage.getItem(`stars_${level}_${skill}_${difficulty}`);
      if (savedStars) {
        setLevelStars(JSON.parse(savedStars));
      }
    } catch (error) {
      console.warn('Could not load stars:', error);
    }
  }, [level, skill, difficulty]);
  
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
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        🎯 {skill.charAt(0).toUpperCase() + skill.slice(1).replace(/-/g, ' ')} - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </h1>
      <p style={{ marginBottom: "2rem", color: "#555" }}>Choose a level:</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {levelNumbers.map((levelNum) => {
          const stars = levelStars[`level-${levelNum}`] || 0;
          
          return (
            <Link
              key={levelNum}
              href={`/training/${level}/${skill}/${difficulty}/level-${levelNum}`}
              style={{
                backgroundColor: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textDecoration: "none",
                color: "#333",
                fontWeight: "bold",
                fontSize: "1.1rem",
                transition: "transform 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div>Level {levelNum}</div>
              
              {/* Mostrar estrellas obtenidas */}
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
      
      <div style={{ marginTop: "2rem" }}>
        <Link
          href={`/training/${level}/${skill}`}
          style={{
            backgroundColor: "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "0.75rem 1.5rem",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "none",
            display: "inline-block"
          }}
        >
          ← Back to {skill.charAt(0).toUpperCase() + skill.slice(1).replace(/-/g, ' ')}
        </Link>
      </div>
    </main>
  );
}
