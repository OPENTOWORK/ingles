/**
 * Style Card v1.1 metadata — title strategy and pattern families (runtime helpers).
 * Full card prose lives in pilot packs; this module encodes enforceable title rules.
 *
 * Usage History (required before 20-exam scale — no production migration in v1.1.1):
 * - Each generated part should carry `titlePatternFamily` (set in normalizeGeneratedExamPart).
 * - At orchestration time, read recent `titlePatternFamily` values for the same
 *   level + part + styleCardId from Usage History store (planned: exam_generation_usage
 *   or levels_exam_title_history table keyed by examSlot batch).
 * - Distribution Rules v1.1: block or warn when the same family repeats within N exams
 *   for the same Style Card; prefer families listed in STYLE_CARD_TITLE_FAMILIES[SC-xx].
 * - Wire point: levelsCambridgeExamGenerator varietySeed + Content Brief allocation
 *   should pass lastUsedFamilies into prompt context before generation (TODO: DB read).
 */
import { normalizeForMatch, significantWords } from '@/lib/b2RuoeExamQuality';

export const STYLE_CARD_TITLE_FAMILIES = {
  'SC-01': ['curiosity_question', 'surprising_observation', 'concrete_phenomenon', 'short_contrast'],
  'SC-02': ['current_observation', 'understated_contrast', 'concrete_social_image', 'concise_trend_statement'],
  'SC-03': ['personal_moment', 'quiet_realisation', 'scene_image', 'understated_change'],
  'SC-04': ['concrete_event', 'turning_point', 'character_focus', 'sensory_image'],
  'SC-05': ['practical_question', 'useful_tip_frame', 'concrete_benefit', 'short_how_frame'],
  'SC-06': ['profile_hook', 'role_contrast', 'achievement_focus', 'concise_biographical_frame'],
};

const TITLE_TEMPLATE_PATTERNS = [
  { id: 'the_x_that', re: /^the\s+\w+(\s+\w+){0,3}\s+that\b/i },
  { id: 'what_when_how', re: /^(what|when|how|why)\s+(happens|happened|if)\b/i },
  { id: 'when_x', re: /^when\s+\w+/i },
  { id: 'the_truth_about', re: /^the\s+(truth|story|secret)\s+about\b/i },
];

export function classifyTitlePatternFamily(title) {
  const t = String(title || '').trim();
  for (const p of TITLE_TEMPLATE_PATTERNS) {
    if (p.re.test(t)) return p.id;
  }
  if (/\?$/.test(t)) return 'question_title';
  if (t.split(/\s+/).length <= 5) return 'concise_statement';
  return 'descriptive_title';
}

export function scoreTitleAgainstBrief(title, briefWorkingTitle) {
  const a = significantWords(title, 3);
  const b = significantWords(briefWorkingTitle, 3);
  if (!a.length || !b.length) return { isLiteralParaphrase: false, overlapRatio: 0 };
  const shared = a.filter((w) => b.includes(w));
  const overlapRatio = shared.length / Math.max(a.length, b.length);
  const normA = normalizeForMatch(title);
  const normB = normalizeForMatch(briefWorkingTitle);
  const isLiteralParaphrase =
    overlapRatio >= 0.75 ||
    (normB.length > 8 && normA.includes(normB)) ||
    (normA.length > 8 && normB.includes(normA));
  return { isLiteralParaphrase, overlapRatio, shared };
}

export function getStyleCardTitleFamilies(styleCardId) {
  return STYLE_CARD_TITLE_FAMILIES[String(styleCardId || '').toUpperCase()] || [];
}
