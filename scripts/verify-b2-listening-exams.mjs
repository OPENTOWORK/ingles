/**
 * Verifica que los exámenes de listening B2 comparten el formato del Examen 1:
 * una única grabación por parte, con doble escucha, y el número esperado de respuestas.
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/verify-b2-listening-exams.mjs [slots…]
 */
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';

const env = loadEnvLocal();
const slots = process.argv.slice(2).map(Number).filter(Boolean);
const wanted = slots.length ? slots : [1, 2, 3, 4, 5, 6];

const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const LISTENING_PARTS = [10, 11, 12, 13];
const EXPECTED = {
  10: { mcq: 24, abiertas: 0 },
  11: { mcq: 0, abiertas: 10 },
  12: { mcq: 40, abiertas: 0 },
  13: { mcq: 21, abiertas: 0 },
};

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
  const n = Number(String(p.nombre_parte).match(/\d+/)?.[0]);
  parteIdByNumber[n] = p.id;
}

let problems = 0;

for (const slot of wanted) {
  const examen = (examenes || [])[slot - 1];
  if (!examen) {
    console.log(`Examen ${slot}: no encontrado`);
    problems += 1;
    continue;
  }

  console.log(`\n=== ${String(examen.nombre).trim()} ===`);

  for (const partNumber of LISTENING_PARTS) {
    const { data: pregunta } = await db
      .from('levels_preguntas')
      .select('id')
      .eq('examen_id', examen.id)
      .eq('parte_id', parteIdByNumber[partNumber])
      .maybeSingle();

    if (!pregunta) {
      console.log(`  Parte ${partNumber}: SIN PREGUNTA`);
      problems += 1;
      continue;
    }

    const [{ count: mcq }, { count: abiertas }, { data: audios }] = await Promise.all([
      db.from('levels_respuestas').select('id', { count: 'exact', head: true }).eq('pregunta_id', pregunta.id),
      db
        .from('levels_respuestas_abiertas')
        .select('id', { count: 'exact', head: true })
        .eq('pregunta_id_abierta', pregunta.id),
      db.from('levels_preguntas_audios').select('audio_url, orden').eq('pregunta_id', pregunta.id).order('orden'),
    ]);

    const issues = [];
    const exp = EXPECTED[partNumber];
    if (mcq !== exp.mcq) issues.push(`mcq=${mcq} (esperado ${exp.mcq})`);
    if (partNumber === 11 ? abiertas < exp.abiertas : abiertas !== exp.abiertas) {
      issues.push(`abiertas=${abiertas} (esperado ${exp.abiertas}+)`);
    }
    if ((audios || []).length !== 1) issues.push(`audios=${(audios || []).length} (esperado 1 grabación única)`);

    let durLabel = 'sin audio';
    const url = audios?.[0]?.audio_url;
    if (url) {
      try {
        const res = await fetch(`${url}?cb=${Date.now()}`, { cache: 'no-store' });
        const buf = Buffer.from(await res.arrayBuffer());
        const sec = await getMp3DurationSec(buf);
        durLabel = formatDurationSec(sec);
        const t = getB2ListeningAudioTargets(partNumber);
        if (t && (sec < t.totalMinSec || sec > t.totalMaxSec)) {
          issues.push(
            `duración ${durLabel} fuera de ${formatDurationSec(t.totalMinSec)}–${formatDurationSec(t.totalMaxSec)}`,
          );
        }
      } catch (err) {
        issues.push(`audio no descargable: ${err?.message}`);
      }
    }

    if (issues.length) problems += 1;
    console.log(
      `  Parte ${partNumber}: ${durLabel} | mcq=${mcq} abiertas=${abiertas} audios=${(audios || []).length}` +
        (issues.length ? `  ← ${issues.join('; ')}` : '  OK'),
    );
  }
}

console.log(problems ? `\n${problems} parte(s) con incidencias` : '\nTodo correcto');
process.exit(problems ? 1 : 0);
