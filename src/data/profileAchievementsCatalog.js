/**
 * 11 páginas × 25 logros = 275 badges.
 * Categorías: levels, theory, placement, training.
 */

const ICONS = {
  levels: ['📚', '📝', '🎯', '📖', '✅', '🏆', '⭐', '🔥', '📊', '🎓'],
  theory: ['🧠', '💡', '📘', '🔬', '📐', '✨', '🌟', '📗', '🔍', '🧩'],
  placement: ['🎓', '🧭', '📊', '🏅', '🎯', '⭐', '🚀', '💎', '🏆', '✔️'],
  training: ['💪', '🛠️', '⚡', '🥇', '🔧', '📈', '🎮', '💯', '🌱', '🔥'],
};

const PAGE_META = [
  { title: 'Levels · Primeros pasos', category: 'levels', ruleFamily: 'levels_base' },
  { title: 'Levels · Reading & UoE', category: 'levels', ruleFamily: 'levels_reading' },
  { title: 'Levels · Writing', category: 'levels', ruleFamily: 'levels_writing' },
  { title: 'Levels · Listening', category: 'levels', ruleFamily: 'levels_listening' },
  { title: 'Levels · Speaking & exámenes', category: 'levels', ruleFamily: 'levels_exams' },
  { title: 'Theory · Fundamentos', category: 'theory', ruleFamily: 'theory_base' },
  { title: 'Theory · Dominio', category: 'theory', ruleFamily: 'theory_mastery' },
  { title: 'Placement · Test de nivel', category: 'placement', ruleFamily: 'placement_base' },
  { title: 'Placement · Niveles CEFR', category: 'placement', ruleFamily: 'placement_cefr' },
  { title: 'Training · Unidades', category: 'training', ruleFamily: 'training_base' },
  { title: 'Training · Maestría', category: 'training', ruleFamily: 'training_mastery' },
];

function ruleLevelsBase(i) {
  const n = i + 1;
  const rules = [
    { type: 'levels_accesos', min: 1 },
    { type: 'levels_accesos', min: 3 },
    { type: 'levels_accesos', min: 5 },
    { type: 'levels_intentos', min: 1 },
    { type: 'levels_intentos', min: 5 },
    { type: 'levels_intentos', min: 10 },
    { type: 'levels_intentos', min: 20 },
    { type: 'levels_intentos', min: 35 },
    { type: 'levels_intentos', min: 50 },
    { type: 'levels_correct', min: 5 },
    { type: 'levels_correct', min: 15 },
    { type: 'levels_correct', min: 30 },
    { type: 'levels_correct', min: 50 },
    { type: 'levels_correct', min: 75 },
    { type: 'levels_correct', min: 100 },
    { type: 'levels_parts', min: 1 },
    { type: 'levels_parts', min: 3 },
    { type: 'levels_parts', min: 5 },
    { type: 'levels_parts', min: 8 },
    { type: 'levels_parts', min: 12 },
    { type: 'levels_evaluadas', min: 10 },
    { type: 'levels_evaluadas', min: 25 },
    { type: 'levels_evaluadas', min: 50 },
    { type: 'levels_best_pct', min: 50 },
    { type: 'levels_best_pct', min: 70 },
  ];
  return rules[i] || { type: 'levels_intentos', min: n * 5 };
}

function ruleLevelsReading(i) {
  const min = (i + 1) * 2;
  return i % 3 === 0
    ? { type: 'levels_intentos', min }
    : i % 3 === 1
      ? { type: 'levels_correct', min: min * 2 }
      : { type: 'levels_best_pct', min: 40 + i * 2 };
}

function ruleLevelsWriting(i) {
  return { type: 'levels_intentos', min: (i + 1) * 3 };
}

function ruleLevelsListening(i) {
  return i % 2 === 0
    ? { type: 'levels_correct', min: (i + 1) * 4 }
    : { type: 'levels_parts', min: Math.min(17, 3 + i) };
}

function ruleLevelsExams(i) {
  const rules = [
    { type: 'levels_puntuaciones', min: 1 },
    { type: 'levels_puntuaciones', min: 3 },
    { type: 'levels_puntuaciones', min: 5 },
    { type: 'levels_puntuaciones', min: 10 },
    { type: 'levels_puntuaciones', min: 15 },
    { type: 'levels_aprobados', min: 1 },
    { type: 'levels_aprobados', min: 3 },
    { type: 'levels_aprobados', min: 5 },
    { type: 'levels_aprobados', min: 8 },
    { type: 'levels_aprobados', min: 12 },
    { type: 'levels_best_pct', min: 60 },
    { type: 'levels_best_pct', min: 70 },
    { type: 'levels_best_pct', min: 80 },
    { type: 'levels_best_pct', min: 90 },
    { type: 'levels_best_pct', min: 100 },
    { type: 'levels_intentos', min: 60 },
    { type: 'levels_intentos', min: 80 },
    { type: 'levels_intentos', min: 100 },
    { type: 'levels_correct', min: 120 },
    { type: 'levels_correct', min: 150 },
    { type: 'levels_parts', min: 10 },
    { type: 'levels_parts', min: 14 },
    { type: 'levels_parts', min: 17 },
    { type: 'levels_puntuaciones', min: 20 },
    { type: 'levels_aprobados', min: 15 },
  ];
  return rules[i] || { type: 'levels_puntuaciones', min: 20 + i };
}

