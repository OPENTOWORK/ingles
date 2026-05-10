import fs from "node:fs";
import path from "node:path";

const batch = process.argv[2];
const dir =
  "c:/Users/Usuario/Webs/english-practice/scripts/generated/b2_abiertas_batches";
const file = path.join(dir, `batch_${batch}.sql`);
const query = fs.readFileSync(file, "utf8");
process.stdout.write(
  JSON.stringify({
    project_id: "qnazrzvwvkwhkfbqsbmr",
    query,
  })
);
