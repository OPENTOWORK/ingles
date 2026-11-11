'use client';

import { useEffect, useState } from 'react';
import DraloThinking from '@/components/dralo/DraloThinking';
import { splitRuoeExplanation } from '@/utils/ruoeAnswerReview';
import reviewStyles from '@/components/exam/RuoeAnswerReview.module.css';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/**
 * @param {{ hint?: { loading?: boolean, error?: string | null, text?: string | null } }} props
 */
export default function LevelsAnswerJustification({ hint, ruoeReview = false }) {
  const [spanish, setSpanish] = useState('');
  const [showSpanish, setShowSpanish] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState('');

  useEffect(() => {
    setSpanish('');
    setShowSpanish(false);
    setTranslating(false);
    setTranslateError('');
  }, [hint?.text]);

  if (!hint || (!hint.loading && !hint.error && !hint.text)) return null;

  if (hint.loading) {
    return (
      <DraloThinking
        variant="inline"
        size={40}
        label="Dralo is writing the explanation"
        className="dralo-thinking--tight"
      />
    );
  }

  if (hint.error) {
    return (
      <p className="levels-answer-justification__error">
        {hint.error === true || !hint.error
          ? 'Explanation temporarily unavailable.'
          : hint.error}
      </p>
    );
  }

  const translate = async () => {
    if (spanish) {
      setShowSpanish((open) => !open);
      setTranslateError('');
      return;
    }
    setTranslating(true);
    setTranslateError('');
    try {
      const res = await fetch(buildClientApiUrl('/api/exam-practice/translate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hint.text, kind: 'explanation' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'translate');
      const translation = String(data?.translation || '').trim();
      if (!translation) throw new Error('empty');
      setSpanish(translation);
      setShowSpanish(true);
    } catch {
      setTranslateError('No se ha podido traducir.');
    } finally {
      setTranslating(false);
    }
  };

  const review = ruoeReview ? splitRuoeExplanation(hint.text) : null;
  return (
    <div className="levels-answer-justification">
      {review ? (
        <>
          {review.focus && (
            <section className={reviewStyles.feedbackSection}>
              <h4>What this tests</h4>
              <p>{review.focus}</p>
            </section>
          )}
          <section className={reviewStyles.feedbackSection}>
            <h4>Why it’s correct</h4>
            <p>{review.reason}</p>
          </section>
        </>
      ) : <p className="levels-answer-justification__text">💡 {hint.text}</p>}
      <button
        type="button"
        className="levels-answer-justification__translate"
        onClick={translate}
        disabled={translating}
      >
        {translating
          ? 'Traduciendo…'
          : showSpanish
            ? 'Ocultar traducción'
            : 'Traducir al español'}
      </button>
      {translateError ? (
        <p className="levels-answer-justification__error">{translateError}</p>
      ) : null}
      {showSpanish && spanish ? (
        <p className="levels-answer-justification__spanish">{spanish}</p>
      ) : null}
    </div>
  );
}
