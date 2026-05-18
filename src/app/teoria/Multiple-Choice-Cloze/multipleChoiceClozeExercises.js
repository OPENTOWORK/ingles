import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "The company decided to _____ its workforce due to financial difficulties.",
      "options": [
        "reduce",
        "decrease",
        "lower",
        "cut"
      ],
      "correctAnswer": 0,
      "explanation": "'Reduce workforce' is the most common and natural collocation in business contexts."
    },
    {
      "question": "She couldn't _____ her curiosity and opened the letter.",
      "options": [
        "control",
        "contain",
        "restrain",
        "suppress"
      ],
      "correctAnswer": 1,
      "explanation": "'Contain curiosity' is the correct expression. Although 'control' is also possible, 'contain' is more precise in this context."
    },
    {
      "question": "The meeting has been _____ until further notice.",
      "options": [
        "delayed",
        "postponed",
        "suspended",
        "cancelled"
      ],
      "correctAnswer": 1,
      "explanation": "'Postponed until further notice' is the correct expression. 'Postpone' implies a new date will be set."
    },
    {
      "question": "You should _____ advantage of this opportunity while you can.",
      "options": [
        "make",
        "take",
        "get",
        "have"
      ],
      "correctAnswer": 1,
      "explanation": "'Take advantage' is the correct collocation. It is a fixed expression in English."
    },
    {
      "question": "The new policy will _____ effect next month.",
      "options": [
        "take",
        "make",
        "have",
        "get"
      ],
      "correctAnswer": 0,
      "explanation": "'Take effect' is the correct collocation when something comes into force."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Multiple Choice Cloze, first ___0___ what you need to find.",
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
          "text": "In Multiple Choice Cloze, you should always read the whole text before attempting to fill the gaps.",
          "isTrue": true,
          "explanation": "Correct. Reading the whole text first helps you understand the general context."
        },
        {
          "text": "All four options in Multiple Choice Cloze are usually completely different in meaning.",
          "isTrue": false,
          "explanation": "False. The options are usually related words or synonyms with different nuances."
        },
        {
          "text": "Collocations are not important in Multiple Choice Cloze exercises.",
          "isTrue": true,
          "explanation": "False. Collocations are fundamental in this type of exercise."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should consider the words that come both before and after the gap.",
          "isTrue": true,
          "explanation": "Correct. The immediate context is crucial for choosing the right answer."
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
      "title": "Select all effective Multiple Choice Cloze techniques",
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

export function buildMultipleChoiceClozeExercises() {
  return buildTheoryExercises('multiple-choice-cloze', config);
}
