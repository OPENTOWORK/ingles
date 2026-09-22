import { PART1_KNOWLEDGE_TYPES } from './contract.js';

export function assessPart1Variety(items = []) {
  const rows = Array.isArray(items) ? items : [];
  const counts = Object.fromEntries(PART1_KNOWLEDGE_TYPES.map((type) => [type, 0]));
  let obvious = 0;
  for (const item of rows) {
    const type = String(item?.knowledgeType || '');
    if (Object.prototype.hasOwnProperty.call(counts, type)) counts[type] += 1;
    if (item?.obviousChunk) obvious += 1;
  }
  const used = PART1_KNOWLEDGE_TYPES.filter((type) => counts[type] > 0);
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const problems = [];
  if (rows.length >= 8 && used.length < 5) {
    problems.push(`Only ${used.length} knowledge types are used. Cover at least five of: ${PART1_KNOWLEDGE_TYPES.join(', ')}.`);
  }
  if (dominant && dominant[1] > 3) {
    problems.push(`${dominant[0]} accounts for ${dominant[1]} items. No type may account for more than three.`);
  }
  if (obvious >= 4) {
    problems.push(`${obvious} items are obvious textbook chunks. The part must not be built from them.`);
  }
  return {
    ok: problems.length === 0,
    counts,
    obvious,
    problems,
  };
}
