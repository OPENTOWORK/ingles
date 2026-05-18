import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Before listening to a short dialogue, what should you do?",
      "options": [
        "Write random answers first",
        "Read the questions",
        "Draft long summaries",
        "Close your eyes"
      ],
      "correctAnswer": 1,
      "explanation": "Reading questions beforehand tells your ear what proof to hunt for."
    },
    {
      "question": "Which habit best supports short dialogues?",
      "options": [
        "Listening with zero preview",
        "Reading questions ahead of playback",
        "Parsing each token exhaustively",
        "Avoiding all notes"
      ],
      "correctAnswer": 1,
      "explanation": "Previewing prompts channels attention toward decisive evidence."
    },
    {
      "question": "What kind of answer do short-dialogue items usually expect?",
      "options": [
        "Abstract theory",
        "Concrete, specific facts",
        "Historical background",
        "Scientific jargon"
      ],
      "correctAnswer": 1,
      "explanation": "They overwhelmingly test pragmatic detail such as fares, clocks, venues, roles."
    },
    {
      "question": "What level band do many exam short dialogues target?",
      "options": [
        "Advanced (C1–C2)",
        "Intermediate (B1–B2)",
        "Beginner to elementary",
        "Native only"
      ],
      "correctAnswer": 2,
      "explanation": "They favor accessible lexis tied to survival or daily-life English."
    },
    {
      "question": "Which detail is comparatively rare inside short exchanges?",
      "options": [
        "Prices or appointment times",
        "Dense academic theory",
        "Locations",
        "Immediate plans"
      ],
      "correctAnswer": 1,
      "explanation": "High-level exposition is uncommon; pragmatic micro-facts prevail."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Short Dialogues, first ___0___ what you need to find.",
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
          "text": "Short dialogues often last between 30 seconds and 2 minutes.",
          "isTrue": true,
          "explanation": "Correct. They are purposely brief clips in that typical window."
        },
        {
          "text": "You must grasp every lexical item in order to succeed.",
          "isTrue": true,
          "explanation": "Incorrect. Anchoring facts that questions target matters more than full lexicon mastery."
        },
        {
          "text": "Jotting quick notes helps retention of numbers and names.",
          "isTrue": true,
          "explanation": "Correct. Light notes preserve fragile detail under exam pressure."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Context (store, diner, taxi, etc.) is irrelevant.",
          "isTrue": false,
          "explanation": "Incorrect. Setting drives likely vocabulary and pragmatic goals."
        },
        {
          "text": "Short dialogues usually have complex vocabulary.",
          "isTrue": true,
          "explanation": "Incorrect. Everyday lexis dominates these clips."
        },
        {
          "text": "Context clues strongly shape interpretation.",
          "isTrue": true,
          "explanation": "Correct. Setting and relationships between speakers constrain meaning."
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
      "title": "Select all effective Short Dialogues techniques",
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

export function buildShortDialoguesExercises() {
  return buildTheoryExercises('short-dialogues', config);
}
