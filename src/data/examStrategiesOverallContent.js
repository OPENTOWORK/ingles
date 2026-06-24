import { buildTeoriaExamPartTipsHref } from '@/lib/examPartTipsHref';
import { examStrategiesChapterPath } from '@/config/appRoutes';
import { EXAM_STRATEGIES_STUDENT_LEVEL } from '@/data/examStrategiesStudentIndex';

const LEVEL = EXAM_STRATEGIES_STUDENT_LEVEL;

/**
 * @typedef {{ label: string, href: string }} StrategyLink
 * @typedef {{ part: string, time: string, note?: string }} TimingRow
 * @typedef {{
 *   overview: string,
 *   timing?: TimingRow[],
 *   approach: string[],
 *   crossPart: string[],
 *   mistakes: string[],
 *   studyTip: string,
 *   nextSteps: StrategyLink[],
 * }} OverallStrategyContent
 */

/** @type {Record<string, OverallStrategyContent>} */
export const EXAM_STRATEGIES_OVERALL_CONTENT = {
  'reading-and-use-of-english': {
    overview:
      'Reading and Use of English is one paper with seven parts: Parts 1–4 test grammar and vocabulary in context; Parts 5–7 test reading skills. You have 75 minutes for 52 questions — accuracy in Use of English saves time for the longer reading tasks at the end.',
    timing: [
      { part: 'Parts 1–4 (Use of English)', time: '35–40 min', note: 'Parts 1–2 first — they build confidence' },
      { part: 'Part 5 (Multiple-choice reading)', time: '8–10 min', note: 'Questions follow the text order' },
      { part: 'Part 6 (Gapped text)', time: '10–12 min', note: 'Check pronouns and linkers' },
      { part: 'Part 7 (Multiple matching)', time: '12–15 min', note: 'Scan — do not read every text in depth' },
      { part: 'Final check', time: '3–5 min', note: 'Revisit doubtful Use of English gaps' },
    ],
    approach: [
      'Skim the whole paper once: note how many Use of English vs Reading parts you face.',
      'Do Parts 1–4 in order — they warm up your grammar and vocabulary before the reading load.',
      'In Use of English, read the full sentence before answering; one word per gap in Part 2.',
      'When you reach Part 5, read the text for gist first, then answer questions in sequence.',
      'Leave Part 7 for when you still have energy to scan quickly — it rewards speed, not deep reading.',
    ],
    crossPart: [
      'Collocations you learn in Part 1 help with open cloze (Part 2) and word formation (Part 3).',
      'Key word transformations (Part 4) recycle the same grammar as Parts 1–2 — revise passive, conditionals, reported speech together.',
      'Reference words (this, it, they) matter in Part 6 and in Part 5 detail questions — train yourself to track them.',
      'Paraphrase recognition in Part 5 prepares you for Part 7, where correct answers rarely repeat question words.',
    ],
    mistakes: [
      'Spending too long on Part 1 and running out of time for Part 7.',
      'Writing more than one word in Part 2 open cloze.',
      'Choosing reading options because the same word appears in the text (Part 5).',
      'Matching by topic instead of exact opinion in Part 7.',
      'Not transferring answers carefully — every blank counts.',
    ],
    studyTip:
      'In practice, time each part separately once a week. If Part 7 always runs over, cut 2 minutes from Parts 1–2 before the real exam.',
    nextSteps: [1, 2, 3, 4, 5, 6, 7].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(LEVEL, 'reading-and-use-of-english', part),
    })),
  },
  listening: {
    overview:
      'The Listening paper has four parts, about 40 minutes plus transfer time. You hear each recording twice (except some Part 1 extracts). Questions test gist, detail, attitude and opinion — not every word you hear.',
    timing: [
      { part: 'Before each part', time: 'Use prep time', note: 'Read questions and underline keywords' },
      { part: 'Part 1 (Short extracts)', time: '~10 min', note: 'One question per extract — stay focused' },
      { part: 'Part 2 (Sentence completion)', time: '~10 min', note: 'Write exact words you hear' },
      { part: 'Part 3 (Multiple matching)', time: '~8 min', note: 'Each letter used once' },
      { part: 'Part 4 (Interview)', time: '~10 min', note: 'Questions follow the interview order' },
      { part: 'Transfer answers', time: '6 min', note: 'Check spelling and word limits' },
    ],
    approach: [
      'Before the test starts, check your pen and that you can hear the audio clearly.',
      'Read the rubric and questions before each part plays — predict what you will hear.',
      'First listening: get the main idea and note possible answers. Second listening: confirm and fill gaps.',
      'If you miss an answer, move on — waiting costs the next question.',
      'In Part 2, write only the missing words; check spelling when you transfer.',
    ],
    crossPart: [
      'Keyword traps appear in Part 1 and Part 4 — the audio mentions a word that appears in a wrong option.',
      'Attitude and opinion language in Part 4 builds on gist skills from Part 1.',
      'Part 3 matching is like Reading Part 7: find the speaker whose overall message fits, not one detail.',
      'Accurate spelling in Part 2 saves marks you might lose elsewhere — British spelling is expected.',
    ],
    mistakes: [
      'Reading questions only while the audio plays — preparation time is part of the task.',
      'Choosing an option because you recognise one word from the recording.',
      'Reusing a letter in Part 3 when each option is used once.',
      'Writing two words in Part 2 when only one or two are allowed.',
      'Leaving transfer time unused — many marks are lost on careless copying.',
    ],
    studyTip:
      'Listen to short BBC or podcast clips without subtitles twice a week: first for gist, second for exact phrases. It mirrors the exam rhythm.',
    nextSteps: [1, 2, 3, 4].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(LEVEL, 'listening', part),
    })),
  },
  writing: {
    overview:
      'Writing has two parts in 80 minutes: Part 1 is a compulsory essay (140–190 words); Part 2 is one task chosen from three options (article, email, review, report or story). Part 1 carries more weight — plan it carefully, but do not leave Part 2 unfinished.',
    timing: [
      { part: 'Part 1 — planning', time: '8–10 min', note: 'Outline intro + 3 body points + conclusion' },
      { part: 'Part 1 — writing', time: '30–32 min', note: 'All three notes + your own idea' },
      { part: 'Part 2 — choose & plan', time: '5 min', note: 'Read all three options before deciding' },
      { part: 'Part 2 — writing', time: '30–32 min', note: 'Match register to task type' },
      { part: 'Check both tasks', time: '5–6 min', note: 'Word count, linking words, obvious errors' },
    ],
    approach: [
      'Read both parts of the paper before you write — know what Part 2 options are while you plan Part 1.',
      'Part 1: underline the three notes and plan one paragraph per note plus your own idea.',
      'Use linking words (However, In addition, On the other hand) but keep the essay semi-formal.',
      'Part 2: pick the task you can structure fastest, not the “interesting” one.',
      'Count words roughly as you write — 140 minimum, 190 maximum per task.',
    ],
    crossPart: [
      'Linking words practised in the Part 1 essay improve coherence in Part 2 as well.',
      'Register matters in both parts: essay = semi-formal; email = informal; report = formal.',
      'Planning time in Part 1 stops you from rewriting — the same habit helps Part 2 hit every bullet point.',
      'Strong paragraph structure in the essay (topic sentence + support) transfers to reviews and reports.',
    ],
    mistakes: [
      'Ignoring one of the three essay notes or repeating a note instead of adding your own idea.',
      'Choosing Part 2 without reading all three options.',
      'Writing far under 140 words or far over 190 words.',
      'Using the same informal style in an essay and a report.',
      'No time left to proofread — avoidable spelling errors cost Language marks.',
    ],
    studyTip:
      'Once a week, write only the plan for Part 1 in 8 minutes, then compare with a model answer. Planning is the cheapest way to raise your Content score.',
    nextSteps: [
      {
        label: 'Part 1 — Essay Tips',
        href: buildTeoriaExamPartTipsHref(LEVEL, 'writing', 1),
      },
      {
        label: 'Part 2 — Review',
        href: examStrategiesChapterPath('writing', 'part-2-review'),
      },
      {
        label: 'Part 2 — Report',
        href: examStrategiesChapterPath('writing', 'part-2-report'),
      },
      {
        label: 'Part 2 — Article',
        href: examStrategiesChapterPath('writing', 'part-2-article'),
      },
      {
        label: 'Part 2 — Email',
        href: examStrategiesChapterPath('writing', 'part-2-email'),
      },
    ],
  },
  speaking: {
    overview:
      'Speaking has four parts, about 14 minutes in total, usually with two candidates and two examiners. Parts 1 and 4 are discussions; Part 2 is an individual long turn comparing photos; Part 3 is a collaborative task with your partner. Interaction counts as much as accuracy.',
    timing: [
      { part: 'Part 1 (Interview)', time: '2 min', note: 'Short personal questions' },
      { part: 'Part 2 (Long turn)', time: '3–4 min', note: '~1 min each candidate comparing photos' },
      { part: 'Part 3 (Collaborative task)', time: '2–3 min', note: 'Discuss options, then decide together' },
      { part: 'Part 4 (Discussion)', time: '4–5 min', note: 'Develop ideas from Part 3 topic' },
    ],
    approach: [
      'Answer the question you are asked, then extend with a reason or short example — avoid one-word replies.',
      'In Part 2, compare the photos throughout the minute; do not describe them one after another.',
      'In Part 3, respond to your partner, disagree politely, and work towards a decision.',
      'In Part 4, listen to the examiner and build on what was said — do not give a memorised speech.',
      'Use natural fillers (well, I think, actually) while you think; silence is worse than a small mistake.',
    ],
    crossPart: [
      'Opinion + reason language from Part 1 returns in Part 4 — practise I think… because…',
      'Comparatives from Part 2 (more/less, whereas, similar to) help you discuss abstract topics in Part 4.',
      'Turn-taking phrases from Part 3 (What do you think? / I see your point, but…) show Interactive Communication.',
      'Speculation (might, could, seems to) in Part 2 prepares you for hedging in Part 4 (it depends, tend to).',
    ],
    mistakes: [
      'Memorised answers that do not fit the question (especially Part 1).',
      'Describing photos separately in Part 2 instead of comparing them.',
      'Dominating or saying nothing in Part 3 — balance interaction with your partner.',
      'Repeating the same vocabulary across all parts without trying to paraphrase.',
      'Stopping too early in the long turn because you think one minute is short — keep developing.',
    ],
    studyTip:
      'Record yourself answering a Part 2-style comparison for one minute. Listen back: did you compare, speculate, and give a preference? Repeat until all three are present.',
    nextSteps: [1, 2, 3, 4].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(LEVEL, 'speaking', part),
    })),
  },
};

/**
 * @param {string} skill
 * @param {string} chapter
 * @returns {OverallStrategyContent | null}
 */
export function getExamStrategiesOverallContent(skill, chapter) {
  if (chapter !== 'overall-strategy') return null;
  return EXAM_STRATEGIES_OVERALL_CONTENT[skill] ?? null;
}
