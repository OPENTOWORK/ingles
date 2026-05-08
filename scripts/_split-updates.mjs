import fs from "fs";

const raw = fs.readFileSync(
  new URL("./_tx1_query_only.sql", import.meta.url),
  "utf8"
);
const idx = raw.indexOf("update public.levels_partes");
const end = raw.lastIndexOf("commit;");
const block = raw.slice(idx, end).trim();

const re = /\n(?=update public\.levels_partes set)/g;
const chunks = block.split(re).filter(Boolean);
chunks.forEach((u, i) => {
  const p = new URL(`./_upd_${i + 1}.sql`, import.meta.url);
  const stmt = u.trim().replace(/;+\s*$/u, "");
  fs.writeFileSync(p, stmt + ";\n", "utf8");
  console.log(i + 1, Buffer.byteLength(u, "utf8"));
});
