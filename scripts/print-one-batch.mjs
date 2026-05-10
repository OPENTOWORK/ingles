import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const i = Number(process.argv[2] || "0");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const p = path.join(__dirname, "generated", "b2_abiertas_batches", `batch_${i}.json`);
process.stdout.write(JSON.parse(fs.readFileSync(p, "utf8")));
