import fs from "fs";

const dir = new URL("./", import.meta.url);
const project_id = "qnazrzvwvkwhkfbqsbmr";
const files = [
  "_mcp_tx_updates.sql",
  "_ins_batch_1.sql",
  "_ins_batch_2.sql",
  "_ins_batch_3.sql",
];

files.forEach((name, i) => {
  const query = fs.readFileSync(new URL(name, dir), "utf8");
  const payload = { project_id, query };
  const out = new URL(`./_mcp_exec_payload_${i + 1}.json`, import.meta.url);
  fs.writeFileSync(out, JSON.stringify(payload), "utf8");
  console.log(out.pathname, Buffer.byteLength(JSON.stringify(payload), "utf8"));
});
