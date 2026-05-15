import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = path.join(ROOT, 'scripts', 'generated', 'parte10_levels_respuestas_completo_multinsert.sql');
const outDir = path.join(ROOT, 'scripts', 'generated', 'mcp_batches');
const body = fs.readFileSync(src, 'utf8').trim();
const lines = body.split(/\r?\n/);
const del = lines[0].trim();
const inserts = body.split(/\n\n(?=INSERT INTO public\.levels_respuestas)/).filter((b) => b.trim().startsWith('INSERT'));
if (inserts.length !== 5) {
  console.error('inserts', inserts.length);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '00_delete.sql'), del + '\n', 'utf8');
inserts.forEach((sql, i) => {
  fs.writeFileSync(path.join(outDir, `${String(i + 1).padStart(2, '0')}_insert.sql`), sql.trim() + '\n', 'utf8');
});
console.log('Escritos en', outDir);
