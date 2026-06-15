'use client';

import LevelsPartFinishBanner from '@/components/levels/LevelsPartFinishBanner';

/**
 * Part result banner for the practice side rail (bottom slot).
 */
export default function ExamPracticeFinishNotice({ notice, lang = 'en' }) {
  if (!notice) return null;

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
