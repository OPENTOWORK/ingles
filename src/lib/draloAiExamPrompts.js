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
  return `"partTitle":"Cambridge part title","directions":${JSON.stringify(directions)},"example":{"number":0,"label":"(0)","answer":"...","explanation":"one short line why this answer fits"}${extra}`;
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
      return `Create ONE complete Cambridge B2 First Reading Part 5: multiple choice.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 6 questions numbered 31–36.
Include a rich B2-level reading passage (about 500–650 words) with title.
Each question: plausible inference/detail/vocabulary stem (not too literal), four options A–D.
Distribute correct answers across A, B, C and D (no more than 2 consecutive same letter).
Avoid absurd distractors like "always", "never", "everyone", "all" unless genuinely justified.
Return ONLY JSON with: partTitle, directions, title, passage, questions[{number, prompt, options:["A) ...","B) ...","C) ...","D) ..."]}], modelAnswers[{id, answer:"A"|"B"|"C"|"D"}]`;
    }

    if (activity === 'gapped-text' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Reading Part 6: gapped text.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 6 gaps numbered (31) through (36) in the passage.
Passage length: about 450–600 words (minimum 450 words — count carefully), B2 level, natural magazine/article style with clear paragraph development.
Include sentencePool: exactly 7 sentences labelled A–G (one extra distractor not used in any gap).
Questions array: 6 items {number: 31–36} with NO per-question options (global pool only).
modelAnswers: single letters A–G only, one per gap; use each correct letter once only across gaps 31–36.

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
      return `Create ONE complete Cambridge B2 First Reading Part 7: multiple matching.
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 10 statements numbered 37–46.
Include matchingIntro starting with "Which person…" explaining candidates choose A–D (people may be chosen more than once).
sections: exactly 4 people A–D, each with name and paragraph (120–180 words).
Each question: {number, prompt} with a clear statement to match — NO A/B/C/D option text in questions.
modelAnswers: single letters A–D only.
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
    if (activity === 'multiple-matching' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 3: multiple matching (five speakers).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 5 speakers (Speaker 1–Speaker 5) in the script, matched to options A–H.
optionPool: exactly 8 options A–H (each a short description of an opinion/feeling/activity).
matchingAnswers: 5 rows {number: 19–23, answer: "A"|...|"H"} — one letter per speaker.
questions: 5 items {number: 19–23, prompt: "Speaker N"} WITHOUT repeating full A–H option text.
script: five short monologues labelled "Speaker 1:" … "Speaker 5:" (70–100 words each; suitable for 25–35 second clips).
Return ONLY JSON with: partTitle, directions, setting, script, optionPool ["A) ...",...,"H) ..."], matchingAnswers[], questions[], modelAnswers[] (letters only)`;
    }

    if (activity === 'conversation' && L === 'B2') {
      return `Create ONE complete Cambridge B2 First Listening Part 4: multiple choice (interview or conversation).
${variety}
${SHARED_JSON_RULES}
${directions}
Generate exactly 7 questions numbered 24–30.
Each question must include exactly three options as full strings: "A) ...", "B) ...", "C) ...".
script: ONE continuous interview or conversation between an Interviewer (A) and a guest (B), 450–650 words total (about 3–4 minutes when read aloud). Use "A:" and "B:" speaker labels throughout.
modelAnswers: 7 rows with letter only (A, B, or C) matching questions 24–30.
Do NOT use an A–H matching pool. Do NOT split into five separate speaker monologues.
Return ONLY JSON with: partTitle, title, directions, setting, script, questions[{number,prompt,options[]}], modelAnswers[]`;
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
      scriptRule = `script: EIGHT labelled mini-dialogues "Extract 1" through "Extract 8", each 2–4 lines as "A:" and "B:" dialogue (80–120 words total per extract; suitable for 25–35 second clips).`;
    } else if (activity === 'sentence-completion') {
      scriptRule =
        'script: ONE continuous monologue (450–650 words; about 3–4 minutes when read aloud). No speaker labels unless necessary.';
    } else if (activity === 'multiple-matching') {
      scriptRule =
        'script: five short speaker blocks "Speaker 1:" … "Speaker 5:" (70–100 words each).';
    } else if (activity === 'conversation') {
      scriptRule =
        'script: dialogue with "A:" and "B:" lines for an interview or conversation (450–650 words for B2 Part 4).';
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
