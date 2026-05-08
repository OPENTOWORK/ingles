import fs from "fs";

const raw = fs.readFileSync(
  new URL("./_b2_tx2_inserts.sql", import.meta.url),
  "utf8"
);
const body = raw
  .replace(/^begin;\s*/i, "")
  .trim()
  .replace(/(?:\ncommit;)+\s*$/i, "");
const inserts = body
  .split(/(?=insert into public\.levels_preguntas)/g)
  .filter((x) => x.startsWith("insert"));

const batches = [];
let cur = [];
let bytes = 0;
const MAX = 24000;
for (const ins of inserts) {
  const b = Buffer.byteLength(ins + ";\n", "utf8");
  if (cur.length && bytes + b > MAX) {
    batches.push(cur);
    cur = [];
    bytes = 0;
  }
  cur.push(ins);
  bytes += b;
}
if (cur.length) batches.push(cur);

batches.forEach((stmts, i) => {
  const sql = `begin;\n${stmts.join("\n")}\ncommit;\n`;
  const p = new URL(`./_ins_batch_${i + 1}.sql`, import.meta.url);
  fs.writeFileSync(p, sql, "utf8");
  console.log(i + 1, stmts.length, Buffer.byteLength(sql, "utf8"));
});
