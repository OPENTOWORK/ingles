import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SATURATED_RUOE_BUCKETS,
  buildRuoeTopicPlan,
  classifyRuoeThemeBucket,
  isSaturatedRuoeBucket,
} from '../ruoeTopicVariety.js';

function topic(topicId, mainTopic, subtopic1 = '', subtopic2 = '', extra = {}) {
  return {
    topicId,
    mainTopic,
    subtopic1,
    subtopic2,
    exampleContext: `${mainTopic} text ${topicId}`,
    ...extra,
  };
}

const POOL = [
  topic('TB-001', 'Technology', 'AI', 'Work'),
  topic('TB-002', 'Technology', 'Apps', 'Daily Life'),
  topic('TB-003', 'Travel', 'Adventure', 'Destinations'),
  topic('TB-004', 'Travel', 'Tourism', 'Cities'),
  topic('TB-005', 'History', 'Streets', 'Change'),
  topic('TB-006', 'Geography', 'Rivers', 'Settlement'),
  topic('TB-007', 'Literature', 'Poetry', 'Performance'),
  topic('TB-008', 'Media', 'Radio', 'Local News'),
];

test('classifyRuoeThemeBucket: trusts an explicit curated bucket', () => {
  const curated = topic('TB-080', 'Social Change', 'Generations', 'Housing', {
    themeBucket: 'social-change',
  });
  assert.equal(classifyRuoeThemeBucket(curated), 'social-change');
});

test('classifyRuoeThemeBucket: ignores an explicit bucket that is not a known domain', () => {
  const bogus = topic('TB-999', 'History', '', '', { themeBucket: 'nonsense' });
  assert.equal(classifyRuoeThemeBucket(bogus), 'history');
});

test('classifyRuoeThemeBucket: maps the saturated domains of the base bank', () => {
  assert.equal(classifyRuoeThemeBucket(topic('TB-001', 'Technology', 'AI', 'Work')), 'technology');
  assert.equal(classifyRuoeThemeBucket(topic('TB-002', 'Travel', 'Adventure', 'Destinations')), 'travel');
  assert.equal(classifyRuoeThemeBucket(topic('TB-019', 'Health', 'Sleep', 'Lifestyle')), 'health');
});

test('classifyRuoeThemeBucket: splits Environment into nature and sustainability', () => {
  assert.equal(classifyRuoeThemeBucket(topic('TB-012', 'Environment', 'Conservation', 'Wildlife')), 'nature');
  assert.equal(
    classifyRuoeThemeBucket(topic('TB-034', 'Environment', 'Sustainability', 'Cities')),
    'sustainability',
  );
});

test('classifyRuoeThemeBucket: falls back to other for an unclassifiable entry', () => {
  assert.equal(classifyRuoeThemeBucket(topic('TB-777', 'Lifestyle', '', '')), 'other');
  assert.equal(classifyRuoeThemeBucket({}), 'other');
});

test('isSaturatedRuoeBucket: knows which domains are saturated', () => {
  assert.ok(SATURATED_RUOE_BUCKETS.every(isSaturatedRuoeBucket));
  assert.equal(isSaturatedRuoeBucket('history'), false);
});

test('buildRuoeTopicPlan: fills every planned slot', () => {
  const { assignments } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 3, partsPerExam: 4 });
  assert.equal(assignments.size, 12);
  for (let slot = 1; slot <= 3; slot += 1) {
    for (let part = 1; part <= 4; part += 1) {
      assert.ok(assignments.get(`${slot}:${part}`)?.topicId, `missing ${slot}:${part}`);
    }
  }
});

test('buildRuoeTopicPlan: never repeats a topic inside one exam', () => {
  const { assignments } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 6, partsPerExam: 4 });
  for (let slot = 1; slot <= 6; slot += 1) {
    const ids = [1, 2, 3, 4].map((part) => assignments.get(`${slot}:${part}`).topicId);
    assert.equal(new Set(ids).size, ids.length, `exam ${slot} repeats a topic`);
  }
});

test('buildRuoeTopicPlan: never repeats a thematic domain inside one exam', () => {
  const { assignments } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 6, partsPerExam: 4 });
  for (let slot = 1; slot <= 6; slot += 1) {
    const buckets = [1, 2, 3, 4].map((part) => assignments.get(`${slot}:${part}`).themeBucket);
    assert.equal(new Set(buckets).size, buckets.length, `exam ${slot} repeats a domain`);
  }
});

test('buildRuoeTopicPlan: is deterministic across runs', () => {
  const args = { topics: POOL, maxSlot: 3, partsPerExam: 4 };
  const ids = (plan) => [...plan.entries()].map(([key, value]) => [key, value.topicId]);
  assert.deepEqual(ids(buildRuoeTopicPlan(args).assignments), ids(buildRuoeTopicPlan(args).assignments));
});

test('buildRuoeTopicPlan: exhausts under-used domains before saturated ones', () => {
  const { bucketCounts } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 1, partsPerExam: 4 });
  const saturated = SATURATED_RUOE_BUCKETS.reduce((sum, b) => sum + (bucketCounts.get(b) || 0), 0);
  // Four picks from a pool that is half saturated: the handicap must keep them all fresh.
  assert.equal(saturated, 0);
  assert.equal(bucketCounts.get('history'), 1);
  assert.equal(bucketCounts.get('geography'), 1);
});

test('buildRuoeTopicPlan: keeps the bank-wide spread flat, not just the per-exam one', () => {
  const { bucketCounts } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 6, partsPerExam: 4 });
  const counts = [...bucketCounts.values()];
  assert.ok(
    Math.max(...counts) - Math.min(...counts) <= 2,
    `spread too wide: ${JSON.stringify([...bucketCounts.entries()])}`,
  );
});

test('buildRuoeTopicPlan: does not park the same domain on the same part in every exam', () => {
  const { assignments } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 4, partsPerExam: 4 });
  const firstPart = [1, 2, 3, 4].map((slot) => assignments.get(`${slot}:1`).themeBucket);
  assert.ok(new Set(firstPart).size > 1, `Part 1 always got ${firstPart[0]}`);
});

test('buildRuoeTopicPlan: prefers topics the pilot briefs never consumed', () => {
  const { assignments } = buildRuoeTopicPlan({
    topics: [topic('TB-A', 'History'), topic('TB-B', 'History')],
    usedTopicIds: ['TB-A'],
    maxSlot: 1,
    partsPerExam: 1,
  });
  assert.equal(assignments.get('1:1').topicId, 'TB-B');
});

test('buildRuoeTopicPlan: annotates each assignment with its resolved domain', () => {
  const { assignments } = buildRuoeTopicPlan({ topics: POOL, maxSlot: 1, partsPerExam: 1 });
  assert.ok(assignments.get('1:1').themeBucket);
});

test('buildRuoeTopicPlan: rejects an empty pool', () => {
  assert.throws(() => buildRuoeTopicPlan({ topics: [], maxSlot: 1 }), /empty topic pool/);
});
