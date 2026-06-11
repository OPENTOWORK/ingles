/**
 * Manual dev-server test (Phase 4B manual round).
 * POSTs 4 writings to the REAL dev server endpoint (http://localhost:3000)
 * using the exact payload shape the Practice Mode UI sends
 * (B2WritingLongFormAiPanel -> /api/feedback/essay).
 *
 * Requires: npm run dev running with DRALO_WRITING_CORRECTION_V2_ENABLED=true
 * and DRALO_WRITING_CALIBRATION_ENABLED=true in .env.local.
 */

const BASE = 'http://localhost:3000';

// Parser real de la UI: valida cards renderizadas (filtro Original===Correct incluido).
const { parseWritingCorrectionBlocks } = await import('@/lib/formatWritingFeedbackHtml');

const TESTS = [
  {
    id: 'A',
    name: 'Manual A — B1/B1+ (many grammar/articles/prepositions/SVA errors)',
    expect: 'B1 or B1+ · Not B2-ready · Language <= 2/5',
    partLabel: 'Writing Part 1 (Essay)',
    instructions:
      'Some people believe that students learn better when they use mobile phones in class. Do you agree? Notes: 1) concentration, 2) information, 3) your own idea. Write 140-190 words.',
    essay: `Nowadays the mobile phones are very important on our lifes and many students want to use them in the class. In my opinion this is not a good idea for learn better.

First, the concentration is a big problem. When a student have the phone in the table, he always is thinking in the messages and the social networks. The teachers says that many students don't listen nothing in the lesson because they are watching the screen.

Second, is true that with the phone you can search informations very fast. But many times the students copy the answers without understand them, and this don't help for learn.

For other side, I think the phones can be useful if the teacher control the activity, for example with games of vocabulary or aplications for practise the grammar.

In conclusion, I am agree that the phones are useful in some moments, but if the students use them all the time without control, they will learn less and worst.`,
  },
  {
    id: 'B',
    name: 'Manual B — low B2 (organised, correct connectors, some errors)',
    expect: 'low B2 · Borderline · Language 3/5',
    partLabel: 'Writing Part 1 (Essay)',
    instructions:
      'Many young people eat fast food several times a week. What can be done to encourage healthier eating habits? Notes: 1) education, 2) prices, 3) your own idea. Write 140-190 words.',
    essay: `It is a well-known fact that fast food has become part of the weekly routine of many young people. Although it is cheap and convenient, this habit is clearly connected with health problems, so it is worth asking what can be done about it.

To begin with, education plays an essential role. If schools taught students how to cook simple and healthy meals, many of them would depend less of takeaway food. Moreover, learning to read food labels would make young people more conscious about what they eat.

In addition, prices have a strong influence. At the moment, a burger menu is often more cheap than a salad, which makes the unhealthy option more attractive. Governments could reduce taxes on fresh products and increase them on ultra-processed food.

Finally, I would suggest that restaurants near schools was required to offer at least one healthy menu at a reasonable price.

In conclusion, healthier habits are possible if education, prices and local rules work together. It is a long process, but the benefits for the next generations deserve the effort.`,
  },
  {
    id: 'C',
    name: 'Manual C — informal email, over 220 words (good content, too long)',
    expect: 'word count mentioned · max borderline · CA penalised · improved <= 190 · informal kept',
    partLabel: 'Writing Part 2 (Email)',
    instructions:
      'Your English-speaking friend Alex is coming to your town for a weekend and has asked what you can do together, what the weather is like, and what clothes to bring. Write your email in 140-190 words.',
    essay: `Hi Alex!

You can't imagine how happy I was when I read your message! A weekend together after so many months, that's fantastic. I have been thinking about a lot of plans for us and I want to tell you everything.

On Saturday morning we can go to the old part of the town, there are little streets with shops of artesania and a market very famous where they sell cheese and sweets typical of my region. I know you love trying new food, so I want to take you also to a restaurant where they cook the best rice of the area, my family goes there since I was a child. After lunch we could rent bicycles and go near the river, there is a route very beautiful with views of the mountains, and in the evening my friends want to meet you, so maybe we can have dinner all together in the centre.

On Sunday, if you are not very tired, we can take a bus to a village close to here, it has a castle of the medieval times and you can see all the valley from the top. About the weather, in this time of the year is usually sunny but in the night it gets cold, so bring a warm jacket, comfortable shoes for walk and maybe sunglasses. Don't bring elegant clothes, here everything is very relaxed.

I can't wait for see you! Write me when you know the hour of your bus.

A big hug!`,
  },
  {
    id: 'D',
    name: 'Manual D — clear B2 student writing (range: conditionals, concession, passives; 2 typical slips)',
    expect: 'B2 · B2-ready · Language 4/5 possible · improved stays B2',
    partLabel: 'Writing Part 1 (Essay)',
    instructions:
      'Some people believe it is better to study abroad than in your own country. What is your opinion? Notes: 1) independence, 2) language, 3) your own idea. Write 140-190 words.',
    essay: `It is often said that studying abroad is the best decision a young person can make. Although not everyone can afford it, I am convinced that the advantages clearly outweigh the drawbacks.

Firstly, living in another country forces you to become independent. Tasks which used to be done by your parents, such as cooking or dealing with paperwork, suddenly become your own responsibility. Even though this can be stressful at first, it gives you the opportunity of growing in ways that would be impossible at home.

Secondly, the language improves dramatically. When you are surrounded by native speakers from morning to night, you pick up natural expressions that are rarely taught in class. If I had stayed in my country, my English would certainly be weaker than it is now.

Admittedly, being far from family can be hard, and some students feel lonely during the first months. However, most of them adapt quickly and, at the end, they look back on the experience with pride.

In conclusion, studying abroad is demanding but extremely rewarding, and I would recommend it to any student who has the chance.`,
  },
];

