import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "In Open Cloze, how many words should you generally use per gap?",
      "options": [
        "As many as you need",
        "One word",
        "Two or three words",
        "It depends on the context"
      ],
      "correctAnswer": 1,
      "explanation": "In Open Cloze you generally use only one word per gap, avoiding contractions and long phrases."
    },
    {
      "question": "What is the first recommended strategy for Open Cloze?",
      "options": [
        "Fill the gaps immediately",
        "Read the whole text first",
        "Count the blanks",
        "Look for difficult words"
      ],
      "correctAnswer": 1,
      "explanation": "You should read the whole text first to understand the general context before filling the gaps."
    },
    {
      "question": "Complete: 'She has been living in London _____ five years.'",
      "options": [
        "since",
        "for",
        "during",
        "from"
      ],
      "correctAnswer": 1,
      "explanation": "'For' is used with periods of time (five years). 'Since' is used with specific points in time."
    },
    {
      "question": "What type of words are most common in Open Cloze?",
      "options": [
        "Highly technical words",
        "Function words and connectors",
        "Proper nouns",
        "Very long words"
      ],
      "correctAnswer": 1,
      "explanation": "Function words (articles, prepositions, auxiliaries) and connectors are the most common in Open Cloze."
    },
    {
      "question": "Complete: 'The meeting will take place _____ Monday morning.'",
      "options": [
        "in",
        "on",
        "at",
        "by"
      ],
      "correctAnswer": 1,
      "explanation": "'On' is used with specific days: 'on Monday morning'. 'In' is used with months/years, 'at' with specific times."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Open Cloze, first ___0___ what you need to find.",
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
          "text": "In Open Cloze you can use contractions like 'don't' or 'can't'.",
          "isTrue": true,
          "explanation": "Incorrect. In Open Cloze you should generally avoid contractions and use full forms."
        },
        {
          "text": "The immediate context is important for choosing the right word.",
          "isTrue": true,
          "explanation": "Correct. The words before and after the gap give important clues about which word you need."
        },
        {
          "text": "You only need to consider grammar, not meaning.",
          "isTrue": false,
          "explanation": "Incorrect. You must consider grammar, meaning, and the context of the whole text."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should keep to the register of the text.",
          "isTrue": true,
          "explanation": "Correct. If the text is formal, your answers should be formal; if informal, they should be informal."
        },
        {
          "text": "The tense used elsewhere in the text does not matter.",
          "isTrue": true,
          "explanation": "Incorrect. You should stay consistent with the dominant tense where appropriate."
        },
        {
          "text": "You should always check your answers in context.",
          "isTrue": true,
          "explanation": "Correct. It is important to read the full sentence with your answer to check it makes sense."
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
      "title": "Select all effective Open Cloze techniques",
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

export function buildOpenClozeExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('open-cloze', config, level, primaryLevel);
}
