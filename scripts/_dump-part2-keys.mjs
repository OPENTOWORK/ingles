/**
 * One-off: dump parsed Part 2 open-cloze answers (word only, no gap prefix).
 */
import mammoth from "mammoth";
import fs from "fs";
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
  return s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
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

function findMarker(s, fromIndex, targetNum) {
  const label = String(targetNum);
  let pos = fromIndex;
  while (pos < s.length) {
    const idx = s.indexOf(label, pos);
    if (idx < 0) return -1;
    const prev = idx > 0 ? s[idx - 1] : " ";
    const nextIdx = idx + label.length;
    const nextCh = nextIdx < s.length ? s[nextIdx] : " ";
    if (/\d/.test(prev)) {
      pos = idx + 1;
      continue;
    }
    if (/\d/.test(nextCh)) {
      pos = idx + 1;
      continue;
    }
    return idx;
  }
  return -1;
}

function normalizeTypographicQuotes(str) {
  return String(str)
    .replace(/\u2019/g, "'")
    .replace(/\u2018/g, "'")
    .replace(/\u201c|\u201d/g, '"');
}

function parsePart234Sequential(blob, nums) {
  let s = trimAnswerBlob(blob).replace(/\r/g, "").replace(/\s+/g, " ").trim();
  s = s.replace(/\s*\(Nota:[\s\S]*$/i, "").trim();
  const out = [];
  let searchFrom = 0;
  for (let i = 0; i < nums.length; i++) {
    const n = nums[i];
    const idx = findMarker(s, searchFrom, n);
    if (idx < 0) throw new Error(`Missing marker ${n} in: ${s.slice(0, 160)}`);
    const afterNum = idx + String(n).length;
    const nextN = nums[i + 1];
    let end = s.length;
    if (nextN !== undefined) {
      const j = findMarker(s, afterNum, nextN);
      if (j < 0) throw new Error(`Missing next ${nextN}`);
      end = j;
    }
    let ans = s.slice(afterNum, end).trim();
    ans = cleanAnswerFragment(ans).replace(/^[\s:]+/, "").trim();
    out.push({ num: n, ans: normalizeTypographicQuotes(ans) });
    searchFrom = afterNum;
  }
  return out;
}

for (let ej = 1; ej <= 5; ej++) {
  const docPath = path.join(repoRoot, "Ejercicios", "Levels", "B2", "PARTE 2", `EJERCICIO ${ej}.docx`);
  const { value } = await mammoth.extractRawText({ path: docPath });
  const key = answerKeySection(value);
  const pairs = parsePart234Sequential(key, [9, 10, 11, 12, 13, 14, 15, 16]);
  console.log(
    "EJ" + ej,
    pairs.map(({ num, ans }) => `${num}:${JSON.stringify(ans)}`).join(" | "),
  );
}