const PACK_MARKERS = ['anchor 1', 'anchor 2', 'marking calibration', 'wcp-00', 'real marked student sample'];

function countWords(t) {
  return String(t || '').trim().split(/\s+/).filter(Boolean).length;
}

function section(text, startEmoji, endEmoji) {
  const s = String(text || '');
  const a = s.indexOf(startEmoji);
  if (a === -1) return '';
  const b = endEmoji ? s.indexOf(endEmoji, a + 1) : -1;
  return (b === -1 ? s.slice(a) : s.slice(a, b)).trim();
}

function runCardFilterUnitCheck() {
  const synthetic = [
    'Original: "since I was a child"',
    'Problem: Incorrect verb tense.',
    'Correct: "since I was a child"',
    'Why: "have been going" might be more appropriate.',
    'Type: verb tense',
    '',
    'Original: "I am agree"',
    'Problem: Wrong structure.',
    'Correct: "I agree"',
    'Why: "Agree" is a verb, not an adjective.',
    'Type: grammar',
    '',
    'Original: "It is been a while."',
    'Problem: Wrong auxiliary.',
    'Correct: "It is been a while"',
    'Why: should be "It has been".',
    'Type: grammar',
  ].join('\n');
  const blocks = parseWritingCorrectionBlocks(synthetic);
  const kept = blocks.map((b) => b.original);
  const ok = blocks.length === 1 && kept[0] === 'I am agree';
  console.log('CARD FILTER UNIT CHECK (synthetic defective cards)');
  console.log(`  input: 3 cards (2 defective: identical + identical-but-punctuation) -> rendered: ${blocks.length} [${kept.join(' | ')}]`);
  console.log(`  ${ok ? 'OK — defective cards filtered, valid card kept, type chip preserved.' : 'FAIL — filter not working as expected.'}`);
  return ok;
}

async function run() {
  runCardFilterUnitCheck();
  for (const t of TESTS) {
    console.log(`\n${'='.repeat(72)}\n${t.name}\nEXPECTED: ${t.expect}\noriginal word count: ${countWords(t.essay)}\n${'='.repeat(72)}`);
    const res = await fetch(`${BASE}/api/feedback/essay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        essay: t.essay,
        level: 'b2',
        wordMin: 140,
        wordMax: 190,
        taskContext: {
          partLabel: t.partLabel,
          instructions: t.instructions,
        },
      }),
    });
    if (!res.ok) {
      console.log(`HTTP ${res.status}: ${await res.text()}`);
      continue;
    }
    const data = await res.json();
    const { scores, feedback } = data;
    const improvedBody = section(feedback, '📈', '🚀').replace(/^📈[^\n]*\n?/, '');
    const fallbackNote = improvedBody.includes('could not be shortened reliably');
    const corrCount = (feedback.match(/^Original:/gm) || []).length;
    const corrTypes = [...new Set([...feedback.matchAll(/^Type:\s*(.+)$/gm)].map((m) => m[1].trim().toLowerCase()))];
    // Cards que la UI renderizaría de verdad (con filtro de defectuosas).
    const correctionsSection = section(feedback, '✏️', '📈');
    const renderedCards = parseWritingCorrectionBlocks(correctionsSection.replace(/^✏️[^\n]*\n?/, ''));
    const selfIdentical = renderedCards.filter(
      (b) => b.original && b.correct && b.original.trim().toLowerCase() === b.correct.trim().toLowerCase(),
    );
    const lastLine = feedback.trim().split('\n').map((l) => l.trim()).filter(Boolean).at(-1);
    const leak = PACK_MARKERS.find((m) => feedback.toLowerCase().includes(m));

    console.log(`\nFEEDBACK (full):\n${feedback}`);
    console.log(`\n--- SUMMARY ${t.id} ---`);
    console.log(`CEFR: ${scores.cefr ?? 'NOT PARSED'}`);
    console.log(`Scores: C${scores.content} CA${scores.communication} O${scores.organisation} L${scores.language} = ${scores.total}/20`);
    console.log(`Readiness: ${scores.readiness?.key} ("${scores.readiness?.label}") · UI badge (scores.passed): ${scores.passed ? '✅ Pass/Aprobado' : '❌ Not yet/Aún no'}`);
    console.log(`Final feedback line: ${lastLine}`);
    console.log(`Improved version: ${fallbackNote ? 'SAFE NOTE (shortening failed)' : `${countWords(improvedBody)} words`}`);
    console.log(`Corrections in feedback text: ${corrCount} [${corrTypes.join(', ')}]`);
    console.log(`Cards the UI will render: ${renderedCards.length} (filtered out: ${corrCount - renderedCards.length})`);
    console.log(`Original===Correct cards rendered: ${selfIdentical.length === 0 ? 'NONE ✓' : `${selfIdentical.length} ✗`}`);
    console.log(`Word count of student answer (server): ${scores.wordCount}`);
    console.log(`Improved enforcement meta: ${JSON.stringify(scores.improvedVersion ?? null)}`);
    console.log(`Pack leak markers: ${leak ? `DETECTED ("${leak}")` : 'none'}`);
    console.log(`Feedback total length: ${countWords(feedback)} words`);
  }
}

run().catch((e) => {
  console.error('FAILED:', e?.message || e);
  process.exit(1);
});
