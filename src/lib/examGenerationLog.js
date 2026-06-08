/**
 * Structured logs for DRALO AI exam generation (never log API keys).
 */

export function logExamGeneration(event, data = {}) {
  const payload = {
    ts: new Date().toISOString(),
    event,
    level: data.level ?? data.slug ?? null,
    examNumber: data.examNumber ?? data.examSlot ?? data.slot ?? null,
    partNumber: data.partNumber ?? null,
    partId: data.partId ?? null,
    action: data.action ?? null,
    model: data.model ?? 'cambridge-exam-generation',
    durationMs: data.durationMs ?? null,
    validationOk: data.validationOk ?? null,
    saved: data.saved ?? null,
    error: data.error ? String(data.error).slice(0, 500) : null,
    validationErrors: data.validationErrors ?? null,
  };

  if (payload.validationOk === false || payload.error) {
    console.warn('[exam-generation]', JSON.stringify(payload));
  } else {
    console.info('[exam-generation]', JSON.stringify(payload));
  }

  return payload;
}
