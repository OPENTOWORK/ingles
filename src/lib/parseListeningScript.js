const FEMALE_LABEL =
  /^(a|speaker\s*1|s1|woman|female|f|she|her|maria|anna|sarah|lucy|emma|woman\s*1)$/i;
const MALE_LABEL =
  /^(b|speaker\s*2|s2|man|male|m|he|him|john|tom|david|james|mark|man\s*1)$/i;

/**
 * @typedef {{ label: string, text: string }} ListeningTurn
 */

/**
 * @param {string} script
 * @returns {ListeningTurn[]}
 */
export function parseListeningScript(script) {
  const text = String(script || '').trim();
  if (!text) return [];

  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  /** @type {ListeningTurn[]} */
  const turns = [];

  for (const line of lines) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9\s]{0,24})\s*:\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const content = match[2].trim();
      if (content) turns.push({ label, text: content });
      continue;
    }
    if (turns.length > 0) {
      turns[turns.length - 1].text += ` ${line}`;
    } else {
      turns.push({ label: 'Speaker', text: line });
    }
  }

  if (!turns.length && text) {
    return [{ label: 'Speaker', text }];
  }
  return turns;
}

/**
 * @param {string} label
 * @param {number} index
 * @returns {'female' | 'male'}
 */
export function voiceRoleForLabel(label, index) {
  const norm = String(label || '').trim();
  if (FEMALE_LABEL.test(norm)) return 'female';
  if (MALE_LABEL.test(norm)) return 'male';
  return index % 2 === 0 ? 'female' : 'male';
}

/**
 * @param {ListeningTurn[]} turns
 */
export function isDialogueScript(turns) {
  if (turns.length < 2) return false;
  const labels = new Set(turns.map((t) => t.label.toLowerCase()));
  if (labels.size >= 2) return true;
  return turns.some((t) => /^(a|b|speaker\s*[12])/i.test(t.label));
}

/** @param {string} activityId */
export function listeningActivityPrefersDialogue(activityId) {
  return ['conversation', 'short-extracts', 'multiple-matching'].includes(activityId);
}
