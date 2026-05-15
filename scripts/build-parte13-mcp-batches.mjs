import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'generated', 'parte13_levels_respuestas_completo.sql');
const lines = fs.readFileSync(sqlPath, 'utf8').split(/\r?\n/).filter((l) => l.startsWith('INSERT'));

function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

const byPid = new Map();
for (const l of lines) {
  const m = l.match(
    /VALUES \('([0-9a-f-]+)'::uuid,\s*'((?:''|[^'])*)',\s*(true|false)\)/i,
  );
  if (!m) throw new Error('Parse failed: ' + l.slice(0, 100));
  const pid = m[1];
  const resp = m[2].replace(/''/g, "'");
  const cor = m[3] === 'true';
  if (!byPid.has(pid)) byPid.set(pid, []);
  byPid.get(pid).push({ resp, cor });
}

const inserts = [];
for (const [pid, rows] of byPid) {
  const tuples = rows.map(
    (r) => `('${pid}'::uuid, '${sqlEscape(r.resp)}', ${r.cor})`,
  );
  inserts.push(
    'INSERT INTO public.levels_respuestas (pregunta_id, respuesta, correcta) VALUES\n' +
      tuples.join(',\n') +
      ';',
  );
}

const del =
  "DELETE FROM public.levels_respuestas WHERE pregunta_id IN ('714c245a-7ee2-4430-aefe-5b4afdd543f9'::uuid, '938c432c-b310-400f-b068-5c3a2ffcd0d9'::uuid, 'd7f347d4-b348-4e51-9978-2f3400a0be55'::uuid, '9ccf27bd-7686-4feb-96bf-92ae66dffede'::uuid, 'bce76f33-230d-4ddb-ade3-d8d62e50e592'::uuid);";

const outDir = path.join(__dirname, 'generated', 'parte13_mcp_batches');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '00_delete.sql'), del + '\n', 'utf8');
inserts.forEach((q, i) => {
  fs.writeFileSync(path.join(outDir, `${String(i + 1).padStart(2, '0')}_insert.sql`), q + '\n', 'utf8');
});
console.log('Wrote', outDir, 'inserts', inserts.length, 'chars', inserts.map((q) => q.length));
