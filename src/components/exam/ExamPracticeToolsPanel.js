'use client';

import { useState } from 'react';
import { useExamPracticeTools, HIGHLIGHT_COLORS } from '@/context/ExamPracticeToolsContext';

/**
 * Herramientas de lectura: lupa (zoom), subrayado, espaciado.
 */
export default function ExamPracticeToolsPanel({ lang = 'en' }) {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);
  const tools = useExamPracticeTools();

  const labels = {
    title: en ? 'Tools' : 'Herramientas',
    magnifier: en ? 'Magnifier' : 'Lupa',
    zoomIn: en ? 'Zoom in' : 'Acercar',
    zoomOut: en ? 'Zoom out' : 'Alejar',
    zoomReset: en ? 'Reset size' : 'Tamaño normal',
    highlight: en ? 'Highlighter' : 'Subrayar',
    highlightOn: en ? 'Select text to highlight' : 'Selecciona texto para subrayar',
    highlightOff: en ? 'Turn on highlighter' : 'Activar subrayado',
    spacing: en ? 'Wide spacing' : 'Espaciado amplio',
    clear: en ? 'Clear highlights' : 'Quitar subrayados',
    highlightColor: en ? 'Highlight color' : 'Color del subrayado',
    zoomLevel: en ? 'Text size' : 'Tamaño del texto',
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
            <h3 className="levels-listening-strategy__heading">{labels.magnifier}</h3>
            <p className="levels-listening-strategy__tool-hint">
              {labels.zoomLevel}: <strong>{tools.zoomPercent}%</strong>
            </p>
            <div className="exam-practice-tools__row">
              <button type="button" className="exam-practice-tools__btn" onClick={tools.zoomOut} title={labels.zoomOut}>
                🔍−
              </button>
              <button type="button" className="exam-practice-tools__btn" onClick={tools.zoomIn} title={labels.zoomIn}>
                🔍+
              </button>
              <button type="button" className="exam-practice-tools__btn exam-practice-tools__btn--ghost" onClick={tools.resetZoom}>
                {labels.zoomReset}
              </button>
            </div>
          </section>

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.highlight}</h3>
            <p className="levels-listening-strategy__tool-hint">
              {tools.highlightMode ? labels.highlightOn : labels.highlightOff}
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
                />
              ))}
            </div>
            <div className="exam-practice-tools__row">
              <button
                type="button"
                className={`exam-practice-tools__btn${tools.highlightMode ? ' exam-practice-tools__btn--active' : ''}`}
                onClick={tools.toggleHighlightMode}
              >
                ✏️ {labels.highlight}
              </button>
              <button type="button" className="exam-practice-tools__btn exam-practice-tools__btn--ghost" onClick={tools.clearHighlights}>
                {labels.clear}
              </button>
            </div>
          </section>

          <section>
            <h3 className="levels-listening-strategy__heading">{labels.spacing}</h3>
            <button
              type="button"
              className={`exam-practice-tools__btn exam-practice-tools__btn--wide${tools.lineSpacing ? ' exam-practice-tools__btn--active' : ''}`}
              onClick={tools.toggleLineSpacing}
            >
              ↔ {labels.spacing}
            </button>
          </section>
        </div>
      ) : null}
    </aside>
  );
}
