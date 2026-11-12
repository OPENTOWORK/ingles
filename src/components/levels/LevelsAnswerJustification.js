'use client';

import { useEffect, useState } from 'react';
import DraloThinking from '@/components/dralo/DraloThinking';
import { splitRuoeExplanation } from '@/utils/ruoeAnswerReview';
import reviewStyles from '@/components/exam/RuoeAnswerReview.module.css';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

/**
 * @param {{ hint?: { loading?: boolean, error?: string | null, text?: string | null } }} props
 */
export default function LevelsAnswerJustification({ hint, ruoeReview = false, readingReview = false, readingPassage = '', onOpenReview }) {
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

  if (!ruoeReview && (!hint || (!hint.loading && !hint.error && !hint.text))) return null;

  if (!ruoeReview && hint?.loading) {
    return (
      <DraloThinking
        variant="inline"
        size={40}
        label="Dralo is writing the explanation"
        className="dralo-thinking--tight"
      />
    );
  }

  if (!ruoeReview && hint?.error) {
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

  const review = ruoeReview ? splitRuoeExplanation(hint?.text) : null;
  const onReviewToggle = (event) => {
    if (event.currentTarget.open) onOpenReview?.();
  };
  const explanation = String(hint?.text || '');
  const reviewedEvidence = readingReview && explanation.startsWith('Evidence in the text · ')
    ? explanation.slice('Evidence in the text · '.length)
    : '';
  const quote = readingReview ? explanation.match(/[“"]([^”"]+)[”"]/)?.[1] : '';
  const normalise = (value) => value.replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().toLowerCase();
  const evidence = quote && normalise(readingPassage).includes(normalise(quote)) ? quote : '';
  const reviewSections = readingReview ? [
    { title: 'Evidence in the text', text: reviewedEvidence || evidence, empty: 'No exact quotation is available for this answer.' },
  ] : review && [
    { title: 'What it tests', text: review.focus, empty: 'A skill label is unavailable for this question.' },
    { title: 'Why it’s correct', text: review.reason, empty: 'Explanation temporarily unavailable.' },
  ];
  return (
    <div className={ruoeReview ? reviewStyles.feedback : 'levels-answer-justification'}>
      {reviewSections ? reviewSections.map(({ title, text, empty }) => (
        <details className={reviewStyles.feedbackSection} key={title} onToggle={onReviewToggle}>
          <summary className={reviewStyles.toggle}>{title}</summary>
          <p className={reviewStyles.feedbackBody}>
            {hint?.loading || (!hint?.text && !hint?.error)
              ? <span role="status">Loading…</span>
              : hint?.error ? 'Explanation temporarily unavailable.' : reviewedEvidence
                ? text.split(/(<br>|\*\*[^*]+\*\*)/).map((chunk, index) =>
                    chunk === '<br>' ? <br key={index} /> :
                      chunk.startsWith('**') ? <u key={index}>{chunk.slice(2, -2)}</u> : chunk
                  )
                : text || empty}
          </p>
        </details>
      )) : <p className="levels-answer-justification__text">💡 {hint.text}</p>}
      {hint?.text && (
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
      )}
      {translateError ? (
        <p className="levels-answer-justification__error">{translateError}</p>
      ) : null}
      {showSpanish && spanish ? (
        <p className="levels-answer-justification__spanish">{spanish}</p>
      ) : null}
    </div>
  );
}
