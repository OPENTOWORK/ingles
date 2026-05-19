/**
 * Mapeo placement_preguntas + placement_respuestas → formato del test en la web.
 */

/** Parte 3 en Supabase = writing del placement test */
export const PLACEMENT_WRITING_PARTES_ID = '294a6f65-f5db-4210-b23c-f7ea4c59b3eb';

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalizeGapText(text) {
  return String(text || '')
    .replace(/\.{2,}/g, '____')
    .replace(/_{3,}/g, '____');
}

function inferQuestionType(options) {
  if (options.length === 2) {
    const lower = options.map((o) => String(o).trim().toLowerCase());
    if (lower.includes('true') && lower.includes('false')) return 'tf';
    if (lower.includes('verdadero') && lower.includes('falso')) return 'tf';
  }
  return 'mcq';
}

export function isPlacementWritingRow(row) {
  if (!row) return false;
  if (row.partes_id === PLACEMENT_WRITING_PARTES_ID) return true;
  if (/^pregunta\s*61$/i.test(String(row.explicacion || '').trim())) return true;
  if (/^WRITING\s+TASK/i.test(String(row.pregunta || '').trim())) return true;
  const parteName = row.placement_partes?.nombre_parte || '';
  if (/writing/i.test(parteName)) return true;
  return false;
}

/**
 * @param {object} row - fila de placement_preguntas con placement_respuestas anidadas
 */
export function mapPlacementRowToQuestion(row) {
  if (isPlacementWritingRow(row)) {
    const respuestas = Array.isArray(row.placement_respuestas)
      ? row.placement_respuestas
      : [];
    const topicOptions = respuestas
      .map((r) => String(r.respuesta ?? '').trim())
      .filter(Boolean);

    if (!row.pregunta) return null;

    return {
      id: row.id,
      type: 'writing',
      text: String(row.pregunta).trim(),
      topicOptions,
      options: [],
      answer: '',
      explanation: row.explicacion || '',
      difficulty: row.placement_tests?.dificultad || null,
      testId: row.test_id || null,
      wordMin: 150,
      wordMax: 200,
    };
  }

  const respuestas = Array.isArray(row.placement_respuestas)
    ? row.placement_respuestas
    : [];

  const options = respuestas
    .map((r) => String(r.respuesta ?? '').trim())
    .filter(Boolean);

  const correctRow = respuestas.find((r) => r.correcta === true);
  const answer = correctRow ? String(correctRow.respuesta).trim() : '';

  if (!row.pregunta || !answer || options.length === 0) {
    return null;
  }

  const type = inferQuestionType(options);
  const difficulty =
    row.placement_tests?.dificultad ||
    row.dificultad ||
    null;

  return {
    id: row.id,
    type,
    text: normalizeGapText(row.pregunta),
    options,
    answer,
    explanation: row.explicacion || '',
    difficulty,
    testId: row.test_id || null,
  };
}

/** Baraja opciones de cada pregunta mcq/tf (no la lista de preguntas). */
export function shuffleQuestionOptions(questions) {
  return questions.map((q) => {
    if (q.type === 'mcq' || q.type === 'tf') {
      return { ...q, options: shuffleArray(q.options) };
    }
    return q;
  });
}

/**
 * 60 preguntas tipo test barajadas + 1 writing siempre al final (pregunta 61).
 */
export function buildPlacementQuestionSet(rows) {
  const writingRows = [];
  const mcqRows = [];

  for (const row of rows || []) {
    if (isPlacementWritingRow(row)) writingRows.push(row);
    else mcqRows.push(row);
  }

  const mcqMapped = mcqRows.map(mapPlacementRowToQuestion).filter(Boolean);
  const uniqueMcq = new Map();
  for (const q of mcqMapped) {
    if (!uniqueMcq.has(q.id)) uniqueMcq.set(q.id, q);
  }

  const shuffledMcq = shuffleArray(Array.from(uniqueMcq.values()));

  const writingMapped = writingRows.map(mapPlacementRowToQuestion).filter(Boolean);
  const writingQ =
    writingMapped.find((q) => /^pregunta\s*61$/i.test(q.explanation)) ||
    writingMapped[0] ||
    null;

  if (writingQ) {
    return [...shuffledMcq, writingQ];
  }

  return shuffledMcq;
}
