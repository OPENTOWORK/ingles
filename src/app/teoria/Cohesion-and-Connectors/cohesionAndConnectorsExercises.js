import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: 'Technology has many benefits. _____, it improves communication.'",
      "options": [
        "However",
        "Furthermore",
        "But",
        "Although"
      ],
      "correctAnswer": 1,
      "explanation": "“Furthermore” adds supporting information that builds on the previous idea."
    },
    {
      "question": "Which connector is most appropriate for adding important information?",
      "options": [
        "However",
        "Furthermore",
        "Nevertheless",
        "Yet"
      ],
      "correctAnswer": 1,
      "explanation": "“Furthermore” adds important supporting information; the others are mainly for contrast."
    },
    {
      "question": "Which connector is most appropriate to show result?",
      "options": [
        "Because",
        "However",
        "Therefore",
        "Furthermore"
      ],
      "correctAnswer": 2,
      "explanation": "“Therefore” shows result or consequence; “because” shows cause."
    },
    {
      "question": "What is wrong with this sentence: 'But however, there are problems'?",
      "options": [
        "A connector is missing",
        "It uses two contrast connectors together",
        "The connector is in the wrong place",
        "Punctuation is missing"
      ],
      "correctAnswer": 1,
      "explanation": "The problem is using “But” and “However” together—both signal contrast. Use only one."
    },
    {
      "question": "Complete: 'I studied hard. _____, I passed the exam.'",
      "options": [
        "However",
        "Although",
        "Therefore",
        "Nevertheless"
      ],
      "correctAnswer": 2,
      "explanation": "“Therefore” shows result: you studied hard, so you passed."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Cohesion and Connectors, first ___0___ what you need to find.",
      "blanks": [
        {
          "answer": "identify"
        }
      ]
    },
    {
      "text": "Skim the text to get the ___0___ idea quickly.",
      "blanks": [
        {
          "answer": "main"
        }
      ]
    },
    {
      "text": "Then read ___0___ for the specific details you need.",
      "blanks": [
        {
          "answer": "carefully"
        }
      ]
    }
  ],
  "trueFalse": [
    {
      "statements": [
        {
          "text": "'However' and 'but' may be used together in the same sentence.",
          "isTrue": true,
          "explanation": "Incorrect. Do not use two contrast connectors together. Use one."
        },
        {
          "text": "'Furthermore' is more formal than 'and'.",
          "isTrue": true,
          "explanation": "Correct. “Furthermore” is formal; “and” is simpler and more neutral."
        },
        {
          "text": "Connectors always come at the start of the sentence.",
          "isTrue": true,
          "explanation": "Incorrect. Many do, but some such as “yet” and “so” often appear mid-sentence."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Using a range of connectors improves the quality of a text.",
          "isTrue": true,
          "explanation": "Correct. Variety avoids repetition and keeps the reader engaged."
        },
        {
          "text": "'However' and 'but' can be used interchangeably in all contexts.",
          "isTrue": true,
          "explanation": "Incorrect. “However” is more formal and often starts a sentence with a comma; “but” links clauses more directly."
        },
        {
          "text": "Cohesion can be achieved without using connectors.",
          "isTrue": true,
          "explanation": "Correct. Cohesion also comes from pronouns, repetition, synonyms, and reference."
        }
      ]
    }
  ],
  "matching": [
    {
      "title": "Match the strategy to its purpose",
      "pairs": [
        {
          "left": "Skimming",
          "right": "Get the gist fast"
        },
        {
          "left": "Scanning",
          "right": "Find specific information"
        },
        {
          "left": "Close reading",
          "right": "Analyse detail and nuance"
        },
        {
          "left": "Checking",
          "right": "Verify your answer"
        }
      ],
      "explanation": "Each reading/listening strategy has a distinct goal."
    },
    {
      "title": "Match the signal to what it shows",
      "pairs": [
        {
          "left": "However",
          "right": "Contrast"
        },
        {
          "left": "Therefore",
          "right": "Result"
        },
        {
          "left": "For example",
          "right": "Illustration"
        },
        {
          "left": "In contrast",
          "right": "Opposition"
        }
      ],
      "explanation": "Discourse markers guide interpretation."
    }
  ],
  "findError": [
    {
      "title": "Find the weak advice",
      "sentence": "You should read every word at the same slow speed.",
      "options": [
        "You",
        "should",
        "every word",
        "slow speed"
      ],
      "correctIndex": 2,
      "explanation": "Adjust speed: skim/scan first, then read carefully where needed."
    },
    {
      "title": "Find the weak advice",
      "sentence": "Never read the question before the text.",
      "options": [
        "Never",
        "read",
        "the question",
        "before the text"
      ],
      "correctIndex": 0,
      "explanation": "Always read the task/question first to know what to look for."
    },
    {
      "title": "Find the weak advice",
      "sentence": "If you are unsure, always choose the longest option.",
      "options": [
        "If you are unsure",
        "always",
        "choose",
        "the longest option"
      ],
      "correctIndex": 3,
      "explanation": "Length is not a reliable clue; use evidence from the text."
    }
  ],
  "sentenceOrder": [
    {
      "title": "Order the exam steps",
      "words": [
        "Read",
        "the",
        "instructions",
        "carefully",
        "first"
      ],
      "explanation": "Instructions tell you exactly what to do."
    },
    {
      "title": "Order the process",
      "words": [
        "Locate",
        "the",
        "relevant",
        "section",
        "of",
        "the",
        "text"
      ],
      "explanation": "Find where the answer likely appears before answering."
    },
    {
      "title": "Order the checking steps",
      "words": [
        "Check",
        "your",
        "answer",
        "against",
        "the",
        "text"
      ],
      "explanation": "Always verify with evidence."
    }
  ],
  "selectAll": [
    {
      "title": "Select all effective Cohesion and Connectors techniques",
      "prompt": "Tick every good technique.",
      "options": [
        {
          "text": "Underline key words in the question",
          "isCorrect": true
        },
        {
          "text": "Ignore the time limit completely",
          "isCorrect": false
        },
        {
          "text": "Use context to infer meaning",
          "isCorrect": true
        },
        {
          "text": "Guess without returning to the text",
          "isCorrect": false
        }
      ],
      "explanation": "Keywords, context, and evidence-based answers are essential."
    },
    {
      "title": "Select all true statements",
      "prompt": "Which are correct?",
      "options": [
        {
          "text": "Paraphrasing is common in exam texts",
          "isCorrect": true
        },
        {
          "text": "The exact same words always appear in the answer",
          "isCorrect": false
        },
        {
          "text": "Tone and attitude can be tested",
          "isCorrect": true
        },
        {
          "text": "Practice improves speed and accuracy",
          "isCorrect": true
        }
      ],
      "explanation": "Exams use paraphrase; tone matters; practice helps."
    }
  ]
};

export function buildCohesionAndConnectorsExercises() {
  return buildTheoryExercises('cohesion-and-connectors', config);
}
