import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which type of listening most improves comprehension?",
      "options": [
        "Passive listening",
        "Active listening",
        "Fast listening",
        "Silent listening"
      ],
      "correctAnswer": 1,
      "explanation": "Active listening involves mental engagement and usually boosts comprehension most."
    },
    {
      "question": "What is the main difference between passive and active listening?",
      "options": [
        "Speed of hearing",
        "Level of participation in the process",
        "Volume of the recording",
        "Length of the recording"
      ],
      "correctAnswer": 1,
      "explanation": "The key difference is participation: active listening adds prediction, checking, and inference."
    },
    {
      "question": "What is the main benefit of inference in listening?",
      "options": [
        "Better pronunciation",
        "Understanding implied information",
        "Faster playback",
        "Needing less vocabulary"
      ],
      "correctAnswer": 1,
      "explanation": "Inference mainly helps with meaning that is suggested rather than stated word for word."
    },
    {
      "question": "Which strategy matters most for long recordings?",
      "options": [
        "Listening faster",
        "Attention and focus management",
        "Writing more notes",
        "Ignoring distractions without a plan"
      ],
      "correctAnswer": 1,
      "explanation": "Managing attention—including fatigue and recovery—supports endurance on long input."
    },
    {
      "question": "What should you do when you miss an important word?",
      "options": [
        "Stop listening",
        "Use context to infer meaning",
        "Ask the recording a question",
        "Ignore the rest"
      ],
      "correctAnswer": 1,
      "explanation": "Contextual inference keeps the flow going better than stopping."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Active Listening Strategies, first ___0___ what you need to find.",
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
          "text": "Prediction prepares your mind to process specific information.",
          "isTrue": true,
          "explanation": "Correct. Prediction from questions, context, or vocabulary aims your attention."
        },
        {
          "text": "Continuous checking always harms comprehension.",
          "isTrue": true,
          "explanation": "Incorrect. Light, ongoing checking usually helps by catching errors early."
        },
        {
          "text": "Inference helps with information that is not stated directly.",
          "isTrue": true,
          "explanation": "Correct. Contextual, logical, and cultural clues fill implied meaning."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Attention management is unimportant for active listening.",
          "isTrue": false,
          "explanation": "Incorrect. Managing focus is central to staying active and avoiding drift."
        },
        {
          "text": "Taking notes while listening improves comprehension.",
          "isTrue": true,
          "explanation": "Correct. Notes can sustain focus and accuracy."
        },
        {
          "text": "You must understand every word to be a good listener.",
          "isTrue": true,
          "explanation": "Incorrect. Good listeners track the message and use context and inference."
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
      "title": "Select all effective Active Listening Strategies techniques",
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

export function buildActiveListeningStrategiesExercises() {
  return buildTheoryExercises('active-listening-strateg', config);
}
