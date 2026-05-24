import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What do note-taking techniques help you do?",
      "options": [
        "Organize information",
        "Retain information",
        "Write more efficiently",
        "All of the above"
      ],
      "correctAnswer": 3,
      "explanation": "They support organizing, retaining, and writing more efficiently during listening."
    },
    {
      "question": "What is the main benefit of note-taking in listening?",
      "options": [
        "Improve pronunciation",
        "Retain important information",
        "Increase handwriting speed",
        "Improve spelling"
      ],
      "correctAnswer": 1,
      "explanation": "The main benefit is retaining key information, especially on long audio where details slip easily."
    },
    {
      "question": "What is the best strategy for writing quickly?",
      "options": [
        "Full words only",
        "Abbreviations and symbols",
        "Cursive only",
        "All capitals"
      ],
      "correctAnswer": 1,
      "explanation": "Abbreviations and symbols are the fastest way to keep up without losing meaning."
    },
    {
      "question": "When is note-taking most important?",
      "options": [
        "Short clips only",
        "Long audio with lots of information",
        "Only in monologues",
        "Never"
      ],
      "correctAnswer": 1,
      "explanation": "Long, information-rich audio is where notes matter most to hold specifics."
    },
    {
      "question": "Which abbreviation is best for 'information'?",
      "options": [
        "information",
        "info",
        "inform",
        "infm"
      ],
      "correctAnswer": 1,
      "explanation": "'Info' is a standard, recognizable short form for 'information'."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Note-Taking Techniques, first ___0___ what you need to find.",
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
          "text": "You should try to write down everything you hear.",
          "isTrue": true,
          "explanation": "Incorrect. Note only key information; trying to write everything makes you miss what follows."
        },
        {
          "text": "Abbreviations must be clear to the person who writes them.",
          "isTrue": true,
          "explanation": "Correct. Your short forms must be readable by you later."
        },
        {
          "text": "Different listening types need different note-taking approaches.",
          "isTrue": true,
          "explanation": "Correct. Short dialogues need light notes; monologues need clearer structure."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Speed matters more than perfect form in note-taking.",
          "isTrue": true,
          "explanation": "Correct. Prioritizing speed helps you capture more of what matters."
        },
        {
          "text": "You should write complete sentences when taking notes during listening.",
          "isTrue": true,
          "explanation": "Incorrect. Keywords, short phrases, and abbreviations work better under time pressure."
        },
        {
          "text": "Symbols like arrows and abbreviations speed up note-taking.",
          "isTrue": true,
          "explanation": "Correct. Symbols (→, ↑, &) and abbreviations (w/, b/c) speed up writing."
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
      "title": "Select all effective Note-Taking Techniques techniques",
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

export function buildNoteTakingTechniquesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('note-taking-techniques', config, level, primaryLevel);
}
