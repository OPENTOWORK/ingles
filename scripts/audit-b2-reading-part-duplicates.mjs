/**
 * Read-only audit: B2 R&UoE Exams 1–3 Parts 5 and 7 duplicate/orphan rows.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/audit-b2-reading-part-duplicates.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildQuestionSelectionAfterExamReload } from '../src/utils/skillPracticeNavigation.js';
import { formatLevelsPartDisplayName } from '../src/utils/formatLevelsPartDisplayName.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PART_NUMBERS = [5, 7];
const EXAM_SLOTS = [1, 2, 3];

const EXPECTED_NEW_IDS = new Set([
  '3c8a7acc',
  'b49e0fad',
  '09bb9bdd',
  'cd0b2a0a',
  '65bdae29',
  '06f21bb2',
]);

const EXPECTED_ORPHAN_IDS = new Set(['4a624b0f', '8fec0825', 'c4260d37']);

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function partNumFromName(name) {
  const m = String(name || '').match(/Parte\s+(\d+)/i);
  return m ? Number(m[1]) : null;
}

function titleFromEnunciado(enunciado) {
  const raw = String(enunciado || '');
  const m = raw.match(/(?:^|\n)Title:\s*(.+)/i) || raw.match(/(?:^|\n)([A-Z][^\n]{8,80})/);
  return (m?.[1] || raw.slice(0, 80)).trim();
}

function wordCountFromEnunciado(enunciado) {
  const passage = String(enunciado || '')
    .replace(/^[\s\S]*?(?:Passage:|Text:)\s*/i, '')
    .replace(/Questions:[\s\S]*$/i, '')
    .trim();
  return passage.split(/\s+/).filter(Boolean).length;
}

function shortId(id) {
  return String(id || '').slice(0, 8);
}

