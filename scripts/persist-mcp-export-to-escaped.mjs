/**
 * Persist MCP execute_sql exports to scripts/data/*-escaped.txt
 * Usage:
 *   node scripts/persist-mcp-export-to-escaped.mjs <ddl-mcp-file> <constraints-mcp-file>
 *
 * Each input file is the raw MCP tool output (JSON wrapper or plain text with untrusted-data block).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'scripts', 'data');

function unwrapMcpText(raw) {
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('{')) {
    try {
      const outer = JSON.parse(raw);
      if (typeof outer.result === 'string') return outer.result;
    } catch {
      /* fall through */
    }
  }
  return raw;
}

function extractUntrustedJson(raw) {
  const text = unwrapMcpText(raw);
  const m = text.match(/<untrusted-data-[^>]+>\s*([\s\S]*?)\s*<\/untrusted-data/);
  if (!m) throw new Error('No untrusted-data block in MCP export');
  return JSON.parse(m[1].trim());
}

function toEscaped(s) {
  return JSON.stringify(s).slice(1, -1);
}

const ddlFile = process.argv[2];
const sqlFile = process.argv[3];
if (!ddlFile || !sqlFile) {
  console.error('Usage: node scripts/persist-mcp-export-to-escaped.mjs <ddl-mcp-file> <constraints-mcp-file>');
  process.exit(1);
}

const ddl = extractUntrustedJson(fs.readFileSync(ddlFile, 'utf8'))[0].ddl;
const sql = extractUntrustedJson(fs.readFileSync(sqlFile, 'utf8'))[0].sql;

if (!ddl?.startsWith('CREATE TABLE IF NOT EXISTS public.')) {
  throw new Error('Unexpected ddl export');
}
if (!sql?.startsWith('ALTER TABLE') || !sql.includes('usuario_sesiones_app_user_id_fkey')) {
  throw new Error('Unexpected constraints export');
}

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'ddl-escaped.txt'), toEscaped(ddl));
fs.writeFileSync(path.join(dataDir, 'constraints-escaped.txt'), toEscaped(sql));

console.log(
  `ddl-escaped.txt: ${ddl.length} chars, ${(ddl.match(/CREATE TABLE/g) || []).length} tables`,
);
console.log(`constraints-escaped.txt: ${sql.length} chars`);
