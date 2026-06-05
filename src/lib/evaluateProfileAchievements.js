import { fetchLevelsPracticeData } from '@/lib/fetchLevelsPracticeData';

export function aggregateAchievementStats({
  estadisticas = [],
  puntuaciones = [],
  teoria = [],
  placement = [],
  training = [],
}) {
  const partIds = new Set();
  let levelsAccesos = 0;
  let levelsIntentos = 0;
  let levelsCorrect = 0;
  let levelsEvaluadas = 0;
  let levelsBestPct = 0;
  let levelsLastDate = null;

  for (const row of estadisticas) {
    if (row.parte_id) partIds.add(row.parte_id);
    levelsAccesos += Number(row.accesos) || 0;
    levelsIntentos += Number(row.intentos_completados) || 0;
    levelsCorrect += Number(row.respuestas_correctas) || 0;
    levelsEvaluadas += Number(row.respuestas_evaluadas) || 0;
    const pct = Math.max(
      Number(row.mejor_porcentaje) || 0,
      Number(row.ultimo_porcentaje) || 0,
    );
    if (pct > levelsBestPct) levelsBestPct = Math.round(pct);
    const d = row.ultima_interaccion || row.creado_en;
    if (d && (!levelsLastDate || new Date(d) > new Date(levelsLastDate))) {
      levelsLastDate = d;
    }
  }

  let levelsAprobados = 0;
  let puntuacionesLastDate = null;
  for (const row of puntuaciones) {
    if (row.aprobado === true) levelsAprobados += 1;
    const d = row.created_at;
    if (d && (!puntuacionesLastDate || new Date(d) > new Date(puntuacionesLastDate))) {
      puntuacionesLastDate = d;
    }
  }

  const teoriaPartIds = new Set();
  let theoryAccesos = 0;
  let theoryIntentos = 0;
  let theoryCorrect = 0;
  let theoryEvaluadas = 0;
  let theoryBestPct = 0;
  let theoryLastDate = null;

  for (const row of teoria) {
    if (row.pregunta_id) teoriaPartIds.add(row.pregunta_id);
    theoryAccesos += Number(row.accesos) || 0;
    theoryIntentos += Number(row.intentos_completados) || 0;
    theoryCorrect += Number(row.respuestas_correctas) || 0;
    theoryEvaluadas += Number(row.respuestas_evaluadas) || 0;
    const pct = Math.max(
      Number(row.mejor_porcentaje) || 0,
      Number(row.ultimo_porcentaje) || 0,
    );
    if (pct > theoryBestPct) theoryBestPct = Math.round(pct);
    const d = row.ultima_interaccion || row.creado_en;
    if (d && (!theoryLastDate || new Date(d) > new Date(theoryLastDate))) {
      theoryLastDate = d;
    }
  }

  const placementNiveles = new Set();
  let placementScore = 0;
  let placementLastDate = null;
  for (const row of placement) {
    if (row.nivel_asignado) placementNiveles.add(String(row.nivel_asignado).toUpperCase());
    placementScore += Number(row.score) || 0;
    const d = row.created_at;
    if (d && (!placementLastDate || new Date(d) > new Date(placementLastDate))) {
      placementLastDate = d;
    }
  }

  let trainingHechos = 0;
  let trainingCorrect = 0;
  let trainingLastDate = null;
  for (const row of training) {
    trainingHechos += Number(row.total_hechos) || 0;
    trainingCorrect += Number(row.total_correctos) || 0;
    const d = row.actualizado_en;
    if (d && (!trainingLastDate || new Date(d) > new Date(trainingLastDate))) {
      trainingLastDate = d;
    }
  }

  const trainingAccuracy =
    trainingHechos > 0 ? Math.round((100 * trainingCorrect) / trainingHechos) : 0;

  return {
    levels: {
      accesos: levelsAccesos,
      intentos: levelsIntentos,
      correct: levelsCorrect,
      evaluadas: levelsEvaluadas,
      parts: partIds.size,
      puntuaciones: puntuaciones.length,
      aprobados: levelsAprobados,
      bestPct: levelsBestPct,
      lastDate: levelsLastDate || puntuacionesLastDate,
    },
    theory: {
      rows: teoria.length,
      accesos: theoryAccesos,
      intentos: theoryIntentos,
      correct: theoryCorrect,
      evaluadas: theoryEvaluadas,
      parts: teoriaPartIds.size,
      bestPct: theoryBestPct,
      lastDate: theoryLastDate,
    },
    placement: {
      tests: placement.length,
      score: placementScore,
      niveles: placementNiveles,
      lastDate: placementLastDate,
    },
    training: {
      units: training.length,
      hechos: trainingHechos,
      correct: trainingCorrect,
      accuracy: trainingAccuracy,
      lastDate: trainingLastDate,
    },
  };
}

