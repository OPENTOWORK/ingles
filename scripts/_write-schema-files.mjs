/**
 * One-off: persiste el export MCP en tmp/dralo-b-schema.sql y tmp/dralo-b-constraints.sql
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const exportFile = path.join(root, 'scripts', 'data', 'mcp-schema-export.json');

if (!fs.existsSync(exportFile)) {
  console.error('Falta', exportFile);
  process.exit(1);
}

const { ddl, constraints } = JSON.parse(fs.readFileSync(exportFile, 'utf8'));
const tmpDir = path.join(root, 'tmp');
fs.mkdirSync(tmpDir, { recursive: true });
fs.writeFileSync(path.join(tmpDir, 'dralo-b-schema.sql'), ddl);
fs.writeFileSync(path.join(tmpDir, 'dralo-b-constraints.sql'), constraints);
console.log('Escrito schema + constraints en tmp/');
