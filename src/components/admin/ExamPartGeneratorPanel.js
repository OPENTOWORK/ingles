'use client';

import { useCallback, useMemo, useState } from 'react';
import { getExamPartDisplayLabel } from '@/lib/examPartDisplayLabel';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import { getLevelExamParts } from '@/lib/levelsExamCatalog';

function getPartsForSlug(slug, partMin, partMax) {
  const key = String(slug || 'b2').toLowerCase();
  const catalog = key === 'a2' ? A2_EXAM_PARTS : getLevelExamParts(key) || [];
  return catalog.filter((p) => {
    const n = p.partNumber;
    if (partMin != null && n < partMin) return false;
    if (partMax != null && n > partMax) return false;
    return true;
  });
}

/**
 * Admin panel: regenerate single exam parts with preview before save.
 */
export default function ExamPartGeneratorPanel({
  slug = 'b2',
  examSlot,
  partMin,
  partMax,
  lang = 'es',
  adminPartFlow,
  onSaved,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const parts = useMemo(() => getPartsForSlug(slug, partMin, partMax), [slug, partMin, partMax]);

  const isEn = lang === 'en';
  const preview = adminPartFlow?.partPreview;
  const busy = Boolean(adminPartFlow?.partPreviewLoading || adminPartFlow?.partPreviewSaving);

  const handleGenerate = useCallback(
    (partNumber) => {
      if (!examSlot || busy) return;
      void adminPartFlow?.previewExamPart?.(examSlot, partNumber);
    },
    [adminPartFlow, examSlot, busy],
  );

  if (!adminPartFlow?.canRegenerateExams) return null;

  return (
    <div className="exam-part-generator">
      <button
        type="button"
        className="exam-part-generator__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open
          ? isEn
            ? 'Hide part generator'
            : 'Ocultar generador por partes'
          : isEn
            ? 'Generate / regenerate single parts (DRALO AI)'
            : 'Generar / regenerar partes sueltas (DRALO AI)'}
      </button>

      {open ? (
        <div className="exam-part-generator__body">
          <p className="exam-part-generator__hint">
            {isEn
              ? `Exam ${examSlot}: generate one part at a time. Preview before saving — other parts stay untouched.`
              : `Examen ${examSlot}: genera una parte cada vez. Previsualiza antes de guardar; el resto del examen no se borra.`}
          </p>

          <ul className="exam-part-generator__list">
            {parts.map((partDef) => {
              const label = getExamPartDisplayLabel(slug, partDef.partNumber);
              const isActive = preview?.partNumber === partDef.partNumber;
              return (
                <li key={partDef.partNumber} className="exam-part-generator__item">
                  <span className="exam-part-generator__item-label">{label}</span>
                  <button
                    type="button"
                    className="exam-part-generator__item-btn"
                    disabled={busy || !examSlot}
                    onClick={() => handleGenerate(partDef.partNumber)}
                  >
                    {isEn ? 'Regenerate this part with AI' : 'Regenerar esta parte con IA'}
                  </button>
                  {isActive && preview?.loading ? (
                    <span className="exam-part-generator__item-status">
                      {isEn ? 'Generating…' : 'Generando…'}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {preview && !preview.loading ? (
            <div
              className={`exam-part-generator__preview${
                preview.validation?.ok ? '' : ' exam-part-generator__preview--invalid'
              }`}
            >
              <h3 className="exam-part-generator__preview-title">
                {preview.partLabel || preview.partTitle}
              </h3>

              {preview.validation?.ok ? (
                <p className="exam-part-generator__validation exam-part-generator__validation--ok">
                  {isEn ? 'Validation passed' : 'Validación correcta'}
                </p>
              ) : (
                <div className="exam-part-generator__validation exam-part-generator__validation--error">
                  <strong>{isEn ? 'Validation errors' : 'Errores de validación'}</strong>
                  <ul>
                    {(preview.validation?.errors || []).map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {(preview.validation?.warnings || []).length > 0 ? (
                <div className="exam-part-generator__validation exam-part-generator__validation--warn">
                  <strong>{isEn ? 'Warnings' : 'Avisos'}</strong>
                  <ul>
                    {preview.validation.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {preview.error ? (
                <p className="exam-part-generator__preview-error">{preview.error}</p>
              ) : null}

              {preview.enunciadoPreview ? (
                <div className="exam-part-generator__enunciado">
                  <h4>{isEn ? 'Preview (enunciado)' : 'Vista previa (enunciado)'}</h4>
                  <pre>{preview.enunciadoPreview}</pre>
                </div>
              ) : null}

              {preview.payload ? (
                <details className="exam-part-generator__json">
                  <summary>{isEn ? 'Raw JSON' : 'JSON generado'}</summary>
                  <pre>{JSON.stringify(preview.payload, null, 2)}</pre>
                </details>
              ) : null}

              <div className="exam-part-generator__actions">
                <button
                  type="button"
                  className="exam-part-generator__btn exam-part-generator__btn--primary"
                  disabled={busy || !preview.validation?.ok || !preview.payload}
                  onClick={async () => {
                    await adminPartFlow?.saveExamPart?.();
                    onSaved?.();
                  }}
                >
                  {adminPartFlow?.partPreviewSaving
                    ? isEn
                      ? 'Saving…'
                      : 'Guardando…'
                    : isEn
                      ? 'Save to Supabase'
                      : 'Guardar en Supabase'}
                </button>
                <button
                  type="button"
                  className="exam-part-generator__btn"
                  disabled={busy || !preview.partNumber}
                  onClick={() =>
                    void adminPartFlow?.previewExamPart?.(examSlot, preview.partNumber)
                  }
                >
                  {isEn ? 'Regenerate' : 'Regenerar'}
                </button>
                <button
                  type="button"
                  className="exam-part-generator__btn exam-part-generator__btn--ghost"
                  disabled={busy}
                  onClick={() => adminPartFlow?.cancelPartPreview?.()}
                >
                  {isEn ? 'Cancel' : 'Cancelar'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
