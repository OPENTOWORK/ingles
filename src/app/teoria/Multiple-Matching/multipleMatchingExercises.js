import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "In Multiple Matching, can texts be the answer to more than one question?",
      "options": [
        "No—each text answers only one question",
        "Yes—texts can answer several questions",
        "Only if the texts are very long",
        "It depends how many questions there are"
      ],
      "correctAnswer": 1,
      "explanation": "Yes—in Multiple Matching a text can be the answer to several different questions."
    },
    {
      "question": "What is the best way to start a Multiple Matching task?",
      "options": [
        "Read all the texts first",
        "Read the questions first",
        "Count how many texts there are",
        "Start with the longest text"
      ],
      "correctAnswer": 1,
      "explanation": "Read the questions first so you know what to look for in the texts."
    },
    {
      "question": "If a question is about a 'high price', which words might you find in the text?",
      "options": [
        "Only the word 'expensive'",
        "Luxury, premium, costly, pricey",
        "Only numbers with currency symbols",
        "Only the phrase 'high price'"
      ],
      "correctAnswer": 1,
      "explanation": "Look for synonyms such as 'luxury', 'premium', 'costly', and 'pricey' that signal high price."
    },
    {
      "question": "What should you do while reading each text?",
      "options": [
        "Memorise everything",
        "Translate every word",
        "Underline relevant information and mark possible answers",
        "Read aloud"
      ],
      "correctAnswer": 2,
      "explanation": "Underline relevant information and mark question numbers where you find possible answers."
    },
    {
      "question": "How can you tell a restaurant is 'suitable for families' if it does not say so directly?",
      "options": [
        "Only if it says 'family restaurant'",
        "By mentions of children's menu, playground, high chairs",
        "By counting tables",
        "By the type of food only"
      ],
      "correctAnswer": 1,
      "explanation": "Clues such as 'children's menu', 'playground', or 'high chairs' imply it is family-friendly."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Multiple Matching, first ___0___ what you need to find.",
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
          "text": "Every text must be used as an answer at least once.",
          "isTrue": true,
          "explanation": "Incorrect. Some texts may not answer any question in Multiple Matching."
        },
        {
          "text": "Answers in the texts often use synonyms of words in the questions.",
          "isTrue": true,
          "explanation": "Correct. You rarely find identical wording; look for synonyms and paraphrase."
        },
        {
          "text": "You must read each text fully before you search for answers.",
          "isTrue": false,
          "explanation": "Incorrect. It is more efficient to read strategically for information tied to the questions."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "If a text has already answered one question, it cannot answer another.",
          "isTrue": true,
          "explanation": "Incorrect. Texts can be reused as answers to several different questions."
        },
        {
          "text": "You should look for both explicit and implicit information.",
          "isTrue": true,
          "explanation": "Correct. Sometimes the answer is implied and you must infer it from context."
        },
        {
          "text": "It helps to group similar questions by topic before reading.",
          "isTrue": true,
          "explanation": "Correct. Grouping similar questions makes it easier to find related answers."
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
      "title": "Select all effective Multiple Matching techniques",
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

export function buildMultipleMatchingExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('multiple-matching', config, level, primaryLevel);
}
