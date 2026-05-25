'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import SpeakingPage from '../../../dralo-speaking/pages/SpeakingPage';
import { DRALO_AI_MODES } from '@/data/draloAiConfig';
import DraloAiLevelFilter from '@/components/dralo-ai/DraloAiLevelFilter';

const ACCENT_SOLID = {
  rose: '#e11d48',
};

const config = DRALO_AI_MODES.speaking;

export default function DraloAiSpeakingStudio() {
  const [level, setLevel] = useState(config.defaultLevel || 'B2');
  const [mode, setMode] = useState(config.activities[0]?.id || 'practice');

  const activity = useMemo(
    () => config.activities.find((a) => a.id === mode) || config.activities[0],
    [mode],
  );

  const accentSolid = ACCENT_SOLID[config.accent] || ACCENT_SOLID.rose;

  return (
    <main className="dralo-ai-page" style={{ '--dralo-accent-solid': accentSolid }}>
      <div className="page-hero-wrap__breadcrumb">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/dralo-ai">Dralo AI</Link>
          <span aria-hidden> / </span>
          <span>{config.title}</span>
        </nav>
      </div>

      <PageHero
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.description}
        accent={config.accent}
        mascotVariant={config.mascotVariant}
        stats={[
          { value: 'Dralo', label: 'Voice coach' },
          { value: level, label: 'Level' },
          { value: String(config.activities.length), label: 'Modes' },
        ]}
      />

      <div className="dralo-ai-studio">
        <div className="dralo-ai-studio__toolbar">
          <span className="dralo-ai-studio__badge">✨ Dralo AI</span>
          <DraloAiLevelFilter
            levels={config.levels}
            selectedLevel={level}
            onChange={setLevel}
          />
        </div>

        <div className="dralo-ai-activities" role="tablist" aria-label="Activities">
          {config.activities.map((a) => (
            <button
              key={a.id}
              type="button"
              role="tab"
              aria-selected={mode === a.id}
              className={`dralo-ai-activity${mode === a.id ? ' is-active' : ''}`}
              onClick={() => setMode(a.id)}
            >
              <span aria-hidden>{a.icon}</span> {a.label}
            </button>
          ))}
        </div>

        <div className="dralo-ai-panel dralo-ai-panel--speaking">
          <div className="dralo-ai-panel__head">
            <h2>
              {activity?.icon} {activity?.label}
            </h2>
            <p>{activity?.hint}</p>
          </div>
          <div className="dralo-ai-panel__body dralo-ai-panel__body--speaking">
            <SpeakingPage
              embedded
              level={level}
              onLevelChange={setLevel}
              mode={mode}
              onModeChange={setMode}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
