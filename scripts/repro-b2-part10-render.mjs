/**
 * Reproduce la tubería que usa la interfaz para pintar la Parte 10 de listening:
 * enunciado → extractTextoBloque → líneas → splitListeningMcqContextByQuestion
 * → situación + pregunta de cada ítem.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/repro-b2-part10-render.mjs [slots…] [parte]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  extractTextoBloque,
  splitListeningItemContext,
  splitListeningMcqContextByQuestion,
} from '../src/utils/b2ExamTextBlocks.js';

const env = loadEnvLocal();
const args = process.argv.slice(2).map(Number).filter(Boolean);
const partNumber = args.find((n) => n >= 10 && n <= 13) || 10;
const slots = args.filter((n) => n <= 6);
const wanted = slots.length ? slots : [1, 2, 3, 4, 5, 6];

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await db.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await db
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id)
  .order('nombre');
const { data: parte } = await db
  .from('levels_partes')
  .select('id')
  .eq('nombre_parte', `Parte ${partNumber} B2`)
  .single();

let bad = 0;

for (const slot of wanted) {
  const examen = (examenes || [])[slot - 1];
  if (!examen) continue;

  const { data: pregunta } = await db
    .from('levels_preguntas')
    .select('id, enunciado')
    .eq('examen_id', examen.id)
    .eq('parte_id', parte.id)
    .maybeSingle();

  if (!pregunta) {
    console.log(`\nExamen ${slot}: sin pregunta`);
    continue;
  }

  const texto = extractTextoBloque(pregunta.enunciado, partNumber, { levelSlug: 'b2' }) || '';
  const lines = texto.split('\n').map((l) => l.trim()).filter(Boolean);
  const blocks = splitListeningMcqContextByQuestion(lines);

  console.log(`\n=== Examen ${slot} — Parte ${partNumber} ===`);
  for (const b of blocks) {
    const ctxLines = b.contextLines.map((l) => String(l || '').trim()).filter(Boolean);
    const { situation, prompt } = splitListeningItemContext(ctxLines);

    const ok = Boolean(situation && prompt);
    if (!ok) bad += 1;
    console.log(
      `  Q${String(b.questionNumber).padStart(2)}: ${ok ? 'OK ' : '❌ '}` +
        `situación=${situation ? 'sí' : 'NO'} pregunta=${prompt ? 'sí' : 'NO'}` +
        (ok ? '' : `\n        contextLines=${JSON.stringify(ctxLines)}`),
    );
  }
}

console.log(bad ? `\n${bad} ítem(s) se pintarían sin texto` : '\nTodos los ítems se pintan con texto');
