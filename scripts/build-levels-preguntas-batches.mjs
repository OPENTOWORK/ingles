import fs from "fs";

const srcPath = "c:/Users/Usuario/Downloads/levels_preguntas_rows.sql";
const src = fs.readFileSync(srcPath, "utf8");
const header =
  'INSERT INTO "public"."levels_preguntas" ("id", "examen_id", "level_id", "parte_id", "enunciado", "creado_en") VALUES ';
const idx = src.indexOf("VALUES");
let body = src.slice(idx + 6).trim();
if (body.endsWith(";")) body = body.slice(0, -1).trim();

const rowBoundary = /(?=\),\s*\('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')/i;
const rows = body.split(rowBoundary);
if (rows.length < 2) throw new Error("unexpected split");
const last = rows[rows.length - 1].replace(/\)\s*;?\s*$/, ")");
rows[rows.length - 1] = last;

const BATCH = 10;
const outDir = new URL("./_levels_batches/", import.meta.url);
fs.mkdirSync(outDir, { recursive: true });

const batches = [];
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH).map((row, j) => {
    if (j === 0 && i > 0) return row.replace(/^\)\s*,\s*\(\s*/, "(");
    return row;
  });
  let sql = header + chunk.join("");
  // split leaves the closing ")" of each tuple on the next segment; mid-batch chunks need it on the last row
  if (i + BATCH < rows.length) sql += ")";
  sql += ";";
  batches.push(sql);
}

batches.forEach((sql, j) => {
  fs.writeFileSync(new URL(`batch_${j}.sql`, outDir), sql, "utf8");
  console.log("batch", j, "rows", Math.min(BATCH, rows.length - j * BATCH), "bytes", Buffer.byteLength(sql));
});
console.log("total rows", rows.length, "batches", batches.length);

const joined = rows.join("");
if (joined !== body.replace(/\)\s*;?\s*$/, ")")) {
  console.warn("rejoin mismatch vs body (check trailing semicolon)");
}
