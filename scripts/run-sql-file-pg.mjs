/**
 * Ejecuta un fichero .sql contra Postgres (variable DATABASE_URL o DIRECT_URL).
 * Uso: node scripts/run-sql-file-pg.mjs scripts/generated/b2_parte1_levels_respuestas.sql
 */
import fs from "fs";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fileArg = process.argv[2];
if (!fileArg) {
  console.error("Uso: node scripts/run-sql-file-pg.mjs <ruta.sql>");
  process.exit(1);
}

const sqlPath = path.isAbsolute(fileArg) ? fileArg : path.join(__dirname, "..", fileArg);
const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("Define DATABASE_URL o DIRECT_URL.");
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, "utf8");
const client = new pg.Client({
  connectionString: url,
  ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
});
await client.connect();
await client.query(sql);
await client.end();
console.log("OK:", sqlPath);
