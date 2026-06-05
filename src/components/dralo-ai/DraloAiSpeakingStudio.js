'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';
import { getSpeakingExamActivities } from '@/data/draloAiSpeakingExam';
import DraloAiSpeakingExamPractice from '@/components/dralo-ai/DraloAiSpeakingExamPractice';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';
import { DRALO_AI_EXAM_EYEBROW, DRALO_AI_EXAM_TRACK } from '@/data/draloAiSituationalConfig';

const ACCENT_SOLID = {
  rose: '#e11d48',
};

const config = DRALO_AI_MODES.speaking;

export default function DraloAiSpeakingStudio() {
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const activities = useMemo(() => getSpeakingExamActivities(level), [level]);
  const [activityId, setActivityId] = useState('');

  useEffect(() => {
    const first = activities[0]?.id || '';
    setActivityId((prev) => {
      if (prev && activities.some((a) => a.id === prev)) return prev;
      return first;
    });
  }, [activities]);

  const activity = useMemo(
    () => activities.find((a) => a.id === activityId) || activities[0],
    [activities, activityId],
  );

  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.rose;

  return (
    <main className="dralo-ai-page" style={{ '--dralo-accent-solid': accentSolid }}>
      <div className="dralo-ai-studio__toolbar dralo-ai-studio__toolbar--under-xp">
        <Link href="/dralo-ai/speaking" className="dralo-ai-back-link">
          ← Choose mode
        </Link>
        <DraloAiLevelFilter
          levels={config.levels}
          selectedLevel={level}
          onChange={setLevel}
        />
      </div>

      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai/speaking">{config.title}</Link>
          <span aria-hidden> / </span>
          <span>{DRALO_AI_EXAM_TRACK.label}</span>
        </nav>
      </div>

      <PageHero
        eyebrow={DRALO_AI_EXAM_EYEBROW}
        title={`${config.title} · Exam`}
        description="Practise each Speaking part with the Dralo examiner: listen to real prompts and respond with your microphone."
        accent={config.accent}
        mascotVariant={config.mascotVariant}
        stats={[
          { value: 'Dralo', label: 'Voice coach' },
          { value: level, label: 'Level' },
          { value: String(activities.length), label: 'Parts' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-activities" role="tablist" aria-label="Speaking exam parts">
          {activities.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={activityId === a.id}
              className={`dralo-ai-activity${activityId === a.id ? ' is-active' : ''}`}
              onClick={() => setActivityId(a.id)}
            >
              <span aria-hidden>{a.icon}</span> {a.partTitle || a.label}
            </button>
          ))}
        </div>

        <div className="dralo-ai-panel dralo-ai-panel--speaking">
          <div className="dralo-ai-panel__head">
            <h2>
              {activity?.icon} {activity?.partTitle || activity?.label}
            </h2>
            <p>{activity?.hint}</p>
          </div>
          <div className="dralo-ai-panel__body dralo-ai-panel__body--speaking">
            {activity?.directions ? (
              <div className="dralo-ai-directions">
                <h3 className="dralo-ai-directions__title">{activity.partTitle}</h3>
                <p className="dralo-ai-directions__text">{activity.directions}</p>
              </div>
            ) : null}
            {activity?.tips ? (
              <div className="dralo-ai-example">
                <p className="dralo-ai-example__label">Tips for this part</p>
                <p className="dralo-ai-example__hint">{activity.tips}</p>
              </div>
            ) : null}

            {activity ? (
              <DraloAiSpeakingExamPractice
                key={`${level}-${activity.id}`}
                level={level}
                activity={activity}
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
