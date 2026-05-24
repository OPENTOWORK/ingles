import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the main goal of reading for detail?",
      "options": [
        "Read as fast as possible",
        "Find specific, exact information",
        "Understand only the general idea",
        "Memorise every word"
      ],
      "correctAnswer": 1,
      "explanation": "Reading for detail targets specific facts, exact data, and particular points."
    },
    {
      "question": "What should you do before you read for detail?",
      "options": [
        "Read the whole text first",
        "State exactly what information you need",
        "Count the pages",
        "Look up every unknown word"
      ],
      "correctAnswer": 1,
      "explanation": "First define clearly what specific information you are searching for."
    },
    {
      "question": "What is the difference between 'most students' and 'all students'?",
      "options": [
        "There is no difference",
        "'Most' means a majority; 'all' means everyone",
        "'Most' is more formal than 'all'",
        "They mean exactly the same"
      ],
      "correctAnswer": 1,
      "explanation": "'Most' means a majority (more than half but not everyone); 'all' means 100% with no exceptions."
    },
    {
      "question": "Which words help you find information about causes?",
      "options": [
        "Numbers and dates",
        "Because, since, due to",
        "First, second, third",
        "Always, never, sometimes"
      ],
      "correctAnswer": 1,
      "explanation": "Words like 'because', 'since', and 'due to' signal cause and help you find why something happens."
    },
    {
      "question": "What is the best strategy for information about time order?",
      "options": [
        "Look only for numbers",
        "Look for time connectors like 'first', 'then', 'finally'",
        "Read only the first paragraph",
        "Ignore dates"
      ],
      "correctAnswer": 1,
      "explanation": "Time connectors show the order of events and processes."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Reading for Detail, first ___0___ what you need to find.",
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
          "text": "In reading for detail, every word can matter.",
          "isTrue": true,
          "explanation": "Correct. Modifiers, negation, and small words can completely change meaning."
        },
        {
          "text": "You should read at the same speed as for gist.",
          "isTrue": true,
          "explanation": "Incorrect. Detail reading is slower and more careful than gist reading."
        },
        {
          "text": "Scanning helps you find the right section.",
          "isTrue": true,
          "explanation": "Correct. Scanning locates the parts that likely contain your answer."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You should read only the sentence that holds your answer.",
          "isTrue": true,
          "explanation": "Incorrect. Read the surrounding sentences too for full meaning."
        },
        {
          "text": "Pronouns can refer to information in earlier sentences.",
          "isTrue": true,
          "explanation": "Correct. Pronouns like 'it', 'they', and 'this' often refer back to earlier content."
        },
        {
          "text": "You do not need to check consistency when reading for detail.",
          "isTrue": false,
          "explanation": "Incorrect. Check that information is consistent across the text."
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
      "title": "Select all effective Reading for Detail techniques",
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

export function buildReadingForDetailExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('reading-for-detail', config, level, primaryLevel);
}
