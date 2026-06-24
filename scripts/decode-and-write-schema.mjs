/**
 * Decodifica exports MCP escapados y escribe tmp/dralo-b-schema.sql + constraints.
 * Uso: node scripts/decode-and-write-schema.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'scripts', 'data');

function unesc(s) {
  return s.replace(/\\n/g, '\n').replace(/\\"/g, '"');
}

const ddlEsc = fs.readFileSync(path.join(dataDir, 'ddl-escaped.txt'), 'utf8').trim();
const constraintsEsc = fs.readFileSync(path.join(dataDir, 'constraints-escaped.txt'), 'utf8').trim();

const ddl = unesc(ddlEsc);
const constraints = unesc(constraintsEsc);
const tmp = path.join(root, 'tmp');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, 'dralo-b-schema.sql'), `${ddl}\n`);
fs.writeFileSync(path.join(tmp, 'dralo-b-constraints.sql'), `${constraints}\n`);
console.log(`Escrito schema (${ddl.length} chars) y constraints (${constraints.length} chars)`);
