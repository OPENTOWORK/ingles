/**
 * Separa el bloque fijo de instrucciones (levels_partes."Descripción") del cuerpo
 * del ejercicio almacenado en levels_preguntas.enunciado.
 */

function stripAnswerKeyBlock(text) {
  const m = /\r?\n\s*Answer Key\s*\r?\n/i.exec(text);
  return m ? text.slice(0, m.index).trim() : text.trim();
}

function truncateBeforeLine(text, regex) {
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => regex.test(l.trim()));
  if (idx > 0) return lines.slice(0, idx).join('\n').trim();
  return text;
}

/**
 * @param {string} raw - levels_preguntas.enunciado
 * @param {number} partNumber - 1–7 (First/FCE clásico); 8+ usa la misma heurística genérica sin reglas de Reading 5.
 * @param {{ levelSlug?: string }} [options]
 */
export function extractTextoBloque(raw, partNumber, options = {}) {
  if (!raw) return '';
  let t = raw.replace(/\r\n/g, '\n');
  t = stripAnswerKeyBlock(t);

  const levelSlug = String(options.levelSlug || 'b2').toLowerCase();

  // A2 Key Reading Part 1: cada ítem lleva su aviso en Questions (sin panel Text).
  if (partNumber === 1 && levelSlug === 'a2') return '';

  const lines = t.split('\n');
  const textLineIdxs = lines
    .map((line, i) => (line.trim().toLowerCase() === 'text' ? i : -1))
    .filter((i) => i >= 0);

  const joined = lines.join('\n');

  // Partes 8+ (Writing / Listening / Speaking en BD): reutilizar solo la heurística de líneas "Text".
  if (partNumber > 7) {
    if (textLineIdxs.length >= 2) {
      return lines.slice(textLineIdxs[textLineIdxs.length - 1] + 1).join('\n').trim();
    }
    if (textLineIdxs.length === 1 && textLineIdxs[0] === 0) {
      return lines.slice(1).join('\n').trim();
    }
    return t.trim();
  }

  // A2 Key Reading Part 2: perfiles A/B/C en Text; preguntas 7–13 aparte.
  if (partNumber === 2) {
    let body = truncateBeforeLine(joined, /^questions$/i);
    const textIdx = body.search(/\nText\n/i);
    if (textIdx >= 0) body = body.slice(textIdx + '\nText\n'.length);
    const profileStart = body.search(/(?:^|\n)([A-C]\)\s+\w)/im);
    if (profileStart >= 0) body = body.slice(profileStart).trim();
    return body.trim();
  }

  // A2 Key Part 7: story prompt + picture lines in Text (until Questions).
  if (partNumber === 7 && /Picture\s+1/i.test(joined)) {
    let body = joined;
    const textIdx = body.search(/\nText\n/i);
    if (textIdx >= 0) body = body.slice(textIdx + '\nText\n'.length);
    const qIdx = body.search(/\nQuestions\n/i);
    if (qIdx >= 0) body = body.slice(0, qIdx);
    return body.trim();
  }

  // B2 FCE Part 4: bloque interactivo = sección Questions (preguntas 25–30).
  if (partNumber === 4) {
    const questionsBody = extractKeyWordQuestionsBlock(t);
    if (questionsBody) return questionsBody;
  }

  // B2 FCE Part 7: perfiles A–D (bloque tras "Texts").
  if (partNumber === 7) {
    const txMatch = joined.match(/(?:^|\n)\s*Texts\s*\n/im);
    if (txMatch) {
      const after = joined.slice(txMatch.index + txMatch[0].length);
      return after.trim();
    }
    const wpMatch = joined.match(/(?:^|\n)\s*Which person/im);
    if (wpMatch) {
      const wp = wpMatch.index + (wpMatch[0].startsWith('\n') ? 1 : 0);
      return joined.slice(wp).trim();
    }
  }

  // Una sola línea "Text" tras las instrucciones (Reading 5–6 habitual).
  if (textLineIdxs.length === 1 && textLineIdxs[0] > 0) {
    let body = lines.slice(textLineIdxs[0] + 1).join('\n').trim();
    if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
    if (partNumber === 6) body = stripPart6SentencesTail(body);
    return body;
  }

  // Partes 2–4 y 6 (dos líneas "Text": cabecera + pasaje)
  if (textLineIdxs.length >= 2) {
    let body = lines.slice(textLineIdxs[textLineIdxs.length - 1] + 1).join('\n').trim();
    if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
    if (partNumber === 6) body = stripPart6SentencesTail(body);
    return body;
  }

  // Una sola línea "Text" al inicio: Parte 1, Parte 5, algunas variantes
  if (textLineIdxs.length === 1 && textLineIdxs[0] === 0) {
    const afterText = lines.slice(1).join('\n');
    const part5 = afterText.match(
      /^[\s\S]*?according to the text\.\s*\n\n([\s\S]+)$/im,
    );
    if (part5) {
      let body = part5[1].trim();
      body = truncateBeforeLine(body, /^questions$/i);
      return body;
    }
    let body = afterText.trim();
    if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
    if (partNumber === 6) body = stripPart6SentencesTail(body);
    return body;
  }

  let body = t;
  if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
  if (partNumber === 6) body = stripPart6SentencesTail(body);
  return body;
}

