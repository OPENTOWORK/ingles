/**
 * Cumulative thematic variety for the RUOE exam bank.
 *
 * Assigning topics per exam is not enough: each exam can look internally varied while the bank
 * as a whole stays concentrated in a handful of domains. The published exams ended up saturated
 * with technology, travel, health, sustainability and work, and carried no history, geography,
 * media, literature or consumption texts at all.
 *
 * `buildRuoeTopicPlan` therefore plans every (exam, part) slot in one deterministic pass, so the
 * running balance across ALL exams — not just within one — drives the next choice.
 */

/** Domains already over-represented in the published exams. */
export const SATURATED_RUOE_BUCKETS = Object.freeze([
  'technology',
  'travel',
  'health',
  'sustainability',
  'work',
]);

/** Domains the bank under-covers and should move towards. */
export const UNDERUSED_RUOE_BUCKETS = Object.freeze([
  'art-culture',
  'history',
  'science',
  'media',
  'geography',
  'nature',
  'consumption',
  'public-life',
  'professions',
  'literature',
  'social-change',
]);

/** Neutral domains: present in the bank, neither saturated nor a target for growth. */
export const NEUTRAL_RUOE_BUCKETS = Object.freeze(['education', 'entertainment', 'other']);

export const RUOE_THEME_BUCKETS = Object.freeze([
  ...SATURATED_RUOE_BUCKETS,
  ...UNDERUSED_RUOE_BUCKETS,
  ...NEUTRAL_RUOE_BUCKETS,
]);

const SATURATED_SET = new Set(SATURATED_RUOE_BUCKETS);

/**
 * How far ahead a saturated domain must be before it is picked again. The base bank is 27/50
 * saturated, so without a handicap the balanced pass would still reproduce the old distribution.
 */
const SATURATED_HANDICAP = 2;

/**
 * Saturated topics enter each reuse round one step late. There are more exam slots than topics,
 * so every topic is eventually reused; without this the totals per domain would simply track how
 * many topics each domain happens to contain, which is where the original imbalance came from.
 */
const SATURATED_ROUND_DELAY = 1;

/**
 * Ordered keyword rules. First match wins, so the narrow rules come before the broad ones
 * (wildlife before environment, shopping before lifestyle).
 */
const BUCKET_RULES = [
  ['literature', /\b(literature|novel|novels|poetry|poem|poems|fiction|storytelling|translation)\b/],
  ['media', /\b(media|journalis\w*|newspaper|photograph\w*|radio|broadcast\w*|archive|archives|podcast)\b/],
  ['history', /\b(history|historical|heritage|century|origins|ancient|archaeolog\w*)\b/],
  ['geography', /\b(geograph\w*|map|maps|border|borders|island|islands|river|rivers|landscape|terrain|settlement)\b/],
  ['nature', /\b(wildlife|animal|animals|bird|birds|tree|trees|forest|soil|ocean|oceans|marine|conservation|species)\b/],
  ['consumption', /\b(shopping|consumer|consumption|packaging|price|prices|market|markets|retail|repair|ownership)\b/],
  ['public-life', /\b(librar\w*|volunteer\w*|community|neighbourhood|civic|public space|shared space|local services)\b/],
  ['professions', /\b(trade|trades|apprentice\w*|craftsman\w*|profession\w*|vocational|emergency work)\b/],
  ['art-culture', /\b(art|arts|museum|museums|craft|crafts|theatre|festival|music|dance|design|culture|cultural)\b/],
  ['social-change', /\b(social change|generation|generations|inequalit\w*|belonging|demographic\w*|tradition\w* chang\w*)\b/],
  ['science', /\b(science|scientific|research|experiment|physics|chemistry|biolog\w*|astronom\w*|space|measurement|materials)\b/],
  ['sustainability', /\b(sustainab\w*|climate|recycl\w*|pollution|emissions|renewable|waste)\b/],
  ['technology', /\b(technolog\w*|digital|ai\b|artificial intelligence|software|app|apps|online|internet|social media|robot\w*)\b/],
  ['travel', /\b(travel|tourism|tourist|destination|holiday|holidays|accommodation|backpack\w*)\b/],
  ['health', /\b(health|wellbeing|well-being|medicine|medical|fitness|exercise|nutrition|sleep|mental health|diet)\b/],
  ['work', /\b(work|workplace|career|careers|job|jobs|employ\w*|business|entrepreneur\w*|office)\b/],
  ['education', /\b(education|school|schools|learning|teacher\w*|student\w*|university|languages|skills)\b/],
  ['entertainment', /\b(entertainment|game|games|film|films|cinema|television|sport|sports|hobby|hobbies)\b/],
];

