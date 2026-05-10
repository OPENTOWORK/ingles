/**
 * Prints execute_sql arguments as JSON for each batch file mcp_payload_0..4.json
 * Usage: node scripts/run-levels-inserts-via-mcp-helper.mjs [batchIndex]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "_levels_batches");
const i = Number(process.argv[2] ?? 0);
const file = path.join(dir, `mcp_payload_${i}.json`);
const args = JSON.parse(fs.readFileSync(file, "utf8"));
process.stdout.write(JSON.stringify(args));