function stripPart6SentencesTail(text) {
  let body = truncateBeforeLine(text, /^sentences$/i);
  body = body.replace(/\n\s*[_=\-–—]{3,}\s*$/g, '').trimEnd();
  const lines = body.split('\n');
  const firstOptionIdx = lines.findIndex((l) => /^[A-G]\)\s+/i.test(l.trim()));
  if (firstOptionIdx >= 0) {
    body = lines.slice(0, firstOptionIdx).join('\n').trim();
  }
  return body;
}


/**
 * Parte 1 (multiple-choice cloze): el pasaje y el bloque "Questions" van en el mismo
 * `levels_preguntas.enunciado` tras `Text`. Separa pasaje vs ítems para mostrarlos aparte.
 * @param {string} body - Salida de `extractTextoBloque` para la parte 1
 * @returns {{ texto: string, preguntas: string }}
 */
export function splitPart1TextoYPreguntas(body) {
  if (!body) return { texto: '', preguntas: '' };
  const s = String(body).replace(/\r\n/g, '\n').trim();
  const m = s.match(/^([\s\S]*?)(?:\n|^)\s*Questions\s*\n([\s\S]*)$/im);
  if (!m) return { texto: s, preguntas: '' };
  return { texto: m[1].trim(), preguntas: m[2].trim() };
}

/**
 * Parte 1: bloque "Questions" con líneas `1`, `A word`, `B word`, …
 * @returns {Array<{ questionNumber: number, options: Partial<Record<'A'|'B'|'C'|'D', string>> }>}
 */
export function parsePart1QuestionOptions(preguntasBlock) {
  const lines = String(preguntasBlock || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  /** @type {Array<{ questionNumber: number, options: Partial<Record<'A'|'B'|'C'|'D', string>> }>} */
  const out = [];
  let current = null;
  for (const line of lines) {
    if (/^\d{1,2}$/.test(line)) {
      const n = Number(line);
      if (current && Object.keys(current.options).length > 0) out.push(current);
      current = { questionNumber: n, options: {} };
      continue;
    }
    // "A set" o "A) set" (común en Word / PDF)
    const om = line.match(/^([A-D])\s*\)\s*(.+)$/i) || line.match(/^([A-D])\s+(.+)$/i);
    if (om && current) {
      const letter = om[1].toUpperCase();
      if (letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D') {
        current.options[letter] = om[2].trim();
      }
    }
  }
  if (current && Object.keys(current.options).length > 0) out.push(current);
  return out.sort((a, b) => a.questionNumber - b.questionNumber);
}

/** Solo el cuerpo tras `Questions` hasta el final (Answer Key debe ir ya quitado fuera si aplica). */
export function extractReadingPart5QuestionsBlock(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) return '';
  t = stripAnswerKeyBlock(t);
  const m = t.match(/\n\s*Questions\s*\n([\s\S]*)$/im);
  return m ? m[1].trim() : '';
}

/** Bloque tras `Sentences` (lista A–G). */
export function extractReadingPart6SentencesBlock(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) return '';
  t = stripAnswerKeyBlock(t);
  const m = t.match(/\n\s*Sentences\s*\n([\s\S]*)$/im);
  return m ? m[1].trim() : '';
}

/** Part 6 gaps: `(37)`, `(37) ___`, or `(37) …` before the next word. */
export const PART6_GAP_MARKER_RE = /\((\d{1,2})\)(?:\s*(?:_+|\.{2,}|…{2,}))?\s*/g;

/**
 * Scan passage / enunciado for Part 6 gap numbers (typically 31–42 in B2).
 * @param {string} passageText
 * @param {string} [rawEnunciado]
 * @returns {number[]}
 */
export function inferPart6QuestionNumbersFromPassage(passageText = '', rawEnunciado = '') {
  const blob = [passageText, rawEnunciado].filter(Boolean).join('\n');
  if (!blob) return [];
  const nums = [...blob.matchAll(PART6_GAP_MARKER_RE)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 31 && n <= 42);
  return [...new Set(nums)].sort((a, b) => a - b);
}

/**
 * Pool lines like `A) sentence…` / `A. sentence…` (skills layout).
 * @returns {Partial<Record<string, string>>}
 */
export function parseReadingPart6SentencePoolFromOptionLines(text = '') {
  const pool = {};
  const lines = String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    const m =
      line.match(/^([A-G])\)\s*(.+)$/i) ||
      line.match(/^([A-G])\.\s*(.+)$/i) ||
      line.match(/^([A-G])\s+(.{3,})$/i);
    if (m) pool[m[1].toUpperCase()] = m[2].trim();
  }
  if (Object.keys(pool).length >= 7) return pool;
  return {};
}

