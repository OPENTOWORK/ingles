'use client';

import Link from 'next/link';
import PageHero from '@/components/PageHero';
import ExamPracticeLevelPicker from '@/components/niveles/ExamPracticeLevelPicker';
import NivelesSectionHeader from '@/components/niveles/NivelesSectionHeader';
import NivelesPageStyles from '@/components/niveles/NivelesPageStyles';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import { EXAM_PRACTICE_LEVELS } from '@/data/examPracticeLevels';

export default function ExamModeLevelPage() {
  return (
    <main className="shell niveles-page">
      <PageHero
        breadcrumb={
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/niveles/b2">Exam practice</Link>
            <span aria-hidden="true">/</span>
            <span>Exam mode</span>
          </nav>
        }
        eyebrow="Exam mode"
        title="Choose your level"
        description="Pick your CEFR level first, then select a mock exam and complete each paper under timed conditions."
        showMascot
        mascotVariant={1}
        mascotWidth={168}
        accent="ocean"
        stats={[
          { value: String(EXAM_PRACTICE_LEVELS.length), label: 'Levels' },
          { value: 'A2–C2', label: 'CEFR range' },
        ]}
      />

      <div className="sections">
        <section className="section" id="exam-mode-levels">
          <NivelesSectionHeader
            eyebrow="CEFR levels"
            title="Available tests and tips"
            count={EXAM_PRACTICE_LEVELS.length}
            description="Choose your level and access tailored mock exams — from elementary to mastery. B2 is open during the alpha."
          />
          <ExamPracticeLevelPicker
            variant="grid"
            linkForLevel={(level) => `/niveles/${level.slug}/exam-mode`}
          />
        </section>
      </div>

      <NivelesPageStyles />
      <TeoriaGlobalStyles />
    </main>
  );
}
