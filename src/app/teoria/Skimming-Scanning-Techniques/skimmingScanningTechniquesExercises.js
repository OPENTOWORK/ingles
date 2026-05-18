import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "When doing skimming, which part of a paragraph is MOST important to read?",
      "options": [
        "The middle sentences",
        "Every single word",
        "The first and last sentences",
        "Only the examples"
      ],
      "correctAnswer": 2,
      "explanation": "The first and last sentences of paragraphs usually carry the main ideas."
    },
    {
      "question": "What should you do FIRST when you need to find someone's phone number in a text?",
      "options": [
        "Read the entire text carefully",
        "Look for numbers and contact information",
        "Understand the main idea of the text",
        "Read only the first paragraph"
      ],
      "correctAnswer": 1,
      "explanation": "For scanning a specific fact like a phone number, look for numbers and contact details."
    },
    {
      "question": "Which technique would be BEST for answering 'What is the main argument of this article?'",
      "options": [
        "Scanning",
        "Skimming",
        "Detailed reading",
        "Reading backwards"
      ],
      "correctAnswer": 1,
      "explanation": "Skimming is ideal for the main argument without reading every detail."
    },
    {
      "question": "Signal words like 'however', 'therefore', and 'in conclusion' are most useful for:",
      "options": [
        "Scanning for specific facts",
        "Understanding text structure during skimming",
        "Memorizing vocabulary",
        "Checking spelling"
      ],
      "correctAnswer": 1,
      "explanation": "Signal words show structure and flow of ideas during skimming."
    },
    {
      "question": "When skimming, you should pay most attention to:",
      "options": [
        "Every single word",
        "Only the conclusion",
        "First and last sentences of paragraphs",
        "The middle of each paragraph"
      ],
      "correctAnswer": 2,
      "explanation": "First and last sentences of paragraphs contain the main ideas."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Skimming and Scanning Techniques, first ___0___ what you need to find.",
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
          "text": "Skimming involves reading every word of the text carefully.",
          "isTrue": true,
          "explanation": "False. Skimming is a fast read for the general idea, not every word."
        },
        {
          "text": "Scanning is used to find specific information quickly.",
          "isTrue": true,
          "explanation": "Correct. Scanning is for locating specific information fast."
        },
        {
          "text": "You should always do scanning before skimming.",
          "isTrue": true,
          "explanation": "False. You usually skim first to get overall context."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Signal words like 'however' and 'therefore' are important for skimming.",
          "isTrue": true,
          "explanation": "Correct. Signal words reveal structure and relations in the text."
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
      "title": "Select all effective Skimming and Scanning Techniques techniques",
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

export function buildSkimmingScanningTechniquesExercises() {
  return buildTheoryExercises('skimming-scanning-techni', config);
}
