import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What should you do before you start writing?",
      "options": [
        "Review only",
        "Planning",
        "Self-editing",
        "Publishing"
      ],
      "correctAnswer": 1,
      "explanation": "Plan first to organise ideas and structure the piece effectively."
    },
    {
      "question": "What is the usual order of the writing process?",
      "options": [
        "Write → Plan → Review → Revise",
        "Plan → Write → Review → Revise",
        "Review → Plan → Write → Revise",
        "Revise → Plan → Write → Review"
      ],
      "correctAnswer": 1,
      "explanation": "Typical order: plan → draft → review → revise. Planning comes first."
    },
    {
      "question": "What do you focus on at the macro-editing stage?",
      "options": [
        "Spelling only",
        "Overall structure and organisation",
        "Specific grammar mistakes in isolation",
        "Capital letters only"
      ],
      "correctAnswer": 1,
      "explanation": "Macro-editing deals with overall structure, order, and flow—not tiny mechanical details."
    },
    {
      "question": "Which technique helps most with catching spelling mistakes?",
      "options": [
        "Reading aloud only",
        "Reading backwards",
        "Using only spell check",
        "Reading through once quickly"
      ],
      "correctAnswer": 1,
      "explanation": "Reading backwards (sentence by sentence from the end) helps you focus on individual words."
    },
    {
      "question": "What is the first step when reviewing a draft?",
      "options": [
        "Fix grammar mistakes immediately",
        "Review overall content and structure",
        "Check spelling only",
        "Count words only"
      ],
      "correctAnswer": 1,
      "explanation": "Start with big-picture content and structure (macro) before fine details."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Planning, Reviewing, and Self-Editing, first ___0___ what you need to find.",
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
          "text": "Planning should take roughly 20% of total writing time.",
          "isTrue": true,
          "explanation": "Correct. A useful split is roughly 20% planning, 50% drafting, 30% review and editing."
        },
        {
          "text": "It is better to fix every type of error in a single pass.",
          "isTrue": true,
          "explanation": "Incorrect. Focus on one editing level at a time: macro, meso, micro, then proofreading."
        },
        {
          "text": "Reading aloud helps spot problems with flow.",
          "isTrue": true,
          "explanation": "Correct. Reading aloud reveals rhythm, awkward phrasing, and gaps in logic."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Automated checkers catch every error in a text.",
          "isTrue": false,
          "explanation": "Incorrect. They miss register, style, coherence, and wrong-word errors."
        },
        {
          "text": "Self-editing should tackle all error types at the same time.",
          "isTrue": true,
          "explanation": "Incorrect. Use several passes, each with a different focus: content, organisation, grammar, vocabulary."
        },
        {
          "text": "Reading your text aloud helps identify flow and rhythm problems.",
          "isTrue": true,
          "explanation": "Correct. Reading aloud reveals fluency issues and errors you might skip when reading silently."
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
      "title": "Select all effective Planning, Reviewing, and Self-Editing techniques",
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

export function buildPlanningReviewingAndSelfEditingExercises() {
  return buildTheoryExercises('planning-reviewing-and-s', config);
}
