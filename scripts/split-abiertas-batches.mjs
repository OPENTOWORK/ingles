import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, "generated", "b2_partes_234_levels_respuestas_abiertas.sql");
const outDir = path.join(__dirname, "generated", "b2_abiertas_batches");
const sql = fs.readFileSync(sqlPath, "utf8");
const inserts = [];
let current = "";
for (const line of sql.split("\n")) {
  if (line.startsWith("INSERT INTO public.levels_respuestas_abiertas")) {
    current = line;
  } else if (current) {
    current += "\n" + line;
  }
  if (current && line.trim().endsWith(");")) {
    inserts.push(current.trim());
    current = "";
  }
}
fs.mkdirSync(outDir, { recursive: true });
const batchSize = 15;
let idx = 0;
for (let i = 0; i < inserts.length; i += batchSize) {
  const chunk = inserts.slice(i, i + batchSize).join("\n");
  fs.writeFileSync(path.join(outDir, `batch_${idx}.sql`), chunk + "\n", "utf8");
  idx += 1;
}
console.log("inserts", inserts.length, "batches", idx);
