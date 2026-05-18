import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which connector do you use to organize ideas first?",
      "options": [
        "However",
        "First",
        "But",
        "Although"
      ],
      "correctAnswer": 1,
      "explanation": "'First' is used to introduce the first point in a sequence of ideas."
    },
    {
      "question": "Which connector is most appropriate to start a list of ideas?",
      "options": [
        "But",
        "First",
        "However",
        "Also"
      ],
      "correctAnswer": 1,
      "explanation": "'First' is the most appropriate connector to start a list of ideas; the others have different functions."
    },
    {
      "question": "What is the difference between 'I think' and 'I believe'?",
      "options": [
        "There is no difference",
        "'I think' is stronger than 'I believe'",
        "'I believe' is stronger than 'I think'",
        "One is formal and the other is informal"
      ],
      "correctAnswer": 2,
      "explanation": "'I believe' expresses a firmer belief, while 'I think' is more moderate."
    },
    {
      "question": "What is the error in this sentence: 'But however, I disagree'?",
      "options": [
        "A connector is missing",
        "Uses two contrast connectors together",
        "The connector is in the wrong position",
        "Punctuation is missing"
      ],
      "correctAnswer": 1,
      "explanation": "The error is using 'But' and 'However' together — both are contrast connectors. Use only one: 'But I disagree' or 'However, I disagree'."
    },
    {
      "question": "Complete: 'I like coffee. _____, I prefer tea in the morning.'",
      "options": [
        "Therefore",
        "However",
        "Furthermore",
        "First"
      ],
      "correctAnswer": 1,
      "explanation": "'However' introduces a contrast: I like coffee, but I prefer tea in the morning."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Speaking Connectors, first ___0___ what you need to find.",
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
          "text": "It is important to keep consistency in the formality level of connectors.",
          "isTrue": true,
          "explanation": "Correct. Keeping formality consistent improves clarity and professionalism."
        },
        {
          "text": "I can use 'but' and 'however' together in the same sentence.",
          "isTrue": true,
          "explanation": "Incorrect. 'But' and 'however' are redundant — use only one."
        },
        {
          "text": "Example connectors like 'for example' and 'such as' have different uses.",
          "isTrue": true,
          "explanation": "Correct. 'For example' goes at the start of a sentence; 'such as' goes in the middle."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "It is better to always use the same connector to avoid confusion.",
          "isTrue": false,
          "explanation": "Incorrect. It is better to vary connectors to keep speech interesting."
        },
        {
          "text": "Speaking connectors should be used in every sentence.",
          "isTrue": true,
          "explanation": "Incorrect. Connectors should be used strategically to create fluency without overloading your speech."
        },
        {
          "text": "'On the other hand' is used to introduce a contrasting point.",
          "isTrue": true,
          "explanation": "Correct. 'On the other hand' introduces a contrasting or alternative perspective."
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
      "title": "Select all effective Speaking Connectors techniques",
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

export function buildSpeakingConnectorsExercises() {
  return buildTheoryExercises('speaking-connectors', config);
}
