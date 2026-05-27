'use client';

function formatEta(seconds) {
  const s = Math.max(0, Math.ceil(Number(seconds) || 0));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r > 0 ? `${m} min ${r} s` : `${m} min`;
}

function formatGenError(message) {
  const m = String(message || '').trim();
  if (/sesión no válida/i.test(m)) {
    return 'Sesión no válida. Cierra sesión, vuelve a entrar como administrador y regenera el examen.';
  }
  return m;
}

/**
 * @param {{
 *   generating?: boolean,
 *   genError?: string,
 *   genProgress?: string,
 *   genStep?: number,
 *   genTotal?: number,
 *   genEtaSeconds?: number | null,
 *   genPartLabel?: string,
 *   onDismissError?: () => void,
 * }} props
 */
export default function A2ExamGenerationStatus({
  generating = false,
  genError = '',
  genProgress = '',
  genStep = 0,
  genTotal = 14,
  genEtaSeconds = null,
  genPartLabel = '',
  onDismissError,
}) {
  if (!generating && !genError && !genProgress) return null;

  return (
    <div
      style={{
        maxWidth: '720px',
        margin: '0 auto 1rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        background: genError ? '#fff5f5' : '#ebf8ff',
        border: `1px solid ${genError ? '#fc8181' : '#63b3ed'}`,
        fontSize: '0.9rem',
        lineHeight: 1.5,
      }}
    >
      {generating ? (
        <p style={{ margin: 0 }}>
          ⏳ Generando examen con DRALO AI (parte {genStep} de {genTotal}
          {genPartLabel ? ` — ${genPartLabel}` : ''})…
          {genEtaSeconds != null && genStep > 0 && genStep < genTotal ? (
            <span> Tiempo restante estimado: ~{formatEta(genEtaSeconds)}.</span>
          ) : null}
        </p>
      ) : null}
      {genProgress && !generating && !genError ? (
        <p style={{ margin: 0 }}>{genProgress}</p>
      ) : null}
      {genError ? (
        <p style={{ margin: 0, color: '#9b2c2c' }}>
          {formatGenError(genError)}
          {onDismissError ? (
            <>
              {' '}
              <button
                type="button"
                onClick={onDismissError}
                style={{
                  marginLeft: '0.35rem',
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  color: '#2b6cb0',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Cerrar
              </button>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