function sortExamRows(rows) {
  return [...(rows || [])].sort((a, b) => {
    const na = parseInt(String(a?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    const nb = parseInt(String(b?.nombre ?? '').match(/\d+/)?.[0] || '0', 10);
    if (na !== nb) return na - nb;
    return String(a?.id ?? '').localeCompare(String(b?.id ?? ''));
  });
}

function simulateUiDefaultPreguntaId(questionsData, partsById, partNumber) {
  const groupedByPart = questionsData.reduce((acc, question) => {
    const tablePart = partsById[question.parte_id];
    const partName = formatLevelsPartDisplayName(tablePart?.nombre_parte || 'Parte sin nombre');
    const pn = Number(partName.match(/\d+/)?.[0] || 0);
    if (pn !== partNumber) return acc;

    if (!acc[question.parte_id]) {
      acc[question.parte_id] = {
        id: question.parte_id,
        nombre: partName,
        questions: [],
      };
    }
    acc[question.parte_id].questions.push({ preguntaId: question.id });
    return acc;
  }, {});

  const normalizedParts = Object.values(groupedByPart).sort((a, b) => {
    const aNumber = Number(a.nombre.match(/\d+/)?.[0] || 999);
    const bNumber = Number(b.nombre.match(/\d+/)?.[0] || 999);
    return aNumber - bNumber;
  });

  const selection = buildQuestionSelectionAfterExamReload(normalizedParts, {});
  const partGroups = normalizedParts.filter(
    (p) => Number(p.nombre.match(/\d+/)?.[0] || 0) === partNumber,
  );

  if (!partGroups.length) return { preguntaId: null, partGroups: 0 };

  if (partGroups.length === 1) {
    return { preguntaId: selection[partGroups[0].id] || null, partGroups: 1 };
  }

  const picks = partGroups.map((p) => ({
    parteId: p.id,
    preguntaId: selection[p.id],
    questionCount: p.questions.length,
  }));
  return { preguntaId: picks[0]?.preguntaId || null, partGroups: partGroups.length, picks };
}

const { data: level } = await admin.from('levels').select('id, nombre').ilike('nombre', 'b2').single();
if (!level?.id) {
  console.error('B2 level not found');
  process.exit(1);
}

const { data: examRows } = await admin
  .from('levels_examenes')
  .select('id, nombre')
  .eq('level_id', level.id);

const examsBySlot = {};
for (const slot of EXAM_SLOTS) {
  const ordered = sortExamRows(examRows);
  examsBySlot[slot] = ordered[slot - 1] || null;
}

const report = {
  auditedAt: new Date().toISOString(),
  levelId: level.id,
  examsBySlot: Object.fromEntries(
    Object.entries(examsBySlot).map(([slot, row]) => [slot, row ? { id: row.id, nombre: row.nombre } : null]),
  ),
  parts: [],
  summary: {
    duplicatePartGroups: 0,
    orphanRows: [],
    uiWouldLoadOrphan: [],
  },
};

for (const slot of EXAM_SLOTS) {
  const exam = examsBySlot[slot];
  if (!exam?.id) {
    report.parts.push({ slot, error: 'exam not found' });
    continue;
  }

  const { data: questions } = await admin
    .from('levels_preguntas')
    .select('id, examen_id, level_id, parte_id, enunciado')
    .eq('examen_id', exam.id);

  const partIds = [...new Set((questions || []).map((q) => q.parte_id).filter(Boolean))];
  const { data: partes } = await admin
    .from('levels_partes')
    .select('id, nombre_parte')
    .in('id', partIds.length ? partIds : ['00000000-0000-0000-0000-000000000000']);

  const partsById = Object.fromEntries((partes || []).map((p) => [p.id, p]));
  const qIds = (questions || []).map((q) => q.id);

  let mcqCounts = {};
  let openCounts = {};
  if (qIds.length) {
    const { data: mcq } = await admin
      .from('levels_respuestas')
      .select('pregunta_id')
      .in('pregunta_id', qIds);
    mcqCounts = (mcq || []).reduce((acc, row) => {
      acc[row.pregunta_id] = (acc[row.pregunta_id] || 0) + 1;
      return acc;
    }, {});

    const { data: open } = await admin
      .from('levels_respuestas_abiertas')
      .select('pregunta_id_abierta')
      .in('pregunta_id_abierta', qIds);
    openCounts = (open || []).reduce((acc, row) => {
      acc[row.pregunta_id_abierta] = (acc[row.pregunta_id_abierta] || 0) + 1;
      return acc;
    }, {});
  }

  for (const partNumber of PART_NUMBERS) {
    const rows = (questions || []).filter((q) => {
      const pn = partNumFromName(partsById[q.parte_id]?.nombre_parte);
      return pn === partNumber;
    });

    const ui = simulateUiDefaultPreguntaId(questions || [], partsById, partNumber);

    const entry = {
      slot,
      partNumber,
      examenId: exam.id,
      rowCount: rows.length,
      uiDefaultPreguntaId: ui.preguntaId,
      uiPartGroups: ui.partGroups,
      uiPicks: ui.picks || null,
      rows: rows.map((q) => ({
        id: q.id,
        shortId: shortId(q.id),
        parteId: q.parte_id,
        parteName: partsById[q.parte_id]?.nombre_parte || null,
        title: titleFromEnunciado(q.enunciado),
        wordCount: wordCountFromEnunciado(q.enunciado),
        mcqAnswers: mcqCounts[q.id] || 0,
        openAnswers: openCounts[q.id] || 0,
        isExpectedNew: EXPECTED_NEW_IDS.has(shortId(q.id)),
        isExpectedOrphan: EXPECTED_ORPHAN_IDS.has(shortId(q.id)),
      })),
    };

    if (rows.length > 1) report.summary.duplicatePartGroups += 1;
    for (const row of entry.rows) {
      const totalAnswers = row.mcqAnswers + row.openAnswers;
      if (totalAnswers === 0 && rows.length > 1) {
        report.summary.orphanRows.push({ slot, partNumber, id: row.id, shortId: row.shortId, title: row.title });
      }
    }

    const uiShort = shortId(ui.preguntaId);
    if (EXPECTED_ORPHAN_IDS.has(uiShort)) {
      report.summary.uiWouldLoadOrphan.push({ slot, partNumber, preguntaId: ui.preguntaId, shortId: uiShort });
    }

    report.parts.push(entry);
  }
}

const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'b2-reading-part5-7-duplicate-audit.json');
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

console.log(JSON.stringify(report.summary, null, 2));
console.error(`Audit written to ${outPath}`);
