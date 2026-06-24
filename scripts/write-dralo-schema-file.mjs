/** One-off: escribe tmp/dralo-b-schema.sql leyendo el export MCP más reciente con ddl. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const agentTools = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(root, 'tmp', 'dralo-b-schema.sql');

function extractDdl(raw) {
  const marker = '"ddl":"';
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
  return out.trim();
}

let best = null;
for (const f of fs.readdirSync(agentTools)) {
  const p = path.join(agentTools, f);
  if (!fs.statSync(p).isFile()) continue;
  const raw = fs.readFileSync(p, 'utf8');
  if (!raw.includes('"ddl":"CREATE TABLE')) continue;
  const ddl = extractDdl(raw);
  if (ddl && (!best || ddl.length > best.ddl.length)) best = { ddl, p };
}

if (!best) {
  console.error('No export ddl en agent-tools');
  process.exit(1);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, `${best.ddl}\n`);
console.log('Desde', path.basename(best.p), '→', outFile, best.ddl.length, 'chars');
