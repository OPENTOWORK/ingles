/**
 * Read-only: dump the stored writing enunciado for one exam and show what the UI parser makes of it.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/b2-dump-writing.mjs <slot> [part]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const slot = Number(process.argv[2] || 1);
const onlyPart = process.argv[3] ? Number(process.argv[3]) : null;

const env = loadEnvLocal();
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { parseB2WritingPart1Task, parseB2WritingPart2Task } = await import('../src/data/b2WritingTasks.js');

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await admin.from('levels_examenes').select('id, nombre').eq('level_id', level.id);
const examenId = (examenes || []).find((e) => Number(String(e.nombre).match(/\d+/)?.[0]) === slot)?.id;

for (const partNumber of onlyPart ? [onlyPart] : [8, 9]) {
  const { data: parte } = await admin
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', `Parte ${partNumber} B2`)
    .maybeSingle();
  const { data: preguntas } = await admin
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', examenId)
    .eq('parte_id', parte.id);

  const enunciado = preguntas?.[0]?.enunciado || '';
  console.log(`\n${'='.repeat(70)}`);
  console.log(`EXAM ${slot} · PART ${partNumber} · enunciado (${enunciado.length} chars)`);
  console.log('='.repeat(70));
  console.log(JSON.stringify(enunciado));
  console.log('\n--- raw ---');
  console.log(enunciado);
  console.log('\n--- parsed ---');
  const parsed = partNumber === 8 ? parseB2WritingPart1Task(enunciado) : parseB2WritingPart2Task(enunciado);
  console.log(JSON.stringify(parsed, null, 2));
}
