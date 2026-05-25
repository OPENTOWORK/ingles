'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useExamModeSession } from '@/hooks/useExamModeSession';
import { buildExamModePracticeHref } from '@/utils/examModeSession';
import { getLevelFullExamSections, getNivelesLevelHub } from '@/data/nivelesLevelHub';
import styles from './ExamModeResultsView.module.css';

const SECTION_ICON_CLASS = {
  'Reading and Use of English': styles['cardIcon--reading'],
  'Use of English': styles['cardIcon--reading'],
  Reading: styles['cardIcon--reading'],
  'Reading and Writing': styles['cardIcon--reading'],
  Writing: styles['cardIcon--writing'],
  Listening: styles['cardIcon--listening'],
  Speaking: styles['cardIcon--speaking'],
};

function scoreTone(pct) {
  if (pct >= 60) return 'high';
  if (pct >= 35) return 'mid';
  return 'low';
}

function ProgressRing({ pct, tone }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  const fgClass =
    tone === 'high'
      ? styles['ringFg--high']
      : tone === 'mid'
        ? styles['ringFg--mid']
        : styles['ringFg--low'];

  return (
    <div className={styles.ringWrap} aria-hidden="true">
      <svg className={styles.ringSvg} viewBox="0 0 120 120">
        <circle className={styles.ringBg} cx="60" cy="60" r={r} />
        <circle
          className={`${styles.ringFg} ${fgClass}`}
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.ringCenter}>
        <span className={styles.ringPct}>{pct}%</span>
        <span className={styles.ringLabel}>Overall</span>
      </div>
    </div>
  );
}

