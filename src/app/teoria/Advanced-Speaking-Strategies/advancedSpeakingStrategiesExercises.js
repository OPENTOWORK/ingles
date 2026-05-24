import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which filler is most appropriate for a job interview?",
      "options": [
        "Like, you know...",
        "Um, er...",
        "Let me think about that...",
        "I mean, like..."
      ],
      "correctAnswer": 2,
      "explanation": "'Let me think about that' sounds professional and shows reflection; it fits interviews well."
    },
    {
      "question": "What's the best way to express a moderate opinion about a controversial topic?",
      "options": [
        "I'm absolutely certain that...",
        "It seems to me that...",
        "Without a doubt...",
        "Everyone knows that..."
      ],
      "correctAnswer": 1,
      "explanation": "'It seems to me that...' states a personal view without sounding too absolute, which suits controversial topics."
    },
    {
      "question": "How should you handle a question you don't immediately know how to answer?",
      "options": [
        "Stay silent until you think of something",
        "Say 'I don't know' and stop talking",
        "Say 'That's an interesting question, let me think about that'",
        "Change the topic immediately"
      ],
      "correctAnswer": 2,
      "explanation": "That response buys time professionally and shows you are taking the question seriously."
    },
    {
      "question": "Which phrase best helps you maintain your speaking turn when someone tries to interrupt?",
      "options": [
        "Stop interrupting me!",
        "Let me just finish this point...",
        "You're wrong!",
        "I'm not done yet!"
      ],
      "correctAnswer": 1,
      "explanation": "'Let me just finish this point...' is polite but firm, holding your turn without sounding aggressive."
    },
    {
      "question": "Which is the best way to buy time when you need to think?",
      "options": [
        "Stay silent for 30 seconds",
        "That's an interesting question, let me consider that",
        "I don't know",
        "Can you repeat the question?"
      ],
      "correctAnswer": 1,
      "explanation": "That phrase buys time professionally while showing you are considering the question."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Advanced Speaking Strategies, first ___0___ what you need to find.",
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
          "text": "Using fillers like 'um' and 'er' should always be avoided in formal speaking.",
          "isTrue": true,
          "explanation": "False. Some fillers are natural even in formal settings, but use them sparingly."
        },
        {
          "text": "Self-correction during speaking shows linguistic awareness and is generally positive.",
          "isTrue": true,
          "explanation": "Correct. Natural self-correction shows linguistic awareness and is viewed positively."
        },
        {
          "text": "In formal presentations, you should avoid using personal examples.",
          "isTrue": true,
          "explanation": "False. Personal examples can work in formal settings when they are relevant."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Adapting your register to match your audience shows advanced communication skills.",
          "isTrue": true,
          "explanation": "Correct. Adapting register shows advanced communicative competence."
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
      "title": "Select all effective Advanced Speaking Strategies techniques",
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

export function buildAdvancedSpeakingStrategiesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('advanced-speaking-strate', config, level, primaryLevel);
}
