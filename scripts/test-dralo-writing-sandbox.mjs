/**
 * Sandbox tests for /dralo-ai/writing/ (Phase: real student writings with own task).
 * POSITIVE: fast-food essay WITH its matching task prompt -> Content must NOT be
 * penalised for topic; level B1/B1+; Language <= 2.
 * NEGATIVE: same essay sent with the CURRENT exam topic (life skills) as in
 * Exam Writing Practice -> Content/Task Response must be penalised (off-topic).
 *
 * Uses the real dev server endpoint (same engine as the sandbox UI payload).
 */

const BASE = 'http://localhost:3000';

const FAST_FOOD_ESSAY = `Nowadays, fast food is very typical. There are some people who eate it and others who prefer not eat it. Fast food have many advantages and disadvantages.

On one hand, is very cheep, so you can eat without spending a lot of money. It can also save when you haven't anything to eat. For example, when you are traveling in the car and you have to stop to eat.

In the other hand, the food can be contaminated. Besides, is not healthy, so is not good to eat in many moments. A example of that is when yo eat daily in fast food chains and you start getting fat.

In conclusion, eat fast food have many good and bad things, so we have to think about this, when we can it and when we don't have to eat it.`;

const TESTS = [
  {
    id: 'POSITIVE (Dralo AI Writing sandbox payload)',
    taskContext: {
      partLabel: 'Dralo AI Writing sandbox — essay',
      partDescription: "Task type: essay. The student's target level is B2.",
      instructions:
        'Fast food is always a bad thing to eat. Do you agree? Give reasons for your answer.',
    },
  },
  {
    id: 'NEGATIVE (Exam Writing Practice topic — off-topic answer)',
    expectOffTask: true,
    taskContext: {
      partLabel: 'B2 Writing Part 1 (Essay)',
      instructions:
        'Some people believe schools should teach practical life skills, such as cooking, managing money and basic repairs, as part of the curriculum. Do you agree? Notes: 1) time at school, 2) preparation for adult life, 3) your own idea. Write 140-190 words.',
    },
  },
];

const CHRIS_EMAIL = `Hi Chris!

I'm too excited to answer all your questions! It is been a long time since the last time we talk together. I can remember it, it was summer of the last year. It is amazing that we will be together in a couple months! That's why I recommend you to come here in summer, the weather is perfect and also in this time of the year we have many tradition festivities to enjoy. The best places to visit in Spain on summer are the coast Mediterranean zones, like Catalonia, Valencia and Murcia. But, if you want a fresher weather, coming to Galicia, Asturias, Cantabria or The Basque Country are a good choice. My favourite one is The Basque Country, obviously because is where I exactly live and also because you have in one way beautiful beaches and in the other one big mountains. In my opinion, you should avoid very touristic places like La Concha, there, many people goes because of the hype that is creates. Going to more unusual places is a good option too in those places you could feel more relax and also services are going to be cheaper. I think that you don't have to bring me nothing, because the best present is going to see you again.

Bye!`;

TESTS.push({
  id: 'PARTLY OFF TASK (Chris email — "what to bring" misunderstood as a present)',
  expectPartly: true,
  essayOverride: CHRIS_EMAIL,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — email',
    partDescription: "Task type: email. The student's target level is B2.",
    instructions:
      'Your English-speaking friend Chris wants to visit you in Spain and has asked you some questions: When is the best time to visit? Which places should I go to and which should I avoid? What should I bring? Write your email answering Chris\'s questions in 140-190 words.',
  },
});

const MUSIC_ESSAY = `Nowadays, many people believe that music is an essential part of education. Some think that teenagers should focus only on academic subjects, while others believe that learning practical skills like playing a musical instrument is important.

Many cultural traditions around the world includes music as an important part of family and usually plays instruments together on celebrations. Music can create a peaceful atmosphere to help people feeling relaxed. It is also a healthy way to spend free time instead of using the phone all the day.

Another reason is that playing an instrument can help teenagers having more self-confidence, for example when they play music in front of people or improving skill make them proud of themselves. If a teenager has special musical talent, learning to play an instrument can give them the opportunity to develop it, so then they become famous and have success.

In conclusion, I agree that all teenagers should learn to play an instrument, because it helps them improving skills and developing self-confidence.`;

