import {
  aggregateSessionsByDay,
  computeActivitySummary,
  rowsToActivityMap,
} from '@/lib/perfilActividad';

/** Tablas conocidas; añade aquí nuevas *estadisticas* si el RPC no está disponible. */
export const ESTADISTICAS_TABLES = [
  { table: 'levels_estadisticas', userCol: 'usuario_id', isTraining: false },
  { table: 'levels_teoria_estadisticas', userCol: 'usuario_id', isTraining: false },
  { table: 'training_estadisticas_usuario', userCol: 'user_id', isTraining: true },
];

const COMPLETED_FIELDS = [
  'intentos_completados',
  'ejercicios_completados',
  'total_hechos',
  'accesos',
];
const CORRECT_FIELDS = ['respuestas_correctas', 'total_correctos'];
const TIME_SEC_FIELDS = ['tiempo_segundos_total', 'tiempo_promedio_segundos'];
const TIME_MIN_FIELDS = ['tiempo_total'];
const PCT_FIELDS = ['mejor_porcentaje', 'ultimo_porcentaje', 'puntuacion_promedio'];

function sumFields(row, fields) {
  return fields.reduce((acc, key) => acc + (Number(row[key]) || 0), 0);
}

function rowAvgPct(row) {
  const vals = PCT_FIELDS.map((k) => Number(row[k])).filter((v) => v > 0);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function estimateLevel(avgPct, sumCompleted) {
  if (avgPct > 0) {
    if (avgPct >= 85) return 'C1';
    if (avgPct >= 70) return 'B2';
    if (avgPct >= 55) return 'B1';
    if (avgPct >= 40) return 'A2';
    return 'A1';
  }
  if (sumCompleted > 50) return 'B2';
  if (sumCompleted > 10) return 'A2';
  return 'A2';
}

function aggregateTableRows(rows, isTraining) {
  let completed = 0;
  let correct = 0;
  let timeSec = 0;
  let pctSum = 0;
  let pctCount = 0;

  for (const row of rows) {
    completed += sumFields(row, COMPLETED_FIELDS);
    correct += sumFields(row, CORRECT_FIELDS);
    timeSec += sumFields(row, TIME_SEC_FIELDS);
    timeSec += sumFields(row, TIME_MIN_FIELDS) * 60;
    const pct = rowAvgPct(row);
    if (pct > 0) {
      pctSum += pct;
      pctCount += 1;
    }
  }

  const sessions = isTraining ? rows.length : completed;
  const avgPercent = pctCount > 0 ? Math.round((pctSum / pctCount) * 10) / 10 : 0;

  return {
    rows: rows.length,
    completed,
    correct,
    timeSeconds: timeSec,
    sessions,
    avgPercent,
    pctSum,
    pctCount,
  };
}

/** Agregación vía Supabase client + RLS (sin service role). */
export async function aggregateEstadisticasFromTables(db, userId) {
  const byTable = [];
  let sumCompleted = 0;
  let sumCorrect = 0;
  let sumSessions = 0;
  let sumTimeSec = 0;
  let pctSum = 0;
  let pctCount = 0;

  for (const { table, userCol, isTraining } of ESTADISTICAS_TABLES) {
    const { data: rows, error } = await db.from(table).select('*').eq(userCol, userId);

    if (error?.code === '42P01') continue;
    if (error) {
      console.warn(`[estadisticas] ${table}`, error.message || error);
      continue;
    }

    const agg = aggregateTableRows(rows || [], isTraining);
    sumCompleted += agg.completed;
    sumCorrect += agg.correct;
    sumSessions += agg.sessions;
    sumTimeSec += agg.timeSeconds;
    if (agg.pctCount > 0) {
      pctSum += agg.pctSum;
      pctCount += agg.pctCount;
    }

    byTable.push({
      table,
      rows: agg.rows,
      completed: agg.completed,
      correct: agg.correct,
      timeSeconds: agg.timeSeconds,
      avgPercent: agg.avgPercent,
    });
  }

  const avgPct = pctCount > 0 ? pctSum / pctCount : 0;

  return {
    summary: {
      completedExams: sumCompleted,
      totalCorrect: sumCorrect,
      trainingCount: sumSessions,
      levelEstimate: estimateLevel(avgPct, sumCompleted),
      totalStudyTimeSeconds: sumTimeSec,
      tablesCount: byTable.length,
    },
    byTable,
  };
}

export async function loadEstadisticasGenerales(db, userId) {
  const { data, error } = await db.rpc('perfil_estadisticas_generales', {
    p_user_id: userId,
  });

  if (!error && data) return data;

  if (error && error.code !== '42883') {
    console.warn('[estadisticas] rpc', error.message || error);
  }

  return aggregateEstadisticasFromTables(db, userId);
}

/** Combina RPC de tablas *estadisticas* con racha/tiempo de perfil_actividad. */
export function mergeGeneralStatsPayload(rpcPayload, activitySummary) {
  const summary = rpcPayload?.summary || {};
  const streak = activitySummary?.streak ?? 0;
  const totalMinutes =
    activitySummary?.last90Minutes > 0
      ? activitySummary.last90Minutes
      : Math.round((Number(summary.totalStudyTimeSeconds) || 0) / 60);

  return {
    summary: {
      completedExams: Number(summary.completedExams) || 0,
      totalCorrect: Number(summary.totalCorrect) || 0,
      trainingCount: Number(summary.trainingCount) || 0,
      levelEstimate: summary.levelEstimate || 'A2',
      studyStreak: streak,
      totalStudyMinutes: totalMinutes,
      tablesCount: Number(summary.tablesCount) || 0,
    },
    byTable: Array.isArray(rpcPayload?.byTable) ? rpcPayload.byTable : [],
    sources: {
      estadisticasTables: true,
      perfilActividad: Boolean(activitySummary),
    },
  };
}

export async function loadPerfilActividadSummary(db, userId) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 400);

  const { data: rows, error } = await db
    .from('perfil_actividad')
    .select('activity_date, study_minutes, sessions_count')
    .eq('user_id', userId)
    .gte('activity_date', since.toISOString().slice(0, 10));

  if (error?.code === '42P01') return null;
  if (error) throw error;

  const map = rowsToActivityMap(rows || []);
  if (map.size < 3) {
    const { data: sessions } = await db
      .from('usuario_sesiones_app')
      .select('started_at, duration_seconds')
      .eq('user_id', userId)
      .gte('started_at', since.toISOString());
    if (sessions?.length) {
      return computeActivitySummary(aggregateSessionsByDay(sessions));
    }
  }
  return computeActivitySummary(map);
}
