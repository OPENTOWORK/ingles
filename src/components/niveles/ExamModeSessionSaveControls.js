'use client';

/** Save / exit controls for exam simulation sections (top bar, right side). */
export default function ExamModeSessionSaveControls({
  onSave,
  onSaveAndExit,
  onExitWithoutSaving,
  saveNotice = '',
  lang = 'en',
  disabled = false,
}) {
  const isEn = lang === 'en';

  return (
    <div
      className="exam-mode-save-controls"
      role="group"
      aria-label={isEn ? 'Exam progress' : 'Progreso del examen'}
    >
      {saveNotice ? (
        <span className="exam-mode-save-controls__notice" role="status">
          {saveNotice}
        </span>
      ) : null}
      <button
        type="button"
        className="exam-mode-save-controls__btn exam-mode-save-controls__btn--save"
        onClick={onSave}
        disabled={disabled}
      >
        {isEn ? 'Save' : 'Guardar'}
      </button>
      <button
        type="button"
        className="exam-mode-save-controls__btn exam-mode-save-controls__btn--save-exit"
        onClick={onSaveAndExit}
        disabled={disabled}
      >
        {isEn ? 'Save and exit' : 'Guardar y salir'}
      </button>
      <button
        type="button"
        className="exam-mode-save-controls__btn exam-mode-save-controls__btn--exit"
        onClick={onExitWithoutSaving}
        disabled={disabled}
      >
        {isEn ? 'Exit without saving' : 'Salir sin guardar'}
      </button>
    </div>
  );
}
