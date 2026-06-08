'use client';

import Link from 'next/link';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { usePlacementAccess } from '@/context/PlacementAccessContext';
import PageHero from '@/components/PageHero';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import ExamTheorySection from '@/components/niveles/ExamTheorySection';
import NivelesSectionHeader from '@/components/niveles/NivelesSectionHeader';
import { isNivelesLevelComingSoonForUser } from '@/constants/studentFeatureAccess';

const NIVELES = [
  {
    nivel: 'A2',
    nombre: 'Elementary',
    descripcion: 'Elemental — simple, direct communication for routine tasks and everyday situations.',
    color: '#58cc02',
    duracion: '100 min exam',
  },
  {
    nivel: 'B1',
    nombre: 'Intermediate',
    descripcion: 'Intermediate — familiar topics, travel, experiences, and justified opinions.',
    color: '#ff9900',
    duracion: '140 min exam',
  },
  {
    nivel: 'B2',
    nombre: 'Upper-Intermediate',
    descripcion: 'Upper intermediate — complex texts, fluent interaction, and clear argumentation.',
    color: '#1cb0f6',
    duracion: '209 min exam',
  },
  {
    nivel: 'C1',
    nombre: 'Advanced',
    descripcion: 'Advanced — long texts, implied meaning, and flexible, precise language use.',
    color: '#8e44ad',
    duracion: '236 min exam',
  },
  {
    nivel: 'C2',
    nombre: 'Mastery',
    descripcion: 'Proficiency — full comprehension, spontaneous expression, and subtle nuance.',
    color: '#e74c3c',
    duracion: '230 min exam',
  },
];

function LevelCardContent({ nivelData }) {
  return (
    <>
      <div className="area-card__head">
        <span
          className="area-card__icon"
          style={{ background: nivelData.color }}
          aria-hidden
        >
          {nivelData.nivel}
        </span>
        <span className="area-card__title">{nivelData.nombre}</span>
      </div>
      <span className="area-card__desc">{nivelData.descripcion}</span>
      <span className="area-card__meta">{nivelData.duracion} →</span>
    </>
  );
}

function NivelesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userRole, session } = useUserRole();
  const {
    loading: placementLoading,
    isLevelLocked,
    hasPlacementResult,
  } = usePlacementAccess();

  const isStudent =
    Boolean(session) && (userRole === 'student' || userRole === 'alumno');
  const isTheoryView = searchParams.get('tab') === 'theory';

  useEffect(() => {
    if (isTheoryView) return;
    if (typeof window !== 'undefined' && window.location.hash === '#exam-theory') {
      router.replace('/niveles?tab=theory', { scroll: false });
    }
  }, [isTheoryView, router]);

  const getLockLabel = (nivel) => {
    if (isNivelesLevelComingSoonForUser(userRole, nivel)) return 'COMING SOON';
    if (!isStudent || !isLevelLocked(nivel)) return null;
    if (placementLoading) return 'Comprobando…';
    if (!hasPlacementResult) return 'Placement test requerido';
    return 'Level blocked';
  };

  return (
    <main className={`shell niveles-page${isTheoryView ? ' niveles-page--theory' : ''}`}>
      {!isTheoryView ? (
        <PageHero
          eyebrow="CEFR pathway"
          title="Choose your level"
          description="Pick your English level and access tailored practice — reading, listening, writing, speaking, and full exam simulations."
          mascotVariant={1}
          mascotWidth={168}
          accent="ocean"
          stats={[
            { value: String(NIVELES.length), label: 'Levels' },
            { value: 'A2–C2', label: 'CEFR range' },
          ]}
        />
      ) : null}

      <div className="sections">
        {isTheoryView ? (
          <ExamTheorySection
            userId={session?.user?.id}
            accessToken={session?.access_token}
            isStudent={isStudent}
          />
        ) : (
          <section className="section" id="niveles-practice" data-tour="niveles-levels">
            <NivelesSectionHeader
              eyebrow="CEFR levels"
              title="Available tests and tips"
              count={NIVELES.length}
              description="Choose your level and access tailored mock exams, study tips, and guided practice — from elementary to mastery."
            />
            <ul className="area-grid niveles-grid">
              {NIVELES.map((nivelData) => {
                const isComingSoon = isNivelesLevelComingSoonForUser(userRole, nivelData.nivel);
                const isLockedForStudent =
                  isComingSoon ||
                  (isStudent && (placementLoading || isLevelLocked(nivelData.nivel)));
                const lockLabel = getLockLabel(nivelData.nivel);

                return (
                  <li
                    key={nivelData.nivel}
                    className={isLockedForStudent ? 'level-item is-locked' : 'level-item'}
                  >
                    {isLockedForStudent ? (
                      <div className="area-card area-card--disabled" aria-disabled="true">
                        <LevelCardContent nivelData={nivelData} />
                      </div>
                    ) : (
                      <Link
                        href={`/niveles/${nivelData.nivel.toLowerCase()}`}
                        className="area-card"
                      >
                        <LevelCardContent nivelData={nivelData} />
                      </Link>
                    )}
                    {isLockedForStudent && lockLabel && (
                      <div className="level-item__lock">{lockLabel}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <NivelesPageStyles />
      <TeoriaGlobalStyles />
    </main>
  );
}

export default function Niveles() {
  return (
    <Suspense
      fallback={
        <main className="shell niveles-page" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading levels…</p>
        </main>
      }
    >
      <NivelesInner />
    </Suspense>
  );
}

function NivelesPageStyles() {
  return (
    <style jsx global>{`
      .niveles-page {
        background-color: var(--bg);
        color: var(--text);
        min-height: 100vh;
      }
      .niveles-page .shell,
      .niveles-page.shell {
        min-height: 100svh;
        max-width: 1100px;
        margin: 0 auto;
        padding: clamp(20px, 4vw, 32px) clamp(14px, 3vw, 20px);
      }
      .niveles-page.center {
        display: grid;
        place-items: center;
      }
      .niveles-page .sections {
        display: flex;
        flex-direction: column;
        gap: 28px;
      }
      .niveles-page .section {
        padding: 6px;
      }
      .niveles-page .niveles-section-head {
        margin-bottom: 18px;
        padding: 18px 20px 16px;
        border-radius: 16px;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid rgba(226, 232, 240, 0.95);
        box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
      }
      .niveles-page .niveles-section-head__row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .niveles-page .niveles-section-head__title-wrap {
        min-width: 0;
      }
      .niveles-page .niveles-section-head__eyebrow {
        display: block;
        margin-bottom: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #2563eb;
      }
      .niveles-page .niveles-section-head__title {
        margin: 0;
        font-size: clamp(1.35rem, 2.8vw, 1.65rem);
        font-weight: 800;
        letter-spacing: -0.025em;
        line-height: 1.15;
        color: var(--text);
      }
      .niveles-page .niveles-section-head__count {
        flex: 0 0 auto;
        display: inline-grid;
        place-items: center;
        min-width: 36px;
        height: 36px;
        padding: 0 10px;
        border-radius: 999px;
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        border: 1px solid rgba(37, 99, 235, 0.18);
        font-size: 0.82rem;
        font-weight: 800;
        color: #1d4ed8;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
      }
      .niveles-page .niveles-section-head__desc {
        margin: 12px 0 0;
        max-width: 680px;
        font-size: 0.96rem;
        line-height: 1.55;
        color: #5a6b7d;
      }
      .niveles-page .area-card {
        margin-right: 0;
      }
      .niveles-page .area-card__icon {
        font-size: 13px;
        letter-spacing: 0.02em;
      }
      .niveles-page .area-card:hover .area-card__title {
        font-size: 22px;
        transform: none;
      }
      .niveles-page .area-card:hover .area-card__icon {
        transform: scale(1.28);
      }
      .level-item {
        position: relative;
        list-style: none;
      }
      .area-card--disabled {
        cursor: not-allowed;
        filter: grayscale(0.2);
        opacity: 0.85;
        pointer-events: none;
      }
      .level-item__lock {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        pointer-events: none;
      }
      @media (min-width: 640px) {
        .niveles-page .niveles-grid > .level-item:nth-child(5) {
          grid-column: 1 / -1;
          width: calc(50% - 8px);
          justify-self: center;
        }
      }
      @media (min-width: 980px) {
        .niveles-page .niveles-grid {
          grid-template-columns: repeat(6, minmax(0, 1fr));
        }
        .niveles-page .niveles-grid > .level-item {
          grid-column: span 2;
        }
        .niveles-page .niveles-grid > .level-item:nth-child(4) {
          grid-column: 2 / span 2;
        }
        .niveles-page .niveles-grid > .level-item:nth-child(5) {
          grid-column: 4 / span 2;
          width: auto;
          justify-self: stretch;
        }
      }
      .niveles-page .loader {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 3px solid rgba(0, 112, 243, 0.2);
        border-top-color: #0070f3;
        animation: niveles-spin 1s linear infinite;
      }
      @keyframes niveles-spin {
        to {
          transform: rotate(360deg);
        }
      }
      .niveles-page .exam-theory-section {
        margin-top: 8px;
      }
      .niveles-page .exam-theory-grid {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      }
      @media (min-width: 900px) {
        .niveles-page .exam-theory-grid {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
      }
      .niveles-page .exam-theory-card {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .niveles-page .exam-theory-global-progress {
        margin-top: 18px;
        padding: 16px 18px;
        border-radius: 16px;
        background: linear-gradient(180deg, #f0f9ff 0%, #ecfdf5 100%);
        border: 1px solid rgba(28, 176, 246, 0.2);
      }
      .niveles-page .exam-theory-global-hint {
        margin: 8px 0 0;
        font-size: 0.82rem;
        color: #5a6b7d;
        line-height: 1.4;
      }
      .niveles-page .exam-theory-item {
        position: relative;
        list-style: none;
      }
      .niveles-page .exam-theory-item__lock {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        border-radius: 20px;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        pointer-events: none;
      }
      .niveles-page .exam-theory-card__lock-hint {
        margin: 0;
        font-size: 0.78rem;
        color: #94a3b8;
        text-align: center;
        line-height: 1.35;
      }
    `}</style>
  );
}
