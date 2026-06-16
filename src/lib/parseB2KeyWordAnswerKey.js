import { SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE, SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION } from '@/lib/validateB2KeyWordAnswerKey';

/**
 * @typedef {'legacy' | 'metadata'} B2KeyWordAnswerKeyMode
 */

/**
 * @typedef {object} B2KeyWordLegacyParsedKey
 * @property {number} questionNumber
 * @property {'legacy'} mode
 * @property {string[]} acceptedFullAnswers
 */

/**
 * @typedef {object} B2KeyWordMetadataParsedKey
 * @property {number} questionNumber
 * @property {'metadata'} mode
 * @property {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey} answerKey
 */

/**
 * @param {string} text
 * @returns {{ questionNumber: number | null, answerText: string }}
 */
export function parseKeyWordRespuestaTexto(text) {
  const raw = String(text || '').trim();
  if (!raw) return { questionNumber: null, answerText: '' };

  let match = raw.match(/(?:^|[^\d])(\d{1,2})\s+(.+)$/);
  if (!match) match = raw.match(/^(\d{1,2})[\.\)]\s*(.+)$/);
  if (!match) match = raw.match(/^(\d{1,2})([A-Za-z].+)$/);

  if (match) {
    return { questionNumber: Number(match[1]), answerText: String(match[2] || '').trim() };
  }

  return { questionNumber: null, answerText: raw };
}

/**
 * @param {unknown} meta
 * @returns {boolean}
 */
function isUsableGradingMetadata(meta) {
  if (!meta || typeof meta !== 'object') return false;
  if (meta.type !== SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE) return false;
  if (Number(meta.version) !== SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION) return false;
  if (meta.keyword == null || meta.keyword === '') return false;
  if (!Array.isArray(meta.fullAnswers) || meta.fullAnswers.length === 0) return false;
  if (!Array.isArray(meta.markingPoints) || meta.markingPoints.length !== 2) return false;
  return true;
}

/**
 * @param {unknown} meta
 * @returns {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey | null}
 */
function normalizeMetadataAnswerKey(meta) {
  if (!isUsableGradingMetadata(meta)) return null;
  return {
    type: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE,
    version: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION,
    keyword: meta.keyword,
    fullAnswers: [...meta.fullAnswers],
    markingPoints: meta.markingPoints.map((mp) => ({
      id: mp.id,
      ...(mp.label ? { label: mp.label } : {}),
      accepted: [...(mp.accepted || [])],
    })),
  };
}

/**
 * Parse Part 4 rows from `levels_respuestas_abiertas`.
 * Uses `row.grading_metadata` only when present on the object (no DB select).
 *
 * @param {Array<{ respuesta_texto?: string, grading_metadata?: unknown }>} rows
 * @returns {Map<number, B2KeyWordLegacyParsedKey | B2KeyWordMetadataParsedKey>}
 */
export function parseB2KeyWordAnswerKeyRows(rows = []) {
  /** @type {Map<number, { legacyAnswers: string[], metadata?: object }>} */
  const grouped = new Map();

  for (const row of rows || []) {
    const { questionNumber, answerText } = parseKeyWordRespuestaTexto(row?.respuesta_texto || '');
    if (questionNumber == null || questionNumber < 1) continue;

    if (!grouped.has(questionNumber)) {
      grouped.set(questionNumber, { legacyAnswers: [] });
    }
    const bucket = grouped.get(questionNumber);
    if (answerText) {
      bucket.legacyAnswers.push(answerText);
    }

    const meta = row?.grading_metadata;
    if (isUsableGradingMetadata(meta)) {
      bucket.metadata = meta;
    }
  }

  /** @type {Map<number, B2KeyWordLegacyParsedKey | B2KeyWordMetadataParsedKey>} */
  const parsed = new Map();

  for (const [questionNumber, { legacyAnswers, metadata }] of grouped) {
    const answerKey = normalizeMetadataAnswerKey(metadata);
    if (answerKey) {
      parsed.set(questionNumber, {
        questionNumber,
        mode: 'metadata',
        answerKey,
      });
      continue;
    }

    const acceptedFullAnswers = [...new Set(legacyAnswers.map((a) => String(a || '').trim()).filter(Boolean))];
    if (!acceptedFullAnswers.length) continue;

    parsed.set(questionNumber, {
      questionNumber,
      mode: 'legacy',
      acceptedFullAnswers,
    });
  }

  return parsed;
}

/**
 * @param {Map<number, B2KeyWordLegacyParsedKey | B2KeyWordMetadataParsedKey>} parsedMap
 * @param {number} questionNumber
 */
export function getB2KeyWordParsedKeyForQuestion(parsedMap, questionNumber) {
  if (!parsedMap) return null;
  return parsedMap.get(Number(questionNumber)) ?? null;
}
