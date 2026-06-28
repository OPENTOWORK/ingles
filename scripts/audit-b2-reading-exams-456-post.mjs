/**
 * Post-apply audit: B2 R&UoE Exams 4–6 Parts 5 and 7.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/audit-b2-reading-exams-456-post.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { loadEnvLocal } from './load-env-local.mjs';
import { buildQuestionSelectionAfterExamReload } from '../src/utils/skillPracticeNavigation.js';
import { formatLevelsPartDisplayName } from '../src/utils/formatLevelsPartDisplayName.js';
import { buildPartFromDump } from './b2ExamDumpToGenerated.mjs';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { countWords } from '../src/lib/b2RuoeExamQuality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXAM_SLOTS = [4, 5, 6];
const PART_NUMBERS = [5, 7];
const LEGACY_SHORT = new Set(['35c22c4e', '62f706f7', '49881627', '37267fd0', 'efe131db', '48ab323c']);

loadEnvLocal();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) process.exit(1);

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

function partNumFromName(name) {
  const m = String(name || '').match(/Parte\s+(\d+)/i);
  return m ? Number(m[1]) : null;
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
    const pn = partNumFromName(partsById[question.parte_id]?.nombre_parte);
    if (pn !== partNumber) return acc;
    const partName = formatLevelsPartDisplayName(partsById[question.parte_id]?.nombre_parte || '');
    if (!acc[question.parte_id]) {
      acc[question.parte_id] = { id: question.parte_id, nombre: partName, questions: [] };
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
  const partGroups = normalizedParts.filter((p) => Number(p.nombre.match(/\d+/)?.[0] || 0) === partNumber);
  if (!partGroups.length) return { preguntaId: null, partGroups: 0 };
  return { preguntaId: selection[partGroups[0].id] || null, partGroups: partGroups.length };
}

const { data: level } = await admin.from('levels').select('id').ilike('nombre', 'b2').single();
const { data: examRows } = await admin.from('levels_examenes').select('id, nombre').eq('level_id', level.id);
const examsBySlot = {};
for (const slot of EXAM_SLOTS) {
  examsBySlot[slot] = sortExamRows(examRows)[slot - 1] || null;
}

const report = {
  auditedAt: new Date().toISOString(),
  summary: { duplicatePartGroups: 0, orphanRows: [], uiWouldLoadOrphan: [], uiWouldLoadLegacy: [] },
  parts: [],
};

for (const slot of EXAM_SLOTS) {
  const exam = examsBySlot[slot];
  const { data: questions } = await admin
    .from('levels_preguntas')
    .select('id, examen_id, parte_id, enunciado')
    .eq('examen_id', exam.id);

  const partIds = [...new Set((questions || []).map((q) => q.parte_id).filter(Boolean))];
  const { data: partes } = await admin
    .from('levels_partes')
    .select('id, nombre_parte')
    .in('id', partIds.length ? partIds : ['00000000-0000-0000-0000-000000000000']);
  const partsById = Object.fromEntries((partes || []).map((p) => [p.id, p]));
  const qIds = (questions || []).map((q) => q.id);

  let mcqCounts = {};
  if (qIds.length) {
    const { data: mcq } = await admin.from('levels_respuestas').select('pregunta_id, correcta').in('pregunta_id', qIds);
    mcqCounts = (mcq || []).reduce((acc, row) => {
      acc[row.pregunta_id] = (acc[row.pregunta_id] || 0) + 1;
      return acc;
    }, {});
  }

  for (const partNumber of PART_NUMBERS) {
    const rows = (questions || []).filter((q) => partNumFromName(partsById[q.parte_id]?.nombre_parte) === partNumber);
    const ui = simulateUiDefaultPreguntaId(questions || [], partsById, partNumber);
    const uiRow = rows.find((r) => r.id === ui.preguntaId) || rows[0];
    const mcqTotal = uiRow ? mcqCounts[uiRow.id] || 0 : 0;
    const expectedMcq = partNumber === 5 ? 24 : 40;
    const expectedCorrect = partNumber === 5 ? 6 : 10;

    let correctCount = 0;
    if (uiRow) {
      const { data: mcq } = await admin.from('levels_respuestas').select('correcta').eq('pregunta_id', uiRow.id);
      correctCount = (mcq || []).filter((r) => r.correcta).length;
    }

    const dump = {
      partes: [{ partNumber, items: [{ enunciado: uiRow?.enunciado, respuestasMcq: [] }] }],
    };
    if (uiRow) {
      const { data: mcqRows } = await admin.from('levels_respuestas').select('respuesta, correcta').eq('pregunta_id', uiRow.id);
      dump.partes[0].items[0].respuestasMcq = mcqRows || [];
    }
    const gen = uiRow ? buildPartFromDump(dump, partNumber) : null;
    const val = gen ? validateGeneratedExamPart('b2', partNumber, gen) : { ok: false, errors: ['no row'] };

    const entry = {
      slot,
      partNumber,
      rowCount: rows.length,
      uiPreguntaId: ui.preguntaId,
      uiShortId: shortId(ui.preguntaId),
      mcqTotal,
      mcqCorrect: correctCount,
      expectedMcq,
      expectedCorrect,
      validationOk: val.ok,
      title: partNumber === 5 ? gen?.title : gen?.sections?.map((s) => s.name).join(', '),
      passageWordCount: partNumber === 5 ? countWords(gen?.passage || '') : null,
      sectionWordCounts: partNumber === 7 ? gen?.sections?.map((s) => countWords(s.text)) : null,
      isLegacyId: LEGACY_SHORT.has(shortId(ui.preguntaId)),
    };

    if (rows.length > 1) report.summary.duplicatePartGroups += 1;
    for (const row of rows) {
      const total = mcqCounts[row.id] || 0;
      if (rows.length > 1 && total === 0) {
        report.summary.orphanRows.push({ slot, partNumber, id: row.id, shortId: shortId(row.id) });
      }
    }
    if (LEGACY_SHORT.has(shortId(ui.preguntaId))) {
      report.summary.uiWouldLoadLegacy.push({ slot, partNumber, preguntaId: ui.preguntaId });
    }

    report.parts.push(entry);
  }
}

const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'b2-reading-exams-456-post-audit.json');
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
console.log(JSON.stringify(report.parts, null, 2));
process.exit(
  report.summary.duplicatePartGroups === 0 &&
    report.summary.orphanRows.length === 0 &&
    report.summary.uiWouldLoadLegacy.length === 0 &&
    report.parts.every((p) => p.rowCount === 1 && p.validationOk && p.mcqTotal === p.expectedMcq)
    ? 0
    : 1,
);
