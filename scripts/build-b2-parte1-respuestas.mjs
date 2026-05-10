/**
 * Solo PARTE 1 (B2): lee EJERCICIO 1–5.docx → levels_respuestas (exámenes 1–5).
 * Ejecutar: node scripts/build-b2-parte1-respuestas.mjs
 * Salida: scripts/generated/b2_parte1_levels_respuestas.sql
 */
import mammoth from "mammoth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const outDir = path.join(repoRoot, "scripts", "generated");
const outFile = path.join(outDir, "b2_parte1_levels_respuestas.sql");

const PARTE1_ID = "9f50cc1e-de64-43aa-b45c-49e160f9793f";

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

function sqlEscape(str) {
  return String(str).replace(/'/g, "''");
}

function subqueryParte1(examenOffset) {
  return `(SELECT lp.id FROM public.levels_preguntas lp
  JOIN public.levels_examenes le ON le.id = lp.examen_id
  JOIN public.levels lvl ON lvl.id = le.level_id AND lower(lvl.nombre) = 'b2'
  WHERE lp.parte_id = '${PARTE1_ID}'
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
  lines.push("-- PARTE 1 B2: respuestas desde Word (EJERCICIO 1–5 → exámenes 1–5)");
  lines.push(
    `DELETE FROM public.levels_respuestas lr
WHERE lr.pregunta_id IN (
  SELECT pq.id FROM public.levels_preguntas pq
  JOIN public.levels l ON l.id = pq.level_id
  WHERE lower(l.nombre) = 'b2'
  AND pq.parte_id = '${PARTE1_ID}'
);`,
  );
  lines.push("");

  for (let ej = 1; ej <= 5; ej++) {
    const docPath = path.join(
      repoRoot,
      "Ejercicios",
      "Levels",
      "B2",
      "PARTE 1",
      `EJERCICIO ${ej}.docx`,
    );
    if (!fs.existsSync(docPath)) {
      console.warn("Falta:", docPath);
      continue;
    }
    const r = await mammoth.extractRawText({ path: docPath });
    const keySection = answerKeySection(r.value);
    const blob = trimAnswerBlob(keySection);
    const answers = parsePart1(blob);
    if (!answers.length) {
      console.warn("Sin claves:", docPath);
      continue;
    }

    lines.push(
      `-- EJERCICIO ${ej} → examen posición ${ej} (offset ${ej - 1} en ORDER BY nombre)`,
    );
    const subq = subqueryParte1(ej - 1);
    for (const resp of answers) {
      lines.push(
        `INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES (${subq}, '${sqlEscape(resp)}', true);`,
      );
    }
    lines.push("");
  }

  lines.push("COMMIT;");
  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.log("Escrito:", outFile, fs.statSync(outFile).size, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