TESTS.push({
  id: 'IN-RANGE WORD COUNT + SINGLE CEFR LABEL (musical instrument essay)',
  expectInRangeClean: true,
  essayOverride: MUSIC_ESSAY,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — essay',
    partDescription: "Task type: essay. The student's target level is B2.",
    instructions:
      'Some people think that teenagers should focus only on academic subjects, while others believe that learning to play a musical instrument is also important. Do you agree? Write 140-190 words.',
  },
});

const MUSIC_ARTICLE = `LEARN TO PLAY INSTRUMENT

Nowadays many young people spend a lot of time on their phones or computers. However, learning to play a musical instrument is a very positive activity. It is not only fun, also helps to develop important skills.

First of all, playing an instrument can make you feel proud because you discover a new talent. When you learn to play songs, you feel motivated and happy with your progress. In addition, music is a great way to express emotions. A example of that is when young people show their feelings with melodies or rhythms.

In other hand, learning an instrument allows teenagers to explore different cultures and styles of music. For example, they can learn about classical, jazz, pop, or traditional music from other countries. This helps them understand the world better.

In conclusion, learning to play an instrument is beneficial for young people because it helps them to express and learn about different thinks.`;

TESTS.push({
  id: 'ARTICLE (implied recommendation + faulty title — must stay ON TASK)',
  expectArticleCase: true,
  essayOverride: MUSIC_ARTICLE,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — article',
    partDescription: "Task type: article. The student's target level is B2.",
    instructions:
      'A school magazine has asked students to write an article about learning to play a musical instrument. In your article, explain why learning an instrument can be useful for young people and say whether you would recommend it. Write 140-190 words.',
  },
});

const FRIENDSHIP_ARTICLE = `Are you a good friend?

Lots of people worry about what is a good friend and who is a bad friend. And most of them give them confidence to 1, 2 or 3 persons, because they think that people are different. But how do you really know if you have a good or bad friend, or even if you are a good friend.

First of all and the most important thing is that you should be loyal, because loyalty is everything. It doesn't matter if it is a close friend or not. If you are loyal, you aren't going to be a good friend only, also you are gonna become a good person too.

And second is always being ready for someone if it needs you. Because when you are in problems or you are through a difficult moment you need someone to listen you, give you advice or maybe you need a hug. That is why is important to be ready for your friends or people you love.

In conclusion what you give you receive so always try to be nice if you want them to be nice with you. But like I mentioned before, to be a good friend loyalty is number one, but very few people know the meaning of being loyal, so be careful.`;

TESTS.push({
  id: 'FRIENDSHIP (opinion stated in body — must stay ON TASK, Content ~4)',
  expectFriendshipCase: true,
  essayOverride: FRIENDSHIP_ARTICLE,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — article',
    partDescription: "Task type: article. The student's target level is B2.",
    instructions:
      'A school magazine has asked students to write an article about friendship. In your article, explain what makes someone a good friend and give your opinion about the most important qualities a friend should have. Write 140-190 words.',
  },
});

const INSTRUMENT_OPINION_ESSAY = `Some governments believe that playing a musical should be compulsory at school. Although music has many benefits, I believe it should be recommended rather than mandatory.

Music plays an important role in our culture. It is present in films, weddings and parties, and it helps to create emotions and bring people together. Learning to play an instrument can improve concentration, discipline and creativity. It can also help students express their feelings and reduce stress. For some talented people, music can become a career.

However, not everyone is talented or interested in music. Making students to learn an instrument could cause frustration and make them dislike school. Every student has different abilities and passions. Some may prefer sports or science, and they should have the freedom to develop their own skills.

In conclusion, playing an instrument is a valuable experience that can positively influence student's lives. But, it should be optional so that those who truly enjoy music can benefit from it without making others feel pressured.`;

TESTS.push({
  id: 'CORRECTION CARDS (compulsory instrument essay — low B2, L3, >=3 cards)',
  expectCardsCase: true,
  essayOverride: INSTRUMENT_OPINION_ESSAY,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — essay',
    partDescription: "Task type: essay. The student's target level is B2.",
    instructions:
      'All teenagers should learn to play a musical instrument. Do you agree? Write 140-190 words.',
  },
});

