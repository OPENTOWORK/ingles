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
      return `Create ONE complete Cambridge B2 First Use of English Part 4: Key word transformations.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly ${n} transformations numbered 25–${24 + n}, plus example item 0 in the "example" field.
Each question object must include:
- number (25–30)
- type: "transformation"
- sentence1: complete first sentence (meaning source)
- keyword: ONE given word in CAPITALS (must appear unchanged in the answer)
- sentence2Start: second sentence START only, ending with gap "__________________" (candidate completes 2–5 words including keyword)

Each modelAnswers entry: full correct second sentence (2–5 words total including keyword unchanged).

Quality rules:
- Keep the same meaning as sentence1; change grammar/structure (passive, conditional, wish, reported speech, comparatives, etc.)
- Answers must be 2–5 words including the keyword exactly as given
- Do NOT copy sentence1 wording into the answer
- Avoid trivial answers or incomplete fragments
- Vary transformation types across the ${n} items
Return ONLY JSON with: partTitle, directions, example {number:0, sentence1, keyword, sentence2Start, answer, explanation}, questions[], modelAnswers[]`;
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
      return `Create ONE complete Cambridge B2 First Reading and Use of English Part 1: multiple-choice cloze.
${variety}
${SHARED_JSON_RULES}
${directions}

TEXT RULES:
- Natural, realistic exam-style text of 150–180 words with a short title (magazine/website article tone).
- Solid B2 vocabulary throughout: NOT simple A2/B1 language, NOT academic C1/C2 language.
- Include the example gap (0) ___ near the start, then gaps (1) ___ through (${n}) ___ in reading order.
- A gap must NEVER be solvable by grammar alone (e.g. only one option matching the verb form): all four options must fit grammatically, so only meaning, collocation or word partnership decides.

OPTIONS RULES (CRITICAL):
- Exactly 4 options per question: "A) word", "B) word", "C) word", "D) word".
- Each option is ONE word only. No phrases, no multi-word options.
- Exactly ONE correct answer per item. The three distractors must be plausible same-class words that fail on collocation, dependent preposition or precise meaning — never absurd or obviously wrong.
- Never repeat the same word twice within one item's options.
- Spread the correct letters across A, B, C and D (no letter more than 3 times).

EXAMPLE RULES (CRITICAL):
- The "example" field must include four options adapted to gap (0) in the passage (same style as items 1–8).
- example.options: exactly ["A) word","B) word","C) word","D) word"] — ONE word each, plausible distractors for gap (0).
- example.answer: the single correct letter ("A"–"D") for gap (0).

ITEM VARIETY (CRITICAL — the part must test a MIX of lexical knowledge):
- collocations: e.g. strike / reach / make / do … a balance
- fixed expressions: e.g. take / make / have / do … a decision
- dependent prepositions: e.g. interested in / on / at / for
- close-meaning verbs: e.g. raise / rise / increase / grow
- close-meaning nouns, adjectives or adverbs: e.g. valuable / valued / valid / worth
Across the ${n} items: at MOST 4 items may have all-verb options; include at least 2 items whose options are nouns, adjectives or adverbs; include at least 1 item decided by a dependent preposition or fixed expression.

FORBIDDEN:
- all 8 items testing verbs
- options with more than one word
- items where two options are both defensible
- distractors that are obviously wrong
- C1/C2 vocabulary, or B1-trivial gaps
- testing the same word family or the same collocation twice

Each modelAnswers entry: the single correct letter ("A"–"D").
Generate exactly ${n} questions numbered 1–${n}.
${baseExamSchema(directions, `,"title":"short text title","passage":"full 150–180 word text with (0) ___ example and gaps (1) ___ to (${n}) ___",${questionsSchema},${modelAnswersSchema}`)}`;
    }

    if (activity === 'open-cloze' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Reading and Use of English Part 2: open cloze.
${variety}
${SHARED_JSON_RULES}
${directions}

TEXT RULES:
- Natural, realistic exam-style text of 100–140 words with a short title (magazine/website article tone).
- Solid B2 vocabulary and grammar: NOT simple A2/B1 language, NOT academic C1/C2 language.
- Exactly 8 gaps written as (9) ___ through (16) ___ in reading order.
- The passage must NOT contain a gap (0). The example is SEPARATE (see EXAMPLE RULES).
- Never write the gap number with a letter "o": always (9)–(16) with digits.

EXAMPLE RULES (CRITICAL):
- The "example" field is a STANDALONE sentence, not part of the passage.
- It must contain a real gap written as (0) ___ and have one logical one-word answer.
- Good example: {"number":0,"sentence":"She is fond (0) ___ travelling by train.","answer":"of","explanation":"the adjective \\"fond\\" takes the dependent preposition \\"of\\""}

ANSWER RULES (CRITICAL):
- Every answer is exactly ONE word. No phrases, no contractions of two words, no options A/B/C/D.
- Exactly ONE clear best answer per gap: the grammar and context must make other words wrong.
- Part 2 tests GRAMMAR and FUNCTION words, not Part 1 vocabulary. Use a MIX of:
  - prepositions: in / on / at / for / with / by / from / to
  - relative pronouns: which / that / who / where / whose
  - auxiliaries and modals: do / does / did / has / have / is / are / been / would
  - determiners and quantifiers: some / any / each / every / much / many / few / little
  - linkers and conjunctions: although / while / when / because / despite / unless / however
  - pronouns and fixed grammar patterns: it / there / what / one / so / such / enough
- Across the 8 gaps cover at least 4 DIFFERENT categories from the list above.

FORBIDDEN:
- a (0) gap inside the passage
- gaps solvable by several equally correct words (e.g. "very/really/extremely")
- answers that are content vocabulary choices (Part 1 style) instead of grammar/function words
- multi-word answers, empty answers, answers with spaces
- testing the same word as the answer in two different gaps
- B1-trivial gaps or C1/C2 grammar

Each modelAnswers entry: the single correct word (lowercase unless a proper noun).
Generate exactly 8 questions numbered 9–16.
Return ONLY JSON with: partTitle, directions, example {number:0, sentence (with the (0) ___ gap), answer, explanation}, title, passage (100–140 words with gaps (9) ___ to (16) ___ and NO (0) gap), questions[{id:"q1"–"q8", number:9–16, type:"short"}], modelAnswers[{id, answer:"one word"}]`;
    }

    if (activity === 'word-formation' && L === 'B2') {
      return `Create ONE complete B2 First Reading and Use of English Part 3: word formation.
${variety}
${SHARED_JSON_RULES}
${directions}

TEXT RULES:
- Natural B2-level text of 80–120 words with a short title.
- Exactly 8 gaps (17) ___ (STEM) through (24) ___ (STEM) — stem in CAPITALS after each gap marker.
- Include example: {"sentence":"… (0) ___ (NATURE) …","answer":"natural"} (separate from passage).

ANSWER RULES:
- Each gap requires exactly ONE derived word — no phrases, no two valid derivations.
- Context must force the grammatical category (noun / adjective / adverb / verb).
- Include a MIX of B2 transformations: abstract noun, adjective, adverb, derived verb, prefix, suffix.
- Use frequent, natural derived forms — not rare or archaic words.
- Do NOT repeat the same suffix pattern for every gap.

FORBIDDEN:
- stems that allow two equally correct derivations (e.g. both noun and adjective fit)
- multi-word answers, visible mention of "Cambridge"
- overused names (Emma) or repeated career-change narratives

Generate exactly 8 questions numbered 17–24.
Return ONLY JSON with: partTitle, directions, example, title, passage, questions[{id, number:17–24, type:"word-formation", stem:"CAPITALS"}], modelAnswers[{id, answer:"one word"}]`;
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
- script: the FULL extract for TTS ONLY (85–95 words; monologue OR dialogue with "A:" / "B:" labels for each speaker; self-contained; NO question text inside script; ~33–38 seconds when read aloud)

Quality rules (strict):
- Each extract is a DIFFERENT scenario — independent and self-contained (conversation, announcement, interview, voicemail, etc.)
- Do NOT make extracts too similar in setting or speaker type
- Vary speakers, gender and accents across extracts (British, American, Australian, Irish, etc.) — each extract should feel like a new voice cast
- In dialogues, use "A:" / "B:" labels so each speaker has a distinct voice in TTS
- Match register to context; use authentic spoken English (contractions, hedging, natural emphasis) — not written prose
- B2 vocabulary and structures only
- Exactly one correct answer per question; three plausible A/B/C options
- Questions must test inference/deduction — NOT keyword matching from the audio
- Each distractor should echo something mentioned in the audio but NOT be the correct answer
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
- setting: one line describing the shared topic (e.g. "Five people talk about learning a new skill.")
- optionPool: exactly 8 options A–H (each a short paraphrased description of an opinion, feeling or experience — NOT copied verbatim from the audio)
- matchingAnswers: 5 rows {number: 19–23, answer: "A"|…|"H"} — one unique letter per speaker; exactly 3 letters remain unused as distractors
- questions: 5 items {number: 19–23, prompt: "Speaker N"} WITHOUT repeating full A–H option text
- script: five short monologues labelled "Speaker 1:" … "Speaker 5:" (70–95 words each; ~30–35 seconds TTS per clip; ~3–4 minutes total)
- audioClips: REQUIRED array of exactly 5 objects {orden:1–5, titulo:"Speaker N", text:"full monologue text for TTS (75–90 words each)"}

Audio / script quality (strict):
- All 5 speakers share the same general theme but each has a distinct perspective or experience
- Subtle overlaps between speakers so unused options sound plausible (functional distractors)
- Authentic spoken English with differentiated idiolects; similar B2 register across speakers
- No speaker states the correct option text literally — paraphrase is mandatory
- Vary tone and attitude; avoid five near-identical monologues

Questions / options quality (strict):
- Questions numbered 19–23 only; exactly 8 options A–H
- Exactly one correct option per speaker; no option should fit two speakers equally well
- Options paraphrase what you hear — do NOT lift phrases verbatim from the audio
- Distractors must be credible: mentioned or hinted in the audio but not the speaker's main point
- Three unused options must still have some basis in the recordings (not invented out of context)

modelAnswers: 5 rows with letter only (A–H), matching matchingAnswers.
Return ONLY JSON with: partTitle, directions, setting, script, audioClips[], optionPool ["A) ...",...,"H) ..."], matchingAnswers[], questions[], modelAnswers[] (letters only)`;
    }

    if (activity === 'sentence-completion' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 2: sentence completion.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 10 questions numbered 9–18 (type "short"; each prompt is an incomplete sentence with a gap marked ___).
script: ONE continuous monologue — lecture, talk or interview-style speech (380–520 words; ~2:30–3:30 minutes when read aloud). No speaker labels unless necessary. ONE audio for the whole part.

Quality rules (strict):
- Monologue must be fluent and coherent — not a list of disconnected facts
- Information appears in LINEAR order matching questions 9→18
- Use authentic spoken English: natural connectors, reformulation, hedging — not written prose
- B2 vocabulary and structures only
- Each gap has exactly ONE possible answer (1–3 words copied literally from the audio)
- modelAnswers must be exact words/phrases as spoken (no paraphrase, no inference)
- Question sentences must PARAPHRASE the audio — do NOT copy long stretches verbatim from the script
- Completed sentences must be grammatically correct once the gap is filled
- Avoid unnecessary spelling traps, ambiguous gaps, or answers requiring more than 3 words
- Do NOT require the candidate to infer — the missing words must be heard clearly once

modelAnswers: 10 rows {number: 9–18, answer: "1–3 words exactly as in audio"}.
Return ONLY JSON with: partTitle, title, directions, setting, script, questions[{number,prompt,type:"short"}], modelAnswers[]`;
    }

    if (activity === 'conversation' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 4: multiple choice (long interview or discussion).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 7 questions numbered 24–30.

Structure:
- setting: one line describing the interview/discussion context
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
Return ONLY JSON with: partTitle, title, directions, setting, script, questions[{number,prompt,options[]}], modelAnswers[] (letters only)`;
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
