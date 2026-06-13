'use client';

import { useState } from 'react';
import { useExamPracticeTools, HIGHLIGHT_COLORS } from '@/context/ExamPracticeToolsContext';
import { useReadingPracticeSession } from '@/context/ReadingPracticeSessionContext';

export default function ReadingPracticeToolsPanel({ lang = 'en' }) {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);
  const tools = useExamPracticeTools();
  const session = useReadingPracticeSession();

  const labels = {
    title: en ? 'Tools' : 'Herramientas',
    focus: en ? 'Focus mode' : 'Modo concentración',
    exitFocus: en ? 'Exit focus mode' : 'Salir del modo concentración',
    eliminator: en ? 'Answer eliminator' : 'Eliminador de respuestas',
    clearEliminated: en ? 'Clear eliminated' : 'Quitar eliminadas',
    textSettings: en ? 'Text settings' : 'Ajustes de texto',
    fontSize: en ? 'Font size' : 'Tamaño de fuente',
    lineHeight: en ? 'Line height' : 'Interlineado',
    letterSpacing: en ? 'Letter spacing' : 'Espaciado entre letras',
    wideSpacing: en ? 'Wide spacing' : 'Espaciado amplio',
    highContrast: en ? 'High contrast' : 'Alto contraste',
    dyslexiaFont: en ? 'Dyslexia-friendly font' : 'Fuente dislexia',
    resetSettings: en ? 'Reset reading settings' : 'Restablecer ajustes',
    highlight: en ? 'Highlighter' : 'Subrayar',
    highlightOn: en ? 'Select text to highlight' : 'Selecciona texto para subrayar',
    clearHighlights: en ? 'Clear highlights' : 'Quitar subrayados',
    highlightColor: en ? 'Highlight color' : 'Color del subrayado',
  };

  const { readingSettings, updateReadingSettings } = session;

  const toggleWideSpacing = () => {
    updateReadingSettings({ wideSpacing: !readingSettings.wideSpacing });
  };

  return (
    <aside className="levels-listening-strategy levels-listening-strategy--tools">
      <button
        type="button"
        className="levels-listening-strategy__toggle levels-listening-strategy__toggle--tools"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{labels.title}</span>
        <span aria-hidden>{open ? '−' : '+'}</span>
      </button>

      {open ? (
        <div className="levels-listening-strategy__body">
          <section>
            <h3 className="levels-listening-strategy__heading">{en ? 'Study tools' : 'Herramientas de estudio'}</h3>
            <div className="exam-practice-tools__row">
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn exam-practice-tools__btn--wide${session.focusMode ? ' active' : ''}`}
                onClick={session.toggleFocusMode}
                aria-pressed={session.focusMode}
              >
                {session.focusMode ? labels.exitFocus : labels.focus}
              </button>
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn exam-practice-tools__btn--wide${session.answerEliminatorEnabled ? ' active' : ''}`}
                onClick={session.toggleAnswerEliminator}
                aria-pressed={session.answerEliminatorEnabled}
              >
                {labels.eliminator}
              </button>
              {session.answerEliminatorEnabled ? (
                <button
                  type="button"
                  className="tool-button exam-practice-tools__btn exam-practice-tools__btn--ghost"
                  onClick={session.clearEliminatedAnswers}
                >
                  {labels.clearEliminated}
                </button>
              ) : null}
            </div>
            <p className="levels-listening-strategy__tool-hint">
              {session.answerEliminatorEnabled
                ? en
                  ? 'Click options to strike them out without selecting an answer.'
                  : 'Haz clic en opciones para tacharlas sin seleccionar respuesta.'
                : en
                  ? 'Enable Answer eliminator to cross out wrong options.'
                  : 'Activa el eliminador para tachar opciones incorrectas.'}
            </p>
          </section>

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.textSettings}</h3>
            <p className="levels-listening-strategy__tool-hint">
              {labels.fontSize}: <strong>{readingSettings.fontSize}%</strong>
            </p>
            <div className="exam-practice-tools__row">
              <button type="button" className="tool-button exam-practice-tools__btn" onClick={() => session.adjustFontSize(-5)} aria-label={en ? 'Decrease font size' : 'Reducir fuente'}>
                A−
              </button>
              <button type="button" className="tool-button exam-practice-tools__btn" onClick={() => session.adjustFontSize(5)} aria-label={en ? 'Increase font size' : 'Aumentar fuente'}>
                A+
              </button>
              <button type="button" className="tool-button exam-practice-tools__btn exam-practice-tools__btn--ghost" onClick={() => updateReadingSettings({ fontSize: 100 })}>
                Reset
              </button>
            </div>

            <p className="levels-listening-strategy__tool-hint">{labels.lineHeight}</p>
            <div className="exam-practice-tools__row">
              {['normal', 'comfortable', 'large'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`tool-button exam-practice-tools__btn${readingSettings.lineHeight === value ? ' active' : ''}`}
                  onClick={() => updateReadingSettings({ lineHeight: value })}
                  aria-pressed={readingSettings.lineHeight === value}
                >
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>

            <p className="levels-listening-strategy__tool-hint">{labels.letterSpacing}</p>
            <div className="exam-practice-tools__row">
              {[
                { value: 'normal', label: 'Normal' },
                { value: 'wide', label: 'Wide' },
                { value: 'extrawide', label: 'Extra wide' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`tool-button exam-practice-tools__btn${readingSettings.letterSpacing === opt.value ? ' active' : ''}`}
                  onClick={() => updateReadingSettings({ letterSpacing: opt.value })}
                  aria-pressed={readingSettings.letterSpacing === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="exam-practice-tools__row">
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn${readingSettings.wideSpacing ? ' active' : ''}`}
                onClick={toggleWideSpacing}
                aria-pressed={readingSettings.wideSpacing}
              >
                ↔ {labels.wideSpacing}
              </button>
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn${readingSettings.highContrast ? ' active' : ''}`}
                onClick={() => updateReadingSettings({ highContrast: !readingSettings.highContrast })}
                aria-pressed={readingSettings.highContrast}
              >
                {labels.highContrast}
              </button>
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn${readingSettings.dyslexiaFont ? ' active' : ''}`}
                onClick={() => updateReadingSettings({ dyslexiaFont: !readingSettings.dyslexiaFont })}
                aria-pressed={readingSettings.dyslexiaFont}
              >
                {labels.dyslexiaFont}
              </button>
            </div>

            <button type="button" className="tool-button exam-practice-tools__btn exam-practice-tools__btn--ghost exam-practice-tools__btn--wide" onClick={session.resetReadingSettings}>
              {labels.resetSettings}
            </button>
          </section>

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.highlight}</h3>
            <p className="levels-listening-strategy__tool-hint">
              {tools.highlightMode ? labels.highlightOn : en ? 'Turn on highlighter' : 'Activar subrayado'}
            </p>
            <p className="levels-listening-strategy__tool-hint">{labels.highlightColor}</p>
            <div className="exam-practice-highlight-colors" role="group" aria-label={labels.highlightColor}>
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  className={`exam-practice-highlight-colors__swatch exam-practice-highlight-colors__swatch--${color.id}${tools.highlightColor === color.id ? ' exam-practice-highlight-colors__swatch--active' : ''}`}
                  onClick={() => tools.setHighlightColor(color.id)}
                  aria-pressed={tools.highlightColor === color.id}
                  aria-label={en ? color.label : color.labelEs}
                  title={en ? color.label : color.labelEs}
                />
              ))}
            </div>
            <div className="exam-practice-tools__row">
              <button
                type="button"
                className={`tool-button exam-practice-tools__btn${tools.highlightMode ? ' active' : ''}`}
                onClick={tools.toggleHighlightMode}
                aria-pressed={tools.highlightMode}
              >
                ✏️ {labels.highlight}
              </button>
              <button type="button" className="tool-button exam-practice-tools__btn exam-practice-tools__btn--ghost" onClick={tools.clearHighlights}>
                {labels.clearHighlights}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
