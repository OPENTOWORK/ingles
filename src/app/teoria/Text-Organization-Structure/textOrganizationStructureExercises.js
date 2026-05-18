import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the main purpose of text organisation?",
      "options": [
        "Make the text longer",
        "Create a clear, effective message",
        "Use complex vocabulary",
        "Impress the reader"
      ],
      "correctAnswer": 1,
      "explanation": "Organisation guides the reader logically toward a coherent message."
    },
    {
      "question": "Which pattern fits best for explaining how to follow a recipe?",
      "options": [
        "Problem–solution",
        "Cause–effect",
        "Chronological / sequential",
        "Comparison–contrast"
      ],
      "correctAnswer": 2,
      "explanation": "Recipes follow steps in order, so a chronological / sequential pattern fits."
    },
    {
      "question": "Which transition best introduces a counterargument?",
      "options": [
        "Furthermore",
        "However",
        "Therefore",
        "In addition"
      ],
      "correctAnswer": 1,
      "explanation": "'However' signals contrast—ideal before an opposing point."
    },
    {
      "question": "In a problem–solution text, what typically follows stating the problem?",
      "options": [
        "The conclusion",
        "More unrelated problems",
        "Causes of the problem or possible solutions",
        "A new introduction"
      ],
      "correctAnswer": 2,
      "explanation": "After the problem, texts often explore causes or present solutions."
    },
    {
      "question": "Which is NOT typical of a strong introduction?",
      "options": [
        "A hook to gain attention",
        "Topic context",
        "Specific conclusion details",
        "Presentation of the thesis"
      ],
      "correctAnswer": 2,
      "explanation": "Conclusion-level detail belongs at the end, not in the introduction."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Text Organization and Structure, first ___0___ what you need to find.",
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
          "text": "Each paragraph should have one clear main idea.",
          "isTrue": true,
          "explanation": "Correct. Each paragraph should focus on one central point that supports the whole."
        },
        {
          "text": "Connectors are only used at paragraph openings.",
          "isTrue": true,
          "explanation": "Incorrect. Connectors appear within and between sentences for flow."
        },
        {
          "text": "The introduction should state the text's purpose.",
          "isTrue": true,
          "explanation": "Correct. It orientates the reader about what to expect."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "A good paragraph may contain several unrelated main ideas.",
          "isTrue": false,
          "explanation": "Incorrect. One main idea per paragraph works best, with supporting detail."
        },
        {
          "text": "The conclusion should introduce completely new ideas.",
          "isTrue": true,
          "explanation": "Incorrect. The conclusion should wrap up what was already discussed."
        },
        {
          "text": "Connectors help readers follow logical flow.",
          "isTrue": true,
          "explanation": "Correct. They show how ideas relate."
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
      "title": "Select all effective Text Organization and Structure techniques",
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

export function buildTextOrganizationStructureExercises() {
  return buildTheoryExercises('text-organization-struct', config);
}
