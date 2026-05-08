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

  // Part 7: cuerpo habitualmente empieza en "Which person"
  if (partNumber === 7) {
    const wp = joined.search(/\nWhich person/im);
    if (wp >= 0) {
      let body = joined.slice(wp + 1).trim();
      return body;
    }
  }

  // Partes 2–4 y 6 (dos líneas "Text": cabecera + pasaje)
  if (textLineIdxs.length >= 2) {
    let body = lines.slice(textLineIdxs[textLineIdxs.length - 1] + 1).join('\n').trim();
    if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
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
    return body;
  }

  let body = t;
  if (partNumber === 5) body = truncateBeforeLine(body, /^questions$/i);
  return body;
}
