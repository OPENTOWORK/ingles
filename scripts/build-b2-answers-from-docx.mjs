/**
 * Lee Ejercicios/Levels/B2/PARTE {1..7}/EJERCICIO {1..5}.docx y genera SQL
 * para levels_respuestas y levels_respuestas_abiertas (B2).
 *
 * Ejecutar: node scripts/build-b2-answers-from-docx.mjs
 * Salida: scripts/generated/b2_answers_from_docx.sql
 */
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "scripts", "generated");
const outFile = path.join(outDir, "b2_answers_from_docx.sql");

/** Carpeta local PARTE N → levels_partes.id (B2 Reading & Use of English 1–7) */
const PARTE_TO_UUID = {
  1: "9f50cc1e-de64-43aa-b45c-49e160f9793f",
  2: "c7d425b7-63cf-4420-abdc-f38a28111259",
  3: "1c4186d0-fdbe-41e7-8266-efdf712c3006",
  4: "d02d4a2a-734c-4a46-8c7e-7b95734ee84d",
  5: "6f873582-07bf-436a-9a25-492b748678c7",
  6: "b170ab5a-f54f-4cae-ac2e-bd194181cafe",
  7: "bd41d80c-bcdd-4ac9-9c06-13c2ab8fab6e",
};

/** Quita paréntesis explicativos en español dentro de una respuesta suelta */
function cleanAnswerFragment(ans) {
  let s = String(ans || "").trim();
  s = s.replace(/\s*\([^)]*(?:\bNota:|\btambién\b|\bencaja\b|\binterpretación\b)[^)]*\)/gi, "").trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  return s;
}

/** Tras línea "Answer Key" — limpia notas en español al final */
function answerKeySection(fullText) {
  const i = fullText.indexOf("Answer Key");
  if (i < 0) return fullText.trim();
  let s = fullText.slice(i + "Answer Key".length).trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  return s.replace(/^Answer Key\s*/i, "").trim();
}