const MAIN_TOPIC_BUCKETS = new Map([
  ['technology', 'technology'],
  ['travel', 'travel'],
  ['health', 'health'],
  ['environment', 'sustainability'],
  ['work', 'work'],
  ['science', 'science'],
  ['education', 'education'],
  ['entertainment', 'entertainment'],
  ['culture', 'art-culture'],
  ['art & culture', 'art-culture'],
  ['history', 'history'],
  ['media', 'media'],
  ['geography', 'geography'],
  ['nature', 'nature'],
  ['consumption', 'consumption'],
  ['public life', 'public-life'],
  ['professions', 'professions'],
  ['literature', 'literature'],
  ['social change', 'social-change'],
  ['lifestyle', 'other'],
]);

/**
 * Resolve the thematic domain of a Topic Bank entry. An explicit `themeBucket` always wins, so
 * hand-curated entries never depend on keyword guessing.
 */
export function classifyRuoeThemeBucket(topic) {
  const explicit = String(topic?.themeBucket || '').trim();
  if (explicit && RUOE_THEME_BUCKETS.includes(explicit)) return explicit;

  const haystack = [topic?.mainTopic, topic?.subtopic1, topic?.subtopic2, topic?.exampleContext]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  for (const [bucket, pattern] of BUCKET_RULES) {
    if (pattern.test(haystack)) return bucket;
  }

  const main = String(topic?.mainTopic || '').trim().toLowerCase();
  return MAIN_TOPIC_BUCKETS.get(main) || 'other';
}

export function isSaturatedRuoeBucket(bucket) {
  return SATURATED_SET.has(bucket);
}

/**
 * Plan a topic for every (exam slot, part) pair up to `maxSlot`.
 *
 * Selection order for each slot, highest priority first:
 *  1. a thematic domain not yet used in this exam, so each exam stays internally varied;
 *  2. topics used fewest times overall (a topic is only reused once the bank is exhausted),
 *     with saturated domains entering each reuse round one step late;
 *  3. the least-used thematic domain across all exams so far, with saturated domains handicapped;
 *  4. topics the pilot briefs never consumed;
 *  5. a deterministic rotation, so reruns reproduce the same plan.
 *
 * @returns {{ assignments: Map<string, object>, bucketCounts: Map<string, number> }}
 */
export function buildRuoeTopicPlan({
  topics,
  usedTopicIds = [],
  maxSlot,
  partsPerExam = 9,
  offset = 0,
}) {
  const pool = (Array.isArray(topics) ? topics : []).filter((t) => t?.topicId);
  if (pool.length === 0) throw new Error('buildRuoeTopicPlan: empty topic pool');

  const alreadyUsed = new Set(usedTopicIds || []);
  const entries = pool.map((topic, index) => ({
    topic,
    bucket: classifyRuoeThemeBucket(topic),
    pilotUsed: alreadyUsed.has(topic.topicId) ? 1 : 0,
    rotation: (index + Number(offset || 0)) % pool.length,
  }));

  const topicCounts = new Map();
  const bucketCounts = new Map();
  const assignments = new Map();

  const bucketCost = (bucket) =>
    (bucketCounts.get(bucket) || 0) + (isSaturatedRuoeBucket(bucket) ? SATURATED_HANDICAP : 0);

  for (let slot = 1; slot <= maxSlot; slot += 1) {
    const topicsThisExam = new Set();
    const bucketsThisExam = new Set();

    // Whichever part picks first gets the freshest domain, so rotate the order per exam —
    // otherwise Part 1 took the widest choice in every exam and the same domains piled up there.
    for (const part of rotatedParts(partsPerExam, slot)) {
      const candidates = entries.filter((e) => !topicsThisExam.has(e.topic.topicId));
      // Only possible if one exam has more parts than the bank has topics.
      const available = candidates.length > 0 ? candidates : entries;

      let best = null;
      for (const entry of available) {
        const reuseRound =
          (topicCounts.get(entry.topic.topicId) || 0) +
          (isSaturatedRuoeBucket(entry.bucket) ? SATURATED_ROUND_DELAY : 0);
        const key = [
          bucketsThisExam.has(entry.bucket) ? 1 : 0,
          reuseRound,
          bucketCost(entry.bucket),
          entry.pilotUsed,
          entry.rotation,
        ];
        if (best === null || compareKeys(key, best.key) < 0) best = { entry, key };
      }

      const chosen = best.entry;
      topicsThisExam.add(chosen.topic.topicId);
      bucketsThisExam.add(chosen.bucket);
      topicCounts.set(chosen.topic.topicId, (topicCounts.get(chosen.topic.topicId) || 0) + 1);
      bucketCounts.set(chosen.bucket, (bucketCounts.get(chosen.bucket) || 0) + 1);
      assignments.set(`${slot}:${part}`, { ...chosen.topic, themeBucket: chosen.bucket });
    }
  }

  return { assignments, bucketCounts };
}

function rotatedParts(partsPerExam, slot) {
  const parts = Array.from({ length: partsPerExam }, (_, i) => i + 1);
  const shift = (slot - 1) % partsPerExam;
  return [...parts.slice(shift), ...parts.slice(0, shift)];
}

function compareKeys(a, b) {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
}
