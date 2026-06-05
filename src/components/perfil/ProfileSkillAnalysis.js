'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { supabase } from '@/utils/supabaseClient';
import { buildSkillAnalysisFromLevels, SKILL_ANALYSIS_KEYS, SKILL_LABELS } from '@/lib/examStatisticsFromLevels';
import { fetchLevelsPracticeData } from '@/lib/fetchLevelsPracticeData';

const EMPTY_SKILLS = Object.fromEntries(
  SKILL_ANALYSIS_KEYS.map((k) => [k, { score: 0, improvement: 0, exercises: 0 }]),
);

export default function ProfileSkillAnalysis({ userId }) {
  const [skills, setSkills] = useState(EMPTY_SKILLS);
  const [hasData, setHasData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      setSkills(EMPTY_SKILLS);
      setHasData(false);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchLevelsPracticeData(supabase, userId);
        if (cancelled) return;

        const result = buildSkillAnalysisFromLevels(data);
        setSkills(result.skills);
        setHasData(result.hasData);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message || 'Could not load skills.');
          setSkills(EMPTY_SKILLS);
          setHasData(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const radarData = useMemo(
    () =>
      SKILL_ANALYSIS_KEYS.map((key) => ({
        skill: SKILL_LABELS[key],
        A: skills[key]?.score ?? 0,
        B: 100,
      })),
    [skills],
  );

  if (loading) {
    return (
      <>
        <section className="profile-section">
          <p className="section-desc">Loading skills analysis…</p>
        </section>
      </>
    );
  }

  if (error) {
    return (
      <section className="profile-section">
        <p className="section-desc">{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className="profile-section">
        <div className="section-head">
          <h2>🎯 Skills analysis</h2>
        </div>
        {!hasData ? (
          <p className="section-desc">
            No Levels data yet. Practise in{' '}
            <a href="/niveles">Levels</a> to see your progress by skill.
          </p>
        ) : null}
        <div className="skills-grid">
          {SKILL_ANALYSIS_KEYS.map((key) => {
            const data = skills[key] || { score: 0, improvement: 0, exercises: 0 };
            return (
              <div key={key} className="skill-card">
                <div className="skill-name">{SKILL_LABELS[key]}</div>
                <div className="skill-score">{data.score}%</div>
                <div className="skill-improvement">
                  {data.improvement > 0 ? `+${data.improvement}%` : '—'}
                </div>
                <div className="skill-exercises">{data.exercises} exercises</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="profile-section">
        <div className="section-head">
          <h2>📊 Skills radar</h2>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="skill" />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar
              name="Your level"
              dataKey="A"
              stroke="#0070f3"
              fill="#0070f3"
              fillOpacity={0.3}
            />
            <Radar name="Target" dataKey="B" stroke="#eaeaea" fill="transparent" />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}
