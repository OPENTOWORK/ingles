import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is an inference in reading?",
      "options": [
        "Information stated directly",
        "Information you work out though it is not directly stated",
        "The title of the text",
        "Words you do not know"
      ],
      "correctAnswer": 1,
      "explanation": "Inference is what you conclude from clues without direct statement."
    },
    {
      "question": "If a text says 'John slammed the door and stormed out', what can you infer?",
      "options": [
        "John is happy",
        "John is angry or upset",
        "John is in a hurry to get somewhere",
        "John does not know how to close doors gently"
      ],
      "correctAnswer": 1,
      "explanation": "'Slammed' and 'stormed out' suggest anger or strong frustration without naming it."
    },
    {
      "question": "What is the difference between 'He's determined' and 'He's stubborn'?",
      "options": [
        "No difference—they mean the same",
        "'Determined' is more positive; 'stubborn' more negative",
        "'Stubborn' is more formal",
        "They differ only in pronunciation"
      ],
      "correctAnswer": 1,
      "explanation": "'Determined' is positive (persistent); 'stubborn' is negative (unreasonably inflexible)."
    },
    {
      "question": "If a character 'whispers' instead of 'speaks', what might you infer?",
      "options": [
        "They have voice problems",
        "The situation needs secrecy or discretion",
        "They cannot speak loudly",
        "They are reading aloud"
      ],
      "correctAnswer": 1,
      "explanation": "'Whisper' suggests secrecy, confidentiality, or not wanting to be overheard."
    },
    {
      "question": "Which strategy best supports valid inferences?",
      "options": [
        "Imagination alone",
        "Combining several clues from the text",
        "Personal experience only",
        "Ignoring small details"
      ],
      "correctAnswer": 1,
      "explanation": "Several supporting clues from the text make an inference stronger."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Inference and Implication, first ___0___ what you need to find.",
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
          "text": "Inferences should be based on evidence from the text.",
          "isTrue": true,
          "explanation": "Correct. Sound inferences need support from specific clues."
        },
        {
          "text": "You may infer anything that comes to mind.",
          "isTrue": true,
          "explanation": "Incorrect. Inferences must be justified by the text, not free speculation."
        },
        {
          "text": "The author's word choice can reveal unstated attitudes.",
          "isTrue": true,
          "explanation": "Correct. Word choice often signals views that are never stated outright."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Sometimes what the author does NOT say matters as much as what they do.",
          "isTrue": true,
          "explanation": "Correct. Deliberate gaps and silence can be highly meaningful."
        },
        {
          "text": "You can only infer emotions if the text names them.",
          "isTrue": true,
          "explanation": "Incorrect. You infer emotion from actions, dialogue, body language, and wording."
        },
        {
          "text": "Cultural context can change how you read implications.",
          "isTrue": true,
          "explanation": "Correct. Cultural norms shape how we interpret behaviour."
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
      "title": "Select all effective Inference and Implication techniques",
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

export function buildInferenceAndImplicationExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('inference-and-implicatio', config, level, primaryLevel);
}
