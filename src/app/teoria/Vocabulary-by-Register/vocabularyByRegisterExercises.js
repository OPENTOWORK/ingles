import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which register should you use in an academic essay?",
      "options": [
        "Informal",
        "Formal",
        "Neutral",
        "Colloquial"
      ],
      "correctAnswer": 1,
      "explanation": "Academic essays typically require formal register: precise vocabulary and full forms (no contractions)."
    },
    {
      "question": "Which register is most appropriate for an academic essay?",
      "options": [
        "Informal with contractions",
        "Formal without contractions",
        "Neutral with occasional contractions",
        "Mixed by section without signalling"
      ],
      "correctAnswer": 1,
      "explanation": "Academic essays usually avoid contractions and use precise, formal language."
    },
    {
      "question": "What is the best way to move from formal to informal within one text?",
      "options": [
        "Change abruptly with no transition",
        "Use a clear transition phrase",
        "Mix registers in the same sentence",
        "Never change register"
      ],
      "correctAnswer": 1,
      "explanation": "Signal shifts with phrases like “Let me put this informally...” or “Personally, I believe...”"
    },
    {
      "question": "What matters most when choosing register?",
      "options": [
        "Your personal preference",
        "Context and audience",
        "Text length",
        "Topic alone"
      ],
      "correctAnswer": 1,
      "explanation": "Context (where the text is used) and audience (who reads it) matter most."
    },
    {
      "question": "Which option lists more formal alternatives to 'help'?",
      "options": [
        "aid",
        "assist",
        "support",
        "All of the above"
      ],
      "correctAnswer": 3,
      "explanation": "“Aid”, “assist”, and “support” can all be more formal than “help”, with slightly different nuances."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Vocabulary by Register, first ___0___ what you need to find.",
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
          "text": "Formal register is always better than informal register.",
          "isTrue": true,
          "explanation": "Incorrect. The best register depends on context, audience, and purpose."
        },
        {
          "text": "Contractions are appropriate in informal register.",
          "isTrue": true,
          "explanation": "Correct. Contractions such as “don't”, “won't”, “I'm” are normal in informal English."
        },
        {
          "text": "Context determines the appropriate register.",
          "isTrue": true,
          "explanation": "Correct. Setting (academic, business, personal) is the main guide."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should always use the same register throughout any text.",
          "isTrue": false,
          "explanation": "Incorrect. Consistency matters, but controlled register shifts with transitions are sometimes needed."
        },
        {
          "text": "Academic vocabulary is more precise than everyday vocabulary.",
          "isTrue": true,
          "explanation": "Correct. Academic English often uses more specific terms for complex ideas."
        },
        {
          "text": "You should always use the most formal word available.",
          "isTrue": true,
          "explanation": "Incorrect. Match register to context; excessive formality can sound unnatural."
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
      "title": "Select all effective Vocabulary by Register techniques",
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

export function buildVocabularyByRegisterExercises() {
  return buildTheoryExercises('vocabulary-by-register', config);
}
