import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import {
  A2_PART_FORMAT_RULES,
  a2ListeningLocalPart,
  getA2OfficialDirections,
} from '@/data/a2-key-official-spec';

const SHARED = `
Return ONLY valid JSON. A2 Key (Entry 2) — simple A2 vocabulary, official sample-test layout (2020/2022).
Include "directions" using the EXACT official lines provided below when given.
Include "example" with number 0 where the exam has one (Parts 4, 5, Listening 5).
Include "modelAnswers" array with {id, answer} for every scorable item.
For MCQ use exactly 3 options (A, B, C) unless Listening Part 5 matching pool needs 8 (A–H).
Do NOT use Movers/YLE format. Do NOT use 8-notice matching for Reading Part 1.
`;

function speakingPrompt(part) {
  const rules = A2_PART_FORMAT_RULES[part.partNumber] || '';
  if (part.activity === 'interview') {
    return `Create A2 Key Speaking Part 1 (personal interview, 3–4 minutes).
${SHARED}
${rules}
Return JSON:
- partTitle, directions
- phases: [
  {id:"phase1", title:"Introductions", interlocutorLines:["Good morning…","What's your name? (A)","And what's your name? (B)"]},
  {id:"topic1", title:"Topic 1 (e.g. friends)", intro:"Now, let's talk about friends.",
   prompts:[{to:"A",main:"How often do you see your friends?",backup:["Do you see your friends every day?","Do you see your friends at the weekend?"]},
            {to:"B",main:"Where do your friends live?",backup:["Do your friends live near you?"]}],
   extended:{to:"A",main:"Please tell me something about one of your friends.",backup:["Do you like your friend?","Where did you meet your friend?"]}},
  {id:"topic2", title:"Topic 2 (e.g. home)", intro:"Now, let's talk about home.", prompts:[...], extended:{to:"B",main:"Please tell me something about the things you like doing at home at the weekends.",backup:[...]}}
]
- speakingPrompts: flat list of examiner lines in order (for storage)
- modelAnswers: sample short answers for reference`;
  }
  return `Create A2 Key Speaking Part 2 (collaborative task, 5–6 minutes).
${SHARED}
${rules}
Return JSON:
- partTitle, directions, setting, taskTitle
- picturePrompts: exactly 3 items [{label:"Picture 1", scene:"clear scene description for image generation"}, …]
- examinerPrompts: Phase 1 discussion + Phase 2 questions to A and B (opinions, preferences, comparison)
- candidateTask, bulletPoints, modelAnswers`;
}

function listeningPartExtra(partNumber) {
  return A2_PART_FORMAT_RULES[partNumber] || '';
}

/**
 * @param {typeof A2_EXAM_PARTS[0]} partDef
 */
