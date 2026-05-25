/**
 * Mapeo placement_preguntas + placement_respuestas → formato del test en la web.
 */

/** Parte 3 en Supabase = writing del placement test */
export const PLACEMENT_WRITING_PARTES_ID = '294a6f65-f5db-4210-b23c-f7ea4c59b3eb';

/** Segundo placement test en Supabase (Outcomes / examen 2). */
export const PLACEMENT_EXAM2_TEST_ID = 'd3db83c5-85a4-460a-9dcf-34431f3e04d4';
export const PLACEMENT_EXAM2_EXPECTED_QUESTIONS = 61;

/** Sesión única: preguntas aleatorias mezcladas de todos los placement_tests. */
export const PLACEMENT_MIXED_TEST_ID = 'mixed-placement-all-tests';
export const PLACEMENT_MIXED_TARGETS = { 1: 50, 2: 10, 3: 1 };
export const PLACEMENT_MIXED_TOTAL = 61;

export function isPlacementMixedTestId(testId) {
  return (
    testId === PLACEMENT_MIXED_TEST_ID ||
    testId === 'mixed' ||
    testId === 'random'
  );
}

/** Mínimo de filas con etiqueta ExamenNparte… para activar modo estructurado. */
export const PLACEMENT_STRUCTURED_MIN_TAGGED_ROWS = 5;

/** Tres partes del placement test (preguntas 1–50, 51–60, 61). */
export const PLACEMENT_PARTS = [
  {
    part: 1,
    title: 'Grammar & vocabulary',
    from: 1,
    to: 50,
    questionCount: 50,
    estimatedMinutes: 40,
    icon: '📝',
    accent: 'violet',
  },
  {
    part: 2,
    title: 'Reading',
    from: 51,
    to: 60,
    questionCount: 10,
    estimatedMinutes: 15,
    icon: '📖',
    accent: 'ocean',
  },
  {
    part: 3,
    title: 'Writing',
    from: 61,
    to: 61,
    questionCount: 1,
    estimatedMinutes: 20,
    icon: '✍️',
    accent: 'emerald',
  },
];

export const PLACEMENT_ESTIMATED_MINUTES = PLACEMENT_PARTS.reduce(
  (sum, p) => sum + p.estimatedMinutes,
  0,
);

export function getPlacementTestLabel(row) {
  if (!row) return 'Placement Test';
  return (
    row.nombre ||
    row.titulo ||
    row.name ||
    row.title ||
    `Placement ${String(row.id || '').slice(0, 8)}`
  );
}

export function getPlacementTestDescription(row) {
  if (!row) return '';
  return String(row.descripcion || row.description || '').trim();
}

/** Definición de partes según examen cargado (exámenes 2/3/…: preguntas 1–61 en pantalla). */
export function getPlacementPartDefsFromQuestions(questions) {
  const isStructured = (questions || []).some((q) => q.exam2);
  if (!isStructured) return PLACEMENT_PARTS;
  return [
    {
      part: 1,
      title: 'Grammar & vocabulary',
      from: 1,
      to: 50,
      questionCount: 50,
      estimatedMinutes: 40,
      icon: '📝',
      accent: 'violet',
    },
    {
      part: 2,
      title: 'Reading',
      from: 51,
      to: 60,
      questionCount: 10,
      estimatedMinutes: 15,
      icon: '📖',
      accent: 'ocean',
    },
    {
      part: 3,
      title: 'Writing',
      from: 61,
      to: 61,
      questionCount: 1,
      estimatedMinutes: 20,
      icon: '✍️',
      accent: 'emerald',
    },
  ];
}

/** ¿El texto incluye etiqueta ExamenNparteNpreguntaM? (examen 2, 3, …) */
export function isStructuredPlacementExplanation(text) {
  return /examen\s*\d+\s*parte\s*\d+\s*pregunta\s*\d+/i.test(String(text || ''));
}

/** @deprecated Alias */
export function isExam2StructuredExplanation(explicacion) {
  return isStructuredPlacementExplanation(explicacion);
}

function rowHasStructuredExplanation(row) {
  return (
    isStructuredPlacementExplanation(row?.explicacion) ||
    isStructuredPlacementExplanation(row?.pregunta)
  );
}

function parseStructuredFromRow(row) {
  const exp = String(row?.explicacion || '').trim();
  const preg = String(row?.pregunta || '').trim();
  return (
    parseStructuredPlacementExplanation(exp) ||
    parseStructuredPlacementExplanation(preg)
  );
}

