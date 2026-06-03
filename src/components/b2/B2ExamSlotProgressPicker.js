'use client';

import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';

function StarIcon({ state }) {
  const isFull = state === 'full';
  const isHalf = state === 'half';
  const color = isFull || isHalf ? '#ca8a04' : '#cbd5e1';

  if (isHalf) {
    return (
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '1em',
          height: '1em',
          fontSize: '0.9rem',
          lineHeight: 1,
        }}
      >
        <span style={{ color: '#cbd5e1' }}>★</span>
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '50%',
            overflow: 'hidden',
            color: '#ca8a04',
          }}
        >
          ★
        </span>
      </span>
    );
  }

  return (
    <span style={{ color, fontSize: '0.9rem' }}>
      ★
    </span>
  );
}

function StarRow({ filled = 0, max = 3 }) {
  const value = Math.min(max, Math.max(0, Number(filled) || 0));

  return (
    <div
      aria-hidden
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.15rem',
        marginTop: '0.3rem',
        alignItems: 'center',
      }}
    >
      {Array.from({ length: max }, (_, i) => {
        const remainder = value - i;
        let state = 'empty';
        if (remainder >= 1) state = 'full';
        else if (remainder >= 0.5) state = 'half';
        return <StarIcon key={i} state={state} />;
      })}
    </div>
  );
}

/**
 * @param {{
 *   value: number,
 *   onSelect: (n: number) => void,
 *   progressBySlot?: Record<number, { stars?: number, correct?: number, total?: number, approvedParts?: number }>,
 *   partsInPaper?: number,
 *   examLabelsBySlot?: Record<number, string>,
 *   availableSlots?: number[],
 *   showNewExamButton?: boolean,
 *   onNewExam?: () => void,
 *   lang?: 'es' | 'en',
 * }} props
 */
export function B2ExamSlotProgressPicker({
  value,
  onSelect,
  progressBySlot = {},
  partsInPaper = 4,
  examLabelsBySlot = {},
  availableSlots,
  showNewExamButton = false,
  onNewExam,
  lang = 'en',
}) {
  const en = lang === 'en';
  const slotsToShow =
    availableSlots !== undefined
      ? availableSlots
      : Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1);

  return (
    <section
      aria-label={en ? 'Choose exam and view progress' : 'Elegir examen y ver progreso'}
      className="levels-b2-exam-picker"
    >
      <p className="levels-b2-exam-picker__title">{en ? 'Choose an exam' : 'Elige un examen'}</p>
      <div role="group" className="levels-b2-exam-picker__grid">
        {slotsToShow.length === 0 ? (
          <p className="levels-b2-exam-picker__empty">
            {en ? 'No exams available yet.' : 'Aún no hay exámenes disponibles.'}
          </p>
        ) : (
          slotsToShow.map((n) => {
            const active = value === n;
            const prog = progressBySlot[n] || {};
            const stars = Math.min(3, Math.max(0, Number(prog.stars) || 0));
            const approvedParts = Number(prog.approvedParts) || 0;
            const hasScore = approvedParts > 0 || Number(prog.total) > 0;

            return (
              <button
                key={n}
                type="button"
                onClick={() => onSelect(n)}
                aria-pressed={active}
                className={`levels-b2-exam-picker__slot${active ? ' levels-b2-exam-picker__slot--active' : ''}`}
              >
                <span>{examLabelsBySlot[n] || (en ? `Exam ${n}` : `Examen ${n}`)}</span>
                <StarRow filled={stars} />
                {hasScore ? (
                  <span className="levels-b2-exam-picker__slot-meta">
                    {approvedParts}/{partsInPaper} {en ? 'parts' : 'partes'}
                  </span>
                ) : (
                  <span className="levels-b2-exam-picker__slot-meta">
                    {en ? 'No attempts' : 'Sin intentos'}
                  </span>
                )}
              </button>
            );
          })
        )}
        {showNewExamButton && onNewExam ? (
          <button
            type="button"
            onClick={onNewExam}
            className="levels-b2-exam-picker__slot levels-b2-exam-picker__slot--new"
          >
            <span>{en ? '+ New exam' : '+ Examen nuevo'}</span>
            <span className="levels-b2-exam-picker__slot-meta">
              {en ? 'Auto-generate with DRALO AI' : 'Generar con DRALO AI'}
            </span>
          </button>
        ) : null}
      </div>
    </section>
  );
}