function ruleTheoryBase(i) {
  const rules = [
    { type: 'theory_rows', min: 1 },
    { type: 'theory_accesos', min: 3 },
    { type: 'theory_accesos', min: 10 },
    { type: 'theory_intentos', min: 1 },
    { type: 'theory_intentos', min: 5 },
    { type: 'theory_intentos', min: 15 },
    { type: 'theory_correct', min: 5 },
    { type: 'theory_correct', min: 15 },
    { type: 'theory_correct', min: 30 },
    { type: 'theory_evaluadas', min: 10 },
    { type: 'theory_evaluadas', min: 25 },
    { type: 'theory_best_pct', min: 50 },
    { type: 'theory_best_pct', min: 65 },
    { type: 'theory_best_pct', min: 80 },
    { type: 'theory_parts', min: 1 },
    { type: 'theory_parts', min: 3 },
    { type: 'theory_parts', min: 5 },
    { type: 'theory_intentos', min: 25 },
    { type: 'theory_intentos', min: 40 },
    { type: 'theory_correct', min: 50 },
    { type: 'theory_correct', min: 75 },
    { type: 'theory_evaluadas', min: 50 },
    { type: 'theory_best_pct', min: 90 },
    { type: 'theory_accesos', min: 50 },
    { type: 'theory_intentos', min: 60 },
  ];
  return rules[i] || { type: 'theory_intentos', min: 60 + i };
}

function ruleTheoryMastery(i) {
  return i % 2 === 0
    ? { type: 'theory_best_pct', min: 70 + i }
    : { type: 'theory_correct', min: 80 + i * 3 };
}

function rulePlacementBase(i) {
  const rules = [
    { type: 'placement_tests', min: 1 },
    { type: 'placement_tests', min: 2 },
    { type: 'placement_score', min: 5 },
    { type: 'placement_score', min: 10 },
    { type: 'placement_score', min: 15 },
    { type: 'placement_score', min: 20 },
    { type: 'placement_score', min: 25 },
    { type: 'placement_score', min: 30 },
    { type: 'placement_score', min: 35 },
    { type: 'placement_score', min: 40 },
    { type: 'placement_tests', min: 3 },
    { type: 'placement_tests', min: 4 },
    { type: 'placement_tests', min: 5 },
    { type: 'placement_score', min: 45 },
    { type: 'placement_score', min: 50 },
    { type: 'placement_score', min: 55 },
    { type: 'placement_score', min: 60 },
    { type: 'placement_tests', min: 6 },
    { type: 'placement_tests', min: 7 },
    { type: 'placement_tests', min: 8 },
    { type: 'placement_score', min: 65 },
    { type: 'placement_score', min: 70 },
    { type: 'placement_score', min: 75 },
    { type: 'placement_tests', min: 10 },
    { type: 'placement_score', min: 80 },
  ];
  return rules[i] || { type: 'placement_tests', min: 10 };
}

function rulePlacementCefr(i) {
  const levels = ['A2', 'B1', 'B2', 'C1', 'C2'];
  if (i < 5) {
    return { type: 'placement_nivel', nivel: levels[i] };
  }
  if (i < 10) {
    return { type: 'placement_tests', min: 2 + i };
  }
  return { type: 'placement_score', min: 30 + i * 2 };
}

function ruleTrainingBase(i) {
  const rules = [
    { type: 'training_units', min: 1 },
    { type: 'training_units', min: 2 },
    { type: 'training_units', min: 3 },
    { type: 'training_hechos', min: 5 },
    { type: 'training_hechos', min: 10 },
    { type: 'training_hechos', min: 20 },
    { type: 'training_hechos', min: 35 },
    { type: 'training_correct', min: 5 },
    { type: 'training_correct', min: 15 },
    { type: 'training_correct', min: 30 },
    { type: 'training_correct', min: 50 },
    { type: 'training_accuracy', min: 50 },
    { type: 'training_accuracy', min: 60 },
    { type: 'training_accuracy', min: 70 },
    { type: 'training_accuracy', min: 80 },
    { type: 'training_units', min: 5 },
    { type: 'training_units', min: 8 },
    { type: 'training_units', min: 12 },
    { type: 'training_hechos', min: 50 },
    { type: 'training_hechos', min: 75 },
    { type: 'training_hechos', min: 100 },
    { type: 'training_correct', min: 75 },
    { type: 'training_correct', min: 100 },
    { type: 'training_accuracy', min: 90 },
    { type: 'training_units', min: 15 },
  ];
  return rules[i] || { type: 'training_hechos', min: 100 + i };
}

