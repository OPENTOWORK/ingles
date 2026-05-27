/**
 * Descripciones para levels_partes (Parte N A2) con ejemplo oficial.
 * Se actualizan al regenerar el examen.
 */

const EXAMPLES = {
  1: `Example (Question 0):
Graphic: classified ad "For Sale — Women's bicycle (small)…" with bicycle icon.
A) The bicycle is for children.
B) Some parts of the bicycle are broken.
C) Debbie is selling the bicycle.
Answer: B

Questions 1–6: Each item shows a picture (notice, SMS, shop sign) on the left and three sentences A, B, C on the right. Question 6 adds a question below the message image.`,

  2: `Example: Read three short profiles (e.g. Tasha, Danni, Chrissie) about blogging.

Questions 7–13: "Who writes both a magazine and a blog?" — choose A, B or C for each person.`,

  3: `Example: Long text "A family of dancers" with a small photo.

Questions 14–18: Multiple choice with three options (A, B, C) about details in the text.`,

  4: `Example: Gap (0) — answer "subject".

Text "William Perkin" with gaps (19)–(24). Below each gap, choose A, B or C (one word).`,

  5: `Example: Gap (0) — answer "you".

Email From/To Maria → John with gaps (25)–(30). Write ONE word per gap.`,

  6: `Question 31: Write an email (25 words or more) including three bullet points, e.g. invite a friend to go swimming, say where and how you will travel.`,

  7: `Question 32: Look at three pictures and write the story shown (35 words or more). Pictures tell a simple sequence (e.g. wake up → empty fridge → eat at a café).`,

  8: `Questions 1–5: Listen and choose the correct picture (A, B or C) for each question, e.g. "Where will Claire meet Alex?" with three scene drawings.`,

  9: `Questions 6–10: Listen to a monologue and complete the notes (one word, number, date or time per gap), e.g. "Jobs for students — Dates: 15th June – 20th …"`,

  10: `Questions 11–15: Listen to a conversation (e.g. trip to Dublin) and choose A, B or C for each question.`,

  11: `Questions 16–20: Five short extracts; each starts with "You will hear …" and has one MCQ (A, B, C).`,

  12: `Example: 0 Maria [ B ] (cake).

Questions 21–25: Match each person to food/items A–H (eight options, three unused).`,

  13: `Speaking Part 1 (3–4 min): Introductions, then two everyday topics (e.g. friends, home) with questions to Candidate A and B, back-up prompts, and one extended response per topic.`,

  14: `Speaking Part 2 (5–6 min): Collaborative task with picture prompts; candidates discuss, then answer follow-up questions about preferences and comparison.`,
};

const SUMMARIES = {
  1: 'Six short notices or messages; three statements A/B/C per item.',
  2: 'Three people describe the same topic; seven "Who says…?" questions.',
  3: 'One article or story (~200 words); five comprehension MCQs.',
  4: 'Biographical text with six gaps; three-word choice per gap.',
  5: 'Informal email with six one-word gaps.',
  6: 'Guided email writing with three mandatory bullet points (min. 25 words).',
  7: 'Story writing from three sequential pictures (min. 35 words).',
  8: 'Five listening extracts; choose the matching picture A/B/C.',
  9: 'One listening monologue; complete a form or notes (gaps 6–10).',
  10: 'One conversation; five MCQs (11–15).',
  11: 'Five short dialogues; one MCQ each (16–20).',
  12: 'One conversation; match five people to options A–H.',
  13: 'Examiner interview: personal questions, back-up prompts, extended answers.',
  14: 'Collaborative discussion using pictures; opinion and comparison questions.',
};

/** @param {number} partNumber 1–14 */
export function getA2ParteAdminDescription(partNumber) {
  const n = Number(partNumber);
  const summary = SUMMARIES[n] || `Cambridge A2 Key — Part ${n}`;
  const example = EXAMPLES[n] || '';
  return example ? `${summary}\n\n${example}` : summary;
}
