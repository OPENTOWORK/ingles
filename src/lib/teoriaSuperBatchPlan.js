import { getAllTheoryPartOptions } from '@/lib/theoryPartsCatalog';

/** Niveles CEFR que no se usan en el panel de ejercicios ni en el superbotón. */
const TEORIA_ADMIN_EXCLUDED_LEVEL_CODES = new Set(['A1']);

export function filterLevelsForTeoriaAdmin(levels) {
  return (levels || []).filter(
    (l) =>
      !TEORIA_ADMIN_EXCLUDED_LEVEL_CODES.has(
        String(l.nombre || '').trim().toUpperCase(),
      ),
  );
}

/**
 * Plan del superbotón: un ejercicio por cada combinación
 * (tema × cada nivel CEFR del panel × skill × tipo).
 * Ej.: 80 × 5 × 7 × 9 = 25.200. La carpeta queda implícita en cada tema.
 *
 * @param {{
 *   theoryParts?: ReturnType<typeof getAllTheoryPartOptions>,
 *   levels: { id: string, nombre: string }[],
 *   skills: { id: string, nombre: string }[],
 *   tipos: { id: string }[],
 * }} catalog
 */
export function buildTeoriaSuperBatchPlan(catalog) {
  const theoryParts = catalog.theoryParts || getAllTheoryPartOptions();
  const levels = filterLevelsForTeoriaAdmin(catalog.levels || []);
  const skills = catalog.skills || [];
  const tipos = catalog.tipos || [];

  const folders = new Set();
  const combinations = [];

  for (const part of theoryParts) {
    folders.add(part.group);
    for (const nivel of levels) {
      for (const skill of skills) {
        for (const tipo of tipos) {
          combinations.push({
            topicHref: part.href,
            topicLabel: part.label,
            group: part.group,
            nivelId: nivel.id,
            nivelCode: String(nivel.nombre || '').toUpperCase(),
            skillId: skill.id,
            skillName: skill.nombre,
            tipoId: tipo.id,
          });
        }
      }
    }
  }

  return {
    combinations,
    total: combinations.length,
    folders: folders.size,
    topics: theoryParts.length,
    cefrLevels: levels.length,
    skills: skills.length,
    tipos: tipos.length,
    topicLevelSlots: theoryParts.length * levels.length,
  };
}

/** Resumen sin devolver miles de filas al cliente. */
export function summarizeTeoriaSuperBatchPlan(plan) {
  return {
    total: plan.total,
    folders: plan.folders,
    topics: plan.topics,
    cefrLevels: plan.cefrLevels,
    skills: plan.skills,
    tipos: plan.tipos,
    topicLevelSlots: Math.round(plan.topicLevelSlots || 0),
    formula: 'temas × niveles × skills × tipos',
  };
}
