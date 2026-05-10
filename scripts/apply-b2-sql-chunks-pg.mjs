/**
 * Aplica scripts/generated/chunks2/m*.sql en orden (salida de build-b2-answers-from-docx.mjs).
 *
 * Requiere acceso directo a Postgres, p. ej. cadena "Session mode" o pooler del panel Supabase:
 *   set DATABASE_URL=postgresql://postgres.xxx:PASSWORD@...
 *   node scripts/apply-b2-sql-chunks-pg.mjs
 */
import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "generated", "chunks2");

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("Define DATABASE_URL o DIRECT_URL (cadena postgres del proyecto).");
  process.exit(1);
}

const files = fs
  .readdirSync(dir)
  .filter((f) => /^m\d+\.sql$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});

await client.connect();
for (const f of files) {
  const q = fs.readFileSync(path.join(dir, f), "utf8");
  console.log("Ejecutando", f, q.length, "chars");
  await client.query(q);
}
await client.end();
console.log("Listo:", files.length, "archivos.");
