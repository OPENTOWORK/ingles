/**
 * Inserta en Supabase las filas de scripts/generated/parte10_levels_respuestas_completo.sql
 * usando la service role (bypass RLS). Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function loadEnvLocal() {
  const p = path.join(ROOT, '.env.local');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] == null || process.env[m[1]] === '') process.env[m[1]] = v;
  }
}

function parseInsertLine(line) {
  const re =
    /^INSERT INTO public\.levels_respuestas \(pregunta_id, respuesta, correcta\) VALUES \('([0-9a-f-]+)'::uuid, '((?:''|[^'])*)', (true|false)\);$/i;
  const m = String(line).trim().match(re);
  if (!m) return null;
  return {
    pregunta_id: m[1],
    respuesta: m[2].replace(/''/g, "'"),
    correcta: m[3] === 'true',
  };
}

async function main() {
  loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
  }

  const sqlPath = path.join(ROOT, 'scripts', 'generated', 'parte10_levels_respuestas_completo.sql');
  const lines = fs.readFileSync(sqlPath, 'utf8').split(/\r?\n/);
  const insertLines = lines.filter((l) => /^INSERT INTO/.test(l.trim()));
  const rows = insertLines.map(parseInsertLine).filter(Boolean);
  if (rows.length !== 120) {
    console.error('Se esperaban 120 INSERT parseables, hay', rows.length);
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const ids = [
    '2e44ac3c-2e7e-430b-9b0d-226f7e459bea',
    'ba46a83c-6f2f-4899-bb82-01cc3ca1d561',
    '81a4a85a-c928-4260-84f2-3aa5c585ffad',
    'a73489dd-47ad-4cb2-997d-ad605c898cff',
    'a3bf3439-57c9-48bf-992b-2cff82a00eb8',
  ];
  const { error: delErr } = await supabase.from('levels_respuestas').delete().in('pregunta_id', ids);
  if (delErr) {
    console.error('DELETE falló:', delErr.message || delErr);
    process.exit(1);
  }
  console.log('DELETE previo OK (5 pregunta_id).');

  const chunk = 40;
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const { error } = await supabase.from('levels_respuestas').insert(slice);
    if (error) {
      console.error('INSERT lote', i, error.message || error);
      process.exit(1);
    }
    console.log('Insertadas', Math.min(i + chunk, rows.length), '/', rows.length);
  }
  console.log('Listo: 120 filas en levels_respuestas (Parte 10, exámenes 1–5).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