export function buildA2PartGeneratePrompt(partDef, options = {}) {
  const topic = options.topic || 'everyday life (school, hobbies, travel, food, family)';
  const seed = options.varietySeed ?? Date.now();
  const examSlot = options.examSlot ?? 1;
  const start = partDef.questionStart ?? 1;
  const n = partDef.questionCount ?? 5;
  const meta = `Exam set ${examSlot}. Theme: ${topic}. Seed: ${seed}.`;
  const officialDirs = getA2OfficialDirections(partDef);

  if (partDef.mode === 'speaking') {
    return `${speakingPrompt(partDef)}\nOfficial directions style: short candidate instructions.\n${meta}`;
  }

  if (partDef.partNumber === 1) {
    return `Create A2 Key Reading & Writing Part 1.
${SHARED}
${A2_PART_FORMAT_RULES[1]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}

Required JSON:
- partTitle: "Part 1"
- directions: (exact string above)
- example: {number:0, message:"For Sale\\nWomen's bicycle (small)\\n11 years old - needs new tyres\\nPhone Debbie - 0794587454", stimulusType:"classified_ad", imageScene:"classified ad with small bicycle drawing", options:["A) The bicycle is for children.","B) Some parts of the bicycle must be changed.","C) Debbie is selling the bike because she's too big for it now."], answer:"B"}
- questions: exactly 6 items numbered 1–6. Use this mix: 1 classified_ad, 2 text_message, 1 shop_sign, 1 public_sign, 1 text_message with prompt on Q6.
  Each item:
  - stimulusType: "classified_ad" | "text_message" | "shop_sign" | "public_sign"
  - message: 3–6 lines of A2 English (exact text for the picture). SMS: Hi Name + body + sender name. Signs: title + details.
  - imageScene: precise art brief for Cambridge-style B&W exam art
  - options: THREE full sentences starting with "A) " "B) " "C) " — one correct, two plausible distractors (same topic, wrong detail)
  - prompt: ONLY question 6, e.g. "Why did Sophie write this message?"
  - type: "mcq"
- modelAnswers: [{id:"q1",answer:"B"}, {id:"q2",answer:"C"}, ... {id:"q6",answer:"C"}] — one letter each
- Distractors must test careful reading (not trick vocabulary above A2).

${meta}`;
  }

  if (partDef.partNumber === 2) {
    return `Create A2 Key Reading & Writing Part 2.
${SHARED}
${A2_PART_FORMAT_RULES[2]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}

Required JSON:
- partTitle: "Part 2"
- directions: (exact string above)
- passageTitle: short title (e.g. "Young blog writers")
- passage: optional one-line intro
- profiles: exactly 3 [{letter:"A",name:"First name",text:"60–90 words"}, {letter:"B",...}, {letter:"C",...}]
- questions: exactly 7 items, numbers 7–13, each:
  - prompt: one question sentence
  - options: exactly ["A","B","C"] OR three labels tied to people
- modelAnswers: q7–q13 letters A/B/C only

${meta}`;
  }

  if (partDef.partNumber === 3) {
    return `Create A2 Key Reading & Writing Part 3.
${SHARED}
${A2_PART_FORMAT_RULES[3]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}

- passage: 180–220 word factual narrative
- questions: exactly 5 MCQ, numbers 14–18, each with exactly 3 options ["A) short phrase","B) ...","C) ..."] — NOT four options
- modelAnswers for each

${meta}`;
  }

  if (partDef.partNumber === 4) {
    return `Create A2 Key Reading & Writing Part 4.
${SHARED}
${A2_PART_FORMAT_RULES[4]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}

- example in directions: gap (0) with answer
- passage: factual text with gaps (19) through (24) inline
- questions: numbers 19–24, each options exactly ["A) word","B) word","C) word"]
- modelAnswers: letters only

${meta}`;
  }

  if (partDef.partNumber === 5) {
    return `Create A2 Key Reading & Writing Part 5.
${SHARED}
${A2_PART_FORMAT_RULES[5]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}

- example: gap (0) with answer "you" or similar
- passage: informal email From/To with gaps (25)–(30) as (25) ................
- questions: numbers 25–30, type "short"
- modelAnswers: one word each (slash alternatives ok: "a / the")

${meta}`;
  }

  if (partDef.mode === 'writing') {
    if (partDef.activity === 'short-message') {
      return `Create A2 Key Reading & Writing Part 6 (Question 31).
${SHARED}
${A2_PART_FORMAT_RULES[6]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}
bulletPoints (3), taskTitle, instructions, inputNotes. wordMin 25, wordMax 45.

${meta}`;
    }
    return `Create A2 Key Reading & Writing Part 7 (Question 32).
${SHARED}
${A2_PART_FORMAT_RULES[7]}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}
- storyPrompt: "Look at the three pictures. Write the story shown in the pictures."
- picturePrompts: exactly 3 [{label:"Picture 1", scene:"…"}, {label:"Picture 2", scene:"…"}, {label:"Picture 3", scene:"…"}] — simple everyday story sequence
- wordMin 35, wordMax 55. Past narrative.
- modelAnswers: [{id:"q32", answer:"Sample 35+ word story"}]

${meta}`;
  }

  if (partDef.mode === 'listening') {
    const nums = Array.from({ length: n }, (_, i) => start + i);
    const local = a2ListeningLocalPart(partDef.partNumber);
    const extra =
      partDef.partNumber === 8
        ? `
Each question MUST include:
- prompt: question stem (e.g. "Where will Claire meet Alex?")
- imageOptions: exactly 3 [{letter:"A", scene:"line-drawing scene description"}, {letter:"B", scene:"…"}, {letter:"C", scene:"…"}]
- options: ["A","B","C"] and answer letter in modelAnswers
script: five labelled extracts "Extract 1" … "Extract 5" for TTS.`
        : partDef.partNumber === 9
          ? `
- inputNotes or formTitle (e.g. "Jobs for students with Sunshine Holidays")
- passage with labelled gaps (6)–(10); questions type "short"; modelAnswers one word/number/date/time each`
          : partDef.partNumber === 10
            ? `
- setting: one sentence context (e.g. trip to Dublin)
- script: ~90s conversation; five MCQ questions 11–15 with exactly 3 options each`
            : partDef.partNumber === 11
              ? `
- script: five separate short extracts; each question: context "You will hear …", prompt, 3 options A/B/C`
              : partDef.partNumber === 12
                ? `
- matchingIntro, optionPool A–H (8 items), example {number:0, label:"Maria", answer:"B"}
- matchingAnswers for 21–25; script: party conversation`
                : '';
    return `Create A2 Key Listening Part ${local} (stored as global part ${partDef.partNumber}).
${SHARED}
${listeningPartExtra(partDef.partNumber)}
Official directions (copy exactly): ${JSON.stringify(officialDirs)}
Activity: ${partDef.activity}. Question numbers: ${nums.join(', ')}.
Include title, setting, script (for TTS), questions with correct numbering.
${extra}

${meta}`;
  }

  return `Create A2 Key part ${partDef.partNumber}. ${SHARED}\n${meta}`;
}

