import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Complete: '_____, technology has many benefits.'",
      "options": [
        "But",
        "Furthermore",
        "Finally",
        "However"
      ],
      "correctAnswer": 1,
      "explanation": "'Furthermore' adds supporting information related to benefits already introduced."
    },
    {
      "question": "Which structure describes a paragraph best?",
      "options": [
        "Topic sentence + examples + concluding sentence tied to one idea",
        "Introduction + body + conclusion of the whole composition",
        "Topic sentence + supporting sentences + closing sentence",
        "Examples only, with no controlling sentence"
      ],
      "correctAnswer": 2,
      "explanation": "A paragraph usually opens with the main idea, develops it, then wraps up within the same paragraph."
    },
    {
      "question": "Which register best fits a typical university essay?",
      "options": [
        "Very informal tone with slang",
        "Formal style without contractions",
        "Mixed informally sentence by sentence with no warning",
        "Only very short slang sentences"
      ],
      "correctAnswer": 1,
      "explanation": "Academic essays usually expect precise vocabulary and full forms instead of contractions."
    },
    {
      "question": "What is the conclusion mainly for?",
      "options": [
        "Introducing brand-new points not mentioned earlier",
        "Building the longest body section possible",
        "Summarising and closing your points",
        "Listing random examples unrelated to earlier claims"
      ],
      "correctAnswer": 2,
      "explanation": "A conclusion gathers the thread of the discussion and closes—without dumping major new topics."
    },
    {
      "question": "Which text type balances pros and cons of technology most naturally?",
      "options": [
        "Pure narrative folklore only",
        "Argumentative exposition",
        "Short weather forecast",
        "Instruction manual for assembling furniture"
      ],
      "correctAnswer": 1,
      "explanation": "Argumentative writing weighs evidence and viewpoints on opposing sides."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Text Types and Structure, first ___0___ what you need to find.",
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
          "text": "In formal writing you can freely use contractions like 'I'll' and 'don't'.",
          "isTrue": true,
          "explanation": "Incorrect. Formal writing usually avoids contractions; prefer 'I will' and 'do not' unless quoting speech."
        },
        {
          "text": "Each paragraph should mainly develop one controlling idea.",
          "isTrue": true,
          "explanation": "Correct—that keeps paragraphs clear and readable."
        },
        {
          "text": "Words like 'however' and 'furthermore' help make a text smoother.",
          "isTrue": true,
          "explanation": "Correct—they signal relationships between ideas across sentences and paragraphs."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "The introduction should normally be roughly 70% of the essay length.",
          "isTrue": false,
          "explanation": "Incorrect—the introduction is often about 10–15%; the bulk is the body paragraphs."
        },
        {
          "text": "Narratives are often clearer when events follow chronological order.",
          "isTrue": true,
          "explanation": "Correct—it helps listeners or readers reconstruct the timeline."
        },
        {
          "text": "Descriptive texts mainly explain mechanisms step-by-step.",
          "isTrue": true,
          "explanation": "Incorrect—that role fits procedural or explanatory texts better; descriptive writing highlights qualities."
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
      "title": "Select all effective Text Types and Structure techniques",
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

export function buildTextTypesAndStructureExercises() {
  return buildTheoryExercises('text-types-and-structure', config);
}
