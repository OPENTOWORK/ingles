import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "Which type of resources typically offers quick, on-demand access?",
      "options": [
        "Printed-only archives",
        "Digital",
        "Handwritten manuscripts only",
        "Resources with no electronic version"
      ],
      "correctAnswer": 1,
      "explanation": "Digital resources are available almost anytime online or on devices, supporting flexible routines."
    },
    {
      "question": "What is the main benefit of consistent practice?",
      "options": [
        "Memorizing more words in isolation",
        "Developing fluency and confidence",
        "Avoiding grammar study entirely",
        "Reading unrelated material faster without understanding"
      ],
      "correctAnswer": 1,
      "explanation": "Steady practice builds fluency and confidence—what you rely on when you actually use the language."
    },
    {
      "question": "Which approach is strongest for remembering vocabulary over the long term?",
      "options": [
        "Cramming once with no review",
        "Spaced repetition (reviews spread over time)",
        "Reading a list once silently",
        "Studying only on weekends with no weekdays"
      ],
      "correctAnswer": 1,
      "explanation": "Spaced repetition—coming back to items after gaps—typically beats one-off cramming for long-term memory."
    },
    {
      "question": "What matters most in a study plan?",
      "options": [
        "How exhausting each session feels",
        "How consistently you stick to your schedule",
        "How many unused apps are installed",
        "How difficult the hardest book you own looks on the shelf"
      ],
      "correctAnswer": 1,
      "explanation": "A plan you repeat beats a perfect-looking plan you abandon; consistency anchors improvement."
    },
    {
      "question": "What is a typical advantage of interactive digital tools?",
      "options": [
        "They guarantee perfect scores instantly",
        "They often provide quick feedback",
        "They eliminate the need to speak or write",
        "They replace dictionaries completely"
      ],
      "correctAnswer": 1,
      "explanation": "Many interactive exercises give immediate feedback, which speeds up correction and learning."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Key Resources to Improve, first ___0___ what you need to find.",
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
          "text": "Studying three hours once a week is usually better than 30 minutes every day.",
          "isTrue": true,
          "explanation": "Incorrect. Regular short sessions normally support retention and habits better than one long cram block per week."
        },
        {
          "text": "Using different kinds of resources supports learning.",
          "isTrue": true,
          "explanation": "Correct. Mixing digital tools, printed texts, receptive and productive work gives a fuller training effect."
        },
        {
          "text": "Periodic assessment helps you adjust how you study.",
          "isTrue": true,
          "explanation": "Correct. Checking progress shows strengths and gaps so you can change focus or methods."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Study materials should match the learner's approximate level.",
          "isTrue": true,
          "explanation": "Correct. Material that is too easy or unrealistically difficult makes progress harder to sustain."
        },
        {
          "text": "Free resources are always lower quality than paid resources.",
          "isTrue": true,
          "explanation": "Incorrect. Many free resources (BBC Learning English, podcasts, curated YouTube lessons) are high quality."
        },
        {
          "text": "Combining several types of resources often improves outcomes.",
          "isTrue": true,
          "explanation": "Correct. Digital, printed, formal, and informal resources each support different aspects of proficiency."
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
      "title": "Select all effective Key Resources to Improve techniques",
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

export function buildKeyResourcesToImproveExercises() {
  return buildTheoryExercises('key-resources-to-improve', config);
}
