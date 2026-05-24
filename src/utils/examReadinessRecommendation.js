/**
 * Recomendación orientativa sobre cuándo presentarse al examen Cambridge.
 * @param {object} params
 * @param {string} [params.levelEstimate] — A2, B1, B2, C1…
 * @param {number} [params.completedExams]
 * @param {number} [params.studyStreak]
 * @param {number} [params.totalStudyMinutes]
 */
export function getExamReadinessRecommendation({
  levelEstimate = 'B1',
  completedExams = 0,
  studyStreak = 0,
  totalStudyMinutes = 0,
} = {}) {
  const level = String(levelEstimate || 'B1').toUpperCase();
  const studyHours = Math.floor(Number(totalStudyMinutes) / 60);

  const prepMonthsByLevel = {
    A2: { minimum: 2, recommended: 4 },
    B1: { minimum: 3, recommended: 6 },
    B2: { minimum: 2, recommended: 4 },
    C1: { minimum: 3, recommended: 6 },
    C2: { minimum: 4, recommended: 8 },
  };

  const prep = prepMonthsByLevel[level] || prepMonthsByLevel.B1;

  let readiness = 'preparing';
  let readinessLabel = 'Sigue preparándote';
  let suggestedWindow = `En unos ${prep.recommended} meses`;
  let headline =
    'Todavía conviene consolidar bases antes de reservar plaza. Prioriza práctica regular y simulacros completos.';

  const activeLearner = studyStreak >= 5 || completedExams >= 2 || studyHours >= 10;

  if (activeLearner && (completedExams >= 5 || studyStreak >= 14) && studyHours >= 20) {
    readiness = 'ready';
    readinessLabel = 'Buen momento para inscribirte';
    suggestedWindow = 'Próxima convocatoria disponible (junio, agosto o diciembre)';
    headline =
      'Tu constancia y práctica indican que puedes plantearte la próxima convocatoria. Revisa fechas en tu ciudad y reserva con antelación (suelen cerrarse plazas 4–6 semanas antes).';
  } else if (activeLearner && (completedExams >= 2 || studyStreak >= 7)) {
    readiness = 'almost';
    readinessLabel = 'Casi listo/a';
    suggestedWindow = `En ${Math.max(prep.minimum, 2)}–${prep.recommended} meses`;
    headline =
      'Vas por buen camino. Completa al menos un simulacro por habilidad y revisa Writing/Speaking con feedback antes de fijar la fecha.';
  } else {
    suggestedWindow = `En ${prep.recommended} meses (mínimo ${prep.minimum})`;
  }

  const tips = [
    'Reserva la fecha solo cuando hayas hecho simulacros completos del nivel objetivo.',
    'Las convocatorias en papel (junio, agosto, diciembre) suelen agotarse antes — inscríbete pronto si ya te sientes preparado/a.',
    'La modalidad computer-based ofrece más fechas; consulta el centro de tu ciudad.',
    `Objetivo sugerido según tu nivel estimado (${level}): ${prep.recommended} meses de preparación constante.`,
  ];

  return {
    level,
    readiness,
    readinessLabel,
    suggestedWindow,
    headline,
    tips,
    prepMonthsRecommended: prep.recommended,
  };
}
