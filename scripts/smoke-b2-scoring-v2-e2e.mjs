/**
 * B2 Scoring V2 end-to-end smoke validation.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/smoke-b2-scoring-v2-e2e.mjs
 *   node --loader ./scripts/alias-loader.mjs scripts/smoke-b2-scoring-v2-e2e.mjs --v1
 *
 * Requires .env.local with Supabase keys. Optional: SMOKE_TEST_BASE_URL (default http://localhost:3000)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

import { loadEnvLocal } from './load-env-local.mjs';
import { parseB2KeyWordAnswerKeyRows } from '../src/lib/parseB2KeyWordAnswerKey.js';
import { gradeB2Part4Gap, summarizePart4OpenGrades } from '../src/lib/b2Part4Grading.js';
import { computeB2PartScoreMetrics } from '../src/utils/levelsPaperScoreMetrics.js';
import { computeB2PartProgressFromState } from '../src/utils/recordLevelsB2PartScore.js';
import { LEVELS_SCORE_SOURCE } from '../src/utils/levelsScoreSource.js';
import { parseUoePartDescripcion } from '../src/utils/levelsPuntuaciones.js';
import { fetchB2PuntuacionesProgress } from '../src/utils/levelsPuntuacionesProgress.js';
import { isB2PartPassedByPoints } from '../src/utils/levelsB2PartScoring.js';
import { starsFromTheorySessionScore } from '../src/lib/theoryTopicLevels.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = path.join(__dirname, 'generated', 'reviews');
const METADATA_PATH = path.join(__dirname, 'data', 'b2-part4-approved-metadata.json');

const EXAM1_PREGUNTA_ID = '4abc080d-ff9c-4112-b96e-025791d59416';
const EXAM1_EXAMEN_ID = '5bd3e0d7-29a7-4e07-ac15-a4d195528c65';
const PART_NUMBER = 4;

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function fetchLivePart4Rows(admin, examSlot) {
  const metadata = JSON.parse(readFileSync(METADATA_PATH, 'utf8'));
  const itemIds = metadata.items.filter((i) => i.examSlot === examSlot).map((i) => i.supabase.openAnswerRowId);

  const { data, error } = await admin
    .from('levels_respuestas_abiertas')
    .select('id, respuesta_texto, grading_metadata')
    .in('id', itemIds);

  if (error) throw error;
  return data || [];
}

function runPart4GradingSmoke(rows, examLabel) {
  const parsed = parseB2KeyWordAnswerKeyRows(rows);
  const cases = [];

  if (examLabel === 'Exam 1') {
    cases.push(
      { q: 29, answer: 'do not need to use', expected: 2, label: 'E1Q29 full' },
      { q: 29, answer: "don't need", expected: 1, label: 'E1Q29 MP1 only' },
      { q: 29, answer: 'must use', expected: 0, label: 'E1Q29 keyword missing' },
      { q: 29, answer: 'do not need to use a car today', expected: 0, label: 'E1Q29 >5 words' },
      { q: 25, answer: 'hardly anyone finds', expected: 2, label: 'E1Q25 full' },
    );
  }

  if (examLabel === 'Exam 2') {
    cases.push(
      { q: 26, answer: 'is strictly forbidden', expected: 2, label: 'E2Q26 STRICTLY rewrite' },
      { q: 26, answer: 'is strictly', expected: 1, label: 'E2Q26 MP1 only' },
      { q: 26, answer: 'forbidden', expected: 0, label: 'E2Q26 keyword missing' },
    );
  }

  if (examLabel === 'Exam 3') {
    cases.push(
      { q: 29, answer: "wasn't as hard as", expected: 2, label: 'E3Q29 full' },
      { q: 29, answer: 'was not as', expected: 1, label: 'E3Q29 MP1 + partial MP2' },
    );
  }

  const results = cases.map(({ q, answer, expected, label }) => {
    const grade = gradeB2Part4Gap(answer, parsed, q);
    return {
      label,
      questionNumber: q,
      answer,
      expected,
      actual: grade.score,
      ok: grade.score === expected,
      reason: grade.reason,
      mode: parsed.get(q)?.mode ?? 'missing',
    };
  });

  return { results, allOk: results.every((r) => r.ok), metadataMode: [...parsed.values()].every((v) => v.mode === 'metadata') };
}

async function probeScoreSourceColumn(admin) {
  const { error } = await admin.from('levels_puntuaciones').select('score_source').limit(1);
  if (!error) return { exists: true };
  const msg = String(error.message || '');
  if (/score_source/i.test(msg) && /(does not exist|column)/i.test(msg)) return { exists: false };
  return { exists: null, error: msg };
}

async function createSmokeUser(admin) {
  const email = `smoke-b2-v2-${Date.now()}@dralo-smoke.invalid`;
  const password = `Smoke${Date.now()}!Aa1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  return { userId: data.user.id, email, password };
}

async function signIn(anon, email, password) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session.access_token;
}

async function callUpsertApi(baseUrl, token, body) {
  const res = await fetch(`${baseUrl}/api/levels/upsert-part-puntuacion`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, payload };
}

async function readUserPartRows(admin, userId, examenId, parteNumero) {
  const { data, error } = await admin
    .from('levels_puntuaciones')
    .select('*')
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId)
    .eq('parte_numero', parteNumero);
  if (error) throw error;
  return data || [];
}

async function cleanupSmokeUser(admin, userId) {
  await admin.from('levels_puntuaciones').delete().eq('uuid_usuario', userId);
  await admin.auth.admin.deleteUser(userId);
}

function buildPart4ProgressFromGrades(openGrades) {
  const getQuestionKey = (_pid, qn) => `part::q::${qn}`;
  const openNumbers = [25, 26, 27, 28, 29, 30];
  const summary = summarizePart4OpenGrades(openNumbers, openGrades, getQuestionKey, 'part');
  const metrics = computeB2PartScoreMetrics({
    partNumber: PART_NUMBER,
    scoringV2: true,
    openGrades,
    openQuestionNumbers: openNumbers,
    getQuestionKey,
    partId: 'part',
  });
  return computeB2PartProgressFromState({
    partNumber: PART_NUMBER,
    scoringV2: true,
    partScoreMetrics: metrics,
    openSummary: summary,
    complete: true,
  });
}

async function main() {
  const v1Mode = process.argv.includes('--v1');
  loadEnvLocal();
  process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = v1Mode ? 'false' : 'true';

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = process.env.SMOKE_TEST_BASE_URL || 'http://localhost:3000';

  if (!url || !anonKey || !serviceKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const anon = createClient(url, anonKey, { auth: { persistSession: false } });

  mkdirSync(REPORT_DIR, { recursive: true });
  const report = {
    generatedAt: new Date().toISOString(),
    mode: v1Mode ? 'v1-off' : 'v2-on',
    schema: {},
    part4Grading: {},
    persistence: {},
    issues: [],
  };

  // Schema audit
  const scoreSourceProbe = await probeScoreSourceColumn(admin);
  const colQuery = await admin.from('levels_puntuaciones').select('scoring_version, puntos_obtenidos, puntos_maximos').limit(1);
  report.schema = {
    scoreSourceColumnExists: scoreSourceProbe.exists,
    v2ColumnsOk: !colQuery.error,
    uniqueConstraintNote:
      'UNIQUE(uuid_usuario, examen_id, parte_numero, score_source) expected after migration',
  };

  // Part 4 live grading
  for (const [slot, label] of [
    [1, 'Exam 1'],
    [2, 'Exam 2'],
    [3, 'Exam 3'],
  ]) {
    const rows = await fetchLivePart4Rows(admin, slot);
    report.part4Grading[label] = runPart4GradingSmoke(rows, label);
  }

  // Persistence via authenticated API
  let smokeUser = null;
  try {
    smokeUser = await createSmokeUser(admin);
    const token = await signIn(anon, smokeUser.email, smokeUser.password);

    const skillBody = v1Mode
      ? {
          preguntaId: EXAM1_PREGUNTA_ID,
          examenId: EXAM1_EXAMEN_ID,
          parteNumero: PART_NUMBER,
          correctas: 4,
          totalPreguntas: 6,
          scoreSource: LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
          scoringVersion: 1,
        }
      : {
          preguntaId: EXAM1_PREGUNTA_ID,
          examenId: EXAM1_EXAMEN_ID,
          parteNumero: PART_NUMBER,
          correctas: 3,
          totalPreguntas: 6,
          scoreSource: LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
          scoringVersion: 2,
          puntosObtenidos: 8,
          puntosMaximos: 12,
        };

    const skillRes = await callUpsertApi(baseUrl, token, skillBody);
    report.persistence.skillPracticeApi = { request: skillBody, response: skillRes };

    const skillRows = await readUserPartRows(admin, smokeUser.userId, EXAM1_EXAMEN_ID, PART_NUMBER);
    report.persistence.skillPracticeRows = skillRows.map(sanitizeRow);

    if (!v1Mode) {
      const examBody = {
        preguntaId: EXAM1_PREGUNTA_ID,
        examenId: EXAM1_EXAMEN_ID,
        parteNumero: PART_NUMBER,
        correctas: 2,
        totalPreguntas: 6,
        scoreSource: LEVELS_SCORE_SOURCE.EXAM_MODE,
        scoringVersion: 2,
        puntosObtenidos: 6,
        puntosMaximos: 12,
      };
      const examRes = await callUpsertApi(baseUrl, token, examBody);
      report.persistence.examModeApi = { request: examBody, response: examRes };

      const allRows = await readUserPartRows(admin, smokeUser.userId, EXAM1_EXAMEN_ID, PART_NUMBER);
      report.persistence.allRowsAfterExamMode = allRows.map(sanitizeRow);
      const hasSkill = allRows.some((r) => r.score_source === LEVELS_SCORE_SOURCE.SKILL_PRACTICE);
      const hasExam = allRows.some((r) => r.score_source === LEVELS_SCORE_SOURCE.EXAM_MODE);
      report.persistence.separationOk = allRows.length >= 2 && hasSkill && hasExam;

      const { bySlot: skillProgress } = await fetchB2PuntuacionesProgress(anon, {
        userId: smokeUser.userId,
        examenIdBySlot: { 1: EXAM1_EXAMEN_ID },
        partMin: 4,
        partMax: 4,
        scoreSource: LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
      });
      const { bySlot: examProgress } = await fetchB2PuntuacionesProgress(anon, {
        userId: smokeUser.userId,
        examenIdBySlot: { 1: EXAM1_EXAMEN_ID },
        partMin: 4,
        partMax: 4,
        scoreSource: LEVELS_SCORE_SOURCE.EXAM_MODE,
      });
      report.persistence.filteredReads = {
        skillPart4: skillProgress[1]?.parts?.[PART_NUMBER] ?? null,
        examPart4: examProgress[1]?.parts?.[PART_NUMBER] ?? null,
        readsSeparated:
          skillProgress[1]?.parts?.[PART_NUMBER]?.correct === 8 &&
          examProgress[1]?.parts?.[PART_NUMBER]?.correct === 6,
      };

      if (!report.persistence.separationOk) {
        report.issues.push('exam_mode row missing or overwrote skill_practice');
      }
      if (!report.persistence.filteredReads.readsSeparated) {
        report.issues.push('filtered progress reads did not return separate skill vs exam scores');
      }
    }
  } catch (err) {
    report.persistence.error = String(err.message || err);
    report.issues.push(String(err.message || err));
  } finally {
    if (smokeUser?.userId) {
      await cleanupSmokeUser(admin, smokeUser.userId).catch(() => {});
    }
  }

  // Part 4 metrics sanity (V2 ON)
  if (!v1Mode) {
    report.part4Panel = {
      pointsEarned: 8,
      maxPoints: 12,
      questionsAnswered: 6,
      fullyCorrectItems: 2,
      passingThreshold: '8/12 points (cfg.passing=4 items × 2 pts)',
      starsAt8of12: starsFromTheorySessionScore(8, 12),
    };
  }

  const reportPath = path.join(REPORT_DIR, `b2-scoring-v2-e2e-smoke-${ts()}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  const gradingOk = Object.values(report.part4Grading).every((g) => g.allOk && g.metadataMode);
  const skillOk = report.persistence.skillPracticeApi?.response?.ok === true;
  const separationRequired = !v1Mode;
  const separationOk = !separationRequired || report.persistence.separationOk === true;
  const persistOk = skillOk && (v1Mode || report.issues.length === 0 || separationOk);

  console.log(JSON.stringify({ ok: gradingOk && skillOk && separationOk, separationOk, reportPath, report }, null, 2));
  if (!gradingOk || !skillOk || (separationRequired && !separationOk)) process.exit(1);
}

function sanitizeRow(row) {
  const meta = parseUoePartDescripcion(row.descripcion);
  return {
    id: row.id,
    parte_numero: row.parte_numero,
    scoring_version: row.scoring_version,
    puntos_obtenidos: row.puntos_obtenidos,
    puntos_maximos: row.puntos_maximos,
    correctas: row.correctas,
    total_preguntas: row.total_preguntas,
    aprobado: row.aprobado,
    score_source_column: row.score_source ?? null,
    score_source_descripcion: meta?.scoreSource ?? null,
    descripcion_label: String(row.descripcion || '').split('|').slice(1).join('|') || null,
  };
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
