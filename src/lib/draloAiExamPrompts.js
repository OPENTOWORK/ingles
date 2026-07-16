import {
  getExamDirections,
  getExamQuestionCount,
} from '@/lib/draloAiExamPartSpecs';

const SHARED_JSON_RULES = `
Return ONLY valid JSON (no markdown). All student-facing task text in English.
Include EVERY field requested. Generate a COMPLETE exam part (not a single sample item).
`;

function varietyBlock(options) {
  const topic = options.topic || 'general everyday life';
  const seed = options.varietySeed ?? Date.now();
  const avoid = Array.isArray(options.recentFingerprints)
    ? options.recentFingerprints.filter(Boolean).slice(0, 8)
    : [];
  const avoidBlock =
    avoid.length > 0
      ? `\nDo NOT repeat or closely imitate:\n${avoid.map((f) => `- ${f}`).join('\n')}`
      : '';
  return `Topic/theme: ${topic}. Variety seed: ${seed}. Create completely NEW content.${avoidBlock}`;
}

function baseExamSchema(directions, extra = '') {
  return `"partTitle":"Cambridge part title","directions":${JSON.stringify(directions)},"example":{"number":0,"options":["A) word","B) word","C) word","D) word"],"answer":"C","explanation":"one short line why this answer fits"}${extra}`;
}