/** Lines `A) …` anywhere in the enunciado (typical skills layout). */
export function extractReadingPart6OptionLinesBlock(raw = '') {
  const lines = String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => /^[A-G]\)\s+\S/.test(l));
  if (lines.length >= 7) return lines.join('\n');
  return '';
}

/**
 * Global A–G pool before the Questions block (skills layout: sentences after Text, not under "Sentences").
 * @returns {Partial<Record<string, string>>}
 */
export function extractReadingPart6GlobalPoolFromRaw(raw = '') {
  const lines = String(raw || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim());
  const questionsIdx = lines.findIndex((l) => /^questions$/i.test(l));
  const searchLines = questionsIdx >= 0 ? lines.slice(0, questionsIdx) : lines;
  /** @type {Partial<Record<string, string>>} */
  const pool = {};
  for (const line of searchLines) {
    const m =
      line.match(/^([A-G])\)\s*(.+)$/i) ||
      line.match(/^([A-G])\.\s*(.+)$/i) ||
      line.match(/^([A-G])\s+(.{3,})$/i);
    if (!m) continue;
    const L = m[1].toUpperCase();
    const text = m[2].trim();
    if (pool[L] || !isValidPart6PoolSentence(text, L)) continue;
    pool[L] = text;
  }
  return isCompletePart6Pool(pool) ? pool : {};
}

function isValidPart6PoolSentence(text, letter) {
  const t = String(text || '').trim();
  return t.length > 2 && t.toUpperCase() !== String(letter).toUpperCase();
}

function isCompletePart6Pool(pool) {
  return [...'ABCDEFG'].every((L) => isValidPart6PoolSentence(pool[L], L));
}

export { isCompletePart6Pool, isValidPart6PoolSentence };

/**
 * Build pool map from synthetic MCQ groups (optionText on each letter).
 * @param {Array<{ options?: Array<{ optionText?: string, formattedText?: string, respuesta?: string, compactLabel?: string }> }>} groups
 */
export function buildPart6PoolFromMcqGroups(groups = []) {
  const pool = {};
  const first = groups.find((g) => g?.options?.length >= 7);
  if (!first) return pool;
  for (const L of 'ABCDEFG') {
    const opt = first.options.find((o) => {
      if (String(o?.compactLabel || '').toUpperCase() === L) return true;
      const t = String(o?.formattedText || o?.respuesta || '').trim();
      return new RegExp(`^${L}\\)?\\b`, 'i').test(t);
    });
    const text = String(opt?.optionText || '').trim();
    if (isValidPart6PoolSentence(text, L)) pool[L] = text;
  }
  return pool;
}

/**
 * Resolve the global A–G sentence pool from any Part 6 enunciado layout.
 * @returns {Partial<Record<string, string>>}
 */
export function resolveReadingPart6SentencePool(raw = '', passageText = '', mcqGroups = []) {
  const block = extractReadingPart6SentencesBlock(raw);
  const optionLinesBlock = extractReadingPart6OptionLinesBlock(raw);

  const trySources = [
    () => extractReadingPart6GlobalPoolFromRaw(raw),
    () => parseReadingPart6SentencePool(block),
    () => parseReadingPart6SentencePoolFromOptionLines(block),
    () => parseReadingPart6SentencePoolFromOptionLines(optionLinesBlock),
    () => parseReadingPart6SentencePoolFromOptionLines(raw),
    () => parseReadingPart6SentencePoolFromOptionLines(passageText),
    () => buildPart6PoolFromMcqGroups(mcqGroups),
  ];

  for (const fn of trySources) {
    const pool = fn();
    if (isCompletePart6Pool(pool)) return pool;
  }

  const fallback = buildPart6PoolFromMcqGroups(mcqGroups);
  if (Object.keys(fallback).length > 0) return fallback;

  return parseReadingPart6SentencePool(block);
}

/**
 * Human-readable sentences block for display (skills + exam).
 */
export function formatReadingPart6SentencesDisplay(raw = '', pool = {}, mcqGroups = []) {
  const resolved = isCompletePart6Pool(pool)
    ? pool
    : resolveReadingPart6SentencePool(raw, '', mcqGroups);
  const lines = [...'ABCDEFG']
    .map((L) => {
      const text = resolved[L]?.trim();
      return text ? `${L}  ${text}` : '';
    })
    .filter(Boolean);
  if (lines.length >= 7) return lines.join('\n');

  const block = extractReadingPart6SentencesBlock(raw);
  if (block) return block;

  const optionBlock = extractReadingPart6OptionLinesBlock(raw);
  if (optionBlock) return optionBlock.replace(/^([A-G])\)\s*/gim, '$1  ');

  return '';
}

