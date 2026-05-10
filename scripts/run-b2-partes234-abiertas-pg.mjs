/**
 * Aplica scripts/generated/b2_abiertas_batches/batch_{0..7}.sql
 * Requiere DIRECT_URL o DATABASE_URL (Postgres) en el entorno.
 *
 *   set DIRECT_URL=postgresql://...
 *   node scripts/run-b2-partes234-abiertas-pg.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "generated", "b2_abiertas_batches");

const conn = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!conn) {
  console.error("Falta DIRECT_URL o DATABASE_URL.");
  process.exit(1);
}

const files = [];
for (let i = 0; i < 8; i++) {
  const p = path.join(dir, `batch_${i}.sql`);
  if (fs.existsSync(p)) files.push(p);
}

const client = new pg.Client({ connectionString: conn });
await client.connect();
try {
  for (const p of files) {
    const sql = fs.readFileSync(p, "utf8");
    await client.query(sql);
    console.log("OK", path.basename(p));
  }
} finally {
  await client.end();
}
