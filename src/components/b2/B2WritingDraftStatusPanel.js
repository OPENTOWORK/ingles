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
  lang = 'en',
}) {
  const isEn = lang === 'en';

  let statusLabel;
  if (checking) {
    statusLabel = isEn ? 'Checking with Dralo…' : 'Corrigiendo con Dralo…';
  } else if (submitted) {
    statusLabel =
      lastScoreTotal != null
        ? `${isEn ? 'Feedback received' : 'Corrección recibida'} · ${lastScoreTotal}/20`
        : isEn
          ? 'Feedback received'
          : 'Corrección recibida';
  } else {
    statusLabel = isEn ? 'Not submitted yet' : 'Sin enviar todavía';
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
    </div>
  );
}
