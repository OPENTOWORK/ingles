import { getNivelesLevelHub } from '@/data/nivelesLevelHub';
import { getLevelExamSectionRange } from '@/data/levelExamPartMap';

/** Skill columns for the Stars way to B2 cascade (left → right). */
export const B2_STARS_WAY_COLUMNS = [
  {
    key: 'reading',
    skillRoute: 'exam-reading-and-use-of-english',
    label: 'Reading and Use of English',
    shortLabel: 'Reading & UoE',
    accent: '#2563eb',
    accentSoft: '#eff6ff',
    sectionTitle: 'Reading and Use of English',
  },
  {
    key: 'writing',
    skillRoute: 'exam-writing',
    label: 'Writing',
    shortLabel: 'Writing',
    accent: '#059669',
    accentSoft: '#f0fdf4',
    sectionTitle: 'Writing',
  },
  {
    key: 'listening',
    skillRoute: 'exam-listening',
    label: 'Listening',
    shortLabel: 'Listening',
    accent: '#d97706',
    accentSoft: '#fffbeb',
    sectionTitle: 'Listening',
  },
  {
    key: 'speaking',
    skillRoute: 'exam-speaking',
    label: 'Speaking',
    shortLabel: 'Speaking',
    accent: '#db2777',
    accentSoft: '#fdf2f8',
    sectionTitle: 'Speaking',
  },
];

export function getB2StarsWayPartsForColumn(column) {
  const { partMin, partMax } = getLevelExamSectionRange('b2', column.sectionTitle);
  const hub = getNivelesLevelHub('b2');
  const topics = hub?.sections?.[column.sectionTitle] || [];

  return Array.from({ length: partMax - partMin + 1 }, (_, i) => {
    const globalPartNumber = partMin + i;
    const localPartNumber = i + 1;
    const topicRow = topics[i];
    const topicLabel = topicRow?.text?.replace(/^Part\s*\d+:\s*/i, '').trim() || '';

    return {
      globalPartNumber,
      localPartNumber,
      topicLabel,
    };
  });
}

export function getB2StarsWayExerciseHref(column, globalPartNumber, examSlot) {
  return `/niveles/b2/${column.skillRoute}?part=${globalPartNumber}&examen=${examSlot}`;
}
