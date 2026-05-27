import { getExamBlueprint } from '@/features/speaking/domain/exam-blueprints';
import { partInfo as a2Speaking } from '@/data/part-info/a2-speaking';
import { partInfo as b1Speaking } from '@/data/part-info/b1-speaking';
import { partInfo as b2Speaking } from '@/data/part-info/b2-speaking';
import { partInfo as c1Speaking } from '@/data/part-info/c1-speaking';
import { partInfo as c2Speaking } from '@/data/part-info/c2-speaking';

const PART_ICONS = {
  1: '🗣️',
  2: '🖼️',
  3: '🤝',
  4: '💬',
};

const PART_INFO_BY_LEVEL = {
  A2: a2Speaking,
  B1: b1Speaking,
  B2: b2Speaking,
  C1: c1Speaking,
  C2: c2Speaking,
};

/** Actividades «Preparación del examen» = partes Cambridge del paper Speaking */
export function getSpeakingExamActivities(level = 'B2') {
  const L = level || 'B2';
  const blueprint = getExamBlueprint(L);
  return blueprint.parts.map((p, blueprintIndex) => {
    const partNum = p.part;
    const meta = getSpeakingPartMeta(L, partNum);
    return {
      id: `part-${partNum}`,
      partNumber: partNum,
      blueprintIndex,
      label: p.name.replace(/^Part \d+:\s*/i, '') || p.name,
      icon: PART_ICONS[partNum] || '🎤',
      hint: p.instructions,
      partTitle: meta.partTitle || p.name,
      directions: meta.directions || p.instructions,
      tips: meta.tips,
      durationSec: p.suggestedTimeSec,
    };
  });
}

export function getSpeakingPartMeta(level, partNumber) {
  const info = PART_INFO_BY_LEVEL[level]?.[String(partNumber)];
  const blueprint = getExamBlueprint(level);
  const partDef = blueprint.parts.find((p) => p.part === partNumber);
  return {
    partTitle: info?.title || partDef?.name || `Part ${partNumber}`,
    directions: info?.description || partDef?.instructions || '',
    tips: info?.tips || '',
    commonErrors: info?.commonErrors || '',
  };
}

/** Listado fijo para la tarjeta del hub (B2 = 4 partes) */
export const SPEAKING_EXAM_HUB_PARTS = [
  { id: 'part-1', label: 'Part 1: Interview', icon: '🗣️' },
  { id: 'part-2', label: 'Part 2: Long turn', icon: '🖼️' },
  { id: 'part-3', label: 'Part 3: Collaborative task', icon: '🤝' },
  { id: 'part-4', label: 'Part 4: Discussion', icon: '💬' },
];
