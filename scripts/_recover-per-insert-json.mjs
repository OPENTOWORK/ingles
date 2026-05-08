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
inserts.forEach((sql, i) => {
  const query = `begin;\n${sql.trim()}\ncommit;\n`;
  const name = `./_rec_single_${String(i + 1).padStart(2, "0")}.json`;
  fs.writeFileSync(
    new URL(name, import.meta.url),
    JSON.stringify({ project_id: pid, query }),
    "utf8"
  );
  console.log(name, Buffer.byteLength(JSON.stringify({ project_id: pid, query }), "utf8"));
});