export function buildExamGeneratePrompt(mode, activity, level, options = {}) {
  const L = level || 'B2';
  const partNumber = Number(options.partNumber) || 0;
  let n = options.questionCount ?? getExamQuestionCount(mode, activity, L);
  if (L === 'B2' && mode === 'listening' && partNumber === 13 && activity === 'conversation') n = 7;
  if (L === 'B2' && mode === 'listening' && partNumber === 12 && activity === 'multiple-matching') n = 5;
  const directions = getExamDirections(mode, activity);
  const variety = varietyBlock(options);

  if (mode === 'use-of-english') {
    if (activity === 'key-word' && L === 'B2') {
      return `Create ONE complete B2 Reading and Use of English Part 4: Key word transformations (Q25–30).
The task should match official B2 First style, difficulty, wording and item design.
${variety}
${SHARED_JSON_RULES}
${directions}

FORMAT (CRITICAL):
- Example item 0 in the "example" field — not scored.
- Exactly 6 scored transformations numbered 25–30.
- Directions must be: For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).

EACH SCORED QUESTION MUST INCLUDE:
- number (25–30)
- type: "transformation"
- sentence1: complete first sentence (meaning source)
- keyword: ONE given word in CAPITALS (must appear unchanged in every full answer)
- sentence2Start OR sentence2: second sentence with exactly ONE gap written as __________________
- answer: ONE primary correct gap completion (2–5 Cambridge words including the keyword)
- grading_metadata: object required for Dralo's deterministic 0/1/2 grader (see below)

EXAMPLE RULES:
- example.number must be 0
- example must include sentence1, keyword (CAPITALS), sentence2Start/sentence2 with a gap, and answer (2–5 words including keyword)
- Do NOT put example 0 inside questions[] or modelAnswers[]

GRADING METADATA (CRITICAL — required on every scored question):
Each question.grading_metadata MUST be:
{
  "type": "b2_key_word_transformation",
  "version": 1,
  "keyword": "SAME_AS_QUESTION_KEYWORD",
  "fullAnswers": ["primary answer", "optional contraction variant"],
  "markingPoints": [
    { "id": 1, "label": "structure/grammar element", "accepted": ["variant A", "variant B"] },
    { "id": 2, "label": "lexical/complement element", "accepted": ["variant C"] }
  ]
}

MARKING POINT RULES:
- Exactly TWO marking points per item (id 1 and id 2), each worth 1 point.
- Normally: one grammar/structure element + one lexical/complement/preposition/meaning element.
- Each marking point needs at least one accepted variant.
- Marking points must be meaningful and non-overlapping (do not share identical accepted strings).
- CRITICAL: the two marking points must PARTITION each fullAnswer in order — every word of the fullAnswer must belong to MP1 then MP2, with no leftover words and no gaps.
- Good example for answer "do not need to use":
  fullAnswers: ["do not need to use", "don't need to use"]
  markingPoints: [
    { "id": 1, "label": "negative need structure", "accepted": ["do not need", "don't need"] },
    { "id": 2, "label": "infinitive complement", "accepted": ["to use"] }
  ]
- Bad: MP1="IMPORTANT" and MP2="to book" for fullAnswer "IMPORTANT to book your tickets" (leftover words → fails).
- fullAnswers must be consistent with the marking points: each fullAnswer must score 2/2 when graded by marking points alone.
- Every fullAnswer must be 2–5 words by Cambridge word-count rules (don't / didn't count as TWO words; can't / cannot count as ONE).
- Write fullAnswers in normal sentence case/lowercase (not ALL CAPS). The keyword appears naturally inside the answer (e.g. keyword NEED → "do not need to use").
- The keyword must appear unchanged in EVERY fullAnswer.
- Allow only controlled superficial variants (do not / don't, is not / isn't, was not / wasn't, have not / haven't, cannot / can't).
- Do NOT allow two different grammatical transformation routes as separate answers (bad: "wish I had gone" vs "regret not going").

QUALITY RULES:
- The two sentences must express the same meaning.
- Do NOT copy sentence1 wording into the answer unnecessarily.
- Avoid trivial answers or incomplete fragments.
- The keyword must be essential to the answer.
- Exactly one main correct grammatical solution per item.
- Choose common B2 grammatical/lexical keywords.
- Do NOT generate an item that cannot be split naturally into two marking points.

ITEM VARIETY (across Q25–30):
Include a balanced mix such as: passive voice; reported speech; conditionals; wishes/regrets; modal verbs; comparatives; infinitive/gerund patterns; phrasal verbs; fixed expressions; verb patterns; dependent prepositions; emphasis structures; relative clauses; quantifiers.
- Do not overuse the same transformation type.
- Do not repeat the same keyword across the 6 scored items.
- Do not create all 6 items from the same grammar area.
- Do not use C1/C2 obscure structures or B1-trivial items.

FORBIDDEN:
- more or fewer than 6 scored questions
- question numbers outside 25–30
- multiple-choice options
- answers under 2 or over 5 Cambridge words
- missing grading_metadata / missing marking points
- keyword changed, split, or omitted
- two equally valid different transformation routes

Each modelAnswers entry: {id, number:25–30, answer:"2–5 word primary answer"} matching the question answer.
Generate exactly 6 questions numbered 25–30.
Return ONLY JSON with: partTitle, directions, example {number:0, sentence1, keyword, sentence2Start, answer}, questions[{id, number, type:"transformation", sentence1, keyword, sentence2Start, answer, grading_metadata}], modelAnswers[]`;
    }

    const questionsSchema = `"questions":[${Array.from({ length: n }, (_, i) => {
      const num = i + 1;
      if (activity === 'multiple-choice-cloze') {
        return `{"id":"q${num}","number":${num},"type":"mcq","options":["A) word","B) word","C) word","D) word"]}`;
      }
      if (activity === 'key-word') {
        return `{"id":"q${num}","number":${25 + i},"type":"transformation","sentence1":"first sentence","keyword":"WORD","sentence2Start":"start of second sentence ","maxWords":5}`;
      }
      if (activity === 'word-formation') {
        return `{"id":"q${num}","number":${17 + i},"type":"word-formation","stem":"ROOT"}`;
      }
      return `{"id":"q${num}","number":${9 + i},"type":"short","prompt":"Gap ${9 + i}"}`;
    }).join(',')}]`;

    const modelAnswersSchema = `"modelAnswers":[${Array.from({ length: n }, (_, i) => {
      const id = `q${i + 1}`;
      if (activity === 'multiple-choice-cloze') {
        return `{"id":"${id}","answer":"B"}`;
      }
      if (activity === 'key-word') {
        return `{"id":"${id}","answer":"full correct second sentence including keyword unchanged"}`;
      }
      return `{"id":"${id}","answer":"exact one-word or short phrase answer"}`;
    }).join(',')}]`;

    if (activity === 'multiple-choice-cloze' && L === 'B2') {
      return `Create ONE complete B2 Reading and Use of English Part 1: multiple-choice cloze (Q1–8).
The task should match official B2 First style, difficulty and item design.
${variety}
${SHARED_JSON_RULES}
${directions}

FORMAT (CRITICAL — do not invent Q1–9):
- Example gap (0) near the start of the passage — not scored.
- Exactly 8 scored gaps: (1) ___ through (8) ___ in reading order.
- The passage MUST contain all of these markers literally: (0) ___ (1) ___ (2) ___ (3) ___ (4) ___ (5) ___ (6) ___ (7) ___ (8) ___ — never stop at (4) or omit later gaps.
- Questions numbered 1–8 only. Do NOT create question 9.
- Directions must be: For questions 1–8, read the text below and choose the best word (A, B, C or D) for each gap. There is an example at the beginning (0).

TEXT REQUIREMENTS:
- Natural, realistic exam-style text of 150–180 words with a short title.
- STRICT word count: minimum 150 words, maximum 180 words. Count carefully. Do NOT exceed 180.
- Prefer ~160–170 words. If the draft is longer than 180, cut redundant clauses before returning JSON.
- Style similar to a magazine, newspaper, website or popular science article.
- Authentic B2-level British English.
- Difficulty should come from: collocations; lexical precision; natural language use; fixed expressions; dependent prepositions; phrasal verbs; common near-synonyms.
- Avoid: simple A2/B1 language; unnecessarily academic C1/C2 vocabulary; repetitive AI-style writing; unnatural paragraph structure; unnatural sentences created only to force a gap.
- Include the example gap (0) ___ near the start, then gaps (1) ___ through (8) ___ in reading order.
- Every gap must occur naturally in the text.

QUESTION DESIGN:
- Each gap must require the surrounding sentence and wider context.
- A gap must NEVER be solvable by grammar alone: all four options must fit grammatically.
- The correct choice is decided by meaning, collocation, dependent preposition, word partnership or lexical precision.

OPTIONS RULES (CRITICAL):
- Exactly 4 options per question: "A) word", "B) word", "C) word", "D) word".
- Each option is ONE word only. No phrases, no multi-word options.
- Exactly ONE correct answer per item. The three distractors must be plausible same-class words that fail on collocation, dependent preposition, precise meaning or word partnership — never absurd or obviously wrong.
- Never repeat the same word twice within one item's options.
- Spread the correct letters across A, B, C and D — no letter may be correct more than 3 times across Q1–8.

EXAMPLE RULES (CRITICAL):
- The "example" field must include four options adapted to gap (0) in the passage (same style as items 1–8).
- example.options: exactly ["A) word","B) word","C) word","D) word"] — ONE word each, plausible distractors for gap (0).
- example.answer: the single correct letter ("A"–"D") for gap (0).
- example.number must be 0.

ITEM VARIETY (CRITICAL — the part must test a MIX of lexical knowledge):
- collocations
- fixed expressions
- dependent prepositions
- close-meaning verbs
- close-meaning nouns
- phrasal verbs
- adjectives
- adverbs
- Do NOT make all 8 items verb-based.
- Include at least 2 items whose options are nouns, adjectives or adverbs.
- Include at least 1 item decided by a dependent preposition or fixed expression.
- Avoid repeating the same lexical pattern, word family or collocation type excessively.

FORBIDDEN:
- creating 9 scored questions or gaps beyond (8)
- passage longer than 180 words or shorter than 150 words
- all 8 items testing verbs
- options with more than one word
- items where two options are both defensible
- distractors that are obviously wrong
- C1/C2 obscure vocabulary, or B1-trivial gaps
- testing the same word family or the same collocation type twice without clear justification

Each modelAnswers entry: the single correct letter ("A"–"D") for questions 1–8 only (not for example 0).
Generate exactly 8 questions numbered 1–8.
${baseExamSchema(directions, `,"title":"short text title","passage":"full 150–180 word text with (0) ___ example and gaps (1) ___ to (8) ___",${questionsSchema},${modelAnswersSchema}`)}`;
    }

    if (activity === 'open-cloze' && L === 'B2') {
      return `Create ONE complete B2 Reading and Use of English Part 2: Open cloze (Q9–16).
The task should match official B2 First style, difficulty, wording and item design.
${variety}
${SHARED_JSON_RULES}
${directions}

FORMAT (CRITICAL):
- Example gap (0) ___ near the start of the passage — not scored.
- Exactly 8 scored gaps: (9) ___ through (16) ___ in reading order.
- The passage MUST contain all of these markers literally: (0) ___ (9) ___ (10) ___ (11) ___ (12) ___ (13) ___ (14) ___ (15) ___ (16) ___.
- Questions/gaps numbered 9–16 only. Do NOT create gap (17) or above.
- Directions must be: For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).
- Never write a gap number with the letter "o": always digits.

TEXT REQUIREMENTS:
- Natural published-style article of 150–180 words with a short title.
- STRICT word count: minimum 150 words, maximum 180 words. Count carefully. Do NOT exceed 180.
- Prefer ~160–170 words. If the draft is longer than 180, cut redundant clauses before returning JSON.
- Style similar to a magazine, newspaper, website or popular science article.
- Authentic B2-level British English.
- Difficulty should come from grammar and functional language typically tested in B2 First rather than obscure vocabulary.
- Avoid: simple A2/B1 language; unnecessarily academic C1/C2 language; repetitive AI-style writing; unnatural paragraph structure; unnatural sentences created only to force a gap; vocabulary-content gaps that belong to Part 1.
- Include the example gap (0) ___ near the start, then gaps (9) ___ through (16) ___ in reading order.
- Every gap must occur naturally. The completed text with the correct answers must sound completely natural.

GAP DESIGN (CRITICAL):
- Each gap contains exactly ONE missing word and has exactly ONE correct answer.
- Gaps test grammatical knowledge or functional language, not lexical content (that is Part 1).
- Require the surrounding sentence and wider context where possible.
- Across the 8 scored gaps include a balanced MIX of typical answer types:
  - articles
  - determiners
  - quantifiers
  - pronouns
  - auxiliary verbs
  - modal verbs
  - prepositions
  - conjunctions
  - relative pronouns
  - infinitive marker "to"
  - particles
  - common grammatical fixed expressions
- Cover at least 4 DIFFERENT categories from the list above.

EXAMPLE RULES (CRITICAL):
- The "example" field is for gap (0) in the passage (not scored).
- example.number must be 0.
- example.answer must be the single correct ONE-word answer for gap (0).
- Do NOT put example (0) inside questions[] or modelAnswers[].
- No options A/B/C/D for the example or for any scored gap.

FORBIDDEN:
- multi-word answers
- content-word vocabulary gaps like Part 1
- ambiguous gaps with two equally valid answers
- gaps where the answer is only a rare or obscure word
- more than 8 scored gaps, missing gap numbers, or gap (17)+
- any Part 3-style word formation item
- any multiple-choice options
- passage shorter than 150 or longer than 180 words

Each modelAnswers entry: the single correct word (lowercase unless a proper noun) for questions 9–16 only.
Generate exactly 8 questions numbered 9–16.
Return ONLY JSON with: partTitle, directions, example {number:0, answer:"one word"}, title, passage (150–180 words with (0) ___ and gaps (9) ___ to (16) ___), questions[{id:"q1"–"q8", number:9–16, type:"short"}], modelAnswers[{id, number:9–16, answer:"one word"}]`;
    }

    if (activity === 'word-formation' && L === 'B2') {
      return `Create ONE complete B2 Reading and Use of English Part 3: Word formation (Q17–24).
The task should match official B2 First style, difficulty, wording and item design.
${variety}
${SHARED_JSON_RULES}
${directions}

FORMAT (CRITICAL):
- Example gap (0) ___ (STEM) near the start of the passage — not scored. STEM is the base word in CAPITAL LETTERS after the gap marker.
- Exactly 8 scored gaps: (17) ___ (STEM) through (24) ___ (STEM) in reading order.
- The passage MUST contain all of these markers literally: (0) ___ (STEM) (17) ___ (STEM) (18) ___ (STEM) (19) ___ (STEM) (20) ___ (STEM) (21) ___ (STEM) (22) ___ (STEM) (23) ___ (STEM) (24) ___ (STEM).
- Questions/gaps numbered 17–24 only. Do NOT create gap (25) or above.
- Directions must be: For questions 17–24, read the text below. Use the word given in capitals at the end of each line to form a word that fits in the gap. There is an example at the beginning (0).

TEXT REQUIREMENTS:
- Natural published-style article of 150–180 words with a short title.
- STRICT word count: minimum 150 words, maximum 180 words. Count carefully. Do NOT exceed 180.
- Prefer ~165 words. If the draft is shorter than 150, add one natural sentence before returning JSON. If longer than 180, cut redundant clauses.
- Style similar to a magazine, newspaper, website or popular science article.
- Authentic B2-level British English.
- Difficulty should come from accurate word formation and lexical precision, not obscure vocabulary.
- Avoid: simple A2/B1 language; unnecessarily academic C1/C2 vocabulary; repetitive AI-style writing; unnatural paragraph structure; unnatural sentences created only to force a gap; obscure dictionary words; spelling-trick-only items.
- Include the example gap (0) ___ (STEM) near the start, then gaps (17) ___ (STEM) through (24) ___ (STEM) in reading order.
- Every gap must occur naturally. The completed text with the correct answers must sound completely natural.

GAP DESIGN (CRITICAL):
- Each gap contains ONE missing word and provides ONE base word in CAPITAL LETTERS (field "stem", also acceptable as "baseWord").
- The candidate must transform the base word into ONE correctly formed word that fits grammatically and semantically.
- Require genuine understanding of word formation, not only mechanical suffix addition.
- Exactly ONE defensible derived answer per gap.
- Across the 8 scored items include a balanced MIX of transformations:
  - noun → adjective
  - adjective → noun
  - adjective → adverb
  - verb → noun
  - verb → adjective
  - noun → verb
  - singular/plural where appropriate
  - positive/negative forms
  - prefix changes
  - suffix changes
  - combined prefix + suffix changes

ITEM VARIETY (CRITICAL):
- Include a genuine mix of: prefixes; suffixes; changes of word class; positive and negative forms; abstract nouns; adjectives; adverbs; verbs.
- Do not overuse any single transformation type.
- Do not repeat the same word family.
- Do not repeat the same transformation pattern excessively.
- Keep base words within expected B2 Cambridge-style vocabulary range.

EXAMPLE RULES (CRITICAL):
- The "example" field is for gap (0) in the passage (not scored).
- example.number must be 0.
- example.stem (or example.baseWord) must be the CAPITALS base word for gap (0).
- example.answer must be the single correct ONE-word derived form for gap (0).
- Do NOT put example (0) inside questions[] or modelAnswers[].
- No options A/B/C/D.

FORBIDDEN:
- more than 8 scored gaps, missing gap numbers, or gap (25)+
- multiple-choice options
- Part 2-style open cloze with no base word
- Part 4-style key-word transformations
- multi-word answers
- base words that are too obscure, or answers requiring C1/C2 vocabulary
- repeated word families
- two equally valid derived answers
- passage shorter than 150 or longer than 180 words

Each questions entry: {id:"q1"–"q8", number:17–24, type:"word-formation", stem:"CAPITALS"}.
Each modelAnswers entry MUST be an object: {id:"q1"–"q8", number:17–24, answer:"one derived word"} — never a bare string array.
Generate exactly 8 questions numbered 17–24.
Return ONLY JSON with: partTitle, directions, example {number:0, stem:"CAPITALS", answer:"one derived word"}, title, passage (150–180 words with (0) ___ (STEM) and gaps (17) ___ (STEM) to (24) ___ (STEM)), questions[], modelAnswers[]`;
    }

    let passageRule = '';
    if (activity === 'multiple-choice-cloze') {
      passageRule = `passage: 130–200 word text titled, with example gap (0) ___ filled in context AND gaps (1) ___ through (${n}) ___ in order.`;
    } else if (activity === 'open-cloze') {
      passageRule = `passage: 130–200 word text with (0) ___ example gap and (${9}) ___ through (${8 + n}) ___ for each question (8 gaps total for B2).`;
    } else if (activity === 'word-formation') {
      passageRule = `passage: 130–200 word text with (0) EXAMPLE (STEM) ___ and (${17}) ___ (STEM) through (${16 + n}) ___ (STEM) — stem in capitals after each gap marker.`;
    } else {
      passageRule = `Do NOT use a single shared passage; put each item only in questions.`;
    }

    return `Create ONE complete Cambridge ${L} Use of English task: ${activity}.
${variety}
${SHARED_JSON_RULES}
Match Levels B2 format: directions, example (gap 0), ${passageRule}
Generate exactly ${n} questions (numbered like the real exam).
${baseExamSchema(directions, `,"title":"short text title","passage":"full text with gap markers as described",${questionsSchema},${modelAnswersSchema}`)}`;
  }

  if (mode === 'reading') {
    if (activity === 'multiple-choice' && L === 'B2') {
      return `Create ONE complete B2 First Reading Part 5: multiple choice.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 6 questions numbered 31–36.

PASSAGE (CRITICAL):
- 550–700 words, B2 natural register, clear central theme.
- High information density: secondary details, contrasts, examples, references, author attitude.
- Do NOT mention "Cambridge" anywhere student-facing.

QUESTIONS (CRITICAL):
- Mix questionType values: inference, detail, attitude, purpose, reference, global (at least 2 inferential/attitude/purpose/reference/global).
- Each question: ONE clearly correct answer; three plausible distractors at similar length/register.
- Distractors must be wrong by nuance — NOT absurd opposites ("always/never/everyone").
- Correct answer must NOT be copyable by matching a 4+ word phrase from the passage verbatim.
- Options should be parallel in structure; avoid one option obviously longer/shorter than others.

Answer key: distribute A–D (no more than 2 consecutive same letter; use at least 3 different letters).
Return ONLY JSON with: partTitle, directions, title, passage, questions[{number, questionType, prompt, options:["A) ...","B) ...","C) ...","D) ..."]}], modelAnswers[{id, answer:"A"|"B"|"C"|"D"}]`;
    }

    if (activity === 'gapped-text' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Reading Part 6: gapped text.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 6 gaps numbered (37) through (42) in the passage.
Passage length: about 450–600 words (minimum 450 words — count carefully), B2 level, natural magazine/article style with clear paragraph development.
Include sentencePool: exactly 7 sentences labelled A–G (one extra distractor not used in any gap).
Questions array: 6 items {number: 37–42} with NO per-question options (global pool only).
modelAnswers: single letters A–G only, one per gap; use each correct letter once only across gaps 37–42.

Cohesion quality (CRITICAL — avoid keyword-matching traps):
- Each gap must be solvable by discourse cohesion (pronouns this/these/such, contrast however/yet, cause-effect as a result/therefore, examples for instance, paragraph logic), NOT by spotting the same topic word in passage and option.
- Distractor sentences must be plausible in topic but wrong for reference/contrast/cause-effect in that position.
- Do NOT make options match gaps only because they share words like "communication", "transport", "access", "work", etc.
- At least 3 gaps should rely on anaphora or logical connectors in the sentences before/after the gap.
- Vary sentence openings in the pool; avoid seven options starting the same way.

Passage must be coherent; each removed sentence should fit exactly one gap only.
Return ONLY JSON with: partTitle, directions, title, passage (with gap markers), sentencePool ["A) ...","B) ...",...,"G) ..."], questions[{number}], modelAnswers[{id, answer:"A"|...|"G"}]`;
    }

    if (activity === 'multiple-matching' && L === 'B2') {
      return `Create ONE complete B2 First Reading Part 7: multiple matching.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 10 statements numbered 43–52.

COMMON THEME: four people (A–D) share ONE topic but with distinct perspectives/experiences/opinions.

TEXTS (CRITICAL):
- Exactly 4 sections A–D; each 120–150 words.
- Include temporal markers (initially, since then, meanwhile), linkers (however, although, yet), personal evaluations.
- Create REAL overlaps: some ideas should seem to fit two texts but only one is correct by nuance/detail.
- Secondary details must act as plausible distractors across texts.
- Do NOT use overused names (Emma) or career-change narratives.
- Do NOT mention "Cambridge" in student-facing text.

QUESTIONS (CRITICAL):
- Each prompt MUST start with "Who" (e.g. "Who felt that…", "Who mentions…").
- Require interpretation/inference — NOT solvable by one keyword copied from a single text.
- ONE unequivocal answer per question; people may be chosen more than once.

matchingIntro: brief line explaining choose A–D, people may be chosen more than once.
Return ONLY JSON with: partTitle, directions, matchingIntro, sections[{letter, name, text}], questions[{number, prompt}], modelAnswers[{id, answer:"A"|"B"|"C"|"D"}]`;
    }

    const startNum = activity === 'multiple-matching' ? 37 : activity === 'gapped-text' ? 31 : 31;
    const questionsSchema = `"questions":[${Array.from({ length: n }, (_, i) => {
      const num = startNum + i;
      return `{"id":"q${i + 1}","number":${num},"type":"mcq","prompt":"question text","options":["A) ...","B) ...","C) ...","D) ..."]}`;
    }).join(',')}]`;
    const modelAnswersSchema = `"modelAnswers":[${Array.from({ length: n }, (_, i) =>
      `{"id":"q${i + 1}","answer":"B"}`,
    ).join(',')}]`;

    let extraFields = '';
    if (activity === 'gapped-text') {
      extraFields =
        ',"passage":"article with gaps (31) ______ through (' +
        (30 + n) +
        ') ______","sentencePool":["A) extra sentence...","B) ...","C) ...","D) ...","E) ...","F) ...","G) ..."]';
    } else if (activity === 'multiple-matching') {
      extraFields =
        ',"matchingIntro":"Which person…","sections":[{"letter":"A","name":"Name","text":"paragraph"},{"letter":"B","name":"Name","text":"paragraph"},{"letter":"C","name":"Name","text":"paragraph"},{"letter":"D","name":"Name","text":"paragraph"}]';
    } else {
      extraFields = ',"passage":"reading text 200–280 words"';
    }

    return `Create ONE complete Cambridge ${L} Reading task: ${activity}.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly ${n} questions. ${activity === 'multiple-matching' ? 'matchingIntro lists each question stem; sections A–D are full person texts.' : ''}
${baseExamSchema(directions, `,"title":"text title"${extraFields},${questionsSchema},${modelAnswersSchema}`)}`;
  }

  if (mode === 'listening') {
    if (activity === 'short-extracts' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 1: multiple choice (eight short extracts).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 8 questions numbered 1–8 in ONE shared audio (~4½–5 minutes total).
Each question MUST include:
- number (1–8)
- situation: one-line context (e.g. "You hear two friends talking about a trip.")
- prompt: the exam question (e.g. "Why is the woman calling?")
- options: exactly three strings "A) ...", "B) ...", "C) ..."
- script: the FULL extract for TTS ONLY (105–120 words; monologue OR dialogue with "A:" / "B:" labels for each speaker; self-contained; NO question text inside script; ~30–45 seconds when read aloud at a natural, unhurried pace)

Quality rules (strict):
- Each extract is a DIFFERENT scenario — independent and self-contained (conversation, announcement, interview, voicemail, etc.)
- Do NOT make extracts too similar in setting or speaker type
- Vary speakers, gender and accents across extracts (British, American, Australian, Irish, etc.) — each extract should feel like a new voice cast
- In dialogues, use "A:" / "B:" labels so each speaker has a distinct voice in TTS
- Match register to context; use authentic spoken English (contractions, hedging, natural emphasis) — not written prose
- B2 vocabulary and structures only — the exam must feel genuinely challenging at B2 level
- Each extract MUST include at least THREE phrasal verbs or idiomatic chunks and at least TWO natural collocations (e.g. "at short notice", "draw a blank", "get to the bottom of")
- Exactly one correct answer per question; three plausible A/B/C options
- Questions must test inference/deduction — NOT keyword matching from the audio
- Each distractor should echo something mentioned in the audio but NOT be the correct answer (mention weather when the answer is equipment; mention lane four when told to stay inside; mention a tariff when the purpose is membership status)
- The question/prompt must NOT reveal the answer before listening
- Avoid: obvious/irrelevant distractors, multiple equally valid options, artificial or overly formal language

modelAnswers: 8 rows with letter only (A, B, or C).
Also include a combined "script" field concatenating all eight extract scripts separated by blank lines (for reference only).
Return ONLY JSON with: partTitle, title, directions, setting, script, questions[{number,situation,prompt,options[],script}], modelAnswers[]`;
    }

    if (activity === 'multiple-matching' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 3: multiple matching (five speakers).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 5 speakers (Speaker 1–Speaker 5) on ONE shared theme, matched to options A–H.

Structure:
- setting: one line describing the shared topic (e.g. "Five people talk about their first paid job.")
- listeningIntro.text: "Listening Test. Part Three. You will hear five short extracts. In each extract, a different speaker is talking about the same general topic. For questions 19 to 23, choose from the list A to H what each speaker says. Use each letter only once. There are three extra options which you do not need to use. You will hear the recording twice. Before the recording starts, you will have some time to read the options. Now look at questions 19 to 23."
- audioAssembly: { introFromSupabase: "b2/shared/listening-part-3-intro.mp3", introPauseSec: 5, betweenExtractPauseSec: 3, betweenPassesPauseSec: 15, passes: 2, totalDurationTargetSec: { min: 480, max: 600 } }
- optionPool: exactly 8 options A–H (each a short paraphrased description of an opinion, feeling or experience — NOT copied verbatim from the audio)
- matchingAnswers: 5 rows {number: 19–23, answer: "A"|…|"H"} — one unique letter per speaker; exactly 3 letters remain unused as distractors
- questions: 5 items {number: 19–23, prompt: "Speaker N"} WITHOUT repeating full A–H option text
- script: five monologues labelled "Speaker 1:" … "Speaker 5:" (100–125 words each; ~30–45 seconds TTS per extract)
- audioClips: REQUIRED array of exactly 5 objects {orden:1–5, titulo:"Speaker N", text:"full monologue for TTS"}

Audio / script quality (strict):
- ONE combined MP3: intro → 5 s pause → pass 1 (5 speakers) → 15 s pause → pass 2 (same speakers); total 8:00–10:00
- All 5 speakers share the same general theme but each has a distinct perspective
- Use predominantly UK voices/accents; each speaker must sound different (varied gender, region, tone)
- Abundant phrasal verbs (get to grips with, brush aside, muck in, fall through, wipe out, etc.) and natural collocations
- Subtle overlaps so unused options sound plausible — each unused A–H option must be hinted in at least one recording but not be any speaker's main message
- Authentic spoken B2 English; no speaker states the correct option text literally — paraphrase is mandatory

Questions / options quality (strict):
- Exactly one correct option per speaker; no option should fit two speakers equally well
- Distractors must be credible: mentioned or hinted in the audio but not the speaker's main point

modelAnswers: 5 rows with letter only (A–H), matching matchingAnswers.
Return ONLY JSON with: partTitle, directions, setting, listeningIntro, audioAssembly, script, audioClips[], optionPool ["A) ...",...,"H) ..."], matchingAnswers[], questions[], modelAnswers[] (letters only)`;
    }

    if (activity === 'sentence-completion' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 2: sentence completion.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 10 questions numbered 9–18 (type "short"; each prompt is an incomplete sentence with a gap marked ___).
script: ONE continuous recording — a radio-style INTERVIEW between two speakers labelled "A:" (host) and "B:" (guest) (~270–320 words; ~2:10–2:55 per pass when read aloud at a natural pace). ONE combined audio file is assembled as: shared intro → 5 s pause → pass 1 → 10 s pause → pass 2 (total target 5:30–7:00).

Include in JSON:
- listeningIntro.text: "Listening Test. Part Two. You will hear a speaker giving a talk about a specific topic. For questions 9 to 18, complete the sentences with a word or short phrase from the recording. You will hear the recording twice. Before the recording starts, you will have some time to read the questions. Now look at questions 9 to 18."
- audioAssembly: { introFromSupabase: "b2/shared/listening-part-2-intro.mp3", introPauseSec: 5, betweenPassesPauseSec: 10, passes: 2, totalDurationTargetSec: { min: 330, max: 420 } }
- alternateAnswers: optional extra accepted variants (e.g. "sturdy boots" when primary answer is "boots")

Quality rules (strict):
- Format MUST be A:/B: dialogue — host interviews guest; use predominantly UK accents (varied regions: Yorkshire, Welsh, Scottish, Irish, Midlands, etc.)
- Monologue-only scripts are NOT acceptable for B2 Exam 1 Part 2
- Information appears in LINEAR order matching questions 9→18
- Use authentic spoken English: natural connectors, reformulation, hedging — like real FCE recordings
- B2 vocabulary throughout — abundant phrasal verbs (brush up on, fall into, talk into, chip in, wipe out, carry out, talk through, etc.) and collocations (accredited qualification, voluntary basis, sturdy boots, cuts visibility)
- For EACH gap, mention at least one plausible distractor in the audio (GPS near navigation context, ambulance near first aid, grants near sponsorship, trainers near boots) — words heard but wrong for the gap sentence
- Each gap has exactly ONE primary answer (1–3 words copied literally from the audio)
- alternateAnswers may list fuller phrases when a single-word answer is also accepted
- Question sentences must PARAPHRASE the audio heavily — third-person summary framing; do NOT reuse 4+ consecutive words from the script
- Completed sentences must be grammatically correct once the gap is filled
- Do NOT require inference — missing words must be heard clearly

modelAnswers: 10 rows {number: 9–18, answer: "1–3 words exactly as in audio"}.
Return ONLY JSON with: partTitle, title, directions, setting, listeningIntro, audioAssembly, script, questions[{number,lead}], modelAnswers[], alternateAnswers[]`;
    }

    if (activity === 'conversation' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 4: multiple choice (long interview or discussion).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 7 questions numbered 24–30.

Structure:
- setting: one line describing the interview/discussion context
- listeningIntro.text: Cambridge-style spoken intro naming the interviewee and topic, e.g. "Listening Test. Part Four. You will hear an interview with [name/role], who [brief topic]. For questions 24 to 30, choose the best answer: A, B or C. You will hear the interview twice. Before the recording starts, you will have some time to read the questions. Now look at questions 24 to 30." — MUST match directions/setting (same person and project; do not use a generic unrelated topic)
- audioAssembly: { introFromSupabase: "b2/shared/listening-part-4-intro.mp3", introPauseSec: 5, betweenPassesPauseSec: 25, passes: 2, totalDurationTargetSec: { min: 420, max: 480 } }
- script: ONE continuous recording (~3–4 minutes; 450–620 words) — an interview or discussion between TWO or THREE clearly differentiated speakers. Use "A:", "B:" and optionally "C:" labels throughout. ONE audio for the whole part.
- questions: 7 items {number: 24–30, prompt: "…", options: ["A) …", "B) …", "C) …"]}
- modelAnswers: 7 rows with letter only (A, B, or C)

Audio / script quality (strict):
- Natural conversation: interruptions, agreement, partial disagreement, follow-up questions
- Two or three distinct voices (roles clear from labels and idiolect)
- Semi-formal or informal register suited to the context — not written prose
- Authentic spoken English: hedging ("I suppose", "sort of"), emphasis, reformulation, mild disagreement
- Sustained B2 level throughout
- Enough information in the script to answer all seven questions fairly

Questions quality (strict):
- Exactly one correct answer per question; three plausible A/B/C options
- Test opinion, attitude, purpose or inference — NOT literal factual recall or keyword matching
- Options must PARAPHRASE the audio — do NOT lift A/B/C wording verbatim from the script
- Questions must not be answerable without listening (avoid giveaway context in the prompt)
- Avoid two equally valid options; distractors may echo the audio but miss the point
- Questions follow the approximate order of the recording (Q24 early → Q30 near the end)
- Vary comprehension types across the seven items (attitude, reason, implication, recommendation, etc.)
- Exploit disagreements and nuances between speakers where relevant

Do NOT use an A–H matching pool. Do NOT split into separate monologue clips.
Return ONLY JSON with: partTitle, title, directions, setting, listeningIntro, audioAssembly, script, questions[{number,prompt,options[]}], modelAnswers[] (letters only)`;
    }

    const questionsSchema = `"questions":[${Array.from({ length: n }, (_, i) => {
      const num = i + 1;
      if (activity === 'sentence-completion') {
        return `{"id":"q${num}","number":${9 + i},"type":"short","prompt":"Complete: The speaker says ___"}`;
      }
      if (activity === 'multiple-matching') {
        return `{"id":"q${num}","number":${19 + i},"type":"mcq","prompt":"Speaker ${num}","options":[]}`;
      }
      const opts =
        activity === 'short-extracts'
          ? '["A) ...","B) ...","C) ..."]'
          : '["A) ...","B) ...","C) ..."]';
      const qNum =
        activity === 'conversation' && L === 'B2'
          ? 24 + i
          : activity === 'conversation'
            ? 19 + i
            : num;
      return `{"id":"q${num}","number":${qNum},"type":"mcq","prompt":"You hear… / question","options":${opts}}`;
    }).join(',')}]`;
    const modelAnswersSchema = `"modelAnswers":[${Array.from({ length: n }, (_, i) =>
      `{"id":"q${i + 1}","answer":"..."}`,
    ).join(',')}]`;

    let scriptRule =
      'script: ONE continuous text for TTS — monologue prose, NO speaker labels.';
    if (activity === 'short-extracts') {
      scriptRule = `script: EIGHT labelled extracts "Extract 1" through "Extract 8" in one audio (~4½–5 min total). Each extract: 85–95 words, monologue or "A:" / "B:" dialogue, self-contained, ~33–38 seconds TTS. Each extract = different scenario and voice cast; vary accents (GB/US/AU/IE). MCQ answers require inference, not keyword matching; distractors echo the audio but are wrong.`;
    } else if (activity === 'sentence-completion') {
      scriptRule = `script: ONE continuous monologue (380–520 words; ~2:30–3:30 min TTS). Linear information order for gaps 9–18. Question sentences paraphrase the audio; answers are 1–3 literal words from the recording.`;
    } else if (activity === 'multiple-matching') {
      scriptRule =
        L === 'B2'
          ? 'script: five speaker monologues "Speaker 1:" … "Speaker 5:" on one shared theme (70–95 words each; ~30–35 s TTS; ~3–4 min total). Distinct perspectives; paraphrase in options — no literal option wording in audio.'
          : 'script: five short speaker blocks "Speaker 1:" … "Speaker 5:" (70–100 words each).';
    } else if (activity === 'conversation') {
      scriptRule =
        L === 'B2'
          ? 'script: ONE continuous interview/discussion (450–620 words; ~3–4 min TTS) with "A:" / "B:" / optional "C:" labels. Natural turn-taking; MCQ tests attitude/inference — options paraphrase, no literal word-matching.'
          : 'script: dialogue with "A:" and "B:" lines for an interview or conversation (450–650 words for B2 Part 4).';
    }

    return `Create ONE complete Cambridge ${L} Listening task: ${activity}.
${variety}
${SHARED_JSON_RULES}
${directions}
${scriptRule}
Generate exactly ${n} questions.
${baseExamSchema(directions, `,"title":"...","setting":"one line context","script":"...",${questionsSchema},${modelAnswersSchema}`)}`;
  }

  if (mode === 'writing') {
    const wordMin = L === 'A2' ? 80 : L === 'B1' ? 120 : 140;
    const wordMax = L === 'A2' ? 100 : L === 'B1' ? 150 : 190;

    if (activity === 'essay') {
      return `Create ONE complete Cambridge ${L} Writing Part 1 compulsory ESSAY task (NOT a summary of two texts).
${variety}
${SHARED_JSON_RULES}
Use these official directions (copy into "directions" field):
${directions}
The task must include: one clear essay question (question field), exactly three bullet points the candidate must address (bulletPoints array), and word count ${wordMin}–${wordMax}.
Do NOT include text1/text2 passages or summarising/evaluating instructions.
Return ONLY JSON with fields: partTitle, directions, question, instructions, bulletPoints (array of 3 strings), wordMin (${wordMin}), wordMax (${wordMax}), register, checklist`;
    }

    if (activity === 'part-2') {
      return `Create ONE complete Cambridge ${L} Writing Part 2 task set with FOUR optional tasks (article, email/letter, review, report).
${variety}
${SHARED_JSON_RULES}
Use these official directions (copy into "directions" field):
${directions}
Each of the four tasks must be a different format (article, email or letter, review, report).
Word count for every task: ${wordMin}–${wordMax} words.
Return ONLY JSON with fields: directions, instructions, wordMin (${wordMin}), wordMax (${wordMax}), questions (array of exactly 4 objects):
- number (1–4)
- format: article | email | letter | review | report
- context: brief scenario (one or two sentences)
- targetReader: who will read the finished text
- prompt: full writing task with clear instructions
Do NOT use summary-of-two-texts format.`;
    }

    return `Create ONE complete Cambridge ${L} Writing task: ${activity}.
${variety}
${SHARED_JSON_RULES}
Use these official directions (copy into "directions" field):
${directions}
Include directions, full task instructions, bulletPoints array when relevant, and word count.
Return ONLY JSON with fields: partTitle, directions, taskTitle, instructions, inputNotes, bulletPoints, wordMin (${wordMin}), wordMax (${wordMax}), register, checklist`;
  }

  return 'Return JSON {"error":"unknown mode"}';
}