export function extractPart7PromptStemBlob(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) return '';
  t = stripAnswerKeyBlock(t);
  const txIdx = t.search(/\n\s*Texts\s*\n/im);
  const beforeTexts = txIdx >= 0 ? t.slice(0, txIdx) : t;
  const wpMatch = beforeTexts.match(/(?:^|\n)\s*(?:Which person|Who)\b/im);
  if (wpMatch) {
    const wp = wpMatch.index + (wpMatch[0].startsWith('\n') ? 1 : 0);
    let chunk = beforeTexts.slice(wp);
    chunk = chunk
      .replace(/^(?:Which person|Who).*?\n+/is, '')
      .replace(/\n\s*[_=\-–—]{3,}\s*$/g, '')
      .trim();
    return chunk;
  }
  const qStart = beforeTexts.search(/\n\s*(?:4[3-9]|5[0-2])\s+Who\b/im);
  if (qStart >= 0) {
    return beforeTexts
      .slice(qStart + 1)
      .replace(/\n\s*[_=\-–—]{3,}\s*$/g, '')
      .trim();
  }
  return '';
}

export function extractPart7ProfilesBlock(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) return '';
  t = stripAnswerKeyBlock(t);
  const m = t.match(/\n\s*Texts\s*\n([\s\S]*)$/im);
  return m ? m[1].trim() : '';
}

function findAdOptionBoundary(s, nextLetter) {
  const normal = new RegExp(`\\.\\s+${nextLetter}\\.\\s+`, 'i');
  const newlineSep = new RegExp(`\\n\\s*${nextLetter}\\.\\s+`, 'i');
  const glued = new RegExp(`(?<=[a-z0-9\\)])${nextLetter}\\.\\s+`, 'i');
  let best = -1;
  for (const re of [normal, newlineSep, glued]) {
    const m = re.exec(s);
    if (m && (best < 0 || m.index < best)) best = m.index;
  }
  return best;
}

/** Resto que empieza en `A. ...` (sin el stem). */
function extractAdFourOptionsFromATail(tailFromA) {
  const letters = ['A', 'B', 'C', 'D'];
  let rest = String(tailFromA || '').replace(/^A\.\s+/i, '').trimStart();
  const out = {};
  for (let i = 0; i < letters.length; i++) {
    const nextL = letters[i + 1];
    if (!nextL) {
      out.D = rest.trim();
      break;
    }
    const boundary = findAdOptionBoundary(rest, nextL);
    if (boundary < 0) return {};
    const cur = letters[i];
    out[cur] = rest.slice(0, boundary).trim();
    rest = rest
      .slice(boundary)
      .replace(new RegExp(`^\\s*\\.?\\s*${nextL}\\.\\s+`, 'i'), '')
      .trimStart();
  }
  return out;
}

/**
 * Reading Part 5 / 7 (estilo cloze MCQ Cambridge): líneas `31. …` + `A. …B. …`
 * (a veces pegadas en Word, a veces una por línea con `\n` entre opciones).
 * @returns {Array<{ questionNumber: number, stem: string, options: Partial<Record<'A'|'B'|'C'|'D', string>> }>}
 */
export function parseReadingAdMcqChunks(questionsBody) {
  const block = String(questionsBody || '').replace(/\r\n/g, '\n').trim();
  if (!block) return [];
  /** Limpia líneas separadoras (underscores / guiones / em-dashes) que el original Word coloca entre ítems. */
  const stripSeparatorLines = (s) =>
    s
      .replace(/\n\s*[_=\-–—]{3,}\s*(?=\n|$)/g, '')
      .replace(/\n{3,}/g, '\n\n');
  const cleaned = stripSeparatorLines(block);
  const chunks = cleaned
    .split(/\n+(?=\d{1,2}\.\s+)/)
    .map((c) => c.trim())
    .filter(Boolean);
  /** @type {Array<{ questionNumber: number, stem: string, options: Partial<Record<'A'|'B'|'C'|'D', string>> }>} */
  const parsed = [];
  for (const chunk of chunks) {
    const header = /^(\d{1,2})\.\s*([\s\S]+)$/.exec(chunk);
    if (!header) continue;
    const questionNumber = Number(header[1]);
    const body = header[2].trim();
    const idxA = body.search(/\bA\.\s+/i);
    if (idxA < 0) continue;
    const stem = body.slice(0, idxA).trim();
    const fromA = body.slice(idxA).trimStart();
    const options = extractAdFourOptionsFromATail(fromA);
    if (!options.A || !options.B) continue;
    parsed.push({ questionNumber, stem, options });
  }
  return parsed.sort((a, b) => a.questionNumber - b.questionNumber);
}

