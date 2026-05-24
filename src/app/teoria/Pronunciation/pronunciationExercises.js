import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "To pronounce /θ/ as in 'think', what should I do?",
      "options": [
        "Put your lips together",
        "Put your tongue between your teeth",
        "Close your mouth completely",
        "Open your mouth wide"
      ],
      "correctAnswer": 1,
      "explanation": "For the /θ/ sound, your tongue goes between your upper and lower teeth."
    },
    {
      "question": "What is the correct word stress in 'computer'?",
      "options": [
        "comPUter",
        "COMputer",
        "compuTER",
        "com-put-er"
      ],
      "correctAnswer": 1,
      "explanation": "'Computer' is a three-syllable noun with stress on the second syllable: COM-put-er."
    },
    {
      "question": "What is the difference between /θ/ and /ð/?",
      "options": [
        "There is no difference",
        "/θ/ is voiced and /ð/ is voiceless",
        "/θ/ is voiceless and /ð/ is voiced",
        "They are the same sound"
      ],
      "correctAnswer": 2,
      "explanation": "/θ/ (as in 'think') is voiceless (no vibration), while /ð/ (as in 'this') is voiced (with vibration)."
    },
    {
      "question": "What type of intonation is generally used in statements?",
      "options": [
        "Rising",
        "Falling",
        "Flat",
        "Rise-fall"
      ],
      "correctAnswer": 1,
      "explanation": "Statements usually end with falling intonation, showing that the information is complete."
    },
    {
      "question": "How is the '-ed' in 'walked' pronounced?",
      "options": [
        "/ed/",
        "/d/",
        "/t/",
        "/ɪd/"
      ],
      "correctAnswer": 2,
      "explanation": "After voiceless consonants like /k/, the -ed ending is pronounced /t/: walked /wɔːkt/."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Pronunciation, first ___0___ what you need to find.",
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
          "text": "Word stress is less important than individual sounds.",
          "isTrue": true,
          "explanation": "Incorrect. Stress is very important and can change word meaning."
        },
        {
          "text": "In sentences, content words (nouns, verbs) are stressed more.",
          "isTrue": true,
          "explanation": "Correct. Content words (nouns, verbs, adjectives, adverbs) are stressed more than function words."
        },
        {
          "text": "Rising intonation is used in yes/no questions.",
          "isTrue": true,
          "explanation": "Correct. Yes/no questions usually end with rising intonation."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "In connected speech, every word is pronounced clearly and separately.",
          "isTrue": false,
          "explanation": "Incorrect. In connected speech, sounds link and change to create a natural flow."
        },
        {
          "text": "The /r/ sound in English is the same as the Spanish 'rr'.",
          "isTrue": true,
          "explanation": "Incorrect. The /r/ sound in English is softer and is produced with the tongue curled back."
        },
        {
          "text": "Word stress can change the meaning of a word in English.",
          "isTrue": true,
          "explanation": "Correct. For example: 'REcord' (noun) vs 'reCORD' (verb)."
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
      "title": "Select all effective Pronunciation techniques",
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

export function buildPronunciationExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('pronunciation', config, level, primaryLevel);
}
