import mammoth from "mammoth";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");

async function one(p, ej) {
  const docPath = path.join(repoRoot, "Ejercicios", "Levels", "B2", `PARTE ${p}`, `EJERCICIO ${ej}.docx`);
  const r = await mammoth.extractRawText({ path: docPath });
  const t = r.value;
  const i = t.indexOf("Answer Key");
  const section = i < 0 ? t : t.slice(i);
  console.log("=== PARTE", p, "EJ", ej, "===");
  console.log(section.slice(0, 3500));
  console.log("\n");
}

await one(2, 1);
await one(3, 1);
await one(4, 1);
