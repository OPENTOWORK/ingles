import mammoth from "mammoth";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

function cleanAnswerFragment(ans) {
  let s = String(ans || "").trim();
  s = s.replace(/\s*\([^)]*(?:\bNota:|\btambién\b|\bencaja\b|\binterpretación\b)[^)]*\)/gi, "").trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  return s;
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
    pairs.push({ num, ans });
  }
  return pairs;
}

async function test(part, ej, lo, hi) {
  const docPath = path.join(repoRoot, "Ejercicios", "Levels", "B2", `PARTE ${part}`, `EJERCICIO ${ej}.docx`);
  const r = await mammoth.extractRawText({ path: docPath });
  const keyText = answerKeySection(r.value);
  const blob = trimAnswerBlob(keyText);
  const pairs = splitByLeadingNumbers(blob).filter((p) => p.num >= lo && p.num <= hi);
  console.log(`PARTE ${part} EJ${ej}:`, pairs);
}

for (const [p, lo, hi] of [
  [2, 9, 16],
  [3, 17, 24],
  [4, 25, 30],
]) {
  for (let ej = 1; ej <= 5; ej++) {
    await test(p, ej, lo, hi);
  }
}