const SHOPPING_REVIEW = `A place to visit with friends

Last month I went with my friends to a new shopping centre near my city. It is a very popular place because there are many shops, restaurants and also a cinema. I think it is a good place for young people because you can do different activities in the same afternoon.

The best thing of this place is that it has a lot of options. You can buy clothes, eat something or watch a film. Also, the restaurants are not very expensive, so students can go there without spending too much money. The atmosphere is nice and there are always many people, which makes the place more exciting.

However, there are some negative things too. At weekends it is too crowded and sometimes you have to wait a long time to find a table. In addition, some shops are very expensive and the music in some areas is too loud.

In conclusion, I would recommend this shopping centre to students who want to spend time with friends. It is not perfect, but it is a good option for an afternoon.`;

TESTS.push({
  id: 'REVIEW (shopping centre — CEFR/score coherence, no duplicate cards)',
  expectReviewCase: true,
  essayOverride: SHOPPING_REVIEW,
  taskContext: {
    partLabel: 'Dralo AI Writing sandbox — review',
    partDescription: "Task type: review. The student's target level is B2.",
    instructions:
      'A website for students wants reviews of places where young people can spend a nice afternoon. Write a review of a place you have visited. Describe the place, say what was good and bad about it, and explain whether you would recommend it to other students. Write 140-190 words.',
  },
});

function countWords(t) {
  return String(t || '').trim().split(/\s+/).filter(Boolean).length;
}

