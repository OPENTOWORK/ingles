import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlPath = path.join(__dirname, 'generated', 'parte12_levels_respuestas_completo.sql');
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
  "DELETE FROM public.levels_respuestas WHERE pregunta_id IN ('2964745e-955c-4010-b3ac-e2f1f978d8b8'::uuid, 'bca9c486-51a9-4c18-aff5-247bcbc90d0f'::uuid, 'c08ac8fa-5199-48e4-af62-856e64227273'::uuid, '976ae33f-eb19-4251-864f-dad5e334935a'::uuid, 'aa6e56b2-5785-4865-9a18-ab6a850152c5'::uuid);";

const outDir = path.join(__dirname, 'generated', 'parte12_mcp_batches');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, '00_delete.sql'), del + '\n', 'utf8');
inserts.forEach((q, i) => {
  fs.writeFileSync(path.join(outDir, `${String(i + 1).padStart(2, '0')}_insert.sql`), q + '\n', 'utf8');
});
console.log('Wrote', outDir, 'inserts', inserts.length, 'chars', inserts.map((q) => q.length));
