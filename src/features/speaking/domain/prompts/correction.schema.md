Return **only** valid JSON matching this shape (no markdown fences):

{
  "criteria": [
    { "criterion": "taskAchievement", "score": 1-5, "errors": [{ "excerpt": "", "issue": "", "suggestion": "" }] },
    { "criterion": "grammar", "score": 1-5, "errors": [] },
    { "criterion": "vocabulary", "score": 1-5, "errors": [] },
    { "criterion": "fluency", "score": 1-5, "errors": [] },
    { "criterion": "pronunciation", "score": 1-5, "errors": [] }
  ],
  "correctedVersion": "...",
  "modelAnswer": "...",
  "shortExplanation": "plain English, 2-4 sentences",
  "pronunciation": { "score": 1-5, "feedback": "", "isEstimated": true }
}

CEFR level: {{cefr}}.
Student text: {{text}}

If you did not hear audio, set pronunciation.isEstimated to true and keep scores conservative.
