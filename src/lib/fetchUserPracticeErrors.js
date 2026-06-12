import { getLevelExamModules } from '@/data/b2ExamModuleNav';
import { skillFromPartNumber } from '@/lib/examStatisticsFromLevels';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { parseTheoryExerciseDescripcion } from '@/lib/theoryExerciseMeta';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { SECTIONS } from '@/data/teoriaSections';

export const PRACTICE_ERROR_THRESHOLD = 50;

const SKILL_FOLDERS = {
  reading: 'reading-and-use-of-english',
  writing: 'writing',
  listening: 'listening',
  speaking: 'speaking',
};

function normalizeLevelSlug(value) {
  const m = String(value || '')
    .trim()
    .toLowerCase()
    .match(/\b(a2|b1|b2|c1|c2)\b/);
  return m ? m[1] : null;
}

function parseExamSlotFromName(name) {
  const m = String(name || '').match(/examen\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

function skillFolderForPart(levelSlug, parteNumero) {
  const slug = levelSlug || 'b2';
  const n = Number(parteNumero);
  if (!n) return 'reading-and-use-of-english';

  if (slug === 'b2' && n >= 1 && n <= 7) return 'reading-and-use-of-english';
  if ((slug === 'c1' || slug === 'c2') && n >= 1 && n <= 4) return 'reading-and-use-of-english';
  if ((slug === 'c1' || slug === 'c2') && n >= 5) return 'reading-and-use-of-english';

  const skill = skillFromPartNumber(n, slug);
  return SKILL_FOLDERS[skill] || 'reading-and-use-of-english';
}

export function buildExamPracticeHref({ levelSlug, parteNumero, examSlot }) {
  const slug = normalizeLevelSlug(levelSlug) || 'b2';
  const part = Number(parteNumero) || 1;
  const slot = Number(examSlot) || 1;
  const modules = getLevelExamModules(slug);
  const module = modules.find((m) => part >= m.partMin && part <= m.partMax);
  if (!module?.href) {
    return `/niveles/${slug}`;
  }
  const params = new URLSearchParams();
  params.set('examen', String(slot));
  params.set('part', String(part));
  return `${module.href}?${params.toString()}`;
}

function findTopicTitle(topicHref) {
  const canonical = normalizeTopicHref(topicHref);
  for (const topics of Object.values(SECTIONS)) {
    const topic = topics.find((t) => normalizeTopicHref(t.href) === canonical);
    if (topic) return topic.text || topic.title || canonical;
  }
  return canonical.split('/').pop()?.replace(/-/g, ' ') || 'Theory exercise';
}

function theoryCategoryFromHref(topicHref) {
  const apartado = findTheoryApartadoForTopicHref(topicHref);
  if (apartado) return apartado;
  const canonical = normalizeTopicHref(topicHref);
  for (const [section, topics] of Object.entries(SECTIONS)) {
    if (topics.some((t) => normalizeTopicHref(t.href) === canonical)) return section;
  }
  return 'Grammar';
}

function formatSkillLabel(skill) {
  if (!skill) return 'Exam practice';
  const map = {
    reading: 'Reading',
    writing: 'Writing',
    listening: 'Listening',
    speaking: 'Speaking',
  };
  return map[skill] || 'Use of English';
}

function excerptEnunciado(enunciado, max = 160) {
  const raw = String(enunciado || '').trim();
  if (!raw) return '';
  if (raw.startsWith('{')) {
    try {
      const data = JSON.parse(raw);
      const text =
        data.passage ||
        data.title ||
        data.directions ||
        data.instructions ||
        data.taskTitle ||
        '';
      const s = String(text).trim();
      return s.length > max ? `${s.slice(0, max)}…` : s;
    } catch {
      /* fall through */
    }
  }
  return raw.length > max ? `${raw.slice(0, max)}…` : raw;
}

function parseItemDescripcion(descripcion) {
  const raw = String(descripcion || '').trim();
  if (!raw) return { label: '', userAnswer: '' };
  const parts = raw.split(' · ');
  if (parts.length >= 2) {
    return { label: parts[0], userAnswer: parts.slice(1).join(' · ') };
  }
  if (raw.startsWith('uoe_meta:') || raw.startsWith('theory_exercise_meta:')) {
    return { label: '', userAnswer: '' };
  }
  return { label: '', userAnswer: raw };
}

function normalizeExamRow(row, ctx = {}) {
  const meta = parseUoePartDescripcion(row.descripcion);
  const parteNumero = Number(row.parte_numero) || meta?.parteNumero || null;
  const examenId = row.examen_id || meta?.examenId || null;
  const levelSlug = ctx.levelSlug || 'b2';
  const examName = examenId ? ctx.examNames?.[examenId] : null;
  const examSlot = parseExamSlotFromName(examName);
  const partName =
    parteNumero && ctx.partNames?.[parteNumero]
      ? ctx.partNames[parteNumero]
      : parteNumero
        ? `Part ${parteNumero}`
        : null;
  const skill = parteNumero ? skillFromPartNumber(parteNumero, levelSlug) : 'reading';
  const itemMeta = parseItemDescripcion(row.descripcion);
  const isPartScore = Boolean(parteNumero && (row.correctas != null || meta));

  let title = partName || 'Exam question';
  let subtitle = examName || 'Exam practice';
  let userAttempt = itemMeta.userAnswer;
  let contextText = '';

  if (isPartScore) {
    const correctas = Number(row.correctas ?? meta?.correctas) || 0;
    const total = Number(row.total_preguntas ?? meta?.total) || 0;
    title = partName || `Part ${parteNumero}`;
    subtitle = [examName, formatSkillLabel(skill)].filter(Boolean).join(' · ');
    userAttempt = `${correctas}/${total} correct answers`;
    contextText = row.aprobado === false || meta?.aprobado === false ? 'Part not passed' : 'Low score';
  } else {
    const pq = ctx.preguntaById?.[row.id_pregunta];
    contextText = excerptEnunciado(pq?.enunciado);
    if (itemMeta.label) title = itemMeta.label;
    subtitle = [examName, partName].filter(Boolean).join(' · ') || 'Exam practice';
  }

  return {
    id: `exam-${row.id}`,
    source: 'Exam practice',
    sourceKey: 'exam',
    category: formatSkillLabel(skill),
    categoryKey: skill || 'reading',
    level: levelSlug?.toUpperCase() || 'B2',
    score: Math.round(Number(row.puntuacion) || 0),
    title,
    subtitle,
    userAttempt,
    contextText,
    createdAt: row.created_at,
    practiceHref: parteNumero
      ? buildExamPracticeHref({ levelSlug, parteNumero, examSlot })
      : `/niveles/${levelSlug}`,
    table: 'levels_puntuaciones',
    rawId: row.id,
    preguntaId: row.id_pregunta || null,
    parteNumero,
    levelSlug,
  };
}

function normalizeTheoryRow(row, ctx = {}) {
  let meta = parseTheoryExerciseDescripcion(row.descripcion);
  if (!meta && row.id_pregunta) {
    meta = ctx.teoriaPreguntaMeta?.[row.id_pregunta] || null;
  }
  if (!meta) return null;

  const topicHref = normalizeTopicHref(meta.topicHref);
  const topicTitle = findTopicTitle(topicHref);
  const category = theoryCategoryFromHref(topicHref);
  const level = String(meta.cefrLevel || 'B2').toUpperCase();
  const partNum = String(meta.exerciseKey || '').match(/-(\d+)$/)?.[1];

  return {
    id: `theory-${row.id}`,
    source: 'Theory',
    sourceKey: 'theory',
    category,
    categoryKey: category.toLowerCase(),
    level,
    score: Math.round(Number(row.puntuacion) || 0),
    title: topicTitle,
    subtitle: partNum ? `Exercise ${partNum} · ${level}` : `${level} theory`,
    userAttempt: 'Incorrect attempt',
    contextText: '',
    createdAt: row.created_at,
    practiceHref: topicHref,
    table: 'levels_teoria_puntuaciones',
    rawId: row.id,
    topicHref,
    exerciseKey: meta.exerciseKey || null,
    preguntaId: row.id_pregunta || null,
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {string} userId
 */
export async function fetchUserPracticeErrors(db, userId) {
  if (!userId) return { ok: false, data: [], error: 'Missing user id.' };

  const selectCols =
    'id, id_pregunta, puntuacion, descripcion, created_at, examen_id, parte_numero, correctas, total_preguntas, aprobado';

  const [examRes, theoryRes] = await Promise.all([
    db
      .from('levels_puntuaciones')
      .select(selectCols)
      .eq('uuid_usuario', userId)
      .lt('puntuacion', PRACTICE_ERROR_THRESHOLD)
      .order('created_at', { ascending: false })
      .limit(300),
    db
      .from('levels_teoria_puntuaciones')
      .select(selectCols)
      .eq('uuid_usuario', userId)
      .lt('puntuacion', PRACTICE_ERROR_THRESHOLD)
      .order('created_at', { ascending: false })
      .limit(300),
  ]);

  if (examRes.error && examRes.error.code !== '42P01') {
    return { ok: false, data: [], error: examRes.error.message };
  }
  if (theoryRes.error && theoryRes.error.code !== '42P01') {
    return { ok: false, data: [], error: theoryRes.error.message };
  }

  const examRows = examRes.data || [];
  const theoryRows = theoryRes.data || [];

  const preguntaIds = [...new Set(examRows.map((r) => r.id_pregunta).filter(Boolean))];
  const examIds = [...new Set(examRows.map((r) => r.examen_id).filter(Boolean))];
  const teoriaPreguntaIds = [...new Set(theoryRows.map((r) => r.id_pregunta).filter(Boolean))];

  const [preguntasRes, examsRes, teoriaPregRes, partesRes] = await Promise.all([
    preguntaIds.length
      ? db
          .from('levels_preguntas')
          .select('id, enunciado, level_id, parte_id, examen_id')
          .in('id', preguntaIds)
      : Promise.resolve({ data: [] }),
    examIds.length
      ? db.from('levels_examenes').select('id, nombre').in('id', examIds)
      : Promise.resolve({ data: [] }),
    teoriaPreguntaIds.length
      ? db
          .from('levels_teoria_preguntas')
          .select('id, pregunta, descripcion')
          .in('id', teoriaPreguntaIds)
      : Promise.resolve({ data: [] }),
    db.from('levels_partes').select('id, nombre_parte'),
  ]);

  const levelIds = [...new Set((preguntasRes.data || []).map((p) => p.level_id).filter(Boolean))];
  const levelsRes = levelIds.length
    ? await db.from('levels').select('id, nombre').in('id', levelIds)
    : { data: [] };

  const levelById = {};
  (levelsRes.data || []).forEach((l) => {
    levelById[l.id] = normalizeLevelSlug(l.nombre) || 'b2';
  });

  const preguntaById = {};
  (preguntasRes.data || []).forEach((p) => {
    preguntaById[p.id] = { ...p, levelSlug: levelById[p.level_id] || 'b2' };
  });

  const examNames = {};
  (examsRes.data || []).forEach((e) => {
    examNames[e.id] = e.nombre || 'Exam';
  });

  const partNames = {};
  (partesRes.data || []).forEach((p) => {
    const match = String(p.nombre_parte || '').match(/(\d+)/);
    if (match) partNames[Number(match[1])] = formatLevelsPartDisplayName(p.nombre_parte);
  });

  const teoriaPreguntaMeta = {};
  (teoriaPregRes.data || []).forEach((pq) => {
    const parts = String(pq.descripcion || '').split(' · ');
    const href = parts[0] ? normalizeTopicHref(parts[0]) : null;
    const cefrLevel = parts[1] || 'B2';
    if (href && pq.pregunta) {
      teoriaPreguntaMeta[pq.id] = {
        topicHref: href,
        exerciseKey: pq.pregunta,
        cefrLevel,
      };
    }
  });

  const normalized = [];

  for (const row of examRows) {
    const pq = preguntaById[row.id_pregunta];
    const levelSlug =
      normalizeLevelSlug(examNames[row.examen_id]) ||
      pq?.levelSlug ||
      'b2';
    normalized.push(
      normalizeExamRow(row, {
        levelSlug,
        examNames,
        partNames,
        preguntaById,
      }),
    );
  }

  for (const row of theoryRows) {
    const item = normalizeTheoryRow(row, { teoriaPreguntaMeta });
    if (item) normalized.push(item);
  }

  normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return { ok: true, data: normalized, error: null };
}

export function summarizePracticeErrors(errors = []) {
  const list = Array.isArray(errors) ? errors : [];
  return {
    total: list.length,
    exam: list.filter((e) => e.sourceKey === 'exam').length,
    theory: list.filter((e) => e.sourceKey === 'theory').length,
  };
}
