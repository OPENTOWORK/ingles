'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildClientApiUrl } from '@/utils/clientApiUrl';

const HIGHLIGHT_KEY = 'reading-dictionary';
const VISIBLE_MS = 4500;
const MAX_CHARS = 160;

function cleanSelection(raw) {
  return String(raw || '').replace(/\s+/g, ' ').trim();
}

function selectionInsidePassage(range) {
  const node = range.commonAncestorContainer;
  const el = node.nodeType === 1 ? node : node.parentElement;
  if (!el?.closest) return false;
  if (!el.closest('.levels-b2-practice__work-body')) return false;
  if (el.closest('button, a, input, textarea, select, [role="button"], .reading-dictionary-pop')) {
    return false;
  }
  return true;
}

function clearUnderline() {
  if (typeof CSS !== 'undefined' && CSS.highlights) {
    CSS.highlights.delete(HIGHLIGHT_KEY);
  }
  document.querySelectorAll('mark.reading-dictionary-mark').forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

function paintUnderline(range) {
  clearUnderline();
  if (typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined') {
    CSS.highlights.set(HIGHLIGHT_KEY, new Highlight(range));
    return;
  }
  try {
    const mark = document.createElement('mark');
    mark.className = 'reading-dictionary-mark';
    range.surroundContents(mark);
  } catch {
    /* The popup still shows when the selection crosses several elements. */
  }
}

function popupPosition(rect) {
  const width = Math.min(280, window.innerWidth - 24);
  let left = rect.left;
  if (left + width > window.innerWidth - 12) {
    left = window.innerWidth - 12 - width;
  }
  left = Math.max(12, left);
  const below = rect.bottom + 8;
  const top = below + 72 > window.innerHeight ? Math.max(12, rect.top - 76) : below;
  return { top, left, width };
}

export default function ReadingPracticeDictionary({ lang = 'en' }) {
  const en = lang === 'en';
  const [active, setActive] = useState(false);
  const [popup, setPopup] = useState(null);
  const hideTimer = useRef(0);
  const requestId = useRef(0);

  const dismiss = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    requestId.current += 1;
    clearUnderline();
    setPopup(null);
  }, []);

  const scheduleHide = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      clearUnderline();
      setPopup(null);
    }, VISIBLE_MS);
  }, []);

  const captureSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!selectionInsidePassage(range)) return;

    const text = cleanSelection(selection.toString());
    if (!text || !/[A-Za-z]/.test(text)) return;

    const rect = range.getBoundingClientRect();
    const position = popupPosition(rect);
    paintUnderline(range.cloneRange());
    selection.removeAllRanges();

    if (text.length > MAX_CHARS) {
      setPopup({
        ...position,
        source: text,
        translation: '',
        error: en ? 'Select a shorter phrase.' : 'Selecciona una frase más corta.',
        loading: false,
      });
      scheduleHide();
      return;
    }

    const id = requestId.current + 1;
    requestId.current = id;
    setPopup({
      ...position,
      source: text,
      translation: '',
      error: '',
      loading: true,
    });

    fetch(buildClientApiUrl('/api/exam-practice/translate/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || 'translate');
        return data;
      })
      .then((data) => {
        if (requestId.current !== id) return;
        setPopup((current) =>
          current
            ? {
                ...current,
                translation: String(data?.translation || '').trim(),
                loading: false,
                error: '',
              }
            : current,
        );
        scheduleHide();
      })
      .catch(() => {
        if (requestId.current !== id) return;
        setPopup((current) =>
          current
            ? {
                ...current,
                loading: false,
                error: en ? 'Could not translate that.' : 'No se ha podido traducir.',
              }
            : current,
        );
        scheduleHide();
      });
  }, [en, scheduleHide]);

  useEffect(() => {
    if (!active) {
      dismiss();
      return undefined;
    }

    const onPointerUp = (event) => {
      const target = event.target;
      if (target?.closest?.('.reading-dictionary-tool, .reading-dictionary-pop')) return;
      window.setTimeout(captureSelection, 0);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') dismiss();
    };

    document.addEventListener('mouseup', onPointerUp);
    document.addEventListener('touchend', onPointerUp);
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('reading-dictionary-armed');

    return () => {
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchend', onPointerUp);
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('reading-dictionary-armed');
    };
  }, [active, captureSelection, dismiss]);

  useEffect(() => () => {
    window.clearTimeout(hideTimer.current);
    clearUnderline();
  }, []);

  const label = en ? 'Dictionary' : 'Diccionario';
  const hint = en
    ? 'Turn on, then select a word or phrase. It is translated into Spanish for a moment.'
    : 'Actívalo y subraya una palabra o frase. Se traduce al español un momento.';

  return (
    <aside
      className={[
        'levels-listening-strategy',
        'exam-practice-rail-disclosure',
        'reading-dictionary-tool',
        active ? 'exam-practice-rail-disclosure--open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        className="levels-listening-strategy__toggle levels-listening-strategy__toggle--dictionary"
        aria-pressed={active}
        title={hint}
        onClick={() => setActive((value) => !value)}
      >
        <span className="reading-dictionary-tool__icon" aria-hidden>
          Aa
        </span>
        <span>{label}</span>
      </button>
      {popup && typeof document !== 'undefined'
        ? createPortal(
            <div
              className="reading-dictionary-pop"
              role="status"
              style={{ top: popup.top, left: popup.left, width: popup.width }}
            >
              <p className="reading-dictionary-pop__source">{popup.source}</p>
              <p className="reading-dictionary-pop__translation">
                {popup.loading
                  ? en
                    ? 'Translating…'
                    : 'Traduciendo…'
                  : popup.error || popup.translation}
              </p>
            </div>,
            document.body,
          )
        : null}
    </aside>
  );
}
