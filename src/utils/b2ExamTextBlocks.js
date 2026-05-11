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
 */
export function extractTextoBloque(raw, partNumber) {
  if (!raw) return '';
  let t = raw.replace(/\r\n/g, '\n');
  t = stripAnswerKeyBlock(t);

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

  // Part 7: el panel muestra los perfiles A–D (bloque tras "Texts").
  // Las preguntas "Which person…" se renderizan abajo junto a los botones.
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

export function extractPart7PromptStemBlob(raw) {
  let t = String(raw || '').replace(/\r\n/g, '\n').trim();
  if (!t) return '';
  t = stripAnswerKeyBlock(t);
  const wpMatch = t.match(/(?:^|\n)\s*Which person/im);
  if (!wpMatch) return '';
  const wp = wpMatch.index + (wpMatch[0].startsWith('\n') ? 1 : 0);
  const after = t.slice(wp);
  const tx = after.search(/\n\s*Texts\s*\n/im);
  let chunk = tx >= 0 ? after.slice(0, tx) : after;
  chunk = chunk
    .replace(/^Which person.*?\n+/is, '')
    .replace(/\n\s*[_=\-–—]{3,}\s*$/g, '')
    .trim();
  return chunk;
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
