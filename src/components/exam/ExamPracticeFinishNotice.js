'use client';

import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';

/**
 * Part result banner for the practice side rail (bottom slot).
 */
export default function ExamPracticeFinishNotice({ notice, lang = 'en' }) {
  if (!notice) return null;

  const en = lang === 'en';

  if (notice.error) {
    return (
      <div className="levels-listening-practice-side__finish">
        <LevelsPartFinishBanner
          passed={false}
          correct={0}
          total={0}
          passing={0}
          error={notice.error}
          lang={lang}
        />
      </div>
    );
  }

  if (notice.scoringVersion === 2 || notice.v2LocalOnly) {
    return (
      <div className="levels-listening-practice-side__finish">
        <div role="status" className="levels-b2-result levels-b2-result--v2">
          <p className="levels-b2-result__title">
            {en ? 'Part complete' : 'Parte completada'}
          </p>
          <p className="levels-b2-result__detail">
            {en
              ? `Part score: ${notice.correct} / ${notice.total}`
              : `Puntuación de la parte: ${notice.correct} / ${notice.total}`}
          </p>
          <p className="levels-b2-result__note">
            {en
              ? 'Scoring V2 — local practice only (not saved).'
              : 'Scoring V2 — práctica local (no guardado).'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="levels-listening-practice-side__finish">
      <LevelsPartFinishBanner
        passed={notice.passed}
        correct={notice.correct}
        total={notice.total}
        passing={notice.passing}
        lang={lang}
      />
    </div>
  );
}
