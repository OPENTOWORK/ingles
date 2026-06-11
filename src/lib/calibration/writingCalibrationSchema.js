/**
 * Writing Calibration Pack — schema + lightweight validator (Phase 1).
 *
 * SERVER-ONLY. This module must never be imported from client components:
 * the pack contains (eventually real) student writings and ideal feedback
 * that must not reach the public JS bundle.
 *
 * Not yet connected to the real feedback prompt (`buildB2FirstPrompt`).
 */

// Guard: si esto acaba en un bundle de navegador, fallar ruidosamente en vez de filtrar datos.
if (typeof window !== 'undefined') {
  throw new Error('writingCalibrationSchema is server-only and must not be imported from client components.');
}

export const WRITING_TASK_TYPES = ['essay', 'article', 'email', 'letter', 'report', 'review', 'story'];

export const CEFR_LEVELS = ['A2', 'B1', 'B1+', 'low B2', 'B2', 'B2+', 'C1'];

export const SCORE_KEYS = ['content', 'communicativeAchievement', 'organisation', 'language'];

const REQUIRED_STRING_FIELDS = [
  'id',
  'levelTarget',
  'estimatedLevel',
  'taskType',
  'taskPrompt',
  'studentText',
  'idealFeedbackStyle',
  'improvedVersionCurrentLevel',
];

const REQUIRED_ARRAY_FIELDS = ['mainStrengths', 'mainProblems', 'commonMistakes', 'errorCategories', 'whatNotToOvercorrect'];

/** Heurísticas básicas de datos personales: emails, teléfonos, DNI/NIE, URLs con handles. */
const PII_PATTERNS = [
  { label: 'email address', regex: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { label: 'phone number', regex: /(?:\+?\d[\s.-]?){9,}/ },
  { label: 'Spanish DNI/NIE', regex: /\b[XYZ]?\d{7,8}[A-Z]\b/ },
  { label: 'social handle', regex: /(?:^|\s)@[a-z0-9_.]{3,}/i },
];

export function countWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function findPii(text) {
  const hits = [];
  for (const { label, regex } of PII_PATTERNS) {
    if (regex.test(String(text || ''))) hits.push(label);
  }
  return hits;
}

/**
 * Valida un ejemplo del calibration pack.
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateWritingCalibrationExample(example) {
  const errors = [];
  const warnings = [];

  if (!example || typeof example !== 'object') {
    return { valid: false, errors: ['example is not an object'], warnings };
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof example[field] !== 'string' || !example[field].trim()) {
      errors.push(`missing or empty required string field: ${field}`);
    }
  }

  for (const field of REQUIRED_ARRAY_FIELDS) {
    if (!Array.isArray(example[field]) || example[field].length === 0) {
      errors.push(`missing or empty required array field: ${field}`);
    }
  }

  if (example.taskType && !WRITING_TASK_TYPES.includes(example.taskType)) {
    errors.push(`invalid taskType "${example.taskType}" (allowed: ${WRITING_TASK_TYPES.join(', ')})`);
  }

  if (example.estimatedLevel && !CEFR_LEVELS.includes(example.estimatedLevel)) {
    errors.push(`invalid estimatedLevel "${example.estimatedLevel}" (allowed: ${CEFR_LEVELS.join(', ')})`);
  }

  const scores = example.estimatedScores;
  if (!scores || typeof scores !== 'object') {
    errors.push('missing estimatedScores object');
  } else {
    for (const key of SCORE_KEYS) {
      const value = scores[key];
      if (!Number.isInteger(value) || value < 0 || value > 5) {
        errors.push(`estimatedScores.${key} must be an integer between 0 and 5 (got ${value})`);
      }
    }
  }

  if (!Number.isInteger(example.wordCount) || example.wordCount <= 0) {
    errors.push(`wordCount must be a positive integer (got ${example.wordCount})`);
  } else if (typeof example.studentText === 'string') {
    const realCount = countWords(example.studentText);
    const tolerance = Math.max(10, Math.round(realCount * 0.15));
    if (Math.abs(realCount - example.wordCount) > tolerance) {
      errors.push(`wordCount ${example.wordCount} does not match studentText (${realCount} real words)`);
    }
  }

  // strongerB2Version es opcional pero, si está, debe ser string no vacío.
  if (example.strongerB2Version != null && (typeof example.strongerB2Version !== 'string' || !example.strongerB2Version.trim())) {
    errors.push('strongerB2Version must be null or a non-empty string');
  }

  const piiSources = [example.studentText, example.taskPrompt, example.improvedVersionCurrentLevel, example.strongerB2Version];
  for (const source of piiSources) {
    for (const hit of findPii(source)) {
      warnings.push(`possible personal data detected (${hit}) — please review and anonymise`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Valida el pack completo (ids únicos + cada ejemplo).
 * @returns {{ valid: boolean, results: Array<{ id: string, valid: boolean, errors: string[], warnings: string[] }> }}
 */
export function validateWritingCalibrationPack(pack) {
  const results = [];
  const seenIds = new Set();

  for (const example of Array.isArray(pack) ? pack : []) {
    const result = validateWritingCalibrationExample(example);
    const id = example?.id || '(no id)';
    if (seenIds.has(id)) result.errors.push(`duplicate id: ${id}`);
    seenIds.add(id);
    results.push({ id, ...result, valid: result.errors.length === 0 });
  }

  return { valid: results.length > 0 && results.every((r) => r.valid), results };
}
