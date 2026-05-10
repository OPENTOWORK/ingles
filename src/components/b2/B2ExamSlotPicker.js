'use client';

import { B2_EXAM_SLOT_MAX } from '@/utils/b2ResolveExam';

/**
 * @param {{ value: number, onSelect: (n: number) => void }} props
 */
export function B2ExamSlotPicker({ value, onSelect }) {
  return (
    <div
      role="group"
      aria-label="Elegir examen"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '0.5rem 0.75rem',
        justifyContent: 'center',
        marginTop: '0.75rem',
      }}
    >
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Examen</span>
      {Array.from({ length: B2_EXAM_SLOT_MAX }, (_, i) => i + 1).map((n) => {
        const active = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onSelect(n)}
            aria-pressed={active}
            style={{
              border: `1px solid ${active ? '#065f46' : '#a7f3d0'}`,
              background: active ? '#047857' : '#ecfdf5',
              color: active ? '#fff' : '#047857',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: active ? '0 2px 8px rgba(4,120,87,.35)' : 'none',
            }}
          >
            Examen {n}
          </button>
        );
      })}
    </div>
  );
}
