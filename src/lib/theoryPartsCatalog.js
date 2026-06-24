import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import {
  EXAM_THEORY_CATALOG,
  THEORY_SECTION_CATALOG,
  SECTIONS,
} from '@/data/teoriaSections';

/**
 * Todas las partes/temas de teoría: hub /teoria (Theory) + /niveles Exam theory (sin exámenes).
 * @returns {Array<{
 *   href: string,
 *   label: string,
 *   group: string,
 *   source: 'theory' | 'exam-theory',
 *   sectionKey: string,
 *   sectionSlug: string,
 *   levels: string[],
 * }>}
 */
export function getAllTheoryPartOptions() {
  const options = [];

  for (const area of THEORY_SECTION_CATALOG) {
    for (const topic of SECTIONS[area.key] || []) {
      options.push({
        href: normalizeTopicHref(topic.href),
        label: topic.text,
        group: `Theory · ${area.key}`,
        source: 'theory',
        sectionKey: area.key,
        sectionSlug: area.slug,
        levels: topic.levels || [],
      });
    }
  }

  for (const area of EXAM_THEORY_CATALOG) {
    for (const topic of SECTIONS[area.key] || []) {
      options.push({
        href: normalizeTopicHref(topic.href),
        label: topic.text,
        group: `Exam Strategies · ${area.key}`,
        source: 'exam-theory',
        sectionKey: area.key,
        sectionSlug: area.slug,
        unidad: area.slug,
        levels: topic.levels || [],
      });
    }
  }

  return options.sort((a, b) => {
    const sourceOrder = { theory: 0, 'exam-theory': 1 };
    const oa = sourceOrder[a.source] ?? 2;
    const ob = sourceOrder[b.source] ?? 2;
    if (oa !== ob) return oa - ob;
    const g = a.group.localeCompare(b.group, 'es');
    if (g !== 0) return g;
    return a.label.localeCompare(b.label, 'es');
  });
}

/** @param {string} nivelNombre — ej. "b2" → "B2" */
export function filterTheoryPartsByLevel(parts, nivelNombre) {
  const code = String(nivelNombre || '')
    .trim()
    .toUpperCase();
  if (!code) return parts;
  return parts.filter((p) => (p.levels || []).some((l) => String(l).toUpperCase() === code));
}

export function findTheoryPartByHref(parts, href) {
  const canonical = normalizeTopicHref(href);
  return parts.find((p) => p.href === canonical) || null;
}
