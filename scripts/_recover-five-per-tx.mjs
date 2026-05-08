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

const pid = "qnazrzvwvkwhkfbqsbmr";
const CHUNK = 2;
for (let i = 0; i < inserts.length; i += CHUNK) {
  const slice = inserts.slice(i, i + CHUNK);
  const query = `begin;\n${slice.map((s) => s.trim()).join("\n")}\ncommit;\n`;
  const bn = String(i / CHUNK + 1).padStart(2, "0");
  fs.writeFileSync(
    new URL(`./_rec_chunk_${bn}.json`, import.meta.url),
    JSON.stringify({ project_id: pid, query }),
    "utf8"
  );
  console.log(bn, slice.length, Buffer.byteLength(JSON.stringify({ project_id: pid, query }), "utf8"));
}
