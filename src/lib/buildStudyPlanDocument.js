import {
  STUDY_PLAN_GOALS,
  STUDY_PLAN_SKILLS,
} from '@/data/studyPlanSurveyConfig';

const SKILL_LABELS = Object.fromEntries(STUDY_PLAN_SKILLS.map((s) => [s.id, s.name]));
const GOAL_LABELS = Object.fromEntries(STUDY_PLAN_GOALS.map((g) => [g.id, g.name]));

const CEFR_ORDER = ['A2', 'B1', 'B2', 'C1', 'C2'];

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

function weeksUntil(dateStr) {
  const days = daysUntil(dateStr);
  if (days == null) return null;
  return Math.max(1, Math.ceil(days / 7));
}

function labelList(ids, map) {
  return (ids || []).map((id) => map[id] || id).filter(Boolean);
}

function splitWeeklyHours(hoursPerWeek, weaknesses) {
  const h = Number(hoursPerWeek) || 5;
  const weakCount = Math.max(1, (weaknesses || []).length);
  const focusBoost = Math.min(0.35, weakCount * 0.08);
  const training = Math.round(h * (0.35 + focusBoost) * 10) / 10;
  const levels = Math.round(h * 0.35 * 10) / 10;
  const theory = Math.round((h - training - levels) * 10) / 10;
  return { theory: Math.max(0.5, theory), levels: Math.max(0.5, levels), training: Math.max(0.5, training) };
}

function buildWeeklySchedule(split, weaknesses) {
  const focus = (weaknesses || []).slice(0, 2).map((s) => SKILL_LABELS[s] || s);
  const focusNote = focus.length ? ` Prioriza: ${focus.join(', ')}.` : '';
  return [
    {
      day: 'Lunes – Miércoles',
      tasks: [
        `${split.theory} h/semana en Theory (gramática y vocabulario).`,
        'Repaso corto de errores del día anterior.',
      ],
    },
    {
      day: 'Jueves – Viernes',
      tasks: [
        `${split.levels} h/semana en Levels (simulacros por partes).`,
        '1 bloque de listening o reading según tu debilidad.',
      ],
    },
    {
      day: 'Sábado – Domingo',
      tasks: [
        `${split.training} h/semana en Training (habilidades por nivel).${focusNote}`,
        'Simulacro parcial o repaso de writing/speaking si aplica.',
      ],
    },
  ];
}

function buildMilestones(weeks, placementLevel, examDate) {
  if (!weeks) {
    return [
      { week: 2, title: 'Consolidar nivel asignado', detail: 'Completa al menos 3 sesiones en Levels.' },
      { week: 4, title: 'Subir exigencia en Training', detail: 'Pasa a dificultad intermedia en tu habilidad más débil.' },
    ];
  }
  const milestones = [];
  const mid = Math.max(2, Math.floor(weeks / 2));
  milestones.push({
    week: 2,
    title: 'Primer checkpoint',
    detail: `Mantén ritmo semanal y revisa resultados del placement (${placementLevel || 'tu nivel'}).`,
  });
  if (weeks >= 4) {
    milestones.push({
      week: mid,
      title: 'Mitad del camino',
      detail: 'Haz un simulacro completo en Levels y corrige writing con Dralo AI.',
    });
  }
  milestones.push({
    week: weeks,
    title: examDate ? `Objetivo: examen (${examDate})` : 'Objetivo final',
    detail: 'Semana de repaso ligero, simulacros cronometrados y descanso activo.',
  });
  return milestones;
}

/**
 * Genera el documento del plan de estudios a partir de la encuesta y el placement.
 */
