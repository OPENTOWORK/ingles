/**
 * Update B2 Part 7 levels_partes."Descripción" only (Directions panel: 43–52).
 * Usage: node scripts/fix-part7-directions.mjs
 */
import { writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { parteNameForLevel } from '../src/lib/levelsExamCatalog.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const NEW_DESCRIPCION =
  'Part 7: Multiple Matching\r\nYou are going to read four short texts about people who changed career. For questions 43–52, choose from the people (A–D). The people may be chosen more than once.\r\n';

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const nombreParte = parteNameForLevel('b2', 7);

const { data: parte, error: readErr } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('nombre_parte', nombreParte)
  .maybeSingle();

if (readErr || !parte?.id) {
  console.error('Could not read levels_partes row:', readErr?.message || 'not found');
  process.exit(1);
}

const oldDescripcion = parte['Descripción'] ?? '';
const backupPath = path.join(
  root,
  'scripts',
  'generated',
  'backups',
  `backup-levels-partes-b2-part7-${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
);

writeFileSync(
  backupPath,
  JSON.stringify(
    {
      backedUpAt: new Date().toISOString(),
      table: 'levels_partes',
      row: {
        id: parte.id,
        nombre_parte: parte.nombre_parte,
        Descripción: oldDescripcion,
      },
    },
    null,
    2,
  ),
  'utf8',
);

console.error(`Backup written: ${backupPath}`);
console.error('Field updated: levels_partes."Descripción"');
console.error('Old (first 200 chars):', oldDescripcion.slice(0, 200));

if (oldDescripcion.includes('43–52') || oldDescripcion.includes('43-52')) {
  console.log(
    JSON.stringify({ ok: true, skipped: true, reason: 'Already contains 43–52', parteId: parte.id }),
  );
  process.exit(0);
}

const { error: updateErr } = await admin
  .from('levels_partes')
  .update({ Descripción: NEW_DESCRIPCION })
  .eq('id', parte.id);

if (updateErr) {
  console.error('Update failed:', updateErr.message);
  process.exit(1);
}

const { data: verify } = await admin
  .from('levels_partes')
  .select('id, nombre_parte, Descripción')
  .eq('id', parte.id)
  .single();

console.log(
  JSON.stringify(
    {
      ok: true,
      parteId: parte.id,
      nombre_parte: parte.nombre_parte,
      backupPath,
      oldHas3742: /37.?42/.test(oldDescripcion),
      newHas4352: /43.?52/.test(verify?.['Descripción'] || ''),
      newDescripcion: verify?.['Descripción'] || NEW_DESCRIPCION,
    },
    null,
    2,
  ),
);