/** Corta al primer salto grande tras la clave (algunos docs traen texto extra) */
function trimAnswerBlob(blob) {
  const lines = blob.split("\n").map((l) => l.trim());
  const out = [];
  for (const line of lines) {
    if (!line) continue;
    if (/^(questions|text|part )/i.test(line) && out.length > 2) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

/**
 * Word a veces exporta "from10 on11" sin espacio; \b no encuentra "10" dentro de "from10".
 * Inserta espacio entre letra y dígito para que cada número de hueco sea tokenizable.
 */
function normalizeLetterDigitRuns(blob) {
  let t = blob.replace(/\s+/g, " ").trim();
  t = t.replace(/([A-Za-z])(?=\d)/g, "$1 ");
  return t.replace(/\s+/g, " ").trim();
}

/** Palabras 9–16, 17–24, 25–30 pegadas: trocea por índices numéricos */
function splitByLeadingNumbers(blob) {
  const t = normalizeLetterDigitRuns(blob);
  const matches = [...t.matchAll(/\b(\d+)\b/g)];
  const pairs = [];
  for (let j = 0; j < matches.length; j++) {
    const num = parseInt(matches[j][1], 10);
    const start = matches[j].index + matches[j][0].length;
    const end = matches[j + 1] ? matches[j + 1].index : t.length;
    let ans = t.slice(start, end).trim();
    ans = cleanAnswerFragment(ans.replace(/\s*\(Nota:[\s\S]*$/i, "").trim());
    pairs.push({ num, ans });
  }
  return pairs;
}

/** Parte 1: "1 A2 B3 C" o huecos 1–8 con dos dígitos */
function parsePart1(blob) {
  const compact = blob.replace(/\s+/g, "");
  const pairs = [];
  const re = /(\d{1,2})([A-D])/g;
  let m;
  while ((m = re.exec(compact)) !== null) {
    pairs.push({ num: parseInt(m[1], 10), letter: m[2] });
  }
  return pairs.map((p) => `${p.num} ${p.letter}`);
}

/** Parte 5: 6 líneas con letra; preguntas 31–36 */
function parsePart5(blob) {
  const lines = blob
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const letters = lines.filter((l) => /^[A-D]$/i.test(l));
  const out = [];
  let q = 31;
  for (const L of letters) {
    out.push(`${q} ${L.toUpperCase()}`);
    q += 1;
  }
  return out;
}

/** Parte 6 y 7: "31 E32 C" */
function parsePart6or7(blob) {
  const compact = blob.replace(/\s+/g, "");
  const re = /(\d{2})([A-G])/gi;
  const out = [];
  let m;
  while ((m = re.exec(compact)) !== null) {
    out.push(`${parseInt(m[1], 10)} ${m[2].toUpperCase()}`);
  }
  return out;
}

function responsesForPart(partNum, keyText) {
  const blob = trimAnswerBlob(keyText);
  switch (partNum) {
    case 1:
      return parsePart1(blob).map((r) => ({ respuesta: r, abierta: false }));
    case 2:
      return splitByLeadingNumbers(blob)
        .filter((p) => p.num >= 9 && p.num <= 16)
        .map((p) => ({
          respuesta: `${p.num} ${p.ans}`,
          abierta: true,
        }));
    case 3:
      return splitByLeadingNumbers(blob)
        .filter((p) => p.num >= 17 && p.num <= 24)
        .map((p) => ({
          respuesta: `${p.num} ${p.ans}`,
          abierta: true,
        }));
    case 4: {
      const pairs = splitByLeadingNumbers(blob).filter((p) => p.num >= 25 && p.num <= 30);
      return pairs.map((p) => ({
        respuesta: `${p.num} ${p.ans}`,
        abierta: true,
      }));
    }
    case 5:
      return parsePart5(blob).map((r) => ({ respuesta: r, abierta: false }));
    case 6:
      return parsePart6or7(blob).map((r) => ({ respuesta: r, abierta: false }));
    case 7:
      return parsePart6or7(blob).map((r) => ({ respuesta: r, abierta: false }));
    default:
      return [];
  }
}

function sqlEscape(str) {
  return String(str).replace(/'/g, "''");
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const lines = [];
  lines.push("BEGIN;");
  lines.push("");
  lines.push("-- Generado por scripts/build-b2-answers-from-docx.mjs");
  lines.push("-- Borra respuestas existentes solo de B2 para partes 1–7 (lectura + use of English)");
  lines.push(`DELETE FROM public.levels_respuestas_abiertas ra
WHERE ra.pregunta_id_abierta IN (
  SELECT pq.id FROM public.levels_preguntas pq
  JOIN public.levels l ON l.id = pq.level_id
  WHERE lower(l.nombre) = 'b2'
  AND pq.parte_id IN (
    '${Object.values(PARTE_TO_UUID).join("','")}'
  )
);`);
  lines.push("");
  lines.push(`DELETE FROM public.levels_respuestas lr
WHERE lr.pregunta_id IN (
  SELECT pq.id FROM public.levels_preguntas pq
  JOIN public.levels l ON l.id = pq.level_id
  WHERE lower(l.nombre) = 'b2'
  AND pq.parte_id IN (
    '${Object.values(PARTE_TO_UUID).join("','")}'
  )
);`);
  lines.push("");

  const parteUuids = Object.entries(PARTE_TO_UUID);

  for (let parteFolder = 1; parteFolder <= 7; parteFolder++) {
    const parteId = PARTE_TO_UUID[parteFolder];
    for (let ej = 1; ej <= 5; ej++) {
      const docPath = path.join(
        repoRoot,
        "Ejercicios",
        "Levels",
        "B2",
        `PARTE ${parteFolder}`,
        `EJERCICIO ${ej}.docx`,
      );
      if (!fs.existsSync(docPath)) {
        console.warn("Falta:", docPath);
        continue;
      }
      let raw;
      try {
        const r = await mammoth.extractRawText({ path: docPath });
        raw = r.value;
      } catch (e) {
        console.warn("No se pudo leer", docPath, e.message);
        continue;
      }
      const keySection = answerKeySection(raw);
      const rows = responsesForPart(parteFolder, keySection);
      if (!rows.length) {
        console.warn("Sin claves parseadas:", docPath);
        continue;
      }

      /**
       * EJERCICIO ej (1..5) → examen en posición ej-1 (ORDER BY nombre).
       * pregunta: una fila por (parte_id, examen_id) en levels_preguntas.
       */
      lines.push(
        `-- PARTE ${parteFolder} EJERCICIO ${ej} → examen offset ${ej - 1}`,
      );

      for (const row of rows) {
        const resp = sqlEscape(row.respuesta);
        const subq = `(SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '${parteId}'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET ${ej - 1}
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1)`;

        lines.push(
          `INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES (${subq}, '${resp}', true);`,
        );

        if (row.abierta) {
          lines.push(
            `INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES (${subq}, '${resp}');`,
          );
        }
      }
      lines.push("");
    }
  }

  lines.push("COMMIT;");
  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.log("Escrito:", outFile, "bytes", fs.statSync(outFile).size);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
