'use client';

import { useMemo } from 'react';
import { buildExamStatisticsFromLevels } from '@/lib/examStatisticsFromLevels';
import { useLevelsPracticeData } from '@/hooks/useLevelsPracticeData';

const SKILL_LABELS = {
  reading: 'Reading and Use of English',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
};

function formatResultDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function useStudentExamSummary(userId, enabled) {
  const { data, loading, error } = useLevelsPracticeData(userId, { enabled });
  const statistics = useMemo(() => {
    if (!enabled || !data) return null;
    return buildExamStatisticsFromLevels({
      ...data,
      timeRange: 'all',
      levelFilter: null,
    });
  }, [data, enabled]);
  return { statistics, loading: enabled && loading, error };
}

export function StudentExamSummaryCards({ statistics, loading, error }) {
  if (!statistics && loading) {
    return <p className="perfil-student__note">Loading your exam results…</p>;
  }
  if (error) {
    return <p className="perfil-student__note">{error}</p>;
  }
  if (!statistics?.hasData) {
    return (
      <section className="perfil-student__card">
        <h2>Exam results</h2>
        <p>No completed exam results yet. They will appear here after you finish a practice test.</p>
      </section>
    );
  }

  const skills = Object.entries(statistics.sections).filter(([, section]) => section.attempts > 0);
  const average = Math.round(statistics.averageScore);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = statistics.recentAttempts.filter((item) => item.date >= monthStart).length;

  return (
    <div className="perfil-student__metrics" aria-label="Exam summary">
      <article className="perfil-student__card">
        <span className="perfil-student__pill">Completed records</span>
        <p className="perfil-student__stat">{statistics.recentAttempts.length || statistics.completedExams}</p>
        <p>{skills.map(([skill, section]) => `${section.attempts} ${SKILL_LABELS[skill] || skill}`).join(' · ') || 'From your saved practice'}</p>
      </article>
      <article className="perfil-student__card">
        <span className="perfil-student__pill">Average score</span>
        <p className="perfil-student__stat">{Number.isFinite(average) ? `${average}%` : '—'}</p>
        <p>Across your saved practice results</p>
      </article>
      <article className="perfil-student__card">
        <span className="perfil-student__pill">This month</span>
        <p className="perfil-student__stat">{thisMonth}</p>
        <p>{thisMonth === 1 ? 'Saved result this month' : 'Saved results this month'}</p>
      </article>
    </div>
  );
}

export function StudentRecentResults({ statistics, loading }) {
  if (loading || !statistics?.recentAttempts?.length) return null;
  return (
    <section className="perfil-student__card" aria-labelledby="student-recent-results">
      <h2 id="student-recent-results">Recent results</h2>
      <ul className="perfil-student__results">
        {statistics.recentAttempts.slice(0, 6).map((item) => (
          <li key={item.id || `${item.label}-${item.date?.toISOString?.() || item.percentage}`}>
            <span>{item.label}</span>
            <strong>{item.percentage}%</strong>
            <time dateTime={item.date?.toISOString?.() || undefined}>{formatResultDate(item.date)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
