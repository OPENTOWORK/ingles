import fs from "fs";

const src = fs.readFileSync("c:/Users/Usuario/Downloads/levels_preguntas_rows.sql", "utf8");
const header =
  'INSERT INTO "public"."levels_preguntas" ("id", "examen_id", "level_id", "parte_id", "enunciado", "creado_en") VALUES ';
const idx = src.indexOf("VALUES");
if (idx === -1) throw new Error("VALUES not found");
let body = src.slice(idx + 6).trim();
if (body.endsWith(";")) body = body.slice(0, -1).trim();

const rawParts = body.split(/\),\s*\(\'/);
const rows = rawParts.map((p, i) => (i === 0 ? p : `(${p}`));
const last = rows.length - 1;
rows[last] = rows[last].replace(/\)\s*;?\s*$/, ")");

const BATCH = 12;
const batches = [];
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  batches.push(header + chunk.join("), (") + ";");
}

const outDir = "c:/Users/Usuario/Webs/english-practice/scripts/_levels_batches";
fs.mkdirSync(outDir, { recursive: true });
batches.forEach((sql, j) => {
  fs.writeFileSync(`${outDir}/batch_${j}.sql`, sql, "utf8");
});
console.log("rows", rows.length, "batches", batches.length);
batches.forEach((sql, j) => console.log("batch", j, "bytes", Buffer.byteLength(sql)));
