/**
 * PARTES 2, 3 y 4 (B2): inserta solo `levels_respuestas_abiertas` desde EJERCICIO 1–5.docx
 * (Answer Key). No modifica `levels_respuestas`.
 *
 * Ejecutar: node scripts/build-b2-partes-234-respuestas-abiertas.mjs
 * Salida: scripts/generated/b2_partes_234_levels_respuestas_abiertas.sql
 */
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "scripts", "generated");
const outFile = path.join(outDir, "b2_partes_234_levels_respuestas_abiertas.sql");

const PARTE_TO_UUID = {
  2: "c7d425b7-63cf-4420-abdc-f38a28111259",
  3: "1c4186d0-fdbe-41e7-8266-efdf712c3006",
  4: "d02d4a2a-734c-4a46-8c7e-7b95734ee84d",
};

function cleanAnswerFragment(ans) {
  let s = String(ans || "").trim();
  s = s.replace(/\s*\([^)]*(?:\bNota:|\btambién\b|\bencaja\b|\binterpretación\b)[^)]*\)/gi, "").trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  return s;
}

function normalizeTypographicQuotes(s) {
  return String(s)
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c|\u201d/g, '"');
}

function answerKeySection(fullText) {
  const i = fullText.indexOf("Answer Key");
  if (i < 0) return fullText.trim();
  let s = fullText.slice(i + "Answer Key".length).trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  return s.replace(/^Answer Key\s*/i, "").trim();
}

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

function normalizeLetterDigitRuns(blob) {
  let t = blob.replace(/\s+/g, " ").trim();
  t = t.replace(/([A-Za-z])(?=\d)/g, "$1 ");
  return t.replace(/\s+/g, " ").trim();
}

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
    pairs.push({ num, ans: normalizeTypographicQuotes(ans) });
  }
  return pairs;
}

function responsesForPart(partNum, keyText) {
  const blob = trimAnswerBlob(keyText);
  switch (partNum) {
    case 2:
      return splitByLeadingNumbers(blob)
        .filter((p) => p.num >= 9 && p.num <= 16)
        .map((p) => `${p.num} ${p.ans}`);
    case 3:
      return splitByLeadingNumbers(blob)
        .filter((p) => p.num >= 17 && p.num <= 24)
        .map((p) => `${p.num} ${p.ans}`);
    case 4:
      return splitByLeadingNumbers(blob)
        .filter((p) => p.num >= 25 && p.num <= 30)
        .map((p) => `${p.num} ${p.ans}`);
    default:
      return [];
  }
}

function sqlEscape(str) {
  return String(str).replace(/'/g, "''");
}

function subquery(parteId, examenOffset) {
  return `(SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '${parteId}'
  AND le.id = (
    SELECT e2.id FROM public.levels_examenes e2
    WHERE e2.level_id = lvl.id
    ORDER BY e2.nombre ASC
    LIMIT 1 OFFSET ${examenOffset}
  )
  ORDER BY lp.creado_en ASC, lp.id ASC
  LIMIT 1)`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const lines = [];
  lines.push("BEGIN;");
  lines.push("");
  lines.push("-- B2 partes 2–3–4: respuestas abiertas desde Word (scripts/build-b2-partes-234-respuestas-abiertas.mjs)");
  lines.push(`DELETE FROM public.levels_respuestas_abiertas ra
WHERE ra.pregunta_id_abierta IN (
  SELECT pq.id FROM public.levels_preguntas pq
  JOIN public.levels l ON l.id = pq.level_id
  WHERE lower(l.nombre) = 'b2'
  AND pq.parte_id IN (
    '${PARTE_TO_UUID[2]}','${PARTE_TO_UUID[3]}','${PARTE_TO_UUID[4]}'
  )
);`);
  lines.push("");

  for (const parteFolder of [2, 3, 4]) {
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

      lines.push(`-- PARTE ${parteFolder} EJERCICIO ${ej} → examen OFFSET ${ej - 1}`);
      const subq = subquery(parteId, ej - 1);
      for (const resp of rows) {
        lines.push(
          `INSERT INTO public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto) VALUES (${subq}, '${sqlEscape(resp)}');`,
        );
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