function normCard(t) {
  return String(t || '').trim().toLowerCase().replace(/["'""'']/g, '').replace(/[.,;:!?…]+$/, '').replace(/\s+/g, ' ');
}

const only = process.argv[2];
const SELECTED = only ? TESTS.filter((t) => t.id.toLowerCase().includes(only.toLowerCase())) : TESTS;

for (const t of SELECTED) {
  console.log(`\n${'='.repeat(72)}\n${t.id}\n${'='.repeat(72)}`);
  const essayToSend = t.essayOverride || FAST_FOOD_ESSAY;
  const res = await fetch(`${BASE}/api/feedback/essay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      essay: essayToSend,
      level: 'b2',
      wordMin: 140,
      wordMax: 190,
      taskContext: t.taskContext,
    }),
  });
  if (!res.ok) {
    console.log(`HTTP ${res.status}: ${await res.text()}`);
    continue;
  }
  const { feedback, scores } = await res.json();
  const corrTypes = [...new Set([...feedback.matchAll(/^Type:\s*(.+)$/gm)].map((m) => m[1].trim().toLowerCase()))];
  const corrCount = (feedback.match(/^Original:/gm) || []).length;
  console.log(`\nFEEDBACK:\n${feedback}`);
  console.log(`\n--- SUMMARY ---`);
  console.log(`CEFR: ${scores.cefr ?? 'NOT PARSED'}`);
  console.log(`Scores: C${scores.content} CA${scores.communication} O${scores.organisation} L${scores.language} = ${scores.total}/20`);
  console.log(`Readiness: ${scores.readiness?.key} ("${scores.readiness?.label}")`);
  console.log(`Task match: ${scores.taskMatch ?? 'n/a'}`);

  if (t.expectOffTask) {
    const improved = (() => {
      const a = feedback.indexOf('📈');
      const b = feedback.indexOf('🚀', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).replace(/^📈[^\n]*\n?/, '').trim();
    })();
    const checks = [
      ['Task mismatch detected (OFF TASK)', scores.taskMatch === 'off'],
      [`Content <= 2 (got ${scores.content})`, scores.content <= 2],
      [`Communicative Achievement <= 2 (got ${scores.communication})`, scores.communication <= 2],
      ['Readiness needs-improvement / not-b2-ready', ['needs-improvement', 'not-b2-ready'].includes(scores.readiness?.key)],
      ['No polished improved version (note instead)', improved.includes('Improved version not provided')],
      ['Rewrite warning shown', /rewrite your essay/i.test(improved)],
      ['Study plan: read the task carefully', /read the task carefully/i.test(feedback)],
      ['Main problems mention task mismatch', /(does not address|not address the set task|off[- ]topic|off task)/i.test(feedback)],
    ];
    console.log('OFF-TASK ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }
  console.log(`Corrections: ${corrCount} [${corrTypes.join(', ')}]`);
  console.log(`Student word count (server): ${scores.wordCount} (local: ${countWords(essayToSend)})`);

  if (t.expectPartly) {
    const improved = (() => {
      const a = feedback.indexOf('📈');
      const b = feedback.indexOf('🚀', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).replace(/^📈[^\n]*\n?/, '').trim();
    })();
    const problems = (() => {
      const a = feedback.indexOf('🎯');
      const b = feedback.indexOf('✏️', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).trim();
    })();
    const taskCheckLine = (feedback.match(/Task match:[^\n]*/i) || [''])[0];
    const checks = [
      [`Not marked OFF TASK (got ${scores.taskMatch})`, scores.taskMatch !== 'off'],
      [`Task check flags incomplete point (got "${scores.taskMatch}")`, scores.taskMatch === 'partly'],
      ['Task check names the "bring" point', /bring/i.test(taskCheckLine)],
      [`Content <= 3 (got ${scores.content})`, scores.content <= 3],
      [`CEFR B1+/low B2 (got ${scores.cefr})`, ['B1+', 'low B2'].includes(scores.cefr)],
      [`Language ~2/5 (got ${scores.language})`, scores.language <= 2],
      ['Readiness not passed', !scores.readiness?.passed],
      ['Main problems mention the "what to bring" issue', /bring/i.test(problems)],
      ['Improved version answers what to bring (clothes/shoes/jacket…)', /(clothes|shoes|jacket|sunscreen|swimsuit|sun cream|trainers|towel)/i.test(improved)],
      ['Improved version keeps informal tone', /hi chris/i.test(improved) || improved.includes("'")],
      ['Improved version is a real text (not a note)', !improved.includes('Improved version not provided')],
      ['Study plan: underline/answer every question', /underline every question|answer each (one|question)/i.test(feedback)],
    ];
    console.log('PARTLY-OFF-TASK ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }

  if (t.expectReviewCase) {
    const corrSection = (() => {
      const a = feedback.indexOf('✏️');
      const b = feedback.indexOf('📈', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).trim();
    })();
    const improved = (() => {
      const a = feedback.indexOf('📈');
      const b = feedback.indexOf('🚀', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).replace(/^📈[^\n]*\n?/, '').trim();
    })();
    const cards = corrSection.split(/\n(?=Original:)/i).filter((c) => /^Original:/im.test(c)).map((c) => ({
      original: (c.match(/Original:\s*([^\n]*)/i) || [])[1] || '',
      correct: (c.match(/Correct:\s*([^\n]*)/i) || [])[1] || '',
      problem: (c.match(/Problem:\s*([^\n]*)/i) || [])[1] || '',
      type: ((c.match(/Type:\s*([^\n]*)/i) || [])[1] || '').toLowerCase(),
    }));
    const keys = cards.map((c) => `${normCard(c.original)}|${normCard(c.correct)}`);
    const hasDuplicates = new Set(keys).size !== keys.length;
    const identicalCards = cards.filter((c) => normCard(c.original) && normCard(c.original) === normCard(c.correct));
    const styleCardsAsGrammar = cards.filter(
      (c) => /repetitive|phrasing|flat|word choice|style/i.test(c.problem) && /grammar/.test(c.type),
    );
    const coherentLevel =
      scores.cefr === 'low B2' ||
      scores.cefr === 'B2' ||
      (scores.cefr === 'B1+' &&
        !(scores.content >= 4 && scores.communication >= 4 && scores.organisation >= 4 && scores.language >= 3));
    const checks = [
      [`Task check ON TASK (got ${scores.taskMatch})`, scores.taskMatch === 'on'],
      [`CEFR coherent with scores (got ${scores.cefr} with C${scores.content} CA${scores.communication} O${scores.organisation} L${scores.language})`, coherentLevel],
      [
        `Readiness Borderline when low B2 + total>=12 (got ${scores.readiness?.key}, total ${scores.total})`,
        scores.cefr === 'low B2' ? scores.readiness?.key === 'borderline' : !scores.readiness?.passed || scores.cefr === 'B2',
      ],
      [`Language ~3/5 (got ${scores.language})`, scores.language >= 2 && scores.language <= 3],
      [`No duplicate correction cards (got ${cards.length} cards)`, !hasDuplicates],
      [`No Original===Correct cards (got ${identicalCards.length})`, identicalCards.length === 0],
      [`Style cards not labelled grammar (got ${styleCardsAsGrammar.length})`, styleCardsAsGrammar.length === 0],
      [`At least 3 correction cards (got ${cards.length})`, cards.length >= 3],
      ['Improved version uses review vocabulary (lively/pleasant/enjoyable)', /lively|pleasant|enjoyable/i.test(improved)],
      ['Study plan includes review adjectives', /review adjectives|lively, affordable/i.test(feedback)],
    ];
    console.log('REVIEW ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }

  if (t.expectCardsCase) {
    const corrSection = (() => {
      const a = feedback.indexOf('✏️');
      const b = feedback.indexOf('📈', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).trim();
    })();
    const studySection = (() => {
      const a = feedback.indexOf('📚');
      return a === -1 ? '' : feedback.slice(a).trim();
    })();
    const corrTotal = (feedback.match(/^Original:/gm) || []).length;
    const studyMentionsPossessive = /possessive|plural/i.test(studySection);
    const cardsCoverPossessive = /possessive|plural|students'/i.test(corrSection);
    const checks = [
      [`Task check ON TASK (got ${scores.taskMatch})`, scores.taskMatch === 'on'],
      [`CEFR low B2 or B2 max (got ${scores.cefr})`, ['low B2', 'B2'].includes(scores.cefr)],
      [
        `Readiness Borderline (or B2-ready only with CEFR B2) (got ${scores.readiness?.key})`,
        scores.readiness?.key === 'borderline' || (scores.cefr === 'B2' && scores.readiness?.key === 'b2-ready'),
      ],
      [`Content ~4/5 (got ${scores.content})`, scores.content >= 3 && scores.content <= 5],
      [`CA ~4/5 (got ${scores.communication})`, scores.communication >= 3 && scores.communication <= 5],
      [`Organisation ~4/5 (got ${scores.organisation})`, scores.organisation >= 3 && scores.organisation <= 5],
      [`Language ~3/5 (got ${scores.language})`, scores.language >= 2 && scores.language <= 3],
      [`At least 3 correction cards (got ${corrTotal})`, corrTotal >= 3],
      [
        `Study plan/cards coherent on possessive-plural (study mentions: ${studyMentionsPossessive}, cards cover: ${cardsCoverPossessive})`,
        !studyMentionsPossessive || cardsCoverPossessive,
      ],
      ['No invented "task response" cards (essay is on task)', !/Type:\s*task response/i.test(corrSection)],
    ];
    console.log('CORRECTION-CARDS ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }

  if (t.expectFriendshipCase) {
    const improved = (() => {
      const a = feedback.indexOf('📈');
      const b = feedback.indexOf('🚀', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).replace(/^📈[^\n]*\n?/, '').trim();
    })();
    const taskCheckLine = (feedback.match(/Task match:[^\n]*/i) || [''])[0];
    const corrTotal = (feedback.match(/^Original:/gm) || []).length;
    const checks = [
      [`Task check ON TASK, no PARTLY (got ${scores.taskMatch}: "${taskCheckLine.slice(0, 90)}…")`, scores.taskMatch === 'on'],
      [`CEFR B1 or B1+ (got ${scores.cefr})`, ['B1', 'B1+'].includes(scores.cefr)],
      [`Content ~4/5 (got ${scores.content})`, scores.content === 4],
      [`CA ~3/5 (got ${scores.communication})`, scores.communication >= 2 && scores.communication <= 4],
      [`Organisation ~3/5 (got ${scores.organisation})`, scores.organisation >= 2 && scores.organisation <= 4],
      [`Language ~2/5 (got ${scores.language})`, scores.language <= 2],
      ['Readiness: Not B2-ready / Needs improvement', ['not-b2-ready', 'needs-improvement'].includes(scores.readiness?.key)],
      [`Corrections remain useful (got ${corrTotal})`, corrTotal >= 3],
      ['Improved version states opinion clearly', /in my opinion|most important (quality|thing)|loyalty is (the most important|number one|everything)|number one quality/i.test(improved)],
      [`Improved version <= 190 words (original is 218; got ${countWords(improved)})`, countWords(improved) <= 190],
    ];
    console.log('FRIENDSHIP ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }

  if (t.expectArticleCase) {
    const improved = (() => {
      const a = feedback.indexOf('📈');
      const b = feedback.indexOf('🚀', a + 1);
      return (b === -1 ? feedback.slice(a) : feedback.slice(a, b)).replace(/^📈[^\n]*\n?/, '').trim();
    })();
    const improvedTitle = improved.split('\n').map((l) => l.trim()).find(Boolean) || '';
    const taskCheckLine = (feedback.match(/Task match:[^\n]*/i) || [''])[0];
    const checks = [
      [`Task check ON TASK (got ${scores.taskMatch})`, scores.taskMatch === 'on'],
      [`Task check notes recommendation not explicit ("${taskCheckLine.slice(0, 90)}…")`, /recommend|explicit/i.test(taskCheckLine)],
      [`Content ~4/5 (got ${scores.content})`, scores.content === 4],
      [`CA ~3/5 (got ${scores.communication})`, scores.communication >= 2 && scores.communication <= 4],
      [`Organisation ~3/5 (got ${scores.organisation})`, scores.organisation >= 2 && scores.organisation <= 4],
      [`Language ~2/5 (got ${scores.language})`, scores.language <= 2],
      [`CEFR B1+/low B2 max (got ${scores.cefr})`, ['B1+', 'low B2'].includes(scores.cefr)],
      ['Readiness: Not B2-ready / Needs improvement', ['not-b2-ready', 'needs-improvement'].includes(scores.readiness?.key)],
      ['No "passive form" mislabel anywhere', !/passive/i.test(feedback)],
      [`Improved version corrects the title (got "${improvedTitle}")`, !/LEARN TO PLAY INSTRUMENT/.test(improvedTitle) && /an instrument/i.test(improvedTitle)],
      ['Improved version has explicit recommendation', /recommend/i.test(improved)],
      ['No word limit/word count claims (text in range)', !/word\s*-?\s*(limit|count)/i.test(feedback)],
    ];
    console.log('ARTICLE ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }

  if (t.expectInRangeClean) {
    const levelLine = (feedback.match(/Level:[^\n]*/i) || [''])[0];
    const checks = [
      [`Task check ON TASK (got ${scores.taskMatch})`, scores.taskMatch === 'on'],
      [`CEFR B1 or B1+ (got ${scores.cefr})`, ['B1', 'B1+'].includes(scores.cefr)],
      [`No ambiguous level label (line: "${levelLine}")`, !/\/|\bor\b|\bbetween\b|B1\s*-\s*B2/i.test(levelLine)],
      ['No "over/under the word limit" mention', !/(over|under|above|below|exceed\w*)\s+the\s+(word\s+)?limit/i.test(feedback)],
      ['No word limit/word count claims anywhere', !/word\s*-?\s*(limit|count)/i.test(feedback)],
      [`Content ~4/5 (got ${scores.content})`, scores.content >= 3 && scores.content <= 5],
      [`CA ~3/5 (got ${scores.communication})`, scores.communication >= 2 && scores.communication <= 4],
      [`Organisation ~3/5 (got ${scores.organisation})`, scores.organisation >= 2 && scores.organisation <= 4],
      [`Language ~2/5 (got ${scores.language})`, scores.language <= 2],
      ['Readiness: Not B2-ready / Needs improvement', ['not-b2-ready', 'needs-improvement'].includes(scores.readiness?.key)],
      ['Study plan present with Grammar items', /📚[\s\S]*Grammar:/i.test(feedback)],
    ];
    console.log('IN-RANGE / SINGLE-LABEL ACCEPTANCE CHECKS:');
    let fails = 0;
    for (const [label, ok] of checks) {
      if (!ok) fails += 1;
      console.log(`  ${ok ? 'PASS' : 'FAIL'} ${label}`);
    }
    console.log(`  => ${fails === 0 ? 'ALL CHECKS PASSED' : `${fails} CHECK(S) FAILED`}`);
  }
}
