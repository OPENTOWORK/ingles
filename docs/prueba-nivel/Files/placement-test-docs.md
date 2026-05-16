# English Placement Test — Documentation

## Overview

Interactive AI-powered English placement test for your language academy website.
Built from three professional EFL placement tests: **Outcomes** (NGL/Cengage), **Energy** (Pearson), and **Solutions 3rd Edition** (Oxford).

---

## AI Teacher Prompt (for Cursor)

Paste this as the `system` prompt in the API call:

```
You are Sarah, an experienced English language teacher at a language academy. Your role is to evaluate student placement test results and provide warm, encouraging, professional feedback.

You will receive:
1. The student's name
2. Their answers to a 20-question multiple choice grammar/vocabulary test
3. The correct answers

YOUR TASK:
1. Calculate the score (correct answers out of 20)
2. Determine the CEFR level based on score:
   - 0-5: A1 (Beginner)
   - 6-9: A2 (Elementary)  
   - 10-13: B1 (Pre-Intermediate)
   - 14-17: B2 (Intermediate/Upper-Intermediate)
   - 18-20: C1/C2 (Advanced)
3. Write a personalised evaluation in this EXACT JSON format (no markdown, no backticks, just raw JSON):

{
  "score": <number>,
  "total": 20,
  "level": "<A1/A2/B1/B2/C1>",
  "levelName": "<Beginner/Elementary/Pre-Intermediate/Intermediate/Upper-Intermediate/Advanced>",
  "greeting": "<Warm personalised opening using the student's name>",
  "summary": "<2-3 sentences summarising their overall performance in an encouraging tone>",
  "strengths": ["<strength 1 based on which questions they got right>", "<strength 2>"],
  "areasToImprove": ["<area 1 based on wrong answers>", "<area 2>"],
  "recommendation": "<2-3 sentences recommending the specific course level and what they will learn there>",
  "encouragement": "<Short motivational closing message, warm and personal>",
  "wrongQuestions": [<list of question numbers the student got wrong, e.g. 3, 7, 12>]
}

Be specific about grammar points tested (e.g. "present perfect", "comparatives", "modal verbs"). 
Reference actual question topics when giving strengths and areas to improve. 
Keep the tone warm but professional, like a real teacher who wants the student to succeed.
```

---

## Question Bank (20 questions)

| # | Grammar Topic | CEFR Level | Correct Answer |
|---|--------------|------------|----------------|
| 1 | Verb to be (plural) | A1 | D (are) |
| 2 | Irregular plurals | A1 | C (children) |
| 3 | Adverb position | A1 | C (usually get) |
| 4 | Present continuous | A2 | D (is wearing) |
| 5 | Past simple questions | A2 | C (did you go) |
| 6 | Comparatives | A2 | D (intelligent) |
| 7 | Past continuous | A2 | D (were having) |
| 8 | Future plans (going to) | A2 | B (are you going) |
| 9 | Present perfect | B1 | D (Have) |
| 10 | Present perfect + never | B1 | D (been) |
| 11 | First conditional | B1 | A (passes) |
| 12 | Passive voice (past) | B1 | C (was written) |
| 13 | Infinitive of purpose | B1 | B (to buy) |
| 14 | Second conditional | B2 | B (wouldn't arrive) |
| 15 | Present perfect continuous | B2 | D (has been waiting) |
| 16 | Used to | B1 | D (used to) |
| 17 | Reported speech | B2 | C (was arriving) |
| 18 | Third conditional | B2 | D (had) |
| 19 | Question tags | B2 | C (do they) |
| 20 | Reported questions | B2 | C (if we had seen) |

---

## Score → CEFR Level Mapping

| Score | Level | Name |
|-------|-------|------|
| 0–5 | A1 | Beginner |
| 6–9 | A2 | Elementary |
| 10–13 | B1 | Pre-Intermediate |
| 14–17 | B2 | Intermediate / Upper-Intermediate |
| 18–20 | C1/C2 | Advanced |

---

## Integration Instructions for Cursor

### 1. Install in your Next.js / React project

Copy `english-placement-test.jsx` into your components folder:
```
/components/PlacementTest.jsx
```

### 2. API Key Setup

The component calls `https://api.anthropic.com/v1/messages` directly.
For production, **route this through your backend** to keep your API key safe:

```javascript
// pages/api/evaluate.js (Next.js example)
export default async function handler(req, res) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify(req.body)
  });
  const data = await response.json();
  res.json(data);
}
```

Then change the fetch URL in the component from:
```javascript
"https://api.anthropic.com/v1/messages"
```
to:
```javascript
"/api/evaluate"
```

### 3. Add to your page

```jsx
import PlacementTest from '@/components/PlacementTest';

export default function TestPage() {
  return (
    <main>
      <PlacementTest />
    </main>
  );
}
```

### 4. Environment variable

In your `.env.local`:
```
ANTHROPIC_API_KEY=your-api-key-here
```

---

## Customisation

### Change academy name / teacher name
Search for `"Sarah"` and replace with your teacher's name.

### Add more questions
Each question follows this structure:
```javascript
{
  id: 21,
  question: "She ___ here for five years.",
  options: ["works", "is working", "has worked", "worked"],
  correct: "c",
  topic: "present perfect duration",
  level: "B1"
}
```

### Change colours / branding
Edit the `LEVEL_COLORS` object at the top of the component:
```javascript
const LEVEL_COLORS = {
  A1: { bg: "#E1F5EE", text: "#0F6E56", border: "#5DCAA5", name: "Beginner" },
  // ... etc
};
```

### Email results
Add an API call after the evaluation to send results via email (Resend, SendGrid, etc.)

---

## Sources

Questions adapted from:
- **Outcomes Placement Test** — National Geographic Learning / Cengage
- **Energy Placement Test** — Pearson Education (Jenny Parsons)
- **Solutions 3rd Edition Placement Test** — Oxford University Press

All questions selected and adapted for educational, non-commercial use in a language academy context.
