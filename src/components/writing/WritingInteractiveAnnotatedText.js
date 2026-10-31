'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  buildWritingMarkPopupNotes,
  findCorrectionForPhrase,
  getTeacherMarkChip,
  parseAnnotatedTextSegments,
  WRITING_ANNOTATION_LEGEND,
} from '@/lib/writingAnnotatedMarkup';

function normalizeComparable(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function WritingMarkPopup({ popup, onClose, lang, problemsText, strengthsText }) {
  const isEn = lang !== 'es';
  const { rect, tag, correction, phrase } = popup;
  const chip = getTeacherMarkChip(tag, correction, phrase);
  const isStrength = tag === 'good';

  const notes = buildWritingMarkPopupNotes({
    tag,
    correction,
    phrase,
    chip,
    problemsText,
    strengthsText,
    isEn,
  });

  const left =
    typeof window !== 'undefined'
      ? Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 160)
      : rect.left;

  const style = {
    position: 'fixed',
    left,
    top: Math.max(rect.top - 10, 12),
    transform: 'translate(-50%, -100%)',
    zIndex: 1200,
  };

  const showCorrect =
    correction?.correct &&
    normalizeComparable(correction.correct) !== normalizeComparable(phrase) &&
    !isStrength;

  return (
    <div className="writing-mark-popup" style={style} role="dialog" aria-label={chip}>
      <div className="writing-mark-popup__arrow" aria-hidden />
      <div className="writing-mark-popup__head">
        <button type="button" className="writing-mark-popup__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="writing-mark-popup__body">
        {showCorrect ? (
          <p className="writing-mark-popup__arrow-fix">
            → <strong>"{correction.correct.replace(/^"|"$/g, '')}"</strong>
          </p>
        ) : null}

        {notes.map((note, index) => (
          <p key={index} className="writing-mark-popup__note">
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function WritingInteractiveAnnotatedText({
  raw = '',
  corrections = [],
  problemsText = '',
  strengthsText = '',
  lang = 'en',
}) {
  const isEn = lang !== 'es';
  const [popup, setPopup] = useState(null);
  const containerRef = useRef(null);

  const lines = useMemo(() => String(raw ?? ''), [raw]);

  useEffect(() => {
    if (!popup) return undefined;

    const syncPopupToAnchor = () => {
      if (!popup.anchorEl?.isConnected) {
        setPopup(null);
        return;
      }

      const nextRect = popup.anchorEl.getBoundingClientRect();
      setPopup((current) =>
        current
          ? {
              ...current,
              rect: nextRect,
            }
          : current,
      );
    };

    const onDocClick = (event) => {
      if (containerRef.current?.contains(event.target)) return;
      setPopup(null);
    };
    const onEsc = (event) => {
      if (event.key === 'Escape') setPopup(null);
    };

    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', syncPopupToAnchor, true);
    window.addEventListener('resize', syncPopupToAnchor);

    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', syncPopupToAnchor, true);
      window.removeEventListener('resize', syncPopupToAnchor);
    };
  }, [popup?.anchorEl]);

  return (
    <div ref={containerRef} className="writing-annotated-text writing-annotated-text--interactive">
      <p className="writing-annotated-text__hint">
        {isEn
          ? 'Tap the highlights to find explanations'
          : 'Pulsa una palabra resaltada — la corrección aparece encima (como en papel).'}
      </p>

      {lines ? (
        <div className="writing-annotated-text__body">
          {parseAnnotatedTextSegments(lines).map((segment, segmentIndex) => {
            if (segment.type === 'text') {
              return <span key={segmentIndex}>{segment.text}</span>;
            }

            const correction =
              segment.correctionIndex != null && corrections[segment.correctionIndex]
                ? corrections[segment.correctionIndex]
                : findCorrectionForPhrase(segment.text, corrections);

            return (
              <button
                key={segmentIndex}
                type="button"
                className={`writing-mark writing-mark--${segment.tag} writing-mark--clickable`}
                aria-label={getTeacherMarkChip(segment.tag, correction, segment.text)}
                onClick={(event) => {
                  setPopup({
                    anchorEl: event.currentTarget,
                    rect: event.currentTarget.getBoundingClientRect(),
                    tag: segment.tag,
                    phrase: segment.text,
                    correction,
                  });
                }}
              >
                {segment.text}
              </button>
            );
          })}
        </div>
      ) : null}

      {popup ? (
        <WritingMarkPopup
          popup={popup}
          onClose={() => setPopup(null)}
          lang={lang}
          problemsText={problemsText}
          strengthsText={strengthsText}
        />
      ) : null}
    </div>
  );
}

export function WritingAnnotationLegend({ lang = 'en' }) {
  const isEn = lang !== 'es';

  return (
    <div className="writing-annotation-legend" role="note">
      <p className="writing-annotation-legend__title">
        {isEn ? 'Colour key' : 'Leyenda de colores'}
      </p>
      <ul className="writing-annotation-legend__list">
        {WRITING_ANNOTATION_LEGEND.map((item) => (
          <li key={item.key} className="writing-annotation-legend__item">
            <span className={`writing-annotation-legend__swatch writing-mark ${item.className}`}>
              {isEn ? item.labelEn : item.labelEs}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
