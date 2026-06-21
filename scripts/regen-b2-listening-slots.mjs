/**
 * Regenera listening B2 (partes 10–13) para uno o más slots de examen.
 * Usa OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS vía cambridgeExamGenerationCompletion.
 *
 * Duraciones objetivo (Listening Cambridge):
 *   Part 10 — Part 1: 30–40 s por clip (×8)
 *   Part 11 — Part 2: 3:30–3:50 (un audio)
 *   Part 12 — Part 3: 40–50 s por clip (×5)
 *   Part 13 — Part 4: ~4 min (un audio)
 *
 * Uso:
 *   node --loader ./scripts/alias-loader.mjs scripts/regen-b2-listening-slots.mjs 2 3
 *   node --loader ./scripts/alias-loader.mjs scripts/regen-b2-listening-slots.mjs parts=11,13 2
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { getMp3DurationSec } from './mp3-duration.mjs';
import { getB2ListeningAudioTargets, formatDurationSec } from '../src/lib/b2ListeningAudioTargets.js';

const env = loadEnvLocal();
const argv = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const skipAudio = process.argv.includes('--skip-audio');
const partFilterArg = argv.find((a) => /^parts?=/i.test(a));
const partFilter = partFilterArg
  ? partFilterArg
      .split('=')[1]
      .split(',')
      .map(Number)
      .filter((n) => Number.isFinite(n))
  : null;
const slots = argv.map(Number).filter((n) => Number.isFinite(n) && n >= 1);

if (!slots.length) {
  console.error(
    'Uso: node --loader ./scripts/alias-loader.mjs scripts/regen-b2-listening-slots.mjs <slot> [slot2…] [parts=10,11,12,13] [--skip-audio]',
  );
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
if (!env.OPENAI_API_KEY) {
  console.error('Falta OPENAI_API_KEY');
  process.exit(1);
}

const assistantId = env.OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS?.trim();
if (!assistantId) {
  console.warn('⚠ OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS no definido — se usará fallback Chat Completions');
} else {
  console.error(`Assistant Cambridge: ${assistantId}`);
}

const { B2_EXAM_PARTS } = await import('../src/lib/b2ExamCatalog.js');
const { generateAndPersistLevelExamPart } = await import('../src/lib/levelsCambridgeExamGenerator.js');

const listeningParts = B2_EXAM_PARTS.filter((p) => p.needsAudio)
  .map((p) => p.partNumber)
  .filter((pn) => !partFilter?.length || partFilter.includes(pn));

const MAX_PART_ATTEMPTS = 6;

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('Nivel b2 no encontrado');
  process.exit(1);
}

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated');
mkdirSync(outDir, { recursive: true });

const report = { slots: {}, generatedAt: new Date().toISOString(), skipAudio, durationTargets: {} };
for (const pn of listeningParts) {
  const t = getB2ListeningAudioTargets(pn);
  if (t) report.durationTargets[pn] = { ...t, rangeLabel: `${formatDurationSec(t.minSec)}–${formatDurationSec(t.maxSec)}` };
}

for (const examSlot of slots) {
  console.error(`\n=== Examen ${examSlot} B2 — listening (partes ${listeningParts.join(', ')}) ===`);
  report.slots[examSlot] = { parts: {} };

  for (const partNumber of listeningParts) {
    const targets = getB2ListeningAudioTargets(partNumber);
    console.error(
      `\n→ Part ${partNumber} (${targets?.label || 'listening'}) — objetivo ${formatDurationSec(targets?.minSec)}–${formatDurationSec(targets?.maxSec)}…`,
    );
    let partOk = false;
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_PART_ATTEMPTS && !partOk; attempt += 1) {
      if (attempt > 1) console.error(`  Reintento ${attempt}/${MAX_PART_ATTEMPTS}…`);
      try {
        const result = await generateAndPersistLevelExamPart(admin, {
          levelSlug: 'b2',
          levelId: level.id,
          examSlot,
          partNumber,
          skipAudio,
          replacePartContent: true,
          preserveExistingParts: false,
          varietySeed: Date.now() + examSlot * 10000 + partNumber * 137 + attempt * 9973,
        });

        const partReport = {
          ok: true,
          preguntaId: result.preguntaId,
          partTitle: result.partTitle,
          audios: [],
          attempts: attempt,
          targetRange: targets
            ? `${formatDurationSec(targets.minSec)}–${formatDurationSec(targets.maxSec)}`
            : null,
        };

        let durationOk = true;
        if (!skipAudio && result.preguntaId && targets) {
          const { data: audioRows } = await admin
            .from('levels_preguntas_audios')
            .select('id, orden, titulo, audio_url')
            .eq('pregunta_id', result.preguntaId)
            .order('orden');

          for (const row of audioRows || []) {
            let durationSec = null;
            let clipOk = null;
            try {
              const res = await fetch(row.audio_url);
              if (res.ok) {
                const buf = Buffer.from(await res.arrayBuffer());
                durationSec = await getMp3DurationSec(buf);
                clipOk = durationSec >= targets.minSec && durationSec <= targets.maxSec;
                if (!clipOk) durationOk = false;
              }
            } catch (err) {
              console.warn(`  ⚠ No se pudo medir audio orden=${row.orden}:`, err?.message);
              durationOk = false;
            }

            partReport.audios.push({
              orden: row.orden,
              titulo: row.titulo,
              url: row.audio_url,
              durationSec,
              durationFormatted: formatDurationSec(durationSec),
              durationOk: clipOk,
            });

            const durLabel = formatDurationSec(durationSec);
            const status = clipOk === true ? 'OK' : clipOk === false ? 'FUERA DE RANGO' : 'sin medir';
            console.error(`  Audio ${row.orden}: ${durLabel} [${status}] — ${row.titulo?.slice(0, 50)}`);
          }

          if (!audioRows?.length) durationOk = false;
        }

        if (skipAudio || durationOk) {
          report.slots[examSlot].parts[partNumber] = partReport;
          console.error(`  ✓ Guardado preguntaId=${result.preguntaId}`);
          partOk = true;
        } else {
          lastError = `Duración fuera de rango (intento ${attempt})`;
          console.error(`  ✗ ${lastError} — regenerando…`);
        }
      } catch (err) {
        lastError = err?.message || String(err);
        console.error(`  ✗ Error part ${partNumber}:`, lastError);
      }
    }

    if (!partOk) {
      report.slots[examSlot].parts[partNumber] = { ok: false, error: lastError || 'Max attempts exceeded' };
    }
  }
}

const reportPath = path.join(outDir, `regen-listening-exams-${slots.join('-')}-report.json`);
writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.error(`\nInforme: ${reportPath}`);

let allOk = true;
for (const slot of slots) {
  for (const pn of listeningParts) {
    const p = report.slots[slot]?.parts?.[pn];
    if (!p?.ok) {
      allOk = false;
      continue;
    }
    if (!skipAudio) {
      for (const a of p.audios || []) {
        if (a.durationOk === false) allOk = false;
      }
      if (!p.audios?.length) allOk = false;
    }
  }
}

console.log(JSON.stringify({ ok: allOk, reportPath, skipAudio }, null, 2));
process.exit(allOk ? 0 : 1);
