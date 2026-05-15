import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const src = path.join(ROOT, 'scripts', 'generated', 'parte10_levels_respuestas_completo.sql');
const dst = path.join(ROOT, 'scripts', 'generated', 'parte10_levels_respuestas_completo_multinsert.sql');

const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/).filter((l) => /^INSERT\b/.test(l.trim()));
const byPid = new Map();
for (const line of lines) {
  const m = line.match(/VALUES \('([0-9a-f-]+)'::uuid, (.+), (true|false)\);$/i);
  if (!m) {
    console.error('parse fail', line.slice(0, 100));
    process.exit(1);
  }
  const pid = m[1];
  const rest = `${m[2]}, ${m[3]}`;
  if (!byPid.has(pid)) byPid.set(pid, []);
  byPid.get(pid).push(`('${pid}'::uuid, ${rest})`);
}

const out = [];
const ids = [...byPid.keys()];
out.push(`DELETE FROM public.levels_respuestas WHERE pregunta_id IN (${ids.map((id) => `'${id}'::uuid`).join(', ')});`);
for (const [, rows] of byPid) {
  out.push('INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES');
  out.push(`${rows.join(',\n')};`);
}

const sql = out.join('\n\n');
fs.writeFileSync(dst, sql, 'utf8');
console.log('Escrito:', dst, 'bloques:', out.length, 'chars:', sql.length);
