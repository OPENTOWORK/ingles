import { EXAM_STRATEGIES_STUDENT_LEVEL } from '@/data/examStrategiesStudentIndex';

const LEVEL = EXAM_STRATEGIES_STUDENT_LEVEL;

const TASK_COLUMNS = ['Item', 'Detail', 'Note'];

/**
 * Fichas «Part N Tips» en el mismo formato que «Overall Strategy» (nivel B2).
 * Contenido corto a propósito: qué es, cómo hacerlo, fallos típicos y un consejo.
 *
 * @typedef {{
 *   overview: string,
 *   timing: { part: string, time: string, note?: string }[],
 *   approach: string[],
 *   mistakes: string[],
 *   studyTip: string,
 * }} PartStrategyContent
 */
const RAW_PART_CONTENT = {
  'reading-and-use-of-english': {
    1: {
      overview:
        'A short text with eight gaps. For each gap you choose one of four words (A–D). It tests vocabulary: collocations, fixed phrases and words that look similar but behave differently.',
      timing: [
        { part: 'Questions', time: '8 gaps', note: 'Four options each (A–D)' },
        { part: 'Suggested time', time: '8–10 min', note: 'Do not overthink single gaps' },
        { part: 'Tests', time: 'Vocabulary', note: 'Collocations and fixed phrases' },
      ],
      approach: [
        'Read the whole text once before answering — the title tells you the topic.',
        'Try the gap in your head first, then look for that idea among the options.',
        'Check the words right before and after the gap: many answers are fixed collocations.',
        'Eliminate two options quickly, then compare the remaining two in the full sentence.',
      ],
      mistakes: [
        'Picking a word that fits the grammar but not the collocation (make / do / take).',
        'Answering gap by gap without reading the whole text.',
        'Leaving a gap empty — there is no penalty for guessing.',
      ],
      studyTip:
        'Keep a collocation list from every practice test: verb + noun and adjective + preposition are the two groups that repeat most.',
    },
    2: {
      overview:
        'The same kind of text, but with no options: you write ONE word in each of the eight gaps. Almost every answer is a grammar word — article, preposition, pronoun, auxiliary or linker.',
      timing: [
        { part: 'Questions', time: '8 gaps', note: 'Exactly one word per gap' },
        { part: 'Suggested time', time: '8–10 min', note: 'Leave doubtful gaps for the end' },
        { part: 'Tests', time: 'Grammar', note: 'Articles, prepositions, linkers' },
      ],
      approach: [
        'Decide what type of word is missing before you think of the exact word.',
        'Look at the whole sentence, not just the gap — linkers depend on the sentence before.',
        'If a content word feels necessary, re-read: the answer is usually grammatical.',
        'Write something in every gap, then re-read the text to check it flows.',
      ],
      mistakes: [
        'Writing two words or a contraction (don’t counts as two words).',
        'Filling gaps with nouns or adjectives instead of grammar words.',
        'Ignoring fixed phrases such as in spite of, as well as, no matter.',
      ],
      studyTip:
        'Revise the closed word classes as a list: articles, prepositions, relative pronouns, auxiliaries and linkers. Those cover most Part 2 answers.',
    },
    3: {
      overview:
        'A text with eight gaps and a word in capitals beside each one. You change that word — prefix, suffix or both — so it fits the sentence.',
      timing: [
        { part: 'Questions', time: '8 gaps', note: 'One word given in capitals' },
        { part: 'Suggested time', time: '8–10 min', note: 'Fastest part when you know suffixes' },
        { part: 'Tests', time: 'Word formation', note: 'Prefixes, suffixes, plurals' },
      ],
      approach: [
        'Work out the word class you need: noun, verb, adjective or adverb.',
        'Check if the meaning is negative — many answers need un-, in-, im- or dis-.',
        'Decide singular or plural for nouns, and the right tense for verbs.',
        'Say the finished sentence to yourself: the wrong form usually sounds wrong.',
      ],
      mistakes: [
        'Giving the right family word in the wrong class (success instead of successful).',
        'Forgetting the plural -s when the sentence needs it.',
        'Missing the negative prefix when the sentence contrasts two ideas.',
      ],
      studyTip:
        'Study word families in groups of four (decide / decision / decisive / decisively) rather than single words.',
    },
    4: {
      overview:
        'Six separate items. You rewrite a sentence using a given key word, keeping the meaning the same. Your answer must be between two and five words and must include that key word unchanged.',
      timing: [
        { part: 'Questions', time: '6 items', note: 'Two marks each' },
        { part: 'Answer length', time: '2–5 words', note: 'The key word cannot change' },
        { part: 'Suggested time', time: '10–12 min', note: 'Two marks — worth the time' },
      ],
      approach: [
        'Identify what grammar is being tested: passive, conditional, reported speech, modal…',
        'Write the answer, then count the words — contractions count as two.',
        'Check the key word is exactly as given, with nothing added to it.',
        'Read both sentences together to be sure the meaning is identical.',
      ],
      mistakes: [
        'Changing the key word (e.g. writing took instead of take).',
        'Writing six or more words, or fewer than two.',
        'Changing the meaning slightly by adding an opinion or a detail.',
      ],
      studyTip:
        'You can score one of the two marks: if you are unsure, write your best version anyway — half-correct answers still earn a point.',
    },
    5: {
      overview:
        'One longer text with six multiple-choice questions (A–D). The questions test detail, opinion, attitude, purpose and the meaning of a word or phrase in context.',
      timing: [
        { part: 'Questions', time: '6 questions', note: 'Four options each' },
        { part: 'Suggested time', time: '8–10 min', note: 'Questions follow the text order' },
        { part: 'Tests', time: 'Detailed reading', note: 'Opinion, attitude, implication' },
      ],
      approach: [
        'Read the text once for general meaning before looking at the options.',
        'Answer in order: question 1 relates to the start, question 6 to the end.',
        'Find the part of the text the question refers to and read around it carefully.',
        'Prove your answer with a specific line; if you cannot, it is probably wrong.',
      ],
      mistakes: [
        'Choosing an option because it repeats words from the text.',
        'Answering from your own knowledge instead of from the writer’s view.',
        'Picking an option that is true in general but not stated in that paragraph.',
      ],
      studyTip:
        'After each practice test, write why each wrong option is wrong. Spotting the trap type is what makes Part 5 faster.',
    },
    6: {
      overview:
        'A text with six sentences removed. You choose the sentence that fits each gap from seven options (A–G) — one option is never used. It tests how ideas connect across a text.',
      timing: [
        { part: 'Questions', time: '6 gaps', note: 'Seven options, one extra' },
        { part: 'Suggested time', time: '10–12 min', note: 'Check the text after each choice' },
        { part: 'Tests', time: 'Text structure', note: 'Reference words and linkers' },
      ],
      approach: [
        'Read the whole text with the gaps first to follow the overall argument.',
        'Read what comes before AND after each gap — the answer must link both sides.',
        'Underline reference words (this, they, such, instead) and match them to a noun.',
        'Do the easy gaps first; the extra option is easier to spot at the end.',
      ],
      mistakes: [
        'Choosing by shared topic words instead of by logical connection.',
        'Only reading the sentence before the gap.',
        'Not re-reading the finished paragraph to check it makes sense.',
      ],
      studyTip:
        'In any article you read, cover a sentence and predict it from the surrounding text. That is exactly the Part 6 skill.',
    },
    7: {
      overview:
        'One text in sections, or several short texts, with ten questions. You match each question to the section that contains that information. Sections can be used more than once.',
      timing: [
        { part: 'Questions', time: '10 questions', note: 'Sections may repeat' },
        { part: 'Suggested time', time: '12–15 min', note: 'Scan; do not read in depth' },
        { part: 'Tests', time: 'Scanning', note: 'Paraphrase recognition' },
      ],
      approach: [
        'Read the ten questions first and underline the key idea in each one.',
        'Skim each section to know roughly what it is about before matching.',
        'Look for paraphrases: the answer almost never repeats the question words.',
        'If a question is slow, move on and come back — the rest may narrow it down.',
      ],
      mistakes: [
        'Reading every section word by word and running out of time.',
        'Matching the first section with a similar word without checking the others.',
        'Assuming each section is used only once.',
      ],
      studyTip:
        'Practise with a timer: 12 minutes for the whole part. Part 7 rewards speed and paraphrase spotting, not careful reading.',
    },
  },

  listening: {
    1: {
      overview:
        'Eight short unrelated extracts, each with one multiple-choice question (A–C). You hear each extract twice. They test gist, purpose, feeling, opinion and agreement.',
      timing: [
        { part: 'Questions', time: '8 questions', note: 'Three options each' },
        { part: 'Recordings', time: 'Played twice', note: 'About 30 seconds each' },
        { part: 'Tests', time: 'Gist', note: 'Feeling, opinion, purpose' },
      ],
      approach: [
        'Use the pause to read the question and underline what exactly is asked.',
        'First listening: choose an answer. Second listening: confirm it.',
        'Listen to the whole extract — speakers often change their mind at the end.',
        'If you miss one, choose and move on: each extract is independent.',
      ],
      mistakes: [
        'Choosing an option because you heard one of its words.',
        'Answering from the first sentence before the speaker finishes.',
        'Losing the next question while still thinking about the previous one.',
      ],
      studyTip:
        'Listen to one-minute clips and answer a single question: what is the speaker’s attitude? That is the skill Part 1 tests most.',
    },
    2: {
      overview:
        'One monologue of about three minutes with ten gapped sentences. You write the exact word or short phrase you hear — usually one to three words.',
      timing: [
        { part: 'Questions', time: '10 gaps', note: 'Words taken from the recording' },
        { part: 'Recording', time: '~3 min', note: 'Played twice' },
        { part: 'Tests', time: 'Specific detail', note: 'Spelling counts' },
      ],
      approach: [
        'Read the sentences first and predict the type of word missing (number, place, noun).',
        'Write the words you actually hear — do not paraphrase.',
        'Answers come in the same order as the sentences, so track your position.',
        'Use the second listening to fill the gaps you missed and check spelling.',
      ],
      mistakes: [
        'Writing a synonym instead of the exact word from the recording.',
        'Adding extra words that make the sentence ungrammatical.',
        'Misspelling a word you heard clearly — spelling must be correct.',
      ],
      studyTip:
        'Practise dictation with short news clips: write the exact phrase, then check spelling. It trains Part 2 directly.',
    },
    3: {
      overview:
        'Five short monologues on a related topic. You match each speaker to one of eight statements (A–H). Three statements are not used and each is used only once.',
      timing: [
        { part: 'Questions', time: '5 speakers', note: 'Eight options, three extra' },
        { part: 'Recordings', time: 'Played twice', note: 'About 30 seconds each' },
        { part: 'Tests', time: 'Gist and attitude', note: 'Overall message, not details' },
      ],
      approach: [
        'Read all eight options in the pause and note the key difference between them.',
        'First listening: mark possible answers, even two per speaker.',
        'Second listening: confirm and eliminate — each option is used once.',
        'Match the speaker’s main message, not one word they happen to say.',
      ],
      mistakes: [
        'Using the same letter twice.',
        'Matching by a single shared word instead of the overall idea.',
        'Deciding too early, before the speaker reaches their main point.',
      ],
      studyTip:
        'Summarise each speaker in three words while you listen. Comparing your summary with the options is faster than re-reading them all.',
    },
    4: {
      overview:
        'An interview or conversation of about three minutes with seven multiple-choice questions (A–C). It tests opinion, attitude, detail and inference.',
      timing: [
        { part: 'Questions', time: '7 questions', note: 'Three options each' },
        { part: 'Recording', time: '~3 min', note: 'Played twice' },
        { part: 'Tests', time: 'Opinion and detail', note: 'Questions follow the order' },
      ],
      approach: [
        'Read all seven questions in the pause — they follow the order of the interview.',
        'Follow the interviewer’s questions: each one usually signals the next answer.',
        'Listen for the speaker’s opinion words (I’d say, actually, to be honest).',
        'Use the second listening for the two or three answers you are unsure about.',
      ],
      mistakes: [
        'Choosing an option mentioned by the wrong speaker.',
        'Picking the option repeating words you heard, without checking the meaning.',
        'Getting lost after one hard question and missing the following ones.',
      ],
      studyTip:
        'Listen to interview podcasts and pause after each answer to summarise the guest’s opinion in one sentence.',
    },
  },

  writing: {
    1: {
      overview:
        'The compulsory essay: 140–190 words in about 40 minutes. You are given a question and three notes; you must cover two of them and add your own idea for the third. The register is semi-formal.',
      timing: [
        { part: 'Length', time: '140–190 words', note: 'Compulsory task' },
        { part: 'Planning', time: '8–10 min', note: 'Outline before writing' },
        { part: 'Writing & check', time: '30 min', note: 'Leave 3 min to proofread' },
      ],
      approach: [
        'Plan four paragraphs: introduction, point 1, point 2, conclusion with your opinion.',
        'Use the two notes you can develop best, then add your own third idea.',
        'Link ideas with However, In addition, On the other hand — but do not overload.',
        'Keep it semi-formal: no contractions, no slang, no direct questions to the reader.',
      ],
      mistakes: [
        'Copying the notes word for word instead of developing them.',
        'Forgetting to add your own idea, which is part of the task.',
        'Writing far over 190 words and running out of time for Part 2.',
      ],
      studyTip:
        'Practise only the plan: 8 minutes to outline four paragraphs. Content and Organisation improve faster than by writing full essays every time.',
    },
    2: {
      overview:
        'One task chosen from three options: article, email or letter, report or review. Same length as Part 1 (140–190 words), but the register and layout change with the task type.',
      timing: [
        { part: 'Length', time: '140–190 words', note: 'One task from three' },
        { part: 'Choose & plan', time: '5 min', note: 'Read all three options' },
        { part: 'Writing & check', time: '35 min', note: 'Match the register' },
      ],
      approach: [
        'Read all three options before choosing — pick the one you can structure fastest.',
        'Identify the reader: it decides whether you write formally or informally.',
        'Cover every bullet point in the task; each one is part of the Content mark.',
        'Use the layout the task expects: headings in a report, a title in an article.',
      ],
      mistakes: [
        'Choosing the topic you like instead of the task you can organise.',
        'Using the same neutral essay style for every task type.',
        'Missing one of the required points in the question.',
      ],
      studyTip:
        'Learn one solid structure per task type (review, report, article, email). Choosing then takes seconds instead of minutes.',
    },
  },

  speaking: {
    1: {
      overview:
        'The interview: about two minutes. The examiner asks you and your partner personal questions about your life, studies, free time and plans. It is a warm-up, but it is assessed.',
      timing: [
        { part: 'Length', time: '~2 min', note: 'Both candidates' },
        { part: 'Format', time: 'Examiner asks', note: 'Short personal questions' },
        { part: 'Tests', time: 'Fluency', note: 'Natural, extended answers' },
      ],
      approach: [
        'Answer the question, then extend with a reason or a short example.',
        'Aim for two or three sentences — not one word, not a speech.',
        'Use a range of tenses naturally: what you do, did and plan to do.',
        'Listen carefully: answering a different question costs marks.',
      ],
      mistakes: [
        'Giving memorised answers that do not fit the question.',
        'Replying with one word and waiting for the next question.',
        'Talking for too long and turning it into a monologue.',
      ],
      studyTip:
        'Record yourself answering five common questions. Check that every answer has an opinion plus a reason.',
    },
    2: {
      overview:
        'The long turn: you speak alone for one minute comparing two photographs and answering a question about them. Then your partner answers a short question about your photos in 30 seconds.',
      timing: [
        { part: 'Your long turn', time: '1 min', note: 'Two photos + a question' },
        { part: 'Partner response', time: '30 sec', note: 'Short reaction' },
        { part: 'Tests', time: 'Comparing', note: 'Speculating, organising ideas' },
      ],
      approach: [
        'Compare the photos throughout — do not describe one and then the other.',
        'Answer the printed question; comparing alone is not enough.',
        'Speculate with might, could, seems to be, probably — you are not expected to know.',
        'Keep going for the full minute; the examiner will stop you.',
      ],
      mistakes: [
        'Describing the photos in detail instead of comparing them.',
        'Forgetting the question written above the pictures.',
        'Stopping after 30 seconds because you think you have finished.',
      ],
      studyTip:
        'Practise with a timer and any two images. Check you did three things: compare, speculate and answer the question.',
    },
    3: {
      overview:
        'The collaborative task: you and your partner discuss five written prompts for about two minutes, then have one minute to reach a decision together. Interaction matters as much as language.',
      timing: [
        { part: 'Discussion', time: '~2 min', note: 'Five prompts on a page' },
        { part: 'Decision', time: '~1 min', note: 'Agree together' },
        { part: 'Tests', time: 'Interaction', note: 'Turn-taking and negotiating' },
      ],
      approach: [
        'Talk about several prompts — you are not required to cover all five.',
        'Invite your partner in: What do you think? / How about you?',
        'Agree and disagree politely: That’s true, but… / I see your point, however…',
        'In the second minute, actually make a decision, even if you compromise.',
      ],
      mistakes: [
        'Dominating the conversation or letting your partner do all the talking.',
        'Going through the prompts like a checklist without discussing them.',
        'Finishing without any decision in the final minute.',
      ],
      studyTip:
        'Learn four turn-taking phrases by heart. Interactive Communication is the easiest Speaking criterion to improve quickly.',
    },
    4: {
      overview:
        'The discussion: about four minutes of broader questions linked to the Part 3 topic. The examiner asks you both and you can respond to each other. It tests developed ideas and opinions.',
      timing: [
        { part: 'Length', time: '~4 min', note: 'Both candidates' },
        { part: 'Format', time: 'Examiner questions', note: 'Abstract topics' },
        { part: 'Tests', time: 'Developing ideas', note: 'Opinion, reasons, examples' },
      ],
      approach: [
        'Give an opinion, a reason and an example — that is a complete answer.',
        'Build on your partner: I agree with what you said about… / I’d add that…',
        'Hedge when you are unsure: it depends, generally speaking, people tend to.',
        'Use fillers to buy time instead of going silent: well, let me think.',
      ],
      mistakes: [
        'Answering with an opinion and no reason behind it.',
        'Repeating a memorised speech that does not match the question.',
        'Ignoring your partner when the examiner invites a shared discussion.',
      ],
      studyTip:
        'Take any Part 3 topic and answer one abstract question about it in 30 seconds: opinion, reason, example. Repeat with a new topic each day.',
    },
  },
};

/**
 * @param {string} levelSlug
 * @param {string} skill
 * @param {number} part
 * @returns {PartStrategyContent | null}
 */
export function getExamStrategiesPartContent(levelSlug, skill, part) {
  if (String(levelSlug).toLowerCase() !== LEVEL) return null;
  const entry = RAW_PART_CONTENT[skill]?.[part];
  if (!entry) return null;
  return {
    ...entry,
    overviewTitle: 'What is this part?',
    timingTitle: 'Task at a glance',
    timingColumns: TASK_COLUMNS,
    approachTitle: 'How to do it',
  };
}
