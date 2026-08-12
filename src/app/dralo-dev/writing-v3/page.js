import WritingV3PreviewLoader from '@/components/writing/v3/WritingV3PreviewLoader';
import bandFive from '@/features/writing/__tests__/fixtures/ui/band-five.json';
import denseOverlap from '@/features/writing/__tests__/fixtures/ui/dense-overlap.json';
import e2eLive from '@/features/writing/__tests__/fixtures/ui/e2e-live.json';
import standard from '@/features/writing/__tests__/fixtures/ui/standard.json';
import zeroStrengths from '@/features/writing/__tests__/fixtures/ui/zero-strengths.json';

/**
 * Writing v3 preview — INTERNAL, DEVELOPMENT ONLY (Phase 8 / Phase 10).
 *
 * Not linked from any navigation. Production builds refuse this route.
 * `e2e-live` is the last real Phase-10 E2E artefact (not a golden fixture).
 */
export const metadata = {
  title: 'Writing v3 preview (internal)',
  robots: { index: false, follow: false },
};

const FIXTURES = {
  standard,
  'zero-strengths': zeroStrengths,
  'dense-overlap': denseOverlap,
  'band-five': bandFive,
  'e2e-live': e2eLive,
};

export default function WritingV3PreviewPage({ searchParams }) {
  if (process.env.NODE_ENV === 'production') {
    return (
      <main className="shell">
        <p>This preview is not available.</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <WritingV3PreviewLoader
        fixtures={FIXTURES}
        initialFixture={searchParams?.fixture ?? 'standard'}
      />
    </main>
  );
}
