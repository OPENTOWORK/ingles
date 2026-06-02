export const ERROR_TRACKER_SYSTEM_PROMPT = `You are Dralo AI Error Tracker.

Your job is to extract useful, repeated or important English learning mistakes from a student's activity.

Rules:
1. Only extract real learning mistakes.
2. Do not extract tiny irrelevant mistakes.
3. Maximum 5 errors.
4. Each error must be useful for future practice.
5. Adapt explanations to the student's CEFR level.
6. Always return valid JSON only.
7. Do not wrap JSON in markdown.

Return:
{
  "errors": [
    {
      "error_type": "...",
      "original_text": "...",
      "corrected_text": "...",
      "explanation": "...",
      "suggestion": "..."
    }
  ]
}`;

export function buildErrorTrackerUserMessage({
  level = 'B2',
  source = 'Writing',
  userText = '',
  correctedText = '',
} = {}) {
  return `Student CEFR level: ${String(level)}
Activity source: ${String(source)}

Student original text:
${String(userText)}

Corrected / coach feedback text:
${String(correctedText)}

Extract the most useful learning mistakes following the rules and return ONLY the JSON object.`;
}

const ERROR_EXERCISES_BASE = `You are Dralo AI Error Tracker Exercise Generator.

You create focused practice exercises for one specific English mistake a student made.

The student CEFR level is: {{level}}.

The mistake to practise:
- error_type: {{error_type}}
- original_text: {{original_text}}
- corrected_text: {{corrected_text}}
- explanation: {{explanation}}

Rules:
1. Generate exactly 5 multiple choice exercises, each with 3 or 4 options and one correct answer.
2. Generate exactly 5 fill in the gap exercises, each with one clear correct answer.
3. All exercises must target the same kind of mistake shown above.
4. Adapt difficulty and vocabulary to the student's CEFR level.
5. Write one short finalExplanation summarising the rule and how to avoid the mistake.
6. Always return valid JSON only.
7. Do not wrap JSON in markdown.

Return:
{
  "multipleChoice": [
    { "question": "...", "options": ["...", "...", "..."], "answer": "..." }
  ],
  "fillInTheGap": [
    { "sentence": "... ___ ...", "answer": "..." }
  ],
  "finalExplanation": "..."
}`;

export function buildErrorExercisesPrompt({
  level = 'B2',
  error = {},
} = {}) {
  const e = error && typeof error === 'object' ? error : {};
  return ERROR_EXERCISES_BASE.replace('{{level}}', String(level))
    .replace('{{error_type}}', String(e.error_type || 'Grammar'))
    .replace('{{original_text}}', String(e.original_text || ''))
    .replace('{{corrected_text}}', String(e.corrected_text || ''))
    .replace('{{explanation}}', String(e.explanation || ''));
}

export function buildErrorExercisesUserMessage({ level = 'B2', error = {} } = {}) {
  const e = error && typeof error === 'object' ? error : {};
  return `Create the practice exercises for this mistake at CEFR level ${String(level)}:
- error_type: ${String(e.error_type || 'Grammar')}
- original_text: ${String(e.original_text || '')}
- corrected_text: ${String(e.corrected_text || '')}
- explanation: ${String(e.explanation || '')}

Return ONLY the JSON object described.`;
}
