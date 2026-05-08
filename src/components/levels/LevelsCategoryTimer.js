'use client';

/**
 * @param {{ categoryLabel: string, timeLabel: string }} props
 */
export default function LevelsCategoryTimer({ categoryLabel, timeLabel }) {
  return (
    <div
      style={{
        maxWidth: '700px',
        margin: '0 auto 1rem',
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        border: '1px solid #e9d5ff',
        background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem 1rem',
        fontFamily: 'Segoe UI, system-ui, sans-serif',
      }}
    >
      <span style={{ fontWeight: 700, color: '#553c9a', fontSize: '0.95rem' }}>⏱ {categoryLabel}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: '#44337a', fontSize: '1.1rem' }}>
        {timeLabel}
      </span>
    </div>
  );
}
