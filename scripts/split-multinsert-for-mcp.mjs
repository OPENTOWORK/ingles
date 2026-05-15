import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = path.join(ROOT, 'scripts', 'generated', 'parte10_levels_respuestas_completo_multinsert.sql');
const body = fs.readFileSync(src, 'utf8').trim();
const parts = body.split(/\n\nINSERT INTO public\.levels_respuestas/);
// parts[0] is DELETE + "\n\nINSERT..." header issue - split differently

const blocks = body.split(/\n\n(?=INSERT INTO public\.levels_respuestas)/);
const del = blocks[0].split(/\n\n(?=INSERT)/)[0].trim();
const inserts = blocks.map((b) => b.trim()).filter((b) => b.startsWith('INSERT'));
if (inserts.length !== 5) {
  console.error('inserts', inserts.length);
  process.exit(1);
}

const half1 = [del, '', inserts[0], '', inserts[1]].join('\n\n');
const half2 = [inserts[2], '', inserts[3], '', inserts[4]].join('\n\n');
fs.writeFileSync(path.join(ROOT, 'scripts', 'generated', '_mcp_half1.sql'), half1, 'utf8');
fs.writeFileSync(path.join(ROOT, 'scripts', 'generated', '_mcp_half2.sql'), half2, 'utf8');
console.log('half1', half1.length, 'half2', half2.length);
