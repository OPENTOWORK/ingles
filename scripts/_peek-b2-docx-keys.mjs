import mammoth from "mammoth";
import fs from "fs";

const parts = [1, 2, 3, 4, 5, 6, 7];
for (const p of parts) {
  const f = `Ejercicios/Levels/B2/PARTE ${p}/EJERCICIO 1.docx`;
  if (!fs.existsSync(f)) {
    console.log("MISSING", f);
    continue;
  }
  const r = await mammoth.extractRawText({ path: f });
  const t = r.value;
  const idx = t.indexOf("Answer Key");
  const slice = idx >= 0 ? t.slice(idx, idx + 1200) : t.slice(-900);
  console.log("\n=== PARTE " + p + " EJ1 ===\n" + slice.replace(/\r/g, ""));
}
