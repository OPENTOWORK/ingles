import fs from "fs";

const p = new URL("./", import.meta.url);
const pid = "qnazrzvwvkwhkfbqsbmr";

function merge(ids, outName) {
  const parts = [];
  for (const i of ids) {
    const n = String(i).padStart(2, "0");
    const j = JSON.parse(
      fs.readFileSync(new URL(`./_rec_chunk_${n}.json`, p), "utf8")
    );
    parts.push(
      j.query.replace(/^begin;\s*/i, "").replace(/\s*commit;\s*$/i, "").trim()
    );
  }
  const query = `begin;\n${parts.join("\n")}\ncommit;\n`;
  const payload = { project_id: pid, query };
  fs.writeFileSync(new URL(outName, p), JSON.stringify(payload), "utf8");
  console.log(
    outName,
    Buffer.byteLength(JSON.stringify(payload), "utf8")
  );
}

merge([1, 2, 3], "./_mcp_merge_a.json");
merge([4, 5], "./_mcp_merge_b.json");
merge([6, 7], "./_mcp_merge_c1.json");
merge([8], "./_mcp_merge_c2.json");
merge([9, 10], "./_mcp_merge_d1.json");
merge([11, 12], "./_mcp_merge_d2.json");
