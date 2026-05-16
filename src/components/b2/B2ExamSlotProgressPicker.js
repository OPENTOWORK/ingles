'use client';

import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';

function StarIcon({ state }) {
  const isFull = state === 'full';
  const isHalf = state === 'half';
  const color = isFull || isHalf ? '#eab308' : '#cbd5e1';

  if (isHalf) {
    return (
      <span
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '1em',
          height: '1em',
          fontSize: '1rem',
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
            color: '#eab308',
            textShadow: '0 1px 2px rgba(234,179,8,.45)',
          }}
        >
          ★
        </span>
      </span>
    );
  }

  return (
    <span
      style={{
        color,
        textShadow: isFull ? '0 1px 2px rgba(234,179,8,.45)' : 'none',
      }}
    >
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
        gap: '0.2rem',
        marginTop: '0.35rem',
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
 * }} props
 */
export function B2ExamSlotProgressPicker({ value, onSelect, progressBySlot = {} }) {
  return (
    <section
      aria-label="Elegir examen y ver progreso"
      style={{
        width: '100%',
        maxWidth: 'min(100%, 960px)',
        margin: '0 auto 1.5rem',
        padding: '1.15rem 1.25rem 1.25rem',
        borderRadius: '14px',
        border: '2px solid #a7f3d0',
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 100%)',
        boxShadow: '0 4px 14px rgba(4,120,87,.12)',
        alignSelf: 'stretch',
      }}
    >
      <p
        style={{
          margin: '0 0 0.85rem',
          textAlign: 'center',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#065f46',
          letterSpacing: '0.02em',
        }}
      >
        Elige un examen
      </p>
      <div
        role="group"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: '0.65rem',
          justifyContent: 'center',
          alignItems: 'stretch',
          overflowX: 'auto',
          paddingBottom: '0.15rem',
        }}
      >
        {Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1).map((n) => {
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
              style={{
                border: `2px solid ${active ? '#065f46' : '#6ee7b7'}`,
                background: active ? '#047857' : '#ffffff',
                color: active ? '#fff' : '#065f46',
                padding: '0.65rem 0.5rem 0.55rem',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: active ? '0 3px 10px rgba(4,120,87,.35)' : '0 1px 4px rgba(0,0,0,.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1 1 0',
                minWidth: '108px',
                maxWidth: '160px',
                minHeight: '88px',
              }}
            >
              <span>Examen {n}</span>
              <StarRow filled={stars} />
              {hasScore ? (
                <span
                  style={{
                    marginTop: '0.3rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    opacity: active ? 0.95 : 0.85,
                  }}
                >
                  {approvedParts}/4 partes
                </span>
              ) : (
                <span
                  style={{
                    marginTop: '0.3rem',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    opacity: 0.65,
                  }}
                >
                  Sin intentos
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
