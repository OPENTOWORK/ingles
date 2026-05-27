/**
 * A2 Key (Entry 2) — estructura oficial según muestras 2020/2022 (QP, answer keys, scripts).
 * Solo para generación interna; no mostrar marca en la UI.
 */

export const A2_RW_DIRECTIONS = {
  1: 'Questions 1 – 6\nFor each question, choose the correct answer.',
  2: 'Questions 7 – 13\nFor each question, choose the correct answer.',
  3: 'Questions 14 – 18\nFor each question, choose the correct answer.',
  4: 'Questions 19 – 24\nFor each question, choose the correct answer.',
  5: 'Questions 25 – 30\nFor each question, write the correct answer.\nWrite one word for each gap.',
  6: 'Question 31\nWrite 25 words or more.',
  7: 'Question 32\nWrite 35 words or more.',
};

export const A2_LISTENING_DIRECTIONS = {
  1: 'Questions 1 – 5\nFor each question, choose the correct answer.',
  2: 'Questions 6 – 10\nFor each question, write the correct answer in the gap. Write one word or a number or a date or a time.',
  3: 'Questions 11 – 15\nFor each question, choose the correct answer.',
  4: 'Questions 16 – 20\nFor each question, choose the correct answer.',
  5: 'Questions 21 – 25\nFor each question, choose the correct answer.',
};

/** Parte global → parte local Listening (8→1 … 12→5) */
export function a2ListeningLocalPart(globalPart) {
  const n = Number(globalPart);
  if (n >= 8 && n <= 12) return n - 7;
  return n;
}

export function getA2OfficialDirections(partDef) {
  if (!partDef) return '';
  if (partDef.mode === 'listening') {
    const local = a2ListeningLocalPart(partDef.partNumber);
    return A2_LISTENING_DIRECTIONS[local] || '';
  }
  if (partDef.partNumber >= 1 && partDef.partNumber <= 7) {
    return A2_RW_DIRECTIONS[partDef.partNumber] || '';
  }
  return '';
}

/** Reglas de formato por parte (para prompts DRALO AI). */
export const A2_PART_FORMAT_RULES = {
  1: `Reading & Writing Part 1 (Q1–6): Official QP layout. Each item: LEFT = graphic stimulus (classified ad, smartphone SMS, shop sign, etc.) with readable English text; RIGHT = three full-sentence options A, B, C. Include stimulusType, message (text on image), imageScene (for image generation). Q6 adds "prompt" below the message image. No shared passage.`,
  2: `Part 2 (Q7–13): Title line (e.g. "Young blog writers") + intro optional. THREE people A, B, C with first names and 60–90 word profiles. SEVEN questions; each question asks about A/B/C with options exactly ["A","B","C"] or ["A) Name","B) Name","C) Name"]. Same person may be correct more than once.`,
  3: `Part 3 (Q14–18): ONE factual narrative 180–220 words. FIVE questions; each has exactly THREE options A, B, C (short phrases, e.g. "A dancer", "B teacher").`,
  4: `Part 4 (Q19–24): ONE factual passage with inline gaps (19)…(24). Below or per gap: three words "A … B … C …". Example gap (0) in directions.`,
  5: `Part 5 (Q25–30): Informal email From/To with example gap (0). Six gaps (25)–(30); ONE word each. Include "Write one word for each gap."`,
  6: `Part 6 (Q31): Email to a friend; three bullet tasks; 25–45 words.`,
  7: `Part 7 (Q32): Story from THREE picture prompts; 35–55 words; past narrative.`,
  8: `Listening Part 1 (Q1–5): FIVE extracts in script ("Extract 1"…"5"). Each question: stem + THREE options A/B/C (picture scene descriptions). Five audio clips.`,
  9: `Listening Part 2 (Q6–10): ONE monologue; form/notes with gaps (6)–(10); one word/number/date/time per gap.`,
  10: `Listening Part 3 (Q11–15): ONE conversation ~90s; five MCQ A/B/C.`,
  11: `Listening Part 4 (Q16–20): FIVE short extracts; each question starts with "You will hear …"; MCQ A/B/C.`,
  12: `Listening Part 5 (Q21–25): ONE conversation; match people to food/items; optionPool A–H (8 items, 3 unused); matchingAnswers for 21–25; example 0.`,
  13: `Speaking Part 1 (3–4 min): Phase 1 introductions; Phase 2 two topics with prompts to A and B + extended response. speakingPrompts as examiner lines.`,
  14: `Speaking Part 2 (5–6 min): Collaborative task with picture prompts; Phase 1 talk together; Phase 2 follow-up questions to A and B.`,
};
