'use client';

import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

const OPTIONS = [
  { value: 'sure', label: 'Sure' },
  { value: 'not_sure', label: 'Not sure' },
  { value: 'guess', label: 'Guess' },
];

export default function ReadingConfidenceSelector({ questionKey, lang = 'en' }) {
  const { confidenceByQuestion, setConfidence } = useReadingPracticeSession();
  const current = confidenceByQuestion[questionKey];
  const en = lang === 'en';

  return (
    <div className="reading-confidence" role="group" aria-label={en ? 'Confidence' : 'Confianza'}>
      <span className="reading-confidence__label">{en ? 'Confidence:' : 'Confianza:'}</span>
      <div className="reading-confidence__options">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`reading-confidence__btn tool-button${current === opt.value ? ' active' : ''}`}
            onClick={() => setConfidence(questionKey, opt.value)}
            aria-pressed={current === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
