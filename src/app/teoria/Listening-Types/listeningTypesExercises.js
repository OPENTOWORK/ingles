import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "To identify the main idea, what should I listen for most?",
      "options": [
        "Every small detail",
        "Keywords",
        "Only numbers",
        "Proper nouns only"
      ],
      "correctAnswer": 1,
      "explanation": "Keywords that summarize the central topic are central to spotting the main idea."
    },
    {
      "question": "Which approach best supports identifying the main idea?",
      "options": [
        "Hearing each word equally",
        "Focusing on keywords and the overall theme",
        "Writing down every detail",
        "Searching only for numbers and dates"
      ],
      "correctAnswer": 1,
      "explanation": "Main-idea tasks reward focus on keywords and theme, not every specific fact."
    },
    {
      "question": "What are you chiefly answering if the question is 'What is the speaker's attitude'?",
      "options": [
        "Main idea",
        "Details",
        "Contrast",
        "Tone"
      ],
      "correctAnswer": 3,
      "explanation": "Attitude questions aim at tone, not gist, granular detail, or contrast alone."
    },
    {
      "question": "What is a very common listening mistake?",
      "options": [
        "Reading questions beforehand",
        "Trying to decode every word",
        "Taking notes while listening",
        "Predicting content"
      ],
      "correctAnswer": 1,
      "explanation": "Trying to grasp every token is common but unhelpful; prioritize overall meaning and what the items ask."
    },
    {
      "question": "Which listening mode fits finding an appointment time in a conversation?",
      "options": [
        "Listening for gist",
        "Scanning for specific information",
        "Inferential listening",
        "Critical listening"
      ],
      "correctAnswer": 1,
      "explanation": "Scanning fits hunting a concrete detail such as time, date, or number."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Types of Understanding: Main Idea, Details, Contrast, Tone, first ___0___ what you need to find.",
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
          "text": "You should read the questions before listening to the audio.",
          "isTrue": true,
          "explanation": "Correct. Reading questions first tells you what information to listen for."
        },
        {
          "text": "For details you should listen only for words you already know.",
          "isTrue": true,
          "explanation": "Incorrect. Detail questions target specific facts—numbers, names, dates—even when other words are new."
        },
        {
          "text": "Tone is picked up partly through intonation and emotional wording.",
          "isTrue": true,
          "explanation": "Correct. Intonation, pace, and emotion words reveal tone."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "For contrast items, listen for words like however, but, unlike.",
          "isTrue": true,
          "explanation": "Correct. Those markers signal contrast between ideas."
        },
        {
          "text": "Listening for gist means understanding every single word.",
          "isTrue": true,
          "explanation": "Incorrect. Gist means the general idea, not every word."
        },
        {
          "text": "Scanning for specific information requires focused attention on particular details.",
          "isTrue": true,
          "explanation": "Correct. Scanning means targeting names, dates, figures, and similar cues."
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
      "title": "Select all effective Types of Understanding: Main Idea, Details, Contrast, Tone techniques",
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

export function buildListeningTypesExercises() {
  return buildTheoryExercises('listening-types', config);
}
