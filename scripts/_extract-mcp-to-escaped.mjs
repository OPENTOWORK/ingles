/**
 * Extract ddl/sql from MCP agent-tools JSON responses and write escaped txt files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'scripts', 'data');
const agentTools = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function toEscaped(s) {
  return JSON.stringify(s).slice(1, -1);
}

function extractJsonField(raw, field) {
  const marker = `"${field}":"`;
  const start = raw.indexOf(marker);
  if (start < 0) return null;
  let i = start + marker.length;
  let out = '';
  while (i < raw.length) {
    const ch = raw[i];
    if (ch === '\\') {
      const next = raw[i + 1];
      if (next === 'n') {
        out += '\n';
        i += 2;
        continue;
      }
      if (next === '"') {
        out += '"';
        i += 2;
        continue;
      }
      if (next === '\\') {
        out += '\\';
        i += 2;
        continue;
      }
      out += ch;
      i += 1;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i += 1;
  }
  return out;
}

let bestDdl = null;
let bestSql = null;

for (const f of fs.readdirSync(agentTools)) {
  const fp = path.join(agentTools, f);
  if (!fs.statSync(fp).isFile()) continue;
  const raw = fs.readFileSync(fp, 'utf8');
  const ddl = extractJsonField(raw, 'ddl');
  const sql = extractJsonField(raw, 'sql');
  if (ddl?.startsWith('CREATE TABLE IF NOT EXISTS public.')) {
    if (!bestDdl || ddl.length > bestDdl.value.length) bestDdl = { value: ddl, file: f };
  }
  if (sql?.startsWith('ALTER TABLE') && sql.includes('usuario_sesiones_app_user_id_fkey')) {
    if (!bestSql || sql.length > bestSql.value.length) bestSql = { value: sql, file: f };
  }
}

if (!bestDdl) {
  console.error('No ddl export found in agent-tools');
  process.exit(1);
}
if (!bestSql) {
  console.error('No constraints export found in agent-tools');
  process.exit(1);
}

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'ddl-escaped.txt'), toEscaped(bestDdl.value));
fs.writeFileSync(path.join(dataDir, 'constraints-escaped.txt'), toEscaped(bestSql.value));

console.log('ddl from', bestDdl.file, bestDdl.value.length, 'chars', (bestDdl.value.match(/CREATE TABLE/g) || []).length, 'tables');
console.log('sql from', bestSql.file, bestSql.value.length, 'chars');