function findAgSentenceBoundary(s, nextLetter) {
  const afterPeriod = new RegExp(`\\.${nextLetter}\\s+[A-Z]`, '');
  const newlineSep = new RegExp(`\\n\\s*${nextLetter}\\s+[A-Z]`, '');
  const glued = new RegExp(`(?<=[a-z0-9\\)])${nextLetter}\\s+[A-Z]`, '');
  let best = -1;
  for (const re of [afterPeriod, newlineSep, glued]) {
    const m = re.exec(s);
    if (m && (best < 0 || m.index < best)) best = m.index;
  }
  return best;
}

/**
 * Lista global A–G (Part 6): `A Esta frase …B Siguiente…`
 * @returns {Partial<Record<string, string>>}
 */
export function parseReadingPart6SentencePool(block) {
  let s = String(block || '').replace(/\r\n/g, '\n').trim();
  if (!s) return {};
  if (/^A\.\s+/i.test(s)) s = s.replace(/^A\.\s+/i, '');
  else if (/^A\s+/i.test(s)) s = s.replace(/^A\s+/i, '');
  else return {};
  const letters = [...'ABCDEFG'];
  /** @type {Partial<Record<string, string>>} */
  const pool = {};
  let rest = s;
  for (let i = 0; i < letters.length - 1; i++) {
    const cur = letters[i];
    const nextL = letters[i + 1];
    const cut = findAgSentenceBoundary(rest, nextL);
    if (cut < 0) return {};
    pool[cur] = rest.slice(0, cut).trim();
    rest = rest.slice(cut);
    const lead = rest.match(new RegExp(`^\\s*\\.?${nextL}\\s+(?=[A-Z])`, 'i'));
    if (!lead) return {};
    rest = rest.slice(lead[0].length);
  }
  pool.G = rest.trim();
  return pool;
}

/**
 * Part 7: viñetas `37 …` una tras otra (con o sin saltos), y perfiles `A – Nombre` + párrafo.
 */
