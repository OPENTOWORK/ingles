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
  const n = getExamQuestionCount(mode, activity, L);
  const directions = getExamDirections(mode, activity);
  const variety = varietyBlock(options);

  if (mode === 'use-of-english') {
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
    const questionsSchema = `"questions":[${Array.from({ length: n }, (_, i) => {
      const num = i + 1;
      if (activity === 'sentence-completion') {
        return `{"id":"q${num}","number":${9 + i},"type":"short","prompt":"Complete: The speaker says ___"}`;
      }
      if (activity === 'multiple-matching') {
        return `{"id":"q${num}","number":${num},"type":"mcq","prompt":"Speaker ${num} is mainly talking about…","options":["A) ...","B) ...","C) ...","D) ...","E) ...","F) ...","G) ...","H) ..."]}`;
      }
      const opts =
        activity === 'short-extracts'
          ? '["A) ...","B) ...","C) ..."]'
          : '["A) ...","B) ...","C) ...","D) ..."]';
      return `{"id":"q${num}","number":${activity === 'conversation' ? 19 + i : num},"type":"mcq","prompt":"You hear… / question","options":${opts}}`;
    }).join(',')}]`;
    const modelAnswersSchema = `"modelAnswers":[${Array.from({ length: n }, (_, i) =>
      `{"id":"q${i + 1}","answer":"..."}`,
    ).join(',')}]`;

    let scriptRule =
      'script: ONE continuous text for TTS — monologue prose, NO speaker labels.';
    if (activity === 'short-extracts') {
      scriptRule = `script: EIGHT labelled mini-dialogues "Extract 1" through "Extract ${n}", each 2–4 lines as "A:" and "B:" dialogue (70–90 words total).`;
    } else if (activity === 'conversation' || activity === 'multiple-matching') {
      scriptRule =
        'script: dialogue with "A:" and "B:" lines OR five short speaker blocks "Speaker 1:" … for matching.';
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
Return ONLY JSON with fields: directions, instructions, wordMin (${wordMin}), wordMax (${wordMax}), questions (array of 4 objects with number, prompt, format where format is article|email|review|report)`;
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
