/**
 * Revisa los enunciados de listening B2 y localiza preguntas sin texto:
 * las que solo tienen el número y las opciones, sin situación ni pregunta.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/inspect-b2-listening-questions.mjs [slots…] [--dump]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';

const env = loadEnvLocal();
const args = process.argv.slice(2);
const dump = args.includes('--dump');
const slots = args.map(Number).filter(Boolean);
const wanted = slots.length ? slots : [1, 2, 3, 4, 5, 6];

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LISTENING_PARTS = [10, 11, 12, 13];
const isOptionLine = (line) => /^[A-H]\)/.test(line.trim());
const isNumberLine = (line) => /^\d{1,2}$/.test(line.trim());

/** Devuelve [{ number, body[], options[] }] a partir del enunciado guardado. */
function parseQuestions(enunciado) {
  const out = [];
  let current = null;
  for (const raw of String(enunciado || '').split('\n')) {
    const line = raw.trim();
    if (isNumberLine(line)) {
      current = { number: Number(line), body: [], options: [] };
      out.push(current);
      continue;
    }
    if (!current || !line) continue;
    if (isOptionLine(line)) current.options.push(line);
    else current.body.push(line);
  }
  return out;
}

const { data: level } = await db.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examenes } = await db
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id)
  .order('nombre');
const { data: partes } = await db
  .from('levels_partes')
  .select('id, nombre_parte')
  .in('nombre_parte', LISTENING_PARTS.map((n) => `Parte ${n} B2`));

const parteIdByNumber = {};
for (const p of partes || []) {
  parteIdByNumber[Number(String(p.nombre_parte).match(/\d+/)?.[0])] = p.id;
}

let broken = 0;

for (const slot of wanted) {
  const examen = (examenes || [])[slot - 1];
  if (!examen) continue;
  console.log(`\n=== Examen ${slot} — ${String(examen.nombre).trim()} ===`);

  for (const partNumber of LISTENING_PARTS) {
    const { data: pregunta } = await db
      .from('levels_preguntas')
      .select('id, enunciado')
      .eq('examen_id', examen.id)
      .eq('parte_id', parteIdByNumber[partNumber])
      .maybeSingle();

    if (!pregunta) {
      console.log(`  Parte ${partNumber}: SIN PREGUNTA`);
      continue;
    }

    if (partNumber === 11) {
      console.log(`  Parte ${partNumber}: (huecos, se omite)`);
      continue;
    }

    const questions = parseQuestions(pregunta.enunciado);
    const sinTexto = questions.filter((q) => q.options.length && !q.body.length);
    const sinOpciones = questions.filter((q) => !q.options.length && q.body.length);

    const detalle = [];
    if (sinTexto.length) detalle.push(`SIN TEXTO: ${sinTexto.map((q) => q.number).join(', ')}`);
    if (sinOpciones.length) detalle.push(`sin opciones: ${sinOpciones.map((q) => q.number).join(', ')}`);
    if (detalle.length) broken += 1;

    console.log(
      `  Parte ${partNumber}: ${questions.length} preguntas` +
        (detalle.length ? `  ← ${detalle.join(' | ')}` : '  OK'),
    );

    if (dump) {
      console.log('  ----- enunciado -----');
      console.log(
        String(pregunta.enunciado || '')
          .split('\n')
          .map((l) => `  | ${l}`)
          .join('\n'),
      );
      console.log('  ---------------------');
    }
  }
}

console.log(broken ? `\n${broken} parte(s) con preguntas incompletas` : '\nTodo correcto');
process.exit(broken ? 1 : 0);