export function parsePart7NumberedStems(stemBlob) {
  const s = String(stemBlob || '').replace(/\u2026|…/g, '...').replace(/\r\n/g, '\n').trim();
  if (!s) return [];
  const matches = [...s.matchAll(/\b(\d{1,2})\s+/g)];
  const out = [];
  for (let i = 0; i < matches.length; i++) {
    const num = Number(matches[i][1]);
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : s.length;
    out.push({ questionNumber: num, stem: s.slice(start, end).trim() });
  }
  return out.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * @returns {Partial<Record<'A'|'B'|'C'|'D', { label: string, body: string }>>}
 */
export function parsePart7PeopleProfiles(profilesBlock) {
  const t = String(profilesBlock || '').replace(/\r\n/g, '\n').trim();
  if (!t) return {};
  const parts = t.split(/\n(?=[A-D]\s*[–-]\s*)/i).filter((p) => /^\s*[A-D]\s*[–-]/i.test(p));
  /** @type {Partial<Record<string, { label: string, body: string }>>} */
  const pool = {};
  for (const p of parts) {
    const m = p.match(/^([A-D])\s*[–-]\s*([^\n]+)\n+([\s\S]*)$/is);
    if (!m) continue;
    const letter = m[1].toUpperCase();
    pool[letter] = { label: m[2].trim(), body: m[3].trim() };
  }
  return pool;
}

/**
 * Algunos `levels_preguntas.enunciado` de B2 Parte 10 repiten el bloque ítems 1–8 (p. ej. Excel).
 * Recorta al primer ciclo para que el layout coincida con el examen 1.
 *
 * @param {string} text
 */
/** Partes B2 Listening con layout por ítems (10–13). */
export function isB2ListeningItemLayoutPart(partNumber) {
  return partNumber >= 10 && partNumber <= 13;
}

/** A2 Key Listening (global parts 8–12). */
export function isA2ListeningItemLayoutPart(partNumber) {
  return partNumber >= 8 && partNumber <= 12;
}

export function trimListeningPart10DuplicateCycles(text = '') {
  const t = String(text || '').replace(/\r\n/g, '\n');
  if (!t.trim()) return t;
  const re = /(?:^|\n)\s*1\s*\n\s*\n\s*(?:You hear|You overhear)\b/gi;
  const hits = [];
  let m;
  while ((m = re.exec(t)) !== null) {
    hits.push(m.index);
  }
  if (hits.length <= 1) return t;
  return t.slice(0, hits[1]).replace(/[ \t\u00a0]+$/g, '').replace(/\n+$/, '');
}

/**
 * Listening (p. ej. Part 1 / B2 parte 10): el bloque "Texto" trae ítems separados por una
 * línea que es solo el número (`1` … `8`). Opciones A/B/C a veces vienen en el Word;
 * si `stripInlineOptions` es true, se omiten esas líneas porque las pintamos desde la BD.
 *
 * @param {string[]} lines - líneas ya recortadas (p. ej. sin URLs sueltas de audio)
 * @param {{ stripInlineOptions?: boolean }} [opts]
 * @returns {Array<{ questionNumber: number, contextLines: string[] }>}
 */
export function splitListeningMcqContextByQuestion(lines, opts = {}) {
  const stripInlineOptions = opts.stripInlineOptions !== false;
  const raw = Array.isArray(lines)
    ? lines.map((l) => String(l || '').trim()).filter(Boolean)
    : [];
  if (raw.length === 0) return [];

  const isItemNumberLine = (l) => /^(?:[1-9]|1[0-9]|2[0-9]|30)\s*$/.test(l);

  const looksLikeMcqOptionLine = (l) => {
    const t = String(l || '').trim();
    if (/^[ABC]\s*\)\s+\S/.test(t) || /^[ABC]\.\s+\S/.test(t)) return true;
    if (!/^[ABC]\s+\S/.test(t)) return false;
    return !/^[ABC]\s+(?:you\s+hear|you\s+overhear|what|why|how|which|who|where|when|whose|the\s+)/i.test(
      t,
    );
  };

  /** @type {Array<{ questionNumber: number, contextLines: string[] }>} */
  const blocks = [];
  let i = 0;
  while (i < raw.length) {
    if (!isItemNumberLine(raw[i])) {
      i += 1;
      continue;
    }
    const questionNumber = Number(raw[i]);
    if (!Number.isFinite(questionNumber) || questionNumber < 1) {
      i += 1;
      continue;
    }
    i += 1;
    const contextLines = [];
    while (i < raw.length && !isItemNumberLine(raw[i])) {
      const ln = raw[i];
      if (!stripInlineOptions || !looksLikeMcqOptionLine(ln)) contextLines.push(ln);
      i += 1;
    }
    blocks.push({ questionNumber, contextLines });
  }
  return blocks.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * Parte 11 listening: huecos `(9) ___` con la frase de contexto en el mismo párrafo.
 *
 * @param {string} text
 * @returns {Array<{ questionNumber: number, contextLines: string[] }>}
 */
export function splitListeningOpenGapContextByQuestion(text = '') {
  const t = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!t) return [];
  /** @type {Array<{ questionNumber: number, contextLines: string[] }>} */
  const blocks = [];
  for (const part of t.split(/\n\s*\n/)) {
    const gapMatch = part.match(/\((\d{1,2})\)\s*_+/);
    if (!gapMatch) continue;
    const questionNumber = Number(gapMatch[1]);
    if (!Number.isFinite(questionNumber)) continue;
    const contextLines = part
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (contextLines.length) blocks.push({ questionNumber, contextLines });
  }
  return blocks.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * Part 11: merge lead sentence gap with standalone `(N) ___` line for display.
 * @param {string[]} contextLines
 * @param {number} questionNumber
 * @returns {string[]}
 */
export function formatListeningGapDisplayLines(contextLines = [], questionNumber) {
  const lines = contextLines.map((l) => String(l || '').trim()).filter(Boolean);
  if (!lines.length) return lines;
  const gapOnlyRe = new RegExp(`^\\(${questionNumber}\\)\\s*_+$`, 'i');
  const inlineGapRe = new RegExp(`\\(${questionNumber}\\)\\s*(?:_+|\\.{2,}|…{2,})`, 'i');
  const hasStandaloneGapLine = lines.some((l) => gapOnlyRe.test(l));
  if (!hasStandaloneGapLine) return lines;

  const result = [];

  for (const line of lines) {
    if (gapOnlyRe.test(line)) continue;
    if (/_{2,}/.test(line) && !inlineGapRe.test(line)) {
      result.push(line.replace(/_{2,}/, `(${questionNumber}) ___`));
    } else {
      result.push(line);
    }
  }

  if (result.length && !result.some((l) => inlineGapRe.test(l))) {
    const lastIdx = result.length - 1;
    result[lastIdx] = `${result[lastIdx]} (${questionNumber}) ___`.trim();
  }

  return result.length ? result : lines;
}

/**
 * All Part 11 sentences in one passage (setting line + numbered inline gaps).
 * @param {string} text
 * @returns {string[]}
 */
export function buildListeningGapPassageLines(text = '') {
  const t = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!t) return [];

  const blocks = splitListeningOpenGapContextByQuestion(t);
  if (!blocks.length) {
    return t.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  const lines = [];
  const firstBlockStart = t.indexOf(blocks[0].contextLines[0]);
  if (firstBlockStart > 0) {
    const intro = t.slice(0, firstBlockStart).trim();
    intro.split('\n').forEach((l) => {
      const s = l.trim();
      if (s) lines.push(s);
    });
  }

  for (const block of blocks) {
    const formatted = formatListeningGapDisplayLines(block.contextLines, block.questionNumber);
    for (const line of formatted) {
      const out = line.trim();
      if (out) lines.push(out);
    }
  }

  return lines;
}

/** Extract MCQ letter from a levels_respuestas row label. */
export function extractMcqOptionLetter(option = {}) {
  // Prefer formattedText, but also try respuesta: matching keys are often stored as
  // "19 C" while getGroupedAnswers sets formattedText to bare "C", which older
  // patterns missed (needed "C)" or "C …").
  const candidates = [option.formattedText, option.respuesta, option.text]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  for (const raw of candidates) {
    const m =
      raw.match(/^(\d+)\s+([A-H])\)/i) ||
      raw.match(/^(\d+)\s+([A-H])\s*$/i) ||
      raw.match(/^([A-H])\)/i) ||
      raw.match(/^([A-H])\s/i) ||
      raw.match(/^([A-H])$/i);
    if (m) return m[m.length - 1].toUpperCase();
  }
  return '';
}