function detectStructuredExamNumber(rows, test) {
  const list = (rows || []).filter((r) =>
    test?.id ? r.test_id === test.id : true,
  );
  const counts = new Map();
  for (const row of list) {
    const s = parseStructuredFromRow(row);
    if (s?.examNumber != null) {
      counts.set(s.examNumber, (counts.get(s.examNumber) || 0) + 1);
    }
  }
  if (!counts.size) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** ¿Todo el test usa lógica ExamenNparte… (exámenes 2, 3, …)? */
export function isStructuredPlacementBatchMode(rows, test) {
  const list = rows || [];
  if (test?.id === PLACEMENT_EXAM2_TEST_ID) return true;
  const label = getPlacementTestLabel(test || {});
  if (/test\s*[23]|examen\s*[23]|placement\s*[23]/i.test(label)) return true;
  const scoped = test?.id ? list.filter((r) => r.test_id === test.id) : list;
  const tagged = scoped.filter((r) => rowHasStructuredExplanation(r)).length;
  return tagged >= PLACEMENT_STRUCTURED_MIN_TAGGED_ROWS;
}

/** @deprecated Alias */
export function isExam2BatchMode(rows, test) {
  return isStructuredPlacementBatchMode(rows, test);
}

function extractTrailingQuestionNumber(explicacion) {
  const exp = String(explicacion || '').trim();
  let m = exp.match(/pregunta\s*(\d+)/i);
  if (m) return Number(m[1]);
  const nums = exp.match(/\d+/g);
  return nums?.length ? Number(nums[nums.length - 1]) : null;
}

function metaFromPartesId(row, baseOffset) {
  const name = (row.placement_partes?.nombre_parte || '').toLowerCase();
  let part = null;
  if (/reading|comprensi|lectura/.test(name)) part = 2;
  else if (/writing|redacci|escritura/.test(name)) part = 3;
  else if (/grammar|vocabulary|gram|vocab/.test(name)) part = 1;
  if (!part) return null;

  const loose = parseLooseStructuredExplanation(row);
  const qInPart =
    loose?.questionInPart ??
    extractTrailingQuestionNumber(row?.explicacion) ??
    extractTrailingQuestionNumber(row?.pregunta) ??
    1;
  const examNumber = loose?.examNumber ?? detectStructuredExamNumber([row]) ?? 2;
  return resolveStructuredPlacementMeta(
    { examNumber, part, questionInPart: qInPart },
    baseOffset,
  );
}

/** Resumen de partes y tiempos a partir de preguntas ya construidas. */
export function summarizePlacementParts(questions) {
  const defs = getPlacementPartDefsFromQuestions(questions);
  return defs.map((meta) => {
    const count = questions.filter((q) => q.part === meta.part).length;
    const base = meta.questionCount || 1;
    const estimatedMinutes =
      count > 0
        ? Math.max(1, Math.round(meta.estimatedMinutes * (count / base)))
        : 0;
    return {
      ...meta,
      questionCount: count,
      estimatedMinutes,
    };
  }).filter((p) => p.questionCount > 0);
}

/** Catálogo de exámenes disponibles (placement_tests + conteo por test_id). */
export function buildPlacementExamCatalog(tests, rows) {
  const list = Array.isArray(tests) ? tests : [];

  return list
    .map((test) => {
      const testRows = (rows || []).filter((r) => r.test_id === test.id);
      const questions = buildPlacementQuestionSet(testRows, { test });
      const parts = summarizePlacementParts(questions);
      const estimatedMinutes = parts.reduce((s, p) => s + p.estimatedMinutes, 0);

      return {
        id: test.id,
        label: getPlacementTestLabel(test),
        description: getPlacementTestDescription(test),
        difficulty: test.dificultad || test.difficulty || null,
        totalQuestions: questions.length,
        poolRowCount: testRows.length,
        estimatedMinutes: estimatedMinutes || PLACEMENT_ESTIMATED_MINUTES,
        parts,
      };
    })
    .filter((exam) => exam.totalQuestions > 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

export function getPlacementStorageKey(testId) {
  return `placement.v23.${testId || 'default'}`;
}

export function isStructuredPlacementExamContext(testId, explicacion, test) {
  if (testId === PLACEMENT_EXAM2_TEST_ID) return true;
  const label = getPlacementTestLabel(test || {});
  if (/test\s*[23]|examen\s*[23]|placement\s*[23]/i.test(label)) return true;
  return isStructuredPlacementExplanation(explicacion);
}

/** @deprecated Alias */
export function isPlacementExam2Context(testId, explicacion) {
  return (
    isStructuredPlacementExamContext(testId, explicacion) ||
    isStructuredPlacementExplanation(explicacion)
  );
}

/**
 * Formato estructurado: "Examen2parte1pregunta10".
 * Examen 1 legacy: solo "pregunta 51" (sin examenN).
 */
export function parseStructuredPlacementExplanation(explicacion) {
  const exp = String(explicacion || '').trim();
  const examMatch = exp.match(
    /examen\s*(\d+)\s*parte\s*(\d+)\s*pregunta\s*(\d+)/i,
  );
  if (examMatch) {
    return {
      examNumber: Number(examMatch[1]),
      part: Number(examMatch[2]),
      questionInPart: Number(examMatch[3]),
    };
  }
  return null;
}

/** Variantes: "Examen3parte1pregunta8", "parte2pregunta3", "pregunta 51". */
export function parseLooseStructuredExplanation(rowOrText, { defaultExamNumber = 2 } = {}) {
  const row =
    rowOrText && typeof rowOrText === 'object' && 'explicacion' in rowOrText
      ? rowOrText
      : null;
  const structured = row
    ? parseStructuredFromRow(row)
    : parseStructuredPlacementExplanation(rowOrText);
  if (structured) return structured;

  const exp = String(row?.explicacion ?? rowOrText ?? '').trim();
  const examHint = detectStructuredExamNumber(row ? [row] : []) ?? defaultExamNumber;

  let m = exp.match(/parte\s*(\d+)\s*pregunta\s*(\d+)/i);
  if (m) {
    return {
      examNumber: examHint,
      part: Number(m[1]),
      questionInPart: Number(m[2]),
    };
  }

  m = exp.match(/^pregunta\s*(\d+)\s*$/i) || exp.match(/pregunta\s*(\d+)/i);
  if (m) {
    return {
      examNumber: examHint,
      part: null,
      questionInPart: Number(m[1]),
      globalPregunta: true,
    };
  }

  return null;
}

/** @deprecated Alias */
export function parseLooseExam2Explanation(explicacion) {
  return parseLooseStructuredExplanation(explicacion);
}

/** 0 si en BD empieza en pregunta0; 1 si empieza en pregunta1. */
export function detectStructuredQuestionBase(rows, test) {
  const nums = (rows || [])
    .filter((r) =>
      test?.id
        ? r.test_id === test.id
        : isStructuredPlacementExamContext(r?.test_id, r?.explicacion),
    )
    .map((r) => {
      const loose = parseLooseStructuredExplanation(r);
      return loose?.questionInPart;
    })
    .filter((n) => n != null);
  if (!nums.length) return 1;
  return Math.min(...nums) === 0 ? 0 : 1;
}

/** @deprecated Alias */
export function detectExam2QuestionBase(rows) {
  return detectStructuredQuestionBase(rows);
}

function resolveExam2FromGlobalPregunta(questionNum, baseOffset = 1) {
  const placementNumber = questionNum - baseOffset;
  let part = 1;
  if (placementNumber >= 50 && placementNumber <= 59) part = 2;
  else if (placementNumber >= 60) part = 3;

  return {
    part,
    questionInPart: questionNum,
    placementNumber,
    exam2: true,
    examNumber: 2,
  };
}

/**
 * Exámenes estructurados (2, 3, …): índice global 0–60 (50 grammar + 10 reading + 1 writing).
 */
export function resolveStructuredPlacementMeta(structured, baseOffset = 1) {
  const partSection = structured.part;
  const questionInPart = structured.questionInPart;
  let placementNumber = null;
  let part = partSection;

  if (partSection === 1) {
    placementNumber = questionInPart - baseOffset;
    // Importación solo en parte1: 1–50 grammar, 51–60 reading, 61 writing (índice 0–60).
    if (placementNumber >= 50 && placementNumber <= 59) {
      part = 2;
    } else if (placementNumber >= 60) {
      part = 3;
    }
  } else if (partSection === 2) {
    part = 2;
    // BD real: Examen2parte2pregunta51 … pregunta60 (índice global, no 1–10).
    if (questionInPart >= 51) {
      placementNumber = questionInPart - baseOffset;
    } else {
      placementNumber = 50 - baseOffset + questionInPart;
    }
  } else if (partSection === 3) {
    part = 3;
    // BD real: Examen2parte3pregunta61
    if (questionInPart >= 61) {
      placementNumber = questionInPart - baseOffset;
    } else {
      placementNumber = 60 - baseOffset + questionInPart;
    }
  }

  return {
    part,
    questionInPart,
    placementNumber,
    exam2: true,
    examNumber: structured.examNumber ?? 2,
  };
}

/** @deprecated Alias */
export function resolveExam2PlacementMeta(structured, baseOffset = 1) {
  return resolveStructuredPlacementMeta(structured, baseOffset);
}

export function resolvePlacementMeta(
  row,
  { exam2BaseOffset = 1, forceExam2 = false, test, forceStructured = false } = {},
) {
  const useStructured =
    forceStructured ||
    forceExam2 ||
    isStructuredPlacementExamContext(row?.test_id, row?.explicacion) ||
    rowHasStructuredExplanation(row);

  if (useStructured) {
    const defaultExam = detectStructuredExamNumber([row], test) ?? 2;
    const loose = parseLooseStructuredExplanation(row, { defaultExamNumber: defaultExam });
    if (loose?.globalPregunta) {
      const global = resolveExam2FromGlobalPregunta(
        loose.questionInPart,
        exam2BaseOffset,
      );
      if (global.part && global.placementNumber != null) {
        return { ...global, examNumber: loose.examNumber ?? defaultExam };
      }
    }
    if (loose?.part != null) {
      const meta = resolveStructuredPlacementMeta(loose, exam2BaseOffset);
      if (meta.part && meta.placementNumber != null && !Number.isNaN(meta.placementNumber)) {
        return meta;
      }
    }
    const fromParte = metaFromPartesId(row, exam2BaseOffset);
    if (fromParte?.part != null) return fromParte;
    for (const field of [row?.explicacion, row?.pregunta]) {
      const trailing = extractTrailingQuestionNumber(field);
      if (trailing != null) {
        const global = resolveExam2FromGlobalPregunta(trailing, exam2BaseOffset);
        if (global.part && global.placementNumber != null) {
          return { ...global, examNumber: defaultExam };
        }
      }
    }
  }

  const structured = parseStructuredFromRow(row);

  if (structured?.part != null && structured.examNumber >= 2) {
    const meta = resolveStructuredPlacementMeta(structured, exam2BaseOffset);
    if (meta.part && meta.placementNumber != null && !Number.isNaN(meta.placementNumber)) {
      return meta;
    }
  }

  const exp = String(row?.explicacion || '').trim();
  let m = exp.match(/^pregunta\s*(\d+)\s*$/i);
  if (!m) m = exp.match(/^pregunta\s*(\d+)/i);
  if (!m) {
    const preg = String(row?.pregunta || '').trim();
    m = preg.match(/^Q\s*(\d+)\s*::/i);
  }

  const placementNumber = m ? Number(m[1]) : null;
  const part = classifyPlacementPart(row, placementNumber);

  return { part, questionInPart: placementNumber, placementNumber, exam2: false };
}

export function extractPlacementQuestionNumber(row) {
  return resolvePlacementMeta(row).placementNumber;
}

/** Orden fijo: parte 1 → 2 → 3 y, dentro de cada parte, por número de pregunta. */
export function sortPlacementQuestionSet(questions) {
  return [...questions].sort((a, b) => {
    const partA = a.part ?? 99;
    const partB = b.part ?? 99;
    if (partA !== partB) return partA - partB;
    const numA = a.placementNumber ?? 9999;
    const numB = b.placementNumber ?? 9999;
    if (numA !== numB) return numA - numB;
    return String(a.id).localeCompare(String(b.id));
  });
}

export function getPlacementPartMeta(part) {
  return PLACEMENT_PARTS.find((p) => p.part === part) ?? PLACEMENT_PARTS[0];
}

function classifyPlacementPart(row, placementNumber) {
  const structured = parseStructuredFromRow(row);
  if (structured?.part != null && structured.examNumber >= 2) {
    return structured.part;
  }

  if (placementNumber != null && rowHasStructuredExplanation(row)) {
    if (placementNumber >= 0 && placementNumber <= 49) return 1;
    if (placementNumber >= 50 && placementNumber <= 59) return 2;
    if (placementNumber >= 60) return 3;
  }

  if (placementNumber != null) {
    if (placementNumber >= 1 && placementNumber <= 50) return 1;
    if (placementNumber >= 51 && placementNumber <= 60) return 2;
    if (placementNumber === 61) return 3;
  }
  if (isPlacementWritingRow(row)) return 3;
  const parteName = (row.placement_partes?.nombre_parte || '').toLowerCase();
  if (/reading|comprensi[oó]n/i.test(parteName)) return 2;
  if (/writing/i.test(parteName)) return 3;
  if (/grammar|vocabulary|vocabulario|gram[aá]tica/i.test(parteName)) return 1;
  return 1;
}

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

function sortByPlacementNumber(a, b) {
  return (a.placementNumber ?? 999) - (b.placementNumber ?? 999);
}

function dedupeByPlacementNumber(list, { exam2 = false } = {}) {
  const map = new Map();
  for (const q of [...list].sort(sortByPlacementNumber)) {
    const key = exam2
      ? `${q.part}:${q.placementNumber ?? q.id}`
      : (q.placementNumber ?? q.id);
    map.set(key, q);
  }
  return Array.from(map.values()).sort(sortByPlacementNumber);
}

/** Supabase puede guardar correcta como boolean, string o número. */
export function isPlacementRespuestaCorrecta(row) {
  if (!row) return false;
  const v = row.correcta ?? row.es_correcta ?? row.is_correct ?? row.correct;
  return (
    v === true ||
    v === 'true' ||
    v === 't' ||
    v === 'TRUE' ||
    v === 1 ||
    v === '1'
  );
}

function isPlacementRespuestaExplicitlyWrong(row) {
  if (!row) return false;
  const v = row.correcta ?? row.es_correcta ?? row.is_correct ?? row.correct;
  return v === false || v === 'false' || v === 'FALSE' || v === 0 || v === '0';
}

/**
 * Resuelve la respuesta correcta (importaciones con distintos formatos en Supabase).
 */
export function resolvePlacementCorrectAnswer(respuestas) {
  if (!Array.isArray(respuestas) || !respuestas.length) return '';

  const explicit = respuestas.find((r) => isPlacementRespuestaCorrecta(r));
  if (explicit) return String(explicit.respuesta ?? '').trim();

  for (const r of respuestas) {
    const c = r.correcta ?? r.es_correcta ?? r.is_correct ?? r.correct;
    if (typeof c === 'string' && c.length > 1 && !/^(false|0)$/i.test(c.trim())) {
      const text = c.trim();
      const match = respuestas.find(
        (o) =>
          String(o.respuesta ?? '')
            .trim()
            .toLowerCase() === text.toLowerCase(),
      );
      return String((match || r).respuesta ?? text).trim();
    }
  }

  const wrong = respuestas.filter((r) => isPlacementRespuestaExplicitlyWrong(r));
  const notWrong = respuestas.filter((r) => !isPlacementRespuestaExplicitlyWrong(r));
  if (wrong.length > 0 && notWrong.length === 1) {
    return String(notWrong[0].respuesta ?? '').trim();
  }

  if (respuestas.length >= 2 && notWrong.length >= 1) {
    const neutral = respuestas.filter(
      (r) =>
        r.correcta == null ||
        r.correcta === undefined ||
        String(r.correcta ?? '').trim() === '',
    );
    if (neutral.length === 1) {
      return String(neutral[0].respuesta ?? '').trim();
    }
    if (neutral.length > 1 && wrong.length === 0) {
      return String(neutral[0].respuesta ?? '').trim();
    }
  }

  if (
    respuestas.length >= 2 &&
    wrong.length === respuestas.length &&
    respuestas.length <= 4
  ) {
    return String(respuestas[0].respuesta ?? '').trim();
  }

  return '';
}

/** Writing solo en parte 3 explícita o índice 60 (pregunta 61 en etiqueta 1-based). */
export function isExam2WritingRow(row) {
  if (
    !isStructuredPlacementExamContext(row?.test_id, row?.explicacion) &&
    !rowHasStructuredExplanation(row)
  ) {
    return false;
  }
  const loose = parseLooseStructuredExplanation(row);
  if (loose?.globalPregunta) {
    const base = loose.questionInPart === 0 ? 0 : 1;
    return loose.questionInPart - base === 60;
  }
  if (loose?.part === 3) return true;
  if (/^WRITING\s+TASK/i.test(String(row?.pregunta || '').trim())) return true;
  if (loose?.part === 1) {
    const base = loose.questionInPart === 0 ? 0 : 1;
    return loose.questionInPart - base === 60;
  }
  return false;
}

/** Quita líneas residuales "Q51:" / "Q51::" al final (preguntas 52–60). */
export function stripStrayQ51PromptLine(text) {
  return String(text || '')
    .replace(/(?:\r?\n)+\s*Q\s*51\s*:+[^\r\n]*\s*$/gi, '')
    .replace(/\s*Q\s*51\s*:+[^\r\n]*\s*$/gi, '')
    .trim();
}

/** Texto completo de una fila Reading (pregunta + explicación en BD). */
export function getPlacementReadingRowText(row) {
  const pregunta = String(row?.pregunta || '').trim();
  const explicacion = String(row?.explicacion || '').trim();
  if (/reading\s+text/i.test(pregunta)) return pregunta;
  if (/reading\s+text/i.test(explicacion)) return explicacion;
  if (/\[READING\s+TEXT\]/i.test(pregunta)) return pregunta;
  if (/\[READING\s+TEXT\]/i.test(explicacion)) return explicacion;
  return pregunta.length >= explicacion.length
    ? pregunta || explicacion
    : explicacion || pregunta;
}

function readingSourceScore(text, isExam2) {
  const t = String(text || '').trim();
  if (!t) return 0;
  let score = t.length;
  if (/reading\s+text/i.test(t)) score += 8000;
  if (isExam2) {
    if (/\[READING\s+TEXT\]/i.test(t)) score += 5000;
    if (/QUESTION\s+\d+\s*:/i.test(t)) score += 500;
  } else if (/\bQ\s*51\s*:/i.test(t)) {
    score += 500;
  }
  return score;
}

/** Elige el texto fuente del pasaje (no usar solo anchor.text si ya fue recortado). */
function resolveReadingPassageSourceText(part2, isExam2Reading) {
  let best = '';
  let bestScore = 0;
  for (const q of part2) {
    for (const candidate of [q.readingPassageSource, q.text]) {
      const score = readingSourceScore(candidate, isExam2Reading);
      if (score > bestScore) {
        bestScore = score;
        best = String(candidate || '').trim();
      }
    }
  }
  const existing = part2.find((q) => q.readingPassage?.trim())?.readingPassage;
  if (!best && existing) return existing;
  return best;
}

/** Pasaje compartido 51–60: conserva cabecera "Reading text – …" y nota [Questions 51–60…]. */
export function buildSharedReadingPassage(rawText, { exam2 = false } = {}) {
  const raw = String(rawText || '').trim();
  if (!raw) return '';

  const hasPromptMarker = exam2
    ? /QUESTION\s+\d+\s*:/i.test(raw)
    : /\bQ\s*5[1-9]\s*:/i.test(raw);
  if (!hasPromptMarker && /reading\s+text/i.test(raw)) {
    return raw.replace(/^\[READING\s+TEXT\]\s*/i, '').trim() || raw;
  }

  const { passage, prompt } = splitReadingAnchorText(raw, { exam2 });
  let body = passage.trim();

  if (!body) {
    if (exam2) {
      const m = raw.match(/QUESTION\s+\d+\s*:/i);
      body =
        m && m.index != null
          ? raw.slice(0, m.index).trim()
          : stripStrayExam2QuestionLine(raw);
    } else {
      const idx = raw.search(/\bQ\s*51\s*:+/i);
      body = idx >= 0 ? raw.slice(0, idx).trim() : stripStrayQ51PromptLine(raw);
    }
  }

  body = body.replace(/^\[READING\s+TEXT\]\s*/i, '').trim();
  return body || raw;
}

/** Pasaje fijo para mostrar en UI (preguntas parte 2). */
export function getSharedReadingPassageForPart2(questions) {
  const part2 = (questions || []).filter((q) => q.part === 2);
  if (!part2.length) return '';

  const isExam2 = part2.some((q) => q.exam2);
  const existing = part2.find((q) => q.readingPassage?.trim())?.readingPassage;
  if (existing && existing.length > 120) return existing;

  const source = resolveReadingPassageSourceText(part2, isExam2);
  if (!source) return existing || '';

  return buildSharedReadingPassage(source, { exam2: isExam2 });
}

/** Localiza "Q51:" / "Q52:" … en cualquier posición (examen 1). */
export function findExam1ReadingPrompt(text, questionNum = 51) {
  const t = String(text || '').trim();
  if (!t) return { passage: '', prompt: '' };
  const marker = new RegExp(`\\bQ\\s*${questionNum}\\s*:+\\s*`, 'i');
  const idx = t.search(marker);
  if (idx >= 0) {
    return {
      passage: t.slice(0, idx).trim(),
      prompt: t.slice(idx).trim(),
    };
  }
  return { passage: t, prompt: '' };
}

/** Pregunta ancla de Reading: la 51 (examen 1) o la de mayor texto con pasaje. */
function findReadingAnchorQuestion(sorted, isExam2Reading) {
  const part2 = sorted.filter((q) => q.part === 2);
  if (!part2.length) return null;

  const pickLongest = (list) =>
    list.reduce(
      (best, q) =>
        String(q.text || '').length > String(best?.text || '').length ? q : best,
      list[0],
    );

  if (isExam2Reading) {
    return (
      part2.find((q) => q.placementNumber === 50) ||
      pickLongest(part2.filter((q) => /\bQUESTION\s+1\s*:/i.test(q.text || ''))) ||
      pickLongest(part2)
    );
  }

  return (
    part2.find((q) => q.placementNumber === 51) ||
    pickLongest(part2.filter((q) => /\bQ\s*51\s*:+/i.test(q.text || ''))) ||
    pickLongest(part2)
  );
}

/** Línea de pregunta examen 1 (conserva "Q52: …" si viene en el texto). */
function resolveExam1ReadingQuestionText(rawText, questionNum) {
  const cleaned = stripStrayQ51PromptLine(String(rawText || '').trim());
  const { prompt } = findExam1ReadingPrompt(cleaned, questionNum);
  if (prompt) return prompt;
  return formatReadingQuestionPrompt(cleaned) || cleaned;
}

/**
 * Separa pasaje (arriba) y línea de pregunta 51 (abajo).
 * Examen 1: busca "Q51:" en cualquier parte del texto.
 * Examen 2: busca "QUESTION 1:".
 */
export function splitReadingAnchorText(rawText, { exam2 = false } = {}) {
  const text = String(rawText || '').trim();
  if (!text) return { passage: '', prompt: '' };

  if (exam2) {
    const match = text.match(/(?:\r?\n|^)\s*(QUESTION\s+\d+\s*:\s*.+)$/is);
    if (match?.index != null) {
      return {
        passage: text.slice(0, match.index).trim(),
        prompt: match[1].trim(),
      };
    }
    const inline = text.match(/QUESTION\s+\d+\s*:\s*.+/i);
    if (inline) {
      const idx = text.indexOf(inline[0]);
      return {
        passage: (text.slice(0, idx) + text.slice(idx + inline[0].length)).trim(),
        prompt: inline[0].trim(),
      };
    }
    return { passage: text, prompt: '' };
  }

  return findExam1ReadingPrompt(text, 51);
}

/** @deprecated Usar splitReadingAnchorText */
export function splitReadingQuestion51(rawText) {
  return splitReadingAnchorText(rawText, { exam2: false });
}

/** @deprecated Usar splitReadingAnchorText */
export function splitReadingExam2Anchor(rawText) {
  return splitReadingAnchorText(rawText, { exam2: true });
}

/** Enunciado sin prefijo "Q51::" / "Q52::" (examen 1). */
export function formatReadingQuestionPrompt(line) {
  return String(line || '')
    .replace(/^Q\s*\d+\s*::\s*/i, '')
    .replace(/^Q\s*\d+\s*:\s*/i, '')
    .trim();
}

/** Enunciado sin prefijo "QUESTION 1:" (examen 2; la 51 muestra solo el texto de la pregunta). */
export function formatReadingExam2Prompt(line) {
  return String(line || '')
    .replace(/^QUESTION\s+\d+\s*:\s*/i, '')
    .trim();
}

/** Quita líneas residuales "QUESTION 1:" al final en preguntas 52–60 del examen 2. */
export function stripStrayExam2QuestionLine(text) {
  return String(text || '')
    .replace(/(?:\r?\n)+\s*QUESTION\s+1\s*:[^\r\n]*\s*$/gi, '')
    .replace(/\s*QUESTION\s+1\s*:[^\r\n]*\s*$/gi, '')
    .trim();
}

/**
 * Reading 51–60: pasaje fijo arriba (desde la pregunta 51) y pregunta propia abajo.
 * La 61 es Writing y no lleva pasaje de lectura.
 */
export function attachReadingPassagesForPart2(readingQs) {
  const sorted = [...readingQs].sort(sortByPlacementNumber);
  const isExam2Reading = sorted.some((q) => q.exam2);
  const anchor = findReadingAnchorQuestion(sorted, isExam2Reading);
  const sourceText = resolveReadingPassageSourceText(sorted, isExam2Reading);
  const readingPassage = sourceText
    ? buildSharedReadingPassage(sourceText, { exam2: isExam2Reading })
    : '';

  if (!readingPassage.trim()) return sorted;

  const anchorNum = anchor?.placementNumber ?? (isExam2Reading ? 50 : 51);
  const { prompt } = splitReadingAnchorText(sourceText, { exam2: isExam2Reading });

  return sorted.map((q) => {
    if (q.part !== 2) return q;

    const displayNum =
      q.exam2 && q.placementNumber != null
        ? q.placementNumber + 1
        : q.placementNumber;

    if (anchor && (q.placementNumber === anchorNum || q.id === anchor.id)) {
      let questionLine = '';
      if (isExam2Reading) {
        questionLine = prompt ? formatReadingExam2Prompt(prompt) : '';
      } else {
        questionLine =
          prompt.trim() ||
          findExam1ReadingPrompt(sourceText, 51).prompt ||
          resolveExam1ReadingQuestionText(q.text, displayNum ?? 51);
      }
      return {
        ...q,
        readingPassageSource: sourceText,
        readingPassage,
        text: questionLine.trim(),
      };
    }

    const questionText = isExam2Reading
      ? formatReadingExam2Prompt(stripStrayExam2QuestionLine(q.text)) ||
        stripStrayExam2QuestionLine(q.text)
      : resolveExam1ReadingQuestionText(q.text, displayNum ?? q.placementNumber);

    return {
      ...q,
      readingPassageSource: sourceText,
      readingPassage,
      text: questionText,
    };
  });
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
  if (
    isStructuredPlacementExamContext(row?.test_id, row?.explicacion) ||
    rowHasStructuredExplanation(row)
  ) {
    return isExam2WritingRow(row);
  }
  const structured = parseStructuredPlacementExplanation(row?.explicacion);
  if (structured?.part === 3 && !structured.examNumber) return true;
  if (row.partes_id === PLACEMENT_WRITING_PARTES_ID) return true;
  if (/^pregunta\s*61$/i.test(String(row.explicacion || '').trim())) return true;
  if (/parte\s*3\s*pregunta/i.test(String(row.explicacion || '').trim())) return true;
  if (/^WRITING\s+TASK/i.test(String(row.pregunta || '').trim())) return true;
  const parteName = row.placement_partes?.nombre_parte || '';
  if (/writing/i.test(parteName)) return true;
  return false;
}

/** MCQ / writing cuando el mapeo estricto falla (examen 2, datos incompletos en BD). */
function mapPlacementRowRelaxed(row, meta) {
  const respuestas = Array.isArray(row.placement_respuestas)
    ? row.placement_respuestas
    : [];

  if (meta.part === 3) {
    const topicOptions = respuestas
      .map((r) => String(r.respuesta ?? '').trim())
      .filter(Boolean);
    const text = String(row.pregunta || row.explicacion || 'Writing task').trim();
    return {
      id: row.id,
      type: 'writing',
      text,
      topicOptions:
        topicOptions.length > 0
          ? topicOptions
          : ['Option A', 'Option B', 'Option C'],
      options: [],
      answer: '',
      explanation: row.explicacion || '',
      difficulty: row.placement_tests?.dificultad || null,
      testId: row.test_id || null,
      wordMin: 150,
      wordMax: 200,
    };
  }

  const options = respuestas
    .map((r) => String(r.respuesta ?? '').trim())
    .filter(Boolean);
  if (options.length < 2) return null;

  const answer = resolvePlacementCorrectAnswer(respuestas) || options[0];
  const rawText =
    String(row.pregunta || '').trim() ||
    String(row.explicacion || '').trim() ||
    (meta.part === 2
      ? `Reading question ${(meta.placementNumber ?? 0) + 1}`
      : `Question ${(meta.placementNumber ?? 0) + 1}`);

  return {
    id: row.id,
    type: inferQuestionType(options),
    text: normalizeGapText(rawText),
    options,
    answer,
    explanation: row.explicacion || '',
    difficulty: row.placement_tests?.dificultad || null,
    testId: row.test_id || null,
  };
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

    const text = String(row.pregunta || row.explicacion || '').trim();
    if (!text && topicOptions.length === 0) return null;

    return {
      id: row.id,
      type: 'writing',
      text,
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

  const isExam2 =
    isStructuredPlacementExamContext(row?.test_id, row?.explicacion) ||
    rowHasStructuredExplanation(row);
  let answer = resolvePlacementCorrectAnswer(respuestas);

  if (!answer && isExam2 && options.length >= 2) {
    answer = options[0];
  }

  const rawText = String(row.pregunta || '').trim();
  if ((!rawText && !isExam2) || !answer || options.length < 2) {
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
    text: normalizeGapText(rawText || row.explicacion || 'Question'),
    options,
    answer,
    explanation: row.explicacion || '',
    difficulty,
    testId: row.test_id || null,
  };
}

/** Baraja solo las opciones de respuesta (mcq/tf), nunca el orden de las preguntas. */
export function shuffleQuestionOptions(questions) {
  return questions.map((q) => {
    if (q.type === 'mcq' || q.type === 'tf') {
      return { ...q, options: shuffleArray(q.options) };
    }
    return q;
  });
}

export function finalizePlacementQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const reading = questions.filter((q) => q.part === 2);
  const sharedPassage = getSharedReadingPassageForPart2(questions);
  const readingReady =
    reading.length > 0 &&
    sharedPassage.trim().length > 80 &&
    reading.every((q) => String(q.readingPassage || '').trim().length > 80);

  if (readingReady) {
    return sortPlacementQuestionSet(shuffleQuestionOptions(questions));
  }

  const attachedReading =
    reading.length > 0 ? attachReadingPassagesForPart2(reading) : [];
  const byId = new Map(attachedReading.map((q) => [q.id, q]));

  const merged = questions.map((q) =>
    q.part === 2 ? byId.get(q.id) || q : q,
  );

  return sortPlacementQuestionSet(shuffleQuestionOptions(merged));
}

/**
 * Parte 1: preguntas 1–50 en orden.
 * Parte 2: preguntas 51–60 en orden (+ pasaje de la 51 en 52–60).
 * Parte 3: pregunta 61.
 */
function pushBuiltQuestion(byPart, mapped, meta, isExam2Batch) {
  if (!mapped || !meta?.part) return;
  if (
    isExam2Batch &&
    (meta.placementNumber == null ||
      meta.placementNumber < 0 ||
      meta.placementNumber > 60)
  ) {
    return;
  }
  byPart[meta.part].push({
    ...mapped,
    placementNumber: meta.placementNumber,
    part: meta.part,
    exam2: !!(meta.exam2 || isExam2Batch),
  });
}

export function buildPlacementQuestionSet(rows, { test } = {}) {
  const list = rows || [];
  const isExam2Batch = isStructuredPlacementBatchMode(list, test);
  const exam2Base = isExam2Batch ? detectStructuredQuestionBase(list, test) : 1;
  const byPart = { 1: [], 2: [], 3: [] };
  const usedIds = new Set();

  const processRow = (row, { forceRelaxed = false } = {}) => {
    const meta = resolvePlacementMeta(row, {
      exam2BaseOffset: exam2Base,
      forceExam2: isExam2Batch,
      forceStructured: isExam2Batch,
      test,
    });
    let mapped = mapPlacementRowToQuestion(row);
    if (!mapped && (isExam2Batch || forceRelaxed)) {
      mapped = mapPlacementRowRelaxed(row, meta);
    }
    if (!mapped || usedIds.has(row.id)) return;

    if (meta.part === 2) {
      const fullText = getPlacementReadingRowText(row);
      if (fullText) {
        mapped = {
          ...mapped,
          text: normalizeGapText(fullText),
          readingPassageSource: fullText,
        };
      }
    }

    usedIds.add(row.id);
    pushBuiltQuestion(byPart, mapped, meta, isExam2Batch);
  };

  for (const row of list) {
    processRow(row);
  }

  if (isExam2Batch && byPart[2].length < 10) {
    for (const row of list) {
      const meta = resolvePlacementMeta(row, {
        exam2BaseOffset: exam2Base,
        forceExam2: true,
        forceStructured: true,
        test,
      });
      if (meta.part !== 2 || usedIds.has(row.id)) continue;
      processRow(row, { forceRelaxed: true });
    }
  }

  if (isExam2Batch && byPart[3].length < 1) {
    for (const row of list) {
      const meta = resolvePlacementMeta(row, {
        exam2BaseOffset: exam2Base,
        forceExam2: true,
        forceStructured: true,
        test,
      });
      if (meta.part !== 3 || usedIds.has(row.id)) continue;
      processRow(row, { forceRelaxed: true });
    }
  }

  const isExam2 = isExam2Batch;

  const grammar = sortPlacementQuestionSet(
    dedupeByPlacementNumber(byPart[1], { exam2: isExam2 }),
  );
  const reading = attachReadingPassagesForPart2(
    dedupeByPlacementNumber(byPart[2], { exam2: isExam2 }),
  );
  const writingPool = dedupeByPlacementNumber(byPart[3], { exam2: isExam2 });
  const writing = isExam2
    ? writingPool.find((q) => q.placementNumber === 60) ||
      writingPool.find((q) => q.part === 3) ||
      writingPool[0] ||
      null
    : writingPool.find((q) => q.placementNumber === 61) ||
      writingPool.find((q) => /parte\s*3\s*pregunta/i.test(String(q.explanation || ''))) ||
      writingPool.find((q) =>
        /^pregunta\s*61$/i.test(String(q.explanation || '').trim()),
      ) ||
      writingPool[0] ||
      null;

  const ordered = writing
    ? [...grammar, ...reading, writing]
    : [...grammar, ...reading];

  return sortPlacementQuestionSet(ordered).map((q) => ({
    ...q,
    displayNumber:
      q.exam2 && q.placementNumber != null
        ? q.placementNumber + 1
        : q.placementNumber,
  }));
}

/** Índice de la primera pregunta de una parte en el array ordenado. */
export function getPlacementPartStartIndex(questions, partId) {
  const idx = questions.findIndex((q) => q.part === partId);
  return idx >= 0 ? idx : 0;
}

function sampleWithoutReplacement(pool, count) {
  return shuffleArray(pool).slice(0, Math.min(count, pool.length));
}

/**
 * Reading 51–60: elige un bloque completo de un solo placement_test (mismo pasaje).
 * En cada intento del test mixto se sortea otro examen con reading completo.
 */
function sampleReadingFromSingleExam(pool, count = PLACEMENT_MIXED_TARGETS[2]) {
  const byTest = new Map();
  for (const q of pool || []) {
    const tid = q.sourceTestId || '__unknown__';
    if (!byTest.has(tid)) byTest.set(tid, []);
    byTest.get(tid).push(q);
  }

  const completeSets = [];
  let largestPartial = [];

  for (const questions of byTest.values()) {
    const isExam2 = questions.some((q) => q.exam2);
    const deduped = dedupeByPlacementNumber(questions, { exam2: isExam2 });
    const sorted = sortPlacementQuestionSet(deduped);
    if (sorted.length >= count) {
      completeSets.push(sorted.slice(0, count));
    } else if (sorted.length > largestPartial.length) {
      largestPartial = sorted;
    }
  }

  if (completeSets.length > 0) {
    return shuffleArray(completeSets)[0];
  }

  if (largestPartial.length > 0) {
    return largestPartial.slice(0, Math.min(count, largestPartial.length));
  }

  return sampleWithoutReplacement(pool, count);
}

/**
 * Agrupa todas las preguntas válidas por parte (1–3) desde varios exámenes.
 */
function collectPlacementQuestionPools(rows, tests) {
  const testById = new Map((tests || []).map((t) => [t.id, t]));
  const pools = { 1: [], 2: [], 3: [] };
  const usedIds = new Set();

  const addRow = (row, { forceRelaxed = false } = {}) => {
    const test = testById.get(row.test_id) || null;
    const scopedRows = test?.id
      ? (rows || []).filter((r) => r.test_id === test.id)
      : [row];
    const isExam2Batch = isStructuredPlacementBatchMode(scopedRows, test);
    const exam2Base = isExam2Batch
      ? detectStructuredQuestionBase(scopedRows, test)
      : 1;

    const meta = resolvePlacementMeta(row, {
      exam2BaseOffset: exam2Base,
      forceExam2: isExam2Batch,
      forceStructured: isExam2Batch,
      test,
    });
    let mapped = mapPlacementRowToQuestion(row);
    if (!mapped && (isExam2Batch || forceRelaxed)) {
      mapped = mapPlacementRowRelaxed(row, meta);
    }
    if (!mapped || usedIds.has(row.id)) return;
    if (!meta.part || meta.part < 1 || meta.part > 3) return;

    if (meta.part === 2) {
      const fullText = getPlacementReadingRowText(row);
      if (fullText) {
        mapped = {
          ...mapped,
          text: normalizeGapText(fullText),
          readingPassageSource: fullText,
        };
      }
    }

    usedIds.add(row.id);
    pools[meta.part].push({
      ...mapped,
      placementNumber: meta.placementNumber,
      part: meta.part,
      exam2: !!(meta.exam2 || isExam2Batch),
      sourceTestId: row.test_id,
    });
  };

  for (const row of rows || []) {
    addRow(row);
  }

  for (const row of rows || []) {
    const test = testById.get(row.test_id) || null;
    const scopedRows = test?.id
      ? (rows || []).filter((r) => r.test_id === test.id)
      : [row];
    if (!isStructuredPlacementBatchMode(scopedRows, test)) continue;
    const meta = resolvePlacementMeta(row, {
      exam2BaseOffset: detectStructuredQuestionBase(scopedRows, test),
      forceExam2: true,
      forceStructured: true,
      test,
    });
    if (meta.part === 2 && pools[2].length < 60 && !usedIds.has(row.id)) {
      addRow(row, { forceRelaxed: true });
    }
    if (meta.part === 3 && pools[3].length < 10 && !usedIds.has(row.id)) {
      addRow(row, { forceRelaxed: true });
    }
  }

  return pools;
}

/**
 * Construye un test de 61 preguntas: muestra aleatoria sin repetir id entre los 5 exámenes.
 */
export function buildMixedPlacementQuestionSet(rows, { tests } = {}) {
  const pools = collectPlacementQuestionPools(rows, tests);

  const grammar = sampleWithoutReplacement(pools[1], PLACEMENT_MIXED_TARGETS[1]);
  const readingSample = sampleReadingFromSingleExam(pools[2], PLACEMENT_MIXED_TARGETS[2]);
  const writingSample = sampleWithoutReplacement(pools[3], PLACEMENT_MIXED_TARGETS[3]);
  const writing = writingSample[0] || null;

  const grammarOrdered = sortPlacementQuestionSet(grammar).map((q, i) => ({
    ...q,
    part: 1,
    placementNumber: i,
    exam2: true,
    displayNumber: i + 1,
  }));

  const readingRenumbered = readingSample.map((q, i) => ({
    ...q,
    part: 2,
    placementNumber: 50 + i,
    exam2: true,
    displayNumber: 51 + i,
  }));
  const reading = attachReadingPassagesForPart2(
    sortPlacementQuestionSet(readingRenumbered),
  );

  const writingFinal = writing
    ? {
        ...writing,
        part: 3,
        placementNumber: 60,
        exam2: true,
        displayNumber: 61,
      }
    : null;

  const ordered = writingFinal
    ? [...grammarOrdered, ...reading, writingFinal]
    : [...grammarOrdered, ...reading];

  return sortPlacementQuestionSet(shuffleQuestionOptions(ordered));
}
