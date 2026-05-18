/**
 * Generates *Exercises.js for every theory topic and updates page.js imports.
 * Run: node scripts/generate-theory-exercise-packs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const TEORIA = path.join(ROOT, 'src', 'app', 'teoria');

const SKIP = new Set(['page.js', '[section]']);
const SKIP_FOLDERS = new Set(['7-Present-Tenses']); // hand-crafted pack

function slugFromFolder(folder) {
  return folder
    .replace(/^\d+-/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 24) || folder.toLowerCase();
}

function fnName(folder) {
  const base = folder.replace(/[^a-zA-Z0-9]/g, ' ');
  const parts = base.split(/\s+/).filter(Boolean);
  return `build${parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('')}Exercises`;
}

function extractString(str, start) {
  const q = str[start];
  if (q !== '"' && q !== "'") return null;
  let i = start + 1;
  let out = '';
  while (i < str.length) {
    if (str[i] === '\\') {
      out += str[i + 1];
      i += 2;
      continue;
    }
    if (str[i] === q) return { value: out, end: i + 1 };
    out += str[i];
    i += 1;
  }
  return null;
}

function parseMultipleChoice(block) {
  const items = [];
  const re = /<MultipleChoiceExercise/g;
  let m;
  while ((m = re.exec(block))) {
    const chunk = block.slice(m.index, m.index + 1200);
    const qIdx = chunk.indexOf('question=');
    if (qIdx < 0) continue;
    const q = extractString(chunk, qIdx + 'question='.length);
    if (!q) continue;

    const optIdx = chunk.indexOf('options={');
    if (optIdx < 0) continue;
    const optStart = optIdx + 'options={'.length;
    const optEnd = chunk.indexOf(']}', optStart);
    const optInner = chunk.slice(optStart, optEnd);
    const options = [...optInner.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((x) =>
      x[1].replace(/\\"/g, '"'),
    );
    if (options.length === 0) continue;

    const caMatch = chunk.match(/correctAnswer=\{?(\d+)\}?/);
    const expIdx = chunk.indexOf('explanation=');
    const exp = expIdx >= 0 ? extractString(chunk, expIdx + 'explanation='.length) : null;

    items.push({
      question: q.value,
      options,
      correctAnswer: caMatch ? Number(caMatch[1]) : 0,
      explanation: exp?.value || '',
    });
  }
  return items;
}

function parseTrueFalse(block) {
  const items = [];
  const re = /<TrueFalseExercise/g;
  let m;
  while ((m = re.exec(block))) {
    const chunk = block.slice(m.index, m.index + 4000);
    const statements = [];
    const stmtRe = /text:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g;
    let s;
    while ((s = stmtRe.exec(chunk))) {
      const parsed = extractString(s[0], s[0].indexOf(s[0].match(/["']/)[0]));
      if (!parsed) continue;
      const after = chunk.slice(s.index, s.index + 400);
      const isTrue = /isTrue:\s*true/.test(after);
      const expM = after.match(/explanation:\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/);
      const exp = expM ? extractString(expM[0], expM[0].indexOf(expM[0].match(/["']/)[0])) : null;
      statements.push({
        text: parsed.value,
        isTrue,
        explanation: exp?.value || '',
      });
    }
    if (statements.length) items.push({ statements });
  }
  return items;
}

function detectSection(folder, title) {
  const f = folder.toLowerCase();
  if (/^(1-|2-|3-|4-|5-|6-|7-|8-|9-|10-|11-)|verb|pronoun|tense|modal|conditional|clause|passive|reported|article|preposition|adverb|infinitive|gerund|comparative|collocation|false-friend|linking|sentence|question-formation|word-formation|subjunctive/i.test(f)) {
    return 'grammar';
  }
  if (/reading|gist|skimming|scanning|inference|vocabulary-in-context|opinion|cohesion-and-coherence|text-organization|gapped|multiple-matching|cross-text/i.test(f)) {
    return 'reading';
  }
  if (/listening|dialogue|monologue|pronunciation|connected-speech|note-taking|active-listening|english-varieties/i.test(f)) {
    return 'listening';
  }
  if (/writing|essay|planning|text-types|cohesion-and-connector|register|key-resources|useful-grammar/i.test(f)) {
    return 'writing';
  }
  if (/speaking|interaction|conversational/i.test(f)) {
    return 'speaking';
  }
  if (/cloze|transformation|use-of|multiple-choice/i.test(f)) {
    return 'useOfEnglish';
  }
  return 'grammar';
}

function padMc(list, topicTitle, n) {
  const out = [...list];
  const fillers = [
    {
      question: `Which statement about "${topicTitle}" is correct?`,
      options: [
        'It is only useful at C2 level',
        'It is an important topic for Cambridge exams',
        'It is never tested in Use of English',
        'It replaces all other grammar topics',
      ],
      correctAnswer: 1,
      explanation: `"${topicTitle}" is relevant across B1–C2 exam preparation.`,
    },
    {
      question: `When studying "${topicTitle}", you should:`,
      options: [
        'Memorise rules without examples',
        'Combine rules with practice and feedback',
        'Ignore mistakes',
        'Only read, never practise',
      ],
      correctAnswer: 1,
      explanation: 'Active practice with feedback is the most effective approach.',
    },
  ];
  let i = 0;
  while (out.length < n) {
    out.push(fillers[i % fillers.length]);
    i += 1;
  }
  return out.slice(0, n);
}

function splitTrueFalse(groups, n) {
  const out = [];
  for (const g of groups) {
    const stmts = g.statements || [];
    for (let i = 0; i < stmts.length; i += 3) {
      out.push({ statements: stmts.slice(i, i + 3) });
    }
  }
  while (out.length < n) {
    out.push({
      statements: [
        {
          text: `Understanding "${out.length ? 'this' : 'the'}" topic helps exam performance.`,
          isTrue: true,
          explanation: 'Strong topic knowledge improves accuracy in all papers.',
        },
        {
          text: 'You never need to review this topic after learning it once.',
          isTrue: false,
          explanation: 'Spaced review is essential for long-term retention.',
        },
        {
          text: 'Examples are as important as rules.',
          isTrue: true,
          explanation: 'Examples show how rules work in real language.',
        },
      ],
    });
  }
  return out.slice(0, n);
}

function supplements(section, topicTitle) {
  const t = topicTitle;
  const grammar = {
    fillBlanks: [
      { text: `Good study of ${t} helps you ___0___ fewer mistakes in exams.`, blanks: [{ answer: 'make' }] },
      { text: `Practise ${t} until the rules feel ___0___ and natural.`, blanks: [{ answer: 'clear' }] },
      { text: `Review your notes on ${t} ___0___ week.`, blanks: [{ answer: 'every' }] },
    ],
    matching: [
      {
        title: 'Match the concept to its role',
        pairs: [
          { left: 'Rule', right: 'Explains the pattern' },
          { left: 'Example', right: 'Shows real usage' },
          { left: 'Practice', right: 'Builds automaticity' },
          { left: 'Feedback', right: 'Corrects mistakes' },
        ],
        explanation: 'Rules, examples, practice, and feedback work together.',
      },
      {
        title: `Match the term to ${t}`,
        pairs: [
          { left: 'Form', right: 'How it is built' },
          { left: 'Meaning', right: 'What it expresses' },
          { left: 'Use', right: 'When to choose it' },
          { left: 'Mistake', right: 'What learners often get wrong' },
        ],
        explanation: 'Form, meaning, use, and typical errors are the four pillars.',
      },
    ],
    findError: [
      {
        title: 'Find the mistake',
        sentence: 'She don\'t understand the rule.',
        options: ['She', "don't", 'understand', 'the rule'],
        correctIndex: 1,
        explanation: "With she/he/it use doesn't, not don't.",
      },
      {
        title: 'Find the mistake',
        sentence: 'He have finished the exercise.',
        options: ['He', 'have', 'finished', 'the exercise'],
        correctIndex: 1,
        explanation: 'With he/she/it use has, not have.',
      },
      {
        title: 'Find the mistake',
        sentence: 'They was studying all evening.',
        options: ['They', 'was', 'studying', 'all evening'],
        correctIndex: 1,
        explanation: 'With they/we/you use were, not was.',
      },
    ],
    sentenceOrder: [
      {
        title: 'Order the study steps',
        words: ['Read', 'the', 'rule', 'carefully', 'first'],
        explanation: 'Start with the rule before practising.',
      },
      {
        title: 'Order the sentence',
        words: ['Practice', 'makes', 'your', 'English', 'stronger'],
        explanation: 'Regular practice improves performance.',
      },
      {
        title: 'Order the question',
        words: ['Do', 'you', 'understand', 'this', 'topic', '?'],
        explanation: 'Yes/no questions: Do + subject + base verb.',
      },
    ],
    selectAll: [
      {
        title: `Select all good strategies for ${t}`,
        prompt: 'Tick every effective study habit.',
        options: [
          { text: 'Use varied example sentences', isCorrect: true },
          { text: 'Never check your answers', isCorrect: false },
          { text: 'Review mistakes after practice', isCorrect: true },
          { text: 'Skip explanation and only guess', isCorrect: false },
        ],
        explanation: 'Examples and error review strengthen learning.',
      },
      {
        title: 'Select all true statements',
        prompt: 'Which statements are correct?',
        options: [
          { text: 'Context helps you choose the right form', isCorrect: true },
          { text: 'One rule covers every situation in English', isCorrect: false },
          { text: 'Time expressions often signal the tense', isCorrect: true },
          { text: 'Listening and reading expose you to real usage', isCorrect: true },
        ],
        explanation: 'English requires context; time words and input matter.',
      },
    ],
  };

  const skill = {
    fillBlanks: [
      { text: `When applying ${t}, first ___0___ what you need to find.`, blanks: [{ answer: 'identify' }] },
      { text: `Skim the text to get the ___0___ idea quickly.`, blanks: [{ answer: 'main' }] },
      { text: `Then read ___0___ for the specific details you need.`, blanks: [{ answer: 'carefully' }] },
    ],
    matching: [
      {
        title: 'Match the strategy to its purpose',
        pairs: [
          { left: 'Skimming', right: 'Get the gist fast' },
          { left: 'Scanning', right: 'Find specific information' },
          { left: 'Close reading', right: 'Analyse detail and nuance' },
          { left: 'Checking', right: 'Verify your answer' },
        ],
        explanation: 'Each reading/listening strategy has a distinct goal.',
      },
      {
        title: 'Match the signal to what it shows',
        pairs: [
          { left: 'However', right: 'Contrast' },
          { left: 'Therefore', right: 'Result' },
          { left: 'For example', right: 'Illustration' },
          { left: 'In contrast', right: 'Opposition' },
        ],
        explanation: 'Discourse markers guide interpretation.',
      },
    ],
    findError: [
      {
        title: 'Find the weak advice',
        sentence: 'You should read every word at the same slow speed.',
        options: ['You', 'should', 'every word', 'slow speed'],
        correctIndex: 2,
        explanation: 'Adjust speed: skim/scan first, then read carefully where needed.',
      },
      {
        title: 'Find the weak advice',
        sentence: 'Never read the question before the text.',
        options: ['Never', 'read', 'the question', 'before the text'],
        correctIndex: 0,
        explanation: 'Always read the task/question first to know what to look for.',
      },
      {
        title: 'Find the weak advice',
        sentence: 'If you are unsure, always choose the longest option.',
        options: ['If you are unsure', 'always', 'choose', 'the longest option'],
        correctIndex: 3,
        explanation: 'Length is not a reliable clue; use evidence from the text.',
      },
    ],
    sentenceOrder: [
      {
        title: 'Order the exam steps',
        words: ['Read', 'the', 'instructions', 'carefully', 'first'],
        explanation: 'Instructions tell you exactly what to do.',
      },
      {
        title: 'Order the process',
        words: ['Locate', 'the', 'relevant', 'section', 'of', 'the', 'text'],
        explanation: 'Find where the answer likely appears before answering.',
      },
      {
        title: 'Order the checking steps',
        words: ['Check', 'your', 'answer', 'against', 'the', 'text'],
        explanation: 'Always verify with evidence.',
      },
    ],
    selectAll: [
      {
        title: `Select all effective ${t} techniques`,
        prompt: 'Tick every good technique.',
        options: [
          { text: 'Underline key words in the question', isCorrect: true },
          { text: 'Ignore the time limit completely', isCorrect: false },
          { text: 'Use context to infer meaning', isCorrect: true },
          { text: 'Guess without returning to the text', isCorrect: false },
        ],
        explanation: 'Keywords, context, and evidence-based answers are essential.',
      },
      {
        title: 'Select all true statements',
        prompt: 'Which are correct?',
        options: [
          { text: 'Paraphrasing is common in exam texts', isCorrect: true },
          { text: 'The exact same words always appear in the answer', isCorrect: false },
          { text: 'Tone and attitude can be tested', isCorrect: true },
          { text: 'Practice improves speed and accuracy', isCorrect: true },
        ],
        explanation: 'Exams use paraphrase; tone matters; practice helps.',
      },
    ],
  };

  const skillSections = new Set(['reading', 'listening', 'writing', 'speaking', 'useOfEnglish']);
  return skillSections.has(section) ? skill : grammar;
}

function buildConfig(folder, pageContent) {
  const layoutTitle = pageContent.match(/<TheoryLayout[\s\S]*?title="([^"]+)"/);
  const topicTitle = layoutTitle?.[1] || folder;
  const section = detectSection(folder, topicTitle);

  const blockMatch = pageContent.match(/const exercises = \[([\s\S]*?)\n  \];/);
  const block = blockMatch?.[1] || '';

  const legacyMc = parseMultipleChoice(block);
  const legacyTf = parseTrueFalse(block);
  const sup = supplements(section, topicTitle);

  return {
    multipleChoice: padMc(legacyMc, topicTitle, 5),
    fillBlanks: sup.fillBlanks,
    trueFalse: splitTrueFalse(legacyTf, 2),
    matching: sup.matching,
    findError: sup.findError,
    sentenceOrder: sup.sentenceOrder,
    selectAll: sup.selectAll,
  };
}

function serializeConfig(config) {
  return JSON.stringify(config, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");
}

function exercisesFileName(folder) {
  const cleaned = folder.replace(/^\d+-/, '');
  const parts = cleaned.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const camel =
    parts[0].toLowerCase() +
    parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join('');
  return `${camel}Exercises.js`;
}

function generateExercisesFile(folder, config) {
  const slug = slugFromFolder(folder);
  const fn = fnName(folder);
  const fileName = exercisesFileName(folder);
  const outPath = path.join(TEORIA, folder, fileName);
  const configStr = JSON.stringify(config, null, 2);

  return {
    path: outPath,
    fileName,
    fn,
    content: `import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = ${configStr};

export function ${fn}() {
  return buildTheoryExercises('${slug}', config);
}
`,
  };
}

function updatePage(folder, fn, exercisesFileName) {
  const pagePath = path.join(TEORIA, folder, 'page.js');
  let content = fs.readFileSync(pagePath, 'utf8');

  content = content.replace(
    /import\s*\{[^}]*\}\s*from\s*'@\/components\/theory\/ExerciseComponents';?\n?/g,
    '',
  );
  content = content.replace(
    /import\s*\{[^}]*buildPresentTensesExercises[^}]*\}\s*from\s*['"]\.\/presentTensesExercises['"];?\n?/g,
    '',
  );
  content = content.replace(
    /import\s*\{[^}]*\}\s*from\s*['"]\.\/[^'"]*Exercises['"];?\n?/g,
    '',
  );

  const importLine = `import { ${fn} } from './${exercisesFileName.replace(/\.js$/, '')}';\n`;
  if (!content.includes(importLine.trim())) {
    const insertAt = content.indexOf("'use client'");
    if (insertAt >= 0) {
      const after = content.indexOf('\n', insertAt) + 1;
      content = content.slice(0, after) + importLine + content.slice(after);
    } else {
      content = importLine + content;
    }
  }

  content = content.replace(
    /const exercises = \[[\s\S]*?\n  \];/,
    `const exercises = ${fn}();`,
  );

  fs.writeFileSync(pagePath, content);
}

const folders = fs
  .readdirSync(TEORIA, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !SKIP.has(d.name))
  .map((d) => d.name)
  .filter((name) => fs.existsSync(path.join(TEORIA, name, 'page.js')));

let count = 0;
for (const folder of folders) {
  if (SKIP_FOLDERS.has(folder)) continue;

  const pagePath = path.join(TEORIA, folder, 'page.js');
  const pageContent = fs.readFileSync(pagePath, 'utf8');
  if (!pageContent.includes('const exercises =')) continue;

  const config = buildConfig(folder, pageContent);
  const { path: outPath, fileName, fn, content } = generateExercisesFile(folder, config);
  fs.writeFileSync(outPath, content);
  updatePage(folder, fn, fileName);
  count += 1;
  console.log('✓', folder);
}

console.log(`\nGenerated ${count} exercise packs.`);