function checkRule(stats, rule) {
  const l = stats.levels;
  const t = stats.theory;
  const p = stats.placement;
  const tr = stats.training;

  switch (rule.type) {
    case 'levels_accesos':
      return l.accesos >= rule.min;
    case 'levels_intentos':
      return l.intentos >= rule.min;
    case 'levels_correct':
      return l.correct >= rule.min;
    case 'levels_evaluadas':
      return l.evaluadas >= rule.min;
    case 'levels_parts':
      return l.parts >= rule.min;
    case 'levels_puntuaciones':
      return l.puntuaciones >= rule.min;
    case 'levels_aprobados':
      return l.aprobados >= rule.min;
    case 'levels_best_pct':
      return l.bestPct >= rule.min;
    case 'theory_rows':
      return t.rows >= rule.min;
    case 'theory_accesos':
      return t.accesos >= rule.min;
    case 'theory_intentos':
      return t.intentos >= rule.min;
    case 'theory_correct':
      return t.correct >= rule.min;
    case 'theory_evaluadas':
      return t.evaluadas >= rule.min;
    case 'theory_parts':
      return t.parts >= rule.min;
    case 'theory_best_pct':
      return t.bestPct >= rule.min;
    case 'placement_tests':
      return p.tests >= rule.min;
    case 'placement_score':
      return p.score >= rule.min;
    case 'placement_nivel':
      return p.niveles.has(rule.nivel);
    case 'training_units':
      return tr.units >= rule.min;
    case 'training_hechos':
      return tr.hechos >= rule.min;
    case 'training_correct':
      return tr.correct >= rule.min;
    case 'training_accuracy':
      return tr.accuracy >= rule.min;
    default:
      return false;
  }
}

function earnedDateForRule(stats, rule) {
  if (rule.type.startsWith('levels')) return stats.levels.lastDate;
  if (rule.type.startsWith('theory')) return stats.theory.lastDate;
  if (rule.type.startsWith('placement')) return stats.placement.lastDate;
  if (rule.type.startsWith('training')) return stats.training.lastDate;
  return null;
}

export function evaluateAchievementPages(pages, stats) {
  return pages.map((page) => ({
    ...page,
    badges: page.badges.map((badge) => {
      const earned = checkRule(stats, badge.rule);
      const earnedAt = earned ? earnedDateForRule(stats, badge.rule) : null;
      return {
        ...badge,
        earned,
        earnedAt,
        earnedDate: earnedAt
          ? new Date(earnedAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : null,
      };
    }),
  }));
}

export async function fetchAchievementStats(supabase, userId) {
  if (!userId) {
    return aggregateAchievementStats({});
  }

  const levelsData = await fetchLevelsPracticeData(supabase, userId);

  const [teoriaRes, placementRes, trainingRes] = await Promise.all([
    supabase
      .from('levels_teoria_estadisticas')
      .select(
        'pregunta_id, accesos, intentos_completados, respuestas_evaluadas, respuestas_correctas, mejor_porcentaje, ultimo_porcentaje, ultima_interaccion, creado_en',
      )
      .eq('usuario_id', userId),
    supabase
      .from('placement_results')
      .select('nivel_asignado, score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('training_estadisticas_usuario')
      .select('total_hechos, total_correctos, actualizado_en')
      .eq('user_id', userId),
  ]);

  return aggregateAchievementStats({
    estadisticas: levelsData.estadisticas,
    puntuaciones: levelsData.puntuaciones,
    teoria: teoriaRes.error?.code === '42P01' ? [] : teoriaRes.data || [],
    placement: placementRes.error?.code === '42P01' ? [] : placementRes.data || [],
    training: trainingRes.error?.code === '42P01' ? [] : trainingRes.data || [],
  });
}
