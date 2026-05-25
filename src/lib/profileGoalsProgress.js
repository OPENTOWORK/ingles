import { fetchLevelsPracticeData } from '@/lib/fetchLevelsPracticeData';

export const DEFAULT_PROFILE_GOALS = {
  weeklyDays: 4,
  weeklyMinutes: 90,
  weeklyParts: 5,
  monthlyTheoryCorrect: 15,
  monthlyPlacementTests: 1,
  monthlyTrainingDone: 30,
};

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function normalizeStoredGoals(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PROFILE_GOALS };
  if (raw.weekly != null && raw.monthly != null && raw.weeklyDays == null) {
    return {
      ...DEFAULT_PROFILE_GOALS,
      weeklyParts: Number(raw.weekly) || DEFAULT_PROFILE_GOALS.weeklyParts,
    };
  }
  return {
    weeklyDays: Number(raw.weeklyDays) || DEFAULT_PROFILE_GOALS.weeklyDays,
    weeklyMinutes: Number(raw.weeklyMinutes) || DEFAULT_PROFILE_GOALS.weeklyMinutes,
    weeklyParts: Number(raw.weeklyParts) || DEFAULT_PROFILE_GOALS.weeklyParts,
    monthlyTheoryCorrect:
      Number(raw.monthlyTheoryCorrect) || DEFAULT_PROFILE_GOALS.monthlyTheoryCorrect,
    monthlyPlacementTests:
      Number(raw.monthlyPlacementTests) || DEFAULT_PROFILE_GOALS.monthlyPlacementTests,
    monthlyTrainingDone:
      Number(raw.monthlyTrainingDone) || DEFAULT_PROFILE_GOALS.monthlyTrainingDone,
  };
}

export function computeGoalsProgressFromData({
  activityRows = [],
  puntuaciones = [],
  teoria = [],
  placement = [],
  training = [],
}) {
  const weekStart = toDateKey(daysAgo(6));
  const monthStart = toDateKey(daysAgo(29));
  const today = toDateKey(new Date());

  let weekDays = 0;
  let weekMinutes = 0;

  for (const row of activityRows) {
    const key = String(row.activity_date || '').slice(0, 10);
    const mins = Number(row.study_minutes) || 0;
    if (!key || mins <= 0) continue;
    if (key >= weekStart && key <= today) {
      weekDays += 1;
      weekMinutes += mins;
    }
  }

  let weekParts = 0;
  for (const row of puntuaciones) {
    const d = row.created_at ? toDateKey(new Date(row.created_at)) : null;
    if (!d || d > today || d < weekStart) continue;
    weekParts += 1;
  }

  let monthTheoryCorrect = 0;
  for (const row of teoria) {
    const d = row.ultima_interaccion
      ? toDateKey(new Date(row.ultima_interaccion))
      : row.creado_en
        ? toDateKey(new Date(row.creado_en))
        : null;
    if (!d || d > today || d < monthStart) continue;
    monthTheoryCorrect += Number(row.respuestas_correctas) || 0;
  }

  let monthPlacementTests = 0;
  for (const row of placement) {
    const d = row.created_at ? toDateKey(new Date(row.created_at)) : null;
    if (!d || d > today || d < monthStart) continue;
    monthPlacementTests += 1;
  }

  let monthTrainingDone = 0;
  for (const row of training) {
    const d = row.actualizado_en ? toDateKey(new Date(row.actualizado_en)) : null;
    if (d && (d < monthStart || d > today)) continue;
    monthTrainingDone += Number(row.total_hechos) || 0;
  }

  return {
    weekDays,
    weekMinutes,
    weekParts,
    monthTheoryCorrect,
    monthPlacementTests,
    monthTrainingDone,
  };
}

export async function fetchProfileGoalsProgress(supabase, userId) {
  if (!userId) {
    return computeGoalsProgressFromData({});
  }

  const monthStartIso = daysAgo(29).toISOString().slice(0, 10);
  const levelsData = await fetchLevelsPracticeData(supabase, userId);

  const [actRes, teoriaRes, placementRes, trainingRes] = await Promise.all([
    supabase
      .from('perfil_actividad')
      .select('activity_date, study_minutes')
      .eq('user_id', userId)
      .gte('activity_date', monthStartIso),
    supabase
      .from('levels_teoria_estadisticas')
      .select('respuestas_correctas, ultima_interaccion, creado_en')
      .eq('usuario_id', userId),
    supabase
      .from('placement_results')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', `${monthStartIso}T00:00:00`),
    supabase
      .from('training_estadisticas_usuario')
      .select('total_hechos, actualizado_en')
      .eq('user_id', userId),
  ]);

  const activityRows = actRes.error?.code === '42P01' ? [] : actRes.data || [];

  return computeGoalsProgressFromData({
    activityRows,
    puntuaciones: levelsData.puntuaciones,
    teoria: teoriaRes.error?.code === '42P01' ? [] : teoriaRes.data || [],
    placement: placementRes.error?.code === '42P01' ? [] : placementRes.data || [],
    training: trainingRes.error?.code === '42P01' ? [] : trainingRes.data || [],
  });
}

export const GOAL_ITEMS = [
  {
    id: 'weeklyDays',
    title: 'Días activos',
    period: 'Esta semana',
    icon: '🔥',
    unit: 'días',
    progressKey: 'weekDays',
    targetKey: 'weeklyDays',
    hint: 'Días con estudio en perfil_actividad.',
    min: 1,
    max: 7,
  },
  {
    id: 'weeklyMinutes',
    title: 'Tiempo de estudio',
    period: 'Esta semana',
    icon: '⏱️',
    unit: 'min',
    progressKey: 'weekMinutes',
    targetKey: 'weeklyMinutes',
    hint: 'Minutos de estudio esta semana.',
    min: 15,
    max: 600,
    step: 15,
  },
  {
    id: 'weeklyParts',
    title: 'Levels · Partes',
    period: 'Esta semana',
    icon: '📝',
    unit: 'partes',
    progressKey: 'weekParts',
    targetKey: 'weeklyParts',
    hint: 'Partes guardadas en levels_puntuaciones.',
    min: 1,
    max: 50,
  },
  {
    id: 'monthlyTheory',
    title: 'Theory · Aciertos',
    period: 'Este mes',
    icon: '🧠',
    unit: 'aciertos',
    progressKey: 'monthTheoryCorrect',
    targetKey: 'monthlyTheoryCorrect',
    hint: 'Respuestas correctas en levels_teoria_estadisticas.',
    min: 5,
    max: 500,
    step: 5,
  },
  {
    id: 'monthlyPlacement',
    title: 'Placement test',
    period: 'Este mes',
    icon: '🎓',
    unit: 'tests',
    progressKey: 'monthPlacementTests',
    targetKey: 'monthlyPlacementTests',
    hint: 'Tests completados en placement_results.',
    min: 1,
    max: 10,
  },
  {
    id: 'monthlyTraining',
    title: 'Training · Ejercicios',
    period: 'Este mes',
    icon: '💪',
    unit: 'ejercicios',
    progressKey: 'monthTrainingDone',
    targetKey: 'monthlyTrainingDone',
    hint: 'Ejercicios hechos en training_estadisticas_usuario.',
    min: 10,
    max: 500,
    step: 10,
  },
];

export function evaluateGoalItem(progress, target, current) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const done = current >= target;
  const over = current > target;
  return { current, target, pct, done, over };
}
