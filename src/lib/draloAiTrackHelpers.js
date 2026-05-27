import { DRALO_AI_MODES } from '@/data/draloAiConfig';
import { DRALO_AI_SITUATIONAL } from '@/data/draloAiSituationalConfig';

export function mapScenariosToActivities(skillId) {
  const block = DRALO_AI_SITUATIONAL[skillId];
  if (!block?.scenarios) return [];
  return block.scenarios.map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.icon,
    hint: s.hint || s.label,
  }));
}

export function getSituationalMeta(skillId) {
  return DRALO_AI_SITUATIONAL[skillId] || null;
}

export function getExamModeConfig(skillId) {
  return DRALO_AI_MODES[skillId];
}
