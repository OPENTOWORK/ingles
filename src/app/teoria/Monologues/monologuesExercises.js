import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "How long do monologues typically last?",
      "options": [
        "30 seconds–2 minutes",
        "2–5 minutes",
        "5–10 minutes",
        "More than 10 minutes"
      ],
      "correctAnswer": 1,
      "explanation": "Monologues usually last 2–5 minutes, which allows a full treatment of one topic with a single speaker."
    },
    {
      "question": "What is the best strategy for monologues?",
      "options": [
        "Listen with no preparation",
        "Read all questions before the audio",
        "Note everything that is said",
        "Ignore structure"
      ],
      "correctAnswer": 1,
      "explanation": "Reading all questions first is crucial for monologues so you know what to listen for in a longer recording."
    },
    {
      "question": "Which part of the monologue usually has the most detail?",
      "options": [
        "Introduction",
        "Body",
        "Conclusion",
        "Transitions"
      ],
      "correctAnswer": 1,
      "explanation": "The body carries most of the detail (about 70–80%); introduction and conclusion are shorter."
    },
    {
      "question": "What is the most effective note-taking approach for monologues?",
      "options": [
        "Write down everything",
        "Use abbreviations and keywords",
        "Take no notes",
        "Write only at the end"
      ],
      "correctAnswer": 1,
      "explanation": "Abbreviations and keywords let you capture important information without wasting time on full sentences."
    },
    {
      "question": "What matters most for following an academic monologue?",
      "options": [
        "The speaker’s personality",
        "Content structure and organization",
        "The speaker’s accent",
        "Speech rate"
      ],
      "correctAnswer": 1,
      "explanation": "Structure and organization matter most for following academic monologues effectively."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Monologues, first ___0___ what you need to find.",
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
          "text": "Monologues require sustained concentration for the whole recording.",
          "isTrue": true,
          "explanation": "Correct. Monologues are long; you need to stay focused to catch all necessary information."
        },
        {
          "text": "You should note everything said in a monologue.",
          "isTrue": true,
          "explanation": "Incorrect. Note only information relevant to the questions, not every word."
        },
        {
          "text": "Understanding monologue structure helps you anticipate content.",
          "isTrue": true,
          "explanation": "Correct. A typical introduction–body–conclusion pattern tells you what kind of detail comes next."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Monologues are easier than dialogues because there is only one voice.",
          "isTrue": false,
          "explanation": "Incorrect. They can be harder because they are longer and denser with information to process."
        },
        {
          "text": "Monologues are easier than dialogues because there's only one speaker.",
          "isTrue": true,
          "explanation": "Incorrect. Monologues can be harder because they require sustained focus without different voices breaking up the input."
        },
        {
          "text": "Predicting content before listening helps with monologue comprehension.",
          "isTrue": true,
          "explanation": "Correct. Prediction from title or questions primes you for the topic."
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
      "title": "Select all effective Monologues techniques",
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

export function buildMonologuesExercises() {
  return buildTheoryExercises('monologues', config);
}
