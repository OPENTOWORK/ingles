'use client';

import dynamic from 'next/dynamic';

const WritingFeedbackFixtureHarness = dynamic(
  () => import('./WritingFeedbackFixtureHarness'),
  {
    ssr: false,
    loading: () => (
      <div className="writing-v3-harness writing-v3-harness--loading">
        <p className="writing-v3-harness__title">Loading Writing v3 preview…</p>
        <p className="writing-v3-harness__hint">
          The first visit compiles this route in dev (~10s). If you see a chunk timeout,
          confirm the terminal <code>Local:</code> port matches the browser URL and only
          one <code>npm run dev</code> is running.
        </p>
      </div>
    ),
  },
);

export default function WritingV3PreviewLoader({ fixtures, initialFixture }) {
  return (
    <WritingFeedbackFixtureHarness fixtures={fixtures} initialFixture={initialFixture} />
  );
}