/** Resolve a saved MCQ value (option id or letter) to the matching option row. */
export function resolveSelectedMcqOption(group, selectedValue) {
  if (selectedValue == null || selectedValue === '' || !group?.options?.length) return null;
  const byId = group.options.find((o) => o.id === selectedValue);
  if (byId) return byId;
  const letter = /^[A-H]$/i.test(String(selectedValue))
    ? String(selectedValue).toUpperCase()
    : extractMcqOptionLetter({ formattedText: String(selectedValue) });
  if (!letter) return null;
  return group.options.find((o) => extractMcqOptionLetter(o) === letter) || null;
}

export function isMcqSelectionCorrect(group, selectedValue) {
  const selected = resolveSelectedMcqOption(group, selectedValue);
  return Boolean(selected?.correcta);
}

/**
 * Parte 12 listening: `Speaker 1` … `Speaker 5` → preguntas 19–23.
 *
 * @param {string} text
 * @returns {Array<{ questionNumber: number, contextLines: string[] }>}
 */
export function splitListeningSpeakerContextByQuestion(text = '') {
  const raw = String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  /** @type {Array<{ questionNumber: number, contextLines: string[] }>} */
  const blocks = [];
  for (const line of raw) {
    const m = line.match(/^Speaker\s+(\d+)\s*[_\s.]*$/i);
    if (!m) continue;
    const speakerNum = Number(m[1]);
    if (!Number.isFinite(speakerNum) || speakerNum < 1) continue;
    blocks.push({ questionNumber: 18 + speakerNum, contextLines: [line] });
  }
  return blocks.sort((a, b) => a.questionNumber - b.questionNumber);
}

/** @deprecated Use splitListeningSpeakerContextByQuestion (Part 12 → Q19–23). */
export function splitListeningMatchingSpeakerContext(text = '') {
  const raw = String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  /** @type {Array<{ questionNumber: number, contextLines: string[] }>} */
  const blocks = [];
  for (const line of raw) {
    const m = line.match(/^Speaker\s+(\d+)\s*[_\s.]*$/i);
    if (!m) continue;
    const speakerNum = Number(m[1]);
    if (!Number.isFinite(speakerNum) || speakerNum < 1) continue;
    blocks.push({ questionNumber: 23 + speakerNum, contextLines: [line] });
  }
  return blocks.sort((a, b) => a.questionNumber - b.questionNumber);
}

/**
 * Pool A–H (multiple matching) before the speaker labels in Listening Part 12 (B2).
 *
 * @param {string[]|string} linesOrText
 */
export function extractListeningMatchingOptionPool(linesOrText) {
  const raw = Array.isArray(linesOrText)
    ? linesOrText.map((l) => String(l || '').trim()).filter(Boolean)
    : String(linesOrText || '')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
  const pool = [];
  for (const line of raw) {
    if (/^Speaker\s+\d/i.test(line)) break;
    if (/^[A-H]\s+\S/.test(line)) pool.push(line);
  }
  return pool;
}

/** Hueco en segunda frase (Key Word Transformation): puntos o guiones bajos. */
export const KEY_WORD_GAP_RE = /_{2,}|\.{4,}/;

const KEY_WORD_DEFAULT_GAP = '__________________';

/**
 * Quita la cabecera `Text` si es la primera línea.
 *
 * @param {string} raw
 */
function stripLeadingTextLine(raw = '') {
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim().toLowerCase() === 'text') {
    return lines.slice(1).join('\n').trim();
  }
  return String(raw || '').replace(/\r\n/g, '\n').trim();
}

/**
 * Instrucciones + ejemplo de Parte 4 (todo antes de `Questions`).
 *
 * @param {string} raw
 */
export function extractKeyWordDirectionsBlock(raw = '') {
  const body = stripAnswerKeyBlock(stripLeadingTextLine(raw));
  if (!body) return '';
  return truncateBeforeLine(body, /^questions$/i).trim();
}

/**
 * Bloque `Questions` de Parte 4 para el panel de texto interactivo.
 *
 * @param {string} raw
 */
export function extractKeyWordQuestionsBlock(raw = '') {
  const body = stripAnswerKeyBlock(stripLeadingTextLine(raw));
  if (!body) return '';
  const m = body.match(/(?:^|\n)\s*Questions\s*\n([\s\S]*)$/im);
  if (m) return `Questions\n${m[1].trim()}`;
  if (/^questions$/im.test(body.split('\n')[0]?.trim() || '')) return body.trim();
  return '';
}

