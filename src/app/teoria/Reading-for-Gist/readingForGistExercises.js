import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the main goal of reading for gist?",
      "options": [
        "Understand every word",
        "Get the general idea of the text",
        "Memorise specific details",
        "Translate the whole text"
      ],
      "correctAnswer": 1,
      "explanation": "Reading for gist focuses on the general idea or topic, not every detail."
    },
    {
      "question": "What should you do when you meet an unknown word in gist reading?",
      "options": [
        "Stop and look it up",
        "Keep reading without stopping",
        "Ask someone what it means",
        "Stop reading the text"
      ],
      "correctAnswer": 1,
      "explanation": "In gist reading, keep going and focus on overall meaning rather than every unknown word."
    },
    {
      "question": "Which technique best helps you find the main idea?",
      "options": [
        "Read only the first sentence",
        "Read the whole text quickly",
        "Count the words",
        "Read only bold words"
      ],
      "correctAnswer": 1,
      "explanation": "A quick read of the whole text gives an overview and helps you see the main idea."
    },
    {
      "question": "Which parts of the text matter most for gist reading?",
      "options": [
        "Every adjective and adverb",
        "Title, first and last sentences of paragraphs",
        "Only the longest words",
        "Only numbers and dates"
      ],
      "correctAnswer": 1,
      "explanation": "Titles and first/last sentences of paragraphs usually carry the main ideas."
    },
    {
      "question": "What is the minimum level of understanding needed for effective gist reading?",
      "options": [
        "100%",
        "90–95%",
        "70–80%",
        "50–60%"
      ],
      "correctAnswer": 2,
      "explanation": "With about 70–80% understanding you can usually grasp the general idea without every detail."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Reading for Gist, first ___0___ what you need to find.",
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
          "text": "In gist reading you need to understand 100% of the vocabulary.",
          "isTrue": true,
          "explanation": "Incorrect. About 70–80% understanding is often enough to get the general idea."
        },
        {
          "text": "The title is an important clue in gist reading.",
          "isTrue": true,
          "explanation": "Correct. The title hints at the main topic and helps you predict content."
        },
        {
          "text": "You should read more slowly for effective gist reading.",
          "isTrue": false,
          "explanation": "Incorrect. Gist reading means reading faster and focusing on general ideas."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Words that repeat often are usually important to the topic.",
          "isTrue": true,
          "explanation": "Correct. Frequent words often relate to the central theme."
        },
        {
          "text": "Gist reading is only useful for very short texts.",
          "isTrue": true,
          "explanation": "Incorrect. Gist reading is especially helpful for long texts when you need the big picture quickly."
        },
        {
          "text": "You should use gist reading before reading for specific detail.",
          "isTrue": true,
          "explanation": "Correct. Gist reading gives background that makes detailed reading easier."
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
      "title": "Select all effective Reading for Gist techniques",
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

export function buildReadingForGistExercises() {
  return buildTheoryExercises('reading-for-gist', config);
}