function ruleTrainingMastery(i) {
  return i % 2 === 0
    ? { type: 'training_hechos', min: 120 + i * 5 }
    : { type: 'training_correct', min: 100 + i * 4 };
}

const RULE_BUILDERS = {
  levels_base: ruleLevelsBase,
  levels_reading: ruleLevelsReading,
  levels_writing: ruleLevelsWriting,
  levels_listening: ruleLevelsListening,
  levels_exams: ruleLevelsExams,
  theory_base: ruleTheoryBase,
  theory_mastery: ruleTheoryMastery,
  placement_base: rulePlacementBase,
  placement_cefr: rulePlacementCefr,
  training_base: ruleTrainingBase,
  training_mastery: ruleTrainingMastery,
};

function badgeName(category, pageTitle, index, rule) {
  const tier = index + 1;
  if (rule.type === 'placement_nivel') {
    return `Nivel ${rule.nivel}`;
  }
  if (rule.type.includes('best_pct') || rule.type === 'training_accuracy') {
    return `${pageTitle.split('·')[0]?.trim()} · ${rule.min}%`;
  }
  const action =
    rule.type.includes('correct') || rule.type.includes('aprobados')
      ? 'aciertos'
      : rule.type.includes('puntuaciones') || rule.type.includes('tests')
        ? 'registros'
        : rule.type.includes('parts') || rule.type.includes('units')
          ? 'áreas'
          : 'progreso';
  return `${pageTitle.split('·')[0]?.trim()} ${tier} · ${rule.min} ${action}`;
}

function badgeDescription(category, rule) {
  if (rule.type === 'placement_nivel') {
    return `Consigue nivel ${rule.nivel} en el placement test.`;
  }
  const map = {
    levels_accesos: 'Accesos a partes en Levels (levels_estadisticas).',
    levels_intentos: 'Intentos completados en Levels.',
    levels_correct: 'Respuestas correctas en Levels.',
    levels_evaluadas: 'Respuestas evaluadas en Levels.',
    levels_parts: 'Partes distintas practicadas en Levels.',
    levels_puntuaciones: 'Puntuaciones guardadas (levels_puntuaciones).',
    levels_aprobados: 'Partes aprobadas en levels_puntuaciones.',
    levels_best_pct: 'Mejor porcentaje en Levels.',
    theory_rows: 'Actividad en teoría (levels_teoria_estadisticas).',
    theory_accesos: 'Accesos a contenido de teoría.',
    theory_intentos: 'Intentos en teoría.',
    theory_correct: 'Aciertos en teoría.',
    theory_evaluadas: 'Respuestas evaluadas en teoría.',
    theory_parts: 'Bloques de teoría practicados.',
    theory_best_pct: 'Mejor porcentaje en teoría.',
    placement_tests: 'Tests de nivel completados (placement_results).',
    placement_score: 'Puntuación acumulada en placement.',
    training_units: 'Unidades de training practicadas.',
    training_hechos: 'Ejercicios hechos en training.',
    training_correct: 'Ejercicios correctos en training.',
    training_accuracy: 'Porcentaje de acierto en training.',
  };
  const hint = map[rule.type] || 'Completa actividades en la plataforma.';
  return `${hint} Meta: ${rule.min}${rule.nivel ? '' : '+'}.`;
}

function buildPage(pageIndex) {
  const meta = PAGE_META[pageIndex];
  const buildRule = RULE_BUILDERS[meta.ruleFamily];
  const icons = ICONS[meta.category];

  const badges = Array.from({ length: 25 }, (_, i) => {
    const rule = buildRule(i);
    return {
      id: `ach-p${pageIndex}-b${i}`,
      category: meta.category,
      icon: icons[i % icons.length],
      name: badgeName(meta.category, meta.title, i, rule),
      description: badgeDescription(meta.category, rule),
      rule,
    };
  });

  return {
    id: `page-${pageIndex}`,
    title: meta.title,
    category: meta.category,
    badges,
  };
}

export const ACHIEVEMENT_PAGES = Array.from({ length: 11 }, (_, i) => buildPage(i));

export const ACHIEVEMENTS_PER_PAGE = 25;
export const ACHIEVEMENT_PAGE_COUNT = ACHIEVEMENT_PAGES.length;