/**
 * @param {string} sentence2Line
 */
function ensureKeyWordGapInSentence2(sentence2Line = '') {
  const line = String(sentence2Line || '').trim();
  if (!line) return KEY_WORD_DEFAULT_GAP;
  if (KEY_WORD_GAP_RE.test(line)) return line;
  return `${line.replace(/\s+$/, '')} ${KEY_WORD_DEFAULT_GAP}`;
}

/**
 * Parsea ítems de Parte 4 (Key Word Transformations) desde el bloque Questions del enunciado.
 *
 * @param {string} rawText
 * @returns {Array<{
 *   questionNumber: number,
 *   sentence1: string,
 *   keyword: string,
 *   sentence2Before: string,
 *   sentence2After: string,
 *   isExample: boolean,
 * }>}
 */
export function parseB2KeyWordTransformItems(rawText = '') {
  const t = stripAnswerKeyBlock(String(rawText || '').replace(/\r\n/g, '\n').trim());
  if (!t) return [];

  const lines = t.split('\n').map((l) => l.trim()).filter(Boolean);
  const qIdx = lines.findIndex((l) => /^questions$/i.test(l));
  const scan = qIdx >= 0 ? lines.slice(qIdx + 1) : lines;

  /** @type {ReturnType<typeof parseB2KeyWordTransformItems>} */
  const items = [];

  for (let i = 0; i < scan.length; i++) {
    const line = scan[i];
    if (/^answer\s*:/i.test(line) || /^answer key/i.test(line)) break;

    const numOnly = line.match(/^(\d{1,2})$/);
    if (numOnly) {
      const questionNumber = Number(numOnly[1]);
      const sentence1 = (scan[i + 1] || '').trim();
      const keywordLine = (scan[i + 2] || '').trim();
      const sentence2Line = ensureKeyWordGapInSentence2(scan[i + 3] || '');
      if (!sentence1 || !sentence2Line) {
        continue;
      }
      const gapMatch = sentence2Line.match(KEY_WORD_GAP_RE);
      const gapStart = gapMatch?.index ?? 0;
      const gapStr = gapMatch?.[0] ?? '';
      items.push({
        questionNumber,
        sentence1,
        keyword: keywordLine.replace(/^key\s*word\s*:\s*/i, '').trim() || keywordLine,
        sentence2Before: sentence2Line.slice(0, gapStart),
        sentence2After: sentence2Line.slice(gapStart + gapStr.length),
        isExample: questionNumber === 0,
      });
      i += 3;
      continue;
    }

    const dottedNum = line.match(/^(\d{1,2})\.\s*(.+)$/);
    if (dottedNum) {
      const questionNumber = Number(dottedNum[1]);
      const sentence1 = dottedNum[2].trim();
      const keywordLine = (scan[i + 1] || '').trim();
      const sentence2Line = ensureKeyWordGapInSentence2(scan[i + 2] || '');
      if (!sentence1 || !sentence2Line) continue;
      const gapMatch = sentence2Line.match(KEY_WORD_GAP_RE);
      const gapStart = gapMatch?.index ?? 0;
      const gapStr = gapMatch?.[0] ?? '';
      items.push({
        questionNumber,
        sentence1,
        keyword: keywordLine.replace(/^key\s*word\s*:\s*/i, '').trim() || keywordLine,
        sentence2Before: sentence2Line.slice(0, gapStart),
        sentence2After: sentence2Line.slice(gapStart + gapStr.length),
        isExample: questionNumber === 0,
      });
      i += 2;
      continue;
    }

    const glued = line.match(/^(\d{1,2})(.+)$/);
    if (!glued) continue;

    const questionNumber = Number(glued[1]);
    const rest = glued[2].trim();
    const sentence2Line = ensureKeyWordGapInSentence2(scan[i + 1] || '');
    if (!sentence2Line) continue;

    let sentence1 = rest;
    let keyword = '';

    const dotted = rest.match(/^(.+?)\.([A-Za-z]+)$/);
    if (dotted) {
      sentence1 = dotted[1].trim();
      keyword = dotted[2];
    } else {
      const tail = rest.match(/([A-Za-z]+)$/);
      if (tail) {
        keyword = tail[1];
        sentence1 = rest.slice(0, -keyword.length).trim();
      }
    }

    const gapMatch = sentence2Line.match(KEY_WORD_GAP_RE);
    const gapStart = gapMatch?.index ?? 0;
    const gapStr = gapMatch?.[0] ?? '';

    items.push({
      questionNumber,
      sentence1,
      keyword,
      sentence2Before: sentence2Line.slice(0, gapStart),
      sentence2After: sentence2Line.slice(gapStart + gapStr.length),
      isExample: questionNumber === 0,
    });
    i += 1;
  }

  return items;
}