function SectionCard({ row, examSlot }) {
  const tone = scoreTone(row.pct);
  const iconClass = SECTION_ICON_CLASS[row.title] || styles['cardIcon--default'];
  const parts = row.scores?.byPart || {};
  const partEntries = Object.entries(parts).sort(([a], [b]) => Number(a) - Number(b));
  const reviewHref = buildExamModePracticeHref(row.href, examSlot, { review: true });

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={`${styles.cardIcon} ${iconClass}`} aria-hidden="true">
          {row.emoji || '📋'}
        </div>
        <div className={styles.cardMain}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>{row.title}</h3>
            <p className={styles.cardScore}>
              {row.scores.correct}
              <span> / {row.scores.total}</span>
              <span style={{ marginLeft: '0.5rem', color: '#64748b', fontWeight: 700 }}>
                ({row.pct}%)
              </span>
            </p>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={`${styles.progressFill} ${
                row.pct === 0
                  ? styles['progressFill--zero']
                  : styles[`progressFill--${tone}`]
              }`}
              style={{ width: `${Math.max(row.pct, row.scores.total > 0 ? 4 : 0)}%` }}
              role="progressbar"
              aria-valuenow={row.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${row.title} score`}
            />
          </div>
        </div>
      </div>

      {partEntries.length > 0 ? (
        <div className={styles.parts}>
          <p className={styles.partsLabel}>Breakdown by part</p>
          <ul className={styles.partsList}>
            {partEntries.map(([partNum, p]) => {
              const passed = p.passing != null && p.correct >= p.passing;
              const failed = p.passing != null && p.correct < p.passing;
              return (
                <li key={partNum} className={styles.partRow}>
                  <span className={styles.partName}>Part {partNum}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={styles.partScore}>
                      {p.correct}/{p.total}
                    </span>
                    {p.passing != null ? (
                      <span
                        className={`${styles.badge} ${
                          passed ? styles['badge--pass'] : failed ? styles['badge--fail'] : styles['badge--na']
                        }`}
                      >
                        {passed ? 'Pass' : failed ? 'Below pass' : '—'}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div className={styles.cardActions}>
        <Link href={reviewHref} className={styles.reviewBtn}>
          Review answers
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

function ExamModeResultsViewInner({ slug }) {
  const config = getNivelesLevelHub(slug);
  const searchParams = useSearchParams();
  const examSlot = Math.min(5, Math.max(1, Number(searchParams.get('examen') || 1)));
  const { session, ready, repeatExam } = useExamModeSession(slug, examSlot);

  const sectionMeta = useMemo(() => {
    const map = {};
    for (const s of getLevelFullExamSections(slug)) {
      map[s.key] = s;
      map[s.title] = s;
    }
    return map;
  }, [slug]);

  const rows = useMemo(() => {
    if (!session?.sections) return [];
    return session.sections.map((sec) => {
      const scores = sec.scores || { correct: 0, total: 0, byPart: {} };
      const pct = scores.total > 0 ? Math.round((scores.correct / scores.total) * 100) : 0;
      const meta = sectionMeta[sec.key] || sectionMeta[sec.title] || {};
      return {
        ...sec,
        emoji: sec.emoji || meta.emoji,
        partsLabel: meta.partsLabel,
        scores,
        pct,
      };
    });
  }, [session, sectionMeta]);

  const totals = useMemo(() => {
    let correct = 0;
    let total = 0;
    let sectionsPassed = 0;
    for (const r of rows) {
      correct += r.scores.correct || 0;
      total += r.scores.total || 0;
      const passing = r.scores.total > 0 && r.pct >= 60;
      if (passing) sectionsPassed += 1;
    }
    return {
      correct,
      total,
      pct: total > 0 ? Math.round((correct / total) * 100) : 0,
      sectionsPassed,
      sectionsCount: rows.length,
    };
  }, [rows]);

  const overallTone = scoreTone(totals.pct);

  if (!config) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Level not configured.</p>
      </main>
    );
  }

  if (!ready) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Loading your results…</p>
      </main>
    );
  }

  if (!session?.resultsReleased) {
    return (
      <main className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.empty}>
            <h1>Results not ready yet</h1>
            <p>
              Complete every section of the exam to unlock your full score breakdown and answer
              review.
            </p>
            <Link
              href={`/niveles/${slug}/exam-mode?examen=${examSlot}`}
              className={`${styles.footerLink} ${styles['footerLink--primary']}`}
            >
              Continue exam
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/niveles">Levels</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/niveles/${slug}`}>{config.cefr}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/niveles/${slug}/exam-mode?examen=${examSlot}`}>Exam mode</Link>
          <span aria-hidden="true">/</span>
          <span>Results</span>
        </nav>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>Exam mode · Results</p>
          <h1 className={styles.title}>
            {config.cefr} — Test {examSlot}
          </h1>
          <p className={styles.subtitle}>
            Your answers are shown below. Use review to see correct solutions and explanations.
          </p>

          <div className={styles.summary}>
            <ProgressRing pct={totals.pct} tone={overallTone} />
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {totals.correct}/{totals.total}
                </span>
                <span className={styles.statLabel}>Items correct</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{rows.length}</span>
                <span className={styles.statLabel}>Sections</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>
                  {totals.sectionsPassed}/{totals.sectionsCount}
                </span>
                <span className={styles.statLabel}>Sections ≥ 60%</span>
              </div>
            </div>
          </div>
        </header>

        <h2 className={styles.sectionsTitle}>Results by paper</h2>
        <div className={styles.grid}>
          {rows.map((row) => (
            <SectionCard key={row.key} row={row} examSlot={examSlot} />
          ))}
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            onClick={() => repeatExam()}
            className={`${styles.footerLink} ${styles['footerLink--repeat']}`}
          >
            Repeat exam
          </button>
          <Link
            href={`/niveles/${slug}/exam-mode?examen=${examSlot}`}
            className={`${styles.footerLink} ${styles['footerLink--secondary']}`}
          >
            Exam menu
          </Link>
          <Link
            href={`/niveles/${slug}`}
            className={`${styles.footerLink} ${styles['footerLink--primary']}`}
          >
            Back to {config.cefr} hub
          </Link>
        </footer>
      </div>
    </main>
  );
}

export default function ExamModeResultsView({ slug }) {
  return (
    <Suspense
      fallback={
        <main className={styles.page}>
          <p className={styles.loading}>Loading your results…</p>
        </main>
      }
    >
      <ExamModeResultsViewInner slug={slug} />
    </Suspense>
  );
}
