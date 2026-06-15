'use client';

/**
 * Writing-specific status panel for Practice Mode.
 * Replaces the generic "Practice progress: X / 20" score panel,
 * which makes no sense for long-form writing.
 */
export default function B2WritingDraftStatusPanel({
  wordCount = 0,
  submitted = false,
  checking = false,
  lastScoreTotal = null,
  passingCount = 12,
  totalSlots = 20,
  lang = 'en',
}) {
  const isEn = lang === 'en';
  const passHint = isEn
    ? `You need at least ${passingCount}/${totalSlots} to pass this part.`
    : `Necesitas al menos ${passingCount}/${totalSlots} para aprobar esta parte.`;

  let statusLabel;
  if (checking) {
    statusLabel = isEn ? 'Checking with Dralo…' : 'Corrigiendo con Dralo…';
  } else if (submitted) {
    if (lastScoreTotal != null) {
      const passed = lastScoreTotal >= passingCount;
      statusLabel = isEn
        ? `Feedback received · ${lastScoreTotal}/${totalSlots}${passed ? ' · Passed' : ''}`
        : `Corrección recibida · ${lastScoreTotal}/${totalSlots}${passed ? ' · Aprobado' : ''}`;
    } else {
      statusLabel = isEn ? 'Feedback received' : 'Corrección recibida';
    }
  } else {
    statusLabel = passHint;
  }

  return (
    <div
      className={`levels-b2-writing-draft ${
        submitted ? 'levels-b2-writing-draft--submitted' : ''
      }`}
      role="status"
    >
      <span className="levels-b2-writing-draft__title">
        {isEn ? 'Draft status' : 'Estado del borrador'}
      </span>
      <strong className="levels-b2-writing-draft__words">
        {wordCount} {isEn ? 'words' : 'palabras'}
      </strong>
      <span className="levels-b2-writing-draft__state">{statusLabel}</span>
      {submitted && lastScoreTotal != null && lastScoreTotal < passingCount ? (
        <span className="levels-b2-writing-draft__hint">{passHint}</span>
      ) : null}
    </div>
  );
}
