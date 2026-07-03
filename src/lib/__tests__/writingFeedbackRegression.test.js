import test from 'node:test';
import assert from 'node:assert/strict';
import { buildB2FirstPrompt } from '../cambridgeEssayFeedback.js';
import { buildAnnotatedEssayText } from '../writingAnnotatedTextBuilder.js';
import {
  ensureMissingTitleProblem,
  ensureUnclearOpinionTaskCheck,
  stripStrongerB2SkipPlaceholder,
} from '../writingFeedbackPostProcess.js';
import {
  LIBRARIES_WRITING_FIXTURE,
  validateLibrariesFeedbackFindings,
  validateLibrariesScores,
  promptRequiresStrictTeacherMarking,
  hasStrongerB2SkipPlaceholder,
  hasSuperficialConnectorStrengths,
} from '../writingFeedbackValidators.js';

const { task, notes, studentAnswer } = LIBRARIES_WRITING_FIXTURE;

const taskPack = `Task: ${task}\nNotes:\n- ${notes.join('\n- ')}`;

/** Ideal teacher-style feedback covering the libraries regression findings. */
const LIBRARIES_IDEAL_FEEDBACK = `
📝 Dralo writing feedback

💪 Main strengths
- Clear paragraphing with an introduction, body and conclusion.
- Attempt to contrast college libraries and public libraries.

🎯 Main problems
- Missing essay title at the top.
- The essay does not clearly answer "Do you agree?" — the stance is vague.
- The note about different services libraries can offer is only mentioned in passing.
- Your own idea is weak and not clearly separated.
- Several long sentences break down grammatically.

🎓 Estimated CEFR level
Level: B1+
The text shows B1+ control with frequent vocabulary and grammar problems — not yet solid B2.

📋 Task check
Task match: PARTLY OFF TASK — discusses libraries but does not clearly answer Do you agree?
Title included: no
Clear opinion: no
All notes covered: partial — services and own idea underdeveloped
Word count ok: yes
Paragraphing: acceptable

📊 Scores
- Content: 3/5
- Communicative Achievement: 3/5
- Organisation: 3/5
- Language: 3/5
**Total Score: 12/20**

✏️ Corrections
Original: "moreover since the pandemic"
Problem: WW — moreover misused here
Correct: "especially since the pandemic"
Why: Moreover adds information; here you need a reason link, not an additive connector.
Severity: medium
Type: vocabulary

Original: "grown into the online era"
Problem: WW — unnatural collocation
Correct: "adapted to online learning"
Why: Grown into does not collocate naturally with online era in English.
Severity: medium
Type: vocabulary

Original: "Colleague libraries"
Problem: spelling ⇒ College libraries
Correct: "College libraries"
Why: Colleague means coworker; the correct word is college.
Severity: major
Type: spelling

Original: "calmed atmosphere"
Problem: WW
Correct: "calm atmosphere"
Why: Calmed is the past participle of calm (verb); you need the adjective calm.
Severity: medium
Type: vocabulary

Original: "provide a lot options"
Problem: clunky
Correct: "provide a lot of options"
Why: Lot needs of before a countable noun phrase.
Severity: major
Type: grammar

Original: "towards it"
Problem: WW — vague collocation
Correct: "for online learning"
Why: Towards it is vague and unnatural here; name what you mean.
Severity: medium
Type: vocabulary

Original: "for your own good"
Problem: WW — idiom not appropriate here
Correct: "to suit your needs"
Why: For your own good sounds patronising and does not fit an essay conclusion.
Severity: medium
Type: vocabulary

Original: "Different services libraries can offer"
Problem: needs more developing
Correct: "Develop specific services such as research help, events, and digital access"
Why: The task note about services is barely developed — only types of libraries are described.
Severity: major
Type: task response

Original: "Do you agree?"
Problem: tell me which!
Correct: "State clearly whether you agree or disagree"
Why: The reader cannot tell your final position on whether libraries are still needed.
Severity: major
Type: task response

Original: "organise meetups and study"
Problem: need an object here
Correct: "organise study groups"
Why: Organise usually needs a clearer object; the sentence is also too long.
Severity: medium
Type: grammar

Original: "easier and faster way of learning"
Problem: clunky
Correct: "an easier and faster way to learn"
Why: Way of learning is less natural than way to learn after an adjective phrase.
Severity: medium
Type: grammar

Original: "First of all, we can differentiate"
Problem: clear paragraphing ✓
Correct: "First of all, we can differentiate"
Why: You use clear paragraph openers — keep this structure.
Severity: minor
Type: task response

📈 Improved version (your level)
Libraries Still Matter in the Digital Age

It is often discussed how much the way of studying has changed in recent years, especially since the pandemic of 2020. I partially disagree with the idea that libraries are no longer needed, because both college and public libraries still offer valuable services that online learning cannot fully replace.

College libraries are spaces where students can gather, discuss ideas and study together, usually in preparation for exams. Public libraries, on the other hand, provide a calm atmosphere for focused research and access to books, magazines and scientific publications. They also offer services such as study support, community events and access to digital resources.

However, online learning can seem an easier and faster way to learn and can provide a lot of options for students who prefer flexibility.

In conclusion, libraries remain useful alongside online learning, and students should choose the option that best suits their needs.

🚀 Stronger B2 version
Libraries Are Still Essential for Learners

Although online resources have transformed how we study, especially since 2020, I do not fully agree that libraries are no longer needed. Both college and public libraries continue to play an important role alongside digital learning.

College libraries allow students to collaborate, join study groups and prepare for exams in a shared academic environment. Public libraries offer a quiet atmosphere for research and a wide range of materials, from books to scientific journals. In addition, they provide practical services such as research assistance, workshops and free internet access, which many learners still rely on.

Admittedly, online courses can offer a convenient and efficient way to learn new skills. Even so, they cannot replace the community support and specialist resources that libraries provide.

Overall, libraries and online learning can coexist, and students benefit most when they use both thoughtfully.

📚 Study plan
- Strategy: Before writing, underline every question and bullet in the task and plan one paragraph per point.
- Grammar: Review countable nouns after a lot of (a lot of options).
- Vocabulary: Check collocations with online learning instead of translated phrases.
- Task response: Answer Do you agree? with a clear sentence in the introduction and conclusion.
`.trim();