export function getA2PartDef(partNumber) {
  return A2_EXAM_PARTS.find((p) => p.partNumber === Number(partNumber));
}

/** GPT a veces devuelve listas como objeto { "1": {...}, "2": {...} }. */
export function asGeneratedArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return Object.values(value);
  return [];
}

/** @param {object} gen */
export function normalizeGeneratedPayload(gen) {
  if (!gen || typeof gen !== 'object') return gen;
  let questions = asGeneratedArray(gen.questions).map((q, i) => ({
    ...q,
    number: q.number != null && q.number !== '' ? Number(q.number) : undefined,
  }));
  if (gen.partNumber === 1 || questions.every((q) => !q.number)) {
    questions = questions.map((q, i) => ({ ...q, number: q.number ?? i + 1 }));
  }
  return {
    ...gen,
    questions,
    profiles: asGeneratedArray(gen.profiles),
    sections: asGeneratedArray(gen.sections),
    notices: asGeneratedArray(gen.notices),
    optionPool: asGeneratedArray(gen.optionPool),
    matchingAnswers: asGeneratedArray(gen.matchingAnswers),
    modelAnswers: asGeneratedArray(gen.modelAnswers),
    speakingPrompts: asGeneratedArray(gen.speakingPrompts),
    bulletPoints: asGeneratedArray(gen.bulletPoints),
    phases: asGeneratedArray(gen.phases),
    picturePrompts: asGeneratedArray(gen.picturePrompts),
  };
}

/** @param {object} gen @param {typeof A2_EXAM_PARTS[0]} partDef */
export function isA2GeneratedPartComplete(gen, partDef) {
  const data = normalizeGeneratedPayload(gen);
  if (!data || typeof data !== 'object') return false;
  const n = partDef.questionCount ?? 0;
  const start = partDef.questionStart ?? 1;

  if (partDef.partNumber === 1) {
    const qs = data.questions;
    return (
      qs.length >= 6 &&
      qs.filter((q) => asGeneratedArray(q?.options).length >= 3).length >= 6 &&
      qs.filter((q) => String(q.message || '').length > 20).length >= 6 &&
      qs.filter((q) => q.imageScene && q.stimulusType).length >= 6
    );
  }

  if (partDef.partNumber === 2) {
    const profiles = [...data.profiles, ...data.sections];
    const qs = data.questions.filter((q) => Number(q.number) >= 7);
    return profiles.length >= 3 && qs.length >= 7;
  }

  if (partDef.partNumber === 3) {
    const qs = data.questions.filter((q) => Number(q.number) >= 14);
    return (
      (data.passage || '').length > 120 &&
      qs.length >= 5 &&
      qs.filter((q) => asGeneratedArray(q?.options).length === 3).length >= 5
    );
  }

  if (partDef.partNumber === 8) {
    const qs = data.questions.filter((q) => Number(q.number) <= 5);
    return (
      qs.length >= 5 &&
      qs.filter((q) => asGeneratedArray(q.imageOptions).length >= 3).length >= 5
    );
  }

  if (partDef.partNumber === 12) {
    const pool = [...data.optionPool, ...data.notices];
    return pool.length >= 6 && data.matchingAnswers.length >= 5;
  }

  if (partDef.partNumber === 7) {
    return asGeneratedArray(data.picturePrompts).length >= 3;
  }

  if (partDef.partNumber === 14) {
    return asGeneratedArray(data.picturePrompts).length >= 3;
  }

  if (partDef.mode === 'writing') {
    return Boolean(data.directions || data.partTitle);
  }

  if (partDef.mode === 'speaking') {
    return (
      Boolean(data.directions || data.partTitle) &&
      (data.phases.length >= 1 || data.speakingPrompts.length >= 4)
    );
  }

  if (partDef.activity === 'open-cloze') {
    return (
      data.modelAnswers.length >= 6 ||
      data.questions.length >= 6 ||
      /\(25\)/.test(data.passage || '')
    );
  }

  const qs = data.questions;
  const mcqOk = qs.filter((q) => {
    const num = Number(q.number);
    if (num < start) return false;
    const opts = asGeneratedArray(q?.options);
    return opts.length >= 3 || q.type === 'short';
  }).length;
  return mcqOk >= n || data.modelAnswers.length >= n;
}