export function buildStudyPlanDocument({
  placementLevel,
  examGoalDate,
  hoursPerWeek,
  studyGoals = [],
  strengths = [],
  weaknesses = [],
  otherNotes = '',
  placementBreakdown = null,
}) {
  const weeks = weeksUntil(examGoalDate);
  const days = daysUntil(examGoalDate);
  const split = splitWeeklyHours(hoursPerWeek, weaknesses);
  const goalLabels = labelList(studyGoals, GOAL_LABELS);
  const strengthLabels = labelList(strengths, SKILL_LABELS);
  const weaknessLabels = labelList(weaknesses, SKILL_LABELS);
  const levelIdx = CEFR_ORDER.indexOf(String(placementLevel || '').toUpperCase());
  const targetHint =
    levelIdx >= 0 && levelIdx < CEFR_ORDER.length - 1
      ? `Tras consolidar ${placementLevel}, plantea avanzar hacia ${CEFR_ORDER[levelIdx + 1]}.`
      : 'Consolida tu nivel actual con práctica regular y simulacros.';

  const sections = [
    {
      id: 'resumen',
      title: 'Tu perfil de aprendizaje',
      paragraphs: [
        `Nivel asignado en el placement test: **${placementLevel || 'pendiente'}**.`,
        goalLabels.length
          ? `Objetivos principales: ${goalLabels.join(' · ')}.`
          : 'Define tus objetivos para afinar el plan en cualquier momento.',
        examGoalDate && days != null
          ? `Fecha objetivo del examen: **${examGoalDate}** (${days} días · ~${weeks} semanas).`
          : 'Añade una fecha de examen para calcular hitos semanales.',
        `Compromiso de estudio: **${hoursPerWeek} h/semana** (~${Math.round((hoursPerWeek / 7) * 10) / 10} h/día de media).`,
      ],
    },
    {
      id: 'fortalezas-debilidades',
      title: 'Fortalezas y áreas de mejora',
      bullets: [
        strengthLabels.length
          ? `Fortalezas: ${strengthLabels.join(', ')}.`
          : 'Fortalezas: aún no indicadas — el plan equilibra todas las habilidades.',
        weaknessLabels.length
          ? `Prioridad de práctica: ${weaknessLabels.join(', ')}.`
          : 'Debilidades: practica de forma rotatoria todas las skills de Cambridge.',
        targetHint,
      ],
    },
    {
      id: 'distribucion',
      title: 'Distribución semanal en Dralo',
      bullets: [
        `Theory: **${split.theory} h** — gramática, vocabulario y teoría alineada con tu nivel.`,
        `Levels: **${split.levels} h** — exámenes por partes y simulacros.`,
        `Training: **${split.training} h** — ejercicios por habilidad y dificultad.`,
      ],
    },
    {
      id: 'cronograma',
      title: 'Cronograma sugerido',
      schedule: buildWeeklySchedule(split, weaknesses),
    },
    {
      id: 'hitos',
      title: 'Hitos hasta tu objetivo',
      milestones: buildMilestones(weeks, placementLevel, examGoalDate),
    },
    {
      id: 'recomendaciones',
      title: 'Recomendaciones Dralo',
      bullets: [
        'Empieza cada sesión con 10 min de Theory y termina con 15 min de la habilidad más débil.',
        'Usa Placement + Levels para medir progreso; Training para volumen de práctica.',
        'Writing y Speaking: aprovecha Dralo AI y simulacros cronometrados.',
        placementBreakdown?.recommended?.cefr
          ? `Tu equivalencia CEFR del placement: ${placementBreakdown.recommended.cefr}.`
          : null,
        otherNotes?.trim() ? `Notas personales: ${otherNotes.trim()}` : null,
      ].filter(Boolean),
    },
  ];

  const summaryLines = [
    `# Plan de estudios Dralo`,
    ``,
    `**Nivel:** ${placementLevel || '—'} · **${hoursPerWeek} h/semana**`,
    examGoalDate ? `**Examen objetivo:** ${examGoalDate}` : '',
    ``,
    `## Objetivos`,
    ...(goalLabels.length ? goalLabels.map((g) => `- ${g}`) : ['- (sin especificar)']),
    ``,
    `## Esta semana`,
    `- Theory: ${split.theory} h`,
    `- Levels: ${split.levels} h`,
    `- Training: ${split.training} h`,
    weaknessLabels.length ? `\n**Enfócate en:** ${weaknessLabels.join(', ')}` : '',
  ].filter((line) => line !== undefined);

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    placementLevel,
    examGoalDate,
    hoursPerWeek,
    studyGoals,
    strengths,
    weaknesses,
    weeksToExam: weeks,
    daysToExam: days,
    weeklySplit: split,
    sections,
    summary: summaryLines.join('\n'),
  };
}

export { SKILL_LABELS, GOAL_LABELS };
