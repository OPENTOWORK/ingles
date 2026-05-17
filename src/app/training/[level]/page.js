'use client';
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import TrainingCardProgressStats from '@/components/training/TrainingCardProgressStats';
import {
  getMaxStarsForSkill,
  useTrainingSkillStarProgressMap,
} from '@/hooks/useTrainingCefrStarProgress';

const skills = [
  { id: "use-of-english", label: "Use of English", emoji: "📘" },
  { id: "writing", label: "Writing", emoji: "✍️" },
  { id: "listening", label: "Listening", emoji: "🎧" },
  { id: "speaking", label: "Speaking", emoji: "🗣️" },
  { id: "reading", label: "Reading", emoji: "📖" },
  { id: "vocabulary", label: "Vocabulary", emoji: "🧠" },
  { id: "all", label: "All Together", emoji: "🧩" },
  { id: "challenge", label: "Challenge", emoji: "🏆" },
];

export default function LevelPage({ params }) {
  const { level } = params;
  const router = useRouter();
  const { userRole, session } = useUserRole();
  const skillProgressMap = useTrainingSkillStarProgressMap(level);
  const maxStarsPerSkill = getMaxStarsForSkill();

  useEffect(() => {
    if (level?.toLowerCase() === 'a1') {
      router.replace('/training/a2');
      return;
    }
    if (!session) {
      router.push('/login');
    }
  }, [session, router, level]);

  if (!session) {
    return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</p>;
  }

  const isLockedForStudent = userRole === 'student' || userRole === 'alumno';

  if (isLockedForStudent) {
    return (
      <main
        style={{
          padding: "2rem",
          fontFamily: "Segoe UI, sans-serif",
          textAlign: "center",
          background: "linear-gradient(to right, #f0f8ff, #e6f0ff)",
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={{ maxWidth: "580px", backgroundColor: "#fff", borderRadius: "12px", padding: "2rem", boxShadow: "0 10px 24px rgba(0,0,0,0.1)" }}>
          <h1 style={{ marginTop: 0 }}>Proximamente disponible</h1>
          <p style={{ color: "#444", lineHeight: 1.5 }}>
            Training todavia no esta habilitado para alumnos. Puedes seguir practicando desde la seccion de niveles.
          </p>
          <Link
            href="/niveles/b2"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.8rem 1.2rem",
              borderRadius: "8px",
              backgroundColor: "#1cb0f6",
              color: "#fff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Ir a Levels B2
          </Link>
        </div>
      </main>
    );
  }

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
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🌟 Level {level.toUpperCase()}</h1>
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
        {skills.map((skill) => {
          const progress = skillProgressMap[skill.id] ?? {
            earned: 0,
            max: maxStarsPerSkill,
            percent: 0,
          };

          return (
            <Link
              key={skill.id}
              href={`/training/${level}/${skill.id}`}
              style={{
                padding: "1.5rem 1rem 1.25rem",
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
              <TrainingCardProgressStats
                earned={progress.earned}
                max={progress.max}
                percent={progress.percent}
                variant="light"
              />
            </Link>
          );
        })}
      </div>
    </main>
  );
}
