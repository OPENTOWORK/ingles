import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "In Key Word Transformations, how many words should you generally use?",
      "options": [
        "Exactly 3 words",
        "Between 2–5 words including the key word",
        "As many as you need",
        "Only the key word"
      ],
      "correctAnswer": 1,
      "explanation": "You must use between 2–5 words including the given key word, keeping the same meaning."
    },
    {
      "question": "Transform: 'I haven't been to Paris for years.' KEY: since. 'It's years _____ to Paris.'",
      "options": [
        "since I went",
        "since I have been",
        "since I go",
        "since going"
      ],
      "correctAnswer": 0,
      "explanation": "'Since' needs a specific point in time, so you need Past Simple: 'since I went'."
    },
    {
      "question": "Transform: 'They made me wait for an hour.' KEY: forced. 'I _____ wait for an hour.'",
      "options": [
        "was forced to",
        "was forced for",
        "forced to",
        "was forcing to"
      ],
      "correctAnswer": 0,
      "explanation": "Passive 'force' needs 'was forced to + infinitive': 'I was forced to wait'."
    },
    {
      "question": "Transform: 'It's possible that it will rain.' KEY: might. 'It _____ rain.'",
      "options": [
        "might be",
        "might to",
        "might",
        "might have"
      ],
      "correctAnswer": 2,
      "explanation": "'Might' expresses possibility and is followed directly by the base verb: 'It might rain'."
    },
    {
      "question": "Transform: 'I regret not studying harder.' KEY: wish. 'I _____ studied harder.'",
      "options": [
        "wish I",
        "wish I had",
        "wish I have",
        "wish to have"
      ],
      "correctAnswer": 1,
      "explanation": "To express regret about the past we use 'wish + past perfect': 'I wish I had studied'."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Key Word Transformations, first ___0___ what you need to find.",
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
          "text": "In Key Word Transformations you must keep exactly the same meaning.",
          "isTrue": true,
          "explanation": "Correct. The second sentence must mean exactly the same as the first."
        },
        {
          "text": "You may change the given key word.",
          "isTrue": true,
          "explanation": "Incorrect. You must use the key word exactly as given, without changing it."
        },
        {
          "text": "Contractions count as one word.",
          "isTrue": true,
          "explanation": "Correct. Contractions such as 'don't', 'I'll', 'we've' count as a single word."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "You must always use exactly five words in your answer.",
          "isTrue": false,
          "explanation": "Incorrect. You may use between 2–5 words; it does not have to be exactly five."
        },
        {
          "text": "The key word must always come at the start of your answer.",
          "isTrue": true,
          "explanation": "Incorrect. The key word can appear anywhere in your answer."
        },
        {
          "text": "You should consider the tense of the original sentence.",
          "isTrue": true,
          "explanation": "Correct. The tense may change in the transformation, but the time meaning must stay the same."
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
      "title": "Select all effective Key Word Transformations techniques",
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

export function buildKeyWordTransformationsExercises() {
  return buildTheoryExercises('key-word-transformations', config);
}
