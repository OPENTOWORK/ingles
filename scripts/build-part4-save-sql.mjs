/**
 * Build SQL to replace B2 Exam 1 Part 4 from preview JSON.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/build-part4-save-sql.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildB2EnunciadoFromGenerated, buildAnswerRowsFromGenerated } from '../src/lib/formatB2Enunciado.js';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(scriptsDir, '..');
const preview = JSON.parse(
  readFileSync(path.join(scriptsDir, 'generated', 'preview-exam1-part4-b2.json'), 'utf8'),
);

const enunciado = buildB2EnunciadoFromGenerated(preview.generated, 4);
const { open } = buildAnswerRowsFromGenerated(preview.generated);

function sqlEscape(value) {
  return String(value || '').replace(/'/g, "''");
}

const examenId = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const levelId = 'ae0e85e8-3d63-11f1-b2e3-0b27f7b23431';

const sql = `begin;
-- B2 Examen 1 — Part 4 only (Key Word Transformations)
delete from public.levels_respuestas_abiertas
where pregunta_id_abierta in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '${examenId}'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_respuestas
where pregunta_id in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '${examenId}'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_preguntas_audios
where pregunta_id in (
  select lp.id from public.levels_preguntas lp
  join public.levels_partes p on p.id = lp.parte_id
  where lp.examen_id = '${examenId}'::uuid
    and p.nombre_parte = 'Parte 4 B2'
);
delete from public.levels_preguntas lp
using public.levels_partes p
where lp.parte_id = p.id
  and lp.examen_id = '${examenId}'::uuid
  and p.nombre_parte = 'Parte 4 B2';

with parte as (
  select id from public.levels_partes where nombre_parte = 'Parte 4 B2' limit 1
),
ins as (
  insert into public.levels_preguntas (level_id, examen_id, parte_id, enunciado, creado_en)
  select '${levelId}'::uuid, '${examenId}'::uuid, parte.id, '${sqlEscape(enunciado)}', now()
  from parte
  returning id
)
${open
  .map(
    (row) => `insert into public.levels_respuestas_abiertas (pregunta_id_abierta, respuesta_texto)
select id, '${sqlEscape(`${row.questionNumber} ${row.text}`)}' from ins;`,
  )
  .join('\n')}
commit;`;

const outSql = path.join(scriptsDir, 'generated', 'save-exam1-part4-b2.sql');
const outMcp = path.join(scriptsDir, 'generated', 'mcp_exec_save_exam1_part4.json');
writeFileSync(outSql, sql, 'utf8');
writeFileSync(
  outMcp,
  JSON.stringify({ project_id: 'qnazrzvwvkwhkfbqsbmr', query: sql }, null, 2),
  'utf8',
);

console.log('Written', outSql);
console.log('Written', outMcp);
console.log('Open answers:', open.length);
open.forEach((r) => console.log(`  ${r.questionNumber}: ${r.text}`));