test('libraries ideal feedback passes regression finding checks', () => {
  const result = validateLibrariesFeedbackFindings(LIBRARIES_IDEAL_FEEDBACK);
  assert.equal(result.ok, true, `missing findings: ${result.missing.join(', ')}`);
});

test('libraries ideal scores stay in realistic B1+/low B2 band', () => {
  const result = validateLibrariesScores({
    content: 3,
    communication: 3,
    organisation: 3,
    language: 3,
    total: 12,
    cefr: 'B1+',
  });
  assert.equal(result.ok, true, `score issues: ${result.issues.join(', ')}`);
});

test('B2 prompt requires strict teacher marking rules', () => {
  const prompt = buildB2FirstPrompt({
    essay: studentAnswer,
    taskPack,
    wordMin: 140,
    wordMax: 190,
    wordCount: 170,
    v2: true,
  });
  assert.equal(promptRequiresStrictTeacherMarking(prompt), true);
  assert.match(prompt, /Title included:/);
  assert.match(prompt, /MUST always write a full Stronger B2 version/);
  assert.match(prompt, /do NOT mark connectors.*as strengths if they are misused/i);
});

test('post-process flags missing title and unclear opinion for libraries essay', () => {
  const base = '🎯 Main problems\n- Vague conclusion.\n\n📊 Scores\n- Content: 3/5';
  const withTitle = ensureMissingTitleProblem(base, studentAnswer);
  assert.match(withTitle, /missing essay title/i);

  const withOpinion = ensureUnclearOpinionTaskCheck(withTitle, studentAnswer, taskPack);
  assert.match(withOpinion, /do you agree|clear opinion/i);
  assert.match(withOpinion, /Title included: no/i);
});

test('post-process removes Stronger B2 skip placeholder for complete essays', () => {
  const feedback = '🚀 Stronger B2 version\nNot needed yet — focus on the corrections above first.\n\n📚 Study plan';
  const cleaned = stripStrongerB2SkipPlaceholder(feedback, 170);
  assert.equal(hasStrongerB2SkipPlaceholder(cleaned), false);
  assert.match(cleaned, /stronger B2 rewrite is required/i);
});

test('annotated builder does not auto-mark connectors as strengths', () => {
  const blocks = [
    {
      original: 'provide a lot options',
      problem: 'clunky',
      correct: 'provide a lot of options',
      why: 'Lot needs of.',
      type: 'grammar',
    },
  ];
  const annotated = buildAnnotatedEssayText(studentAnswer, blocks, '', '');
  assert.doesNotMatch(annotated, /\[\[good\]\]However\[\[\/good\]\]/i);
  assert.doesNotMatch(annotated, /\[\[good\]\]moreover\[\[\/good\]\]/i);
});

test('ideal feedback avoids superficial connector praise', () => {
  assert.equal(hasSuperficialConnectorStrengths(LIBRARIES_IDEAL_FEEDBACK), false);
});
