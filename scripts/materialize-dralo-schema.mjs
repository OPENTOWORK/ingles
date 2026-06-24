/**
 * Materializa tmp/dralo-b-schema.sql desde el último export MCP (agent-tools).
 * Ejecutar tras regenerar el export ddl de ENGLISH_PROD vía MCP.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const agentTools = path.join(
  process.env.USERPROFILE || '',
  '.cursor/projects/c-Users-Usuario-Webs-english-practice/agent-tools',
);

function findDdlExportFile() {
  if (process.argv[2]) return process.argv[2];
  if (!fs.existsSync(agentTools)) return null;
  const files = fs
    .readdirSync(agentTools)
    .map((f) => path.join(agentTools, f))
    .filter((p) => fs.statSync(p).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  for (const file of files) {
    const head = fs.readFileSync(file, 'utf8').slice(0, 8000);
    if (head.includes('"ddl":"CREATE TABLE')) return file;
  }
  return null;
}

function extractDdl(raw) {
  const marker = '"ddl":"';
  const start = raw.indexOf(marker);
  if (start < 0) throw new Error('No se encontró ddl en el export MCP');
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

const src = findDdlExportFile();
if (!src || !fs.existsSync(src)) {
  console.error('No hay export MCP con ddl. Regenera el export desde ENGLISH_PROD.');
  process.exit(1);
}

const ddl = extractDdl(fs.readFileSync(src, 'utf8'));
const outDir = path.join(root, 'tmp');
const outFile = path.join(outDir, 'dralo-b-schema.sql');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, `${ddl}\n`);
console.log('Schema escrito en', outFile, `(${ddl.length} chars)`);
