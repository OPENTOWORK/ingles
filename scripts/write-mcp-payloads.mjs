import fs from "fs";

const project_id = "qnazrzvwvkwhkfbqsbmr";
for (let i = 0; i < 5; i++) {
  const query = fs.readFileSync(
    new URL(`./_levels_batches/batch_${i}.sql`, import.meta.url),
    "utf8"
  );
  fs.writeFileSync(
    new URL(`./_levels_batches/mcp_payload_${i}.json`, import.meta.url),
    JSON.stringify({ project_id, query }),
    "utf8"
  );
  console.log("wrote", i, Buffer.byteLength(query));
}
