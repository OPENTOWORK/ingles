'use client';

/**
 * @param {{ hint?: { loading?: boolean, error?: string | null, text?: string | null } }} props
 */
export default function LevelsAnswerJustification({ hint }) {
  if (!hint || (!hint.loading && !hint.error && !hint.text)) return null;

  if (hint.loading) {
    return (
      <p style={{ margin: '0.55rem 0 0', fontSize: '0.92rem', color: '#718096', fontStyle: 'italic' }}>
        Generating explanation...
      </p>
    );
  }

  if (hint.error) {
    return (
      <p style={{ margin: '0.55rem 0 0', fontSize: '0.88rem', color: '#718096', fontStyle: 'italic' }}>
        {hint.error === true || !hint.error
          ? 'Explanation temporarily unavailable.'
          : hint.error}
      </p>
    );
  }

  return (
    <p
      style={{
        margin: '0.55rem 0 0',
        fontSize: '0.95rem',
        lineHeight: 1.55,
        color: '#2d3748',
        fontWeight: 500,
      }}
    >
      💡 {hint.text}
    </p>
  );
}
