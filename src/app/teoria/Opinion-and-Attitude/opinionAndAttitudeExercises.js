import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "What is the difference between opinion and attitude?",
      "options": [
        "None—they are synonyms",
        "Opinion is a viewpoint; attitude is emotional stance",
        "Opinion is formal; attitude is informal",
        "Opinion is for facts; attitude is for feelings"
      ],
      "correctAnswer": 1,
      "explanation": "Opinion is what the author thinks; attitude is how they feel (positive, negative, neutral) toward the topic."
    },
    {
      "question": "Which phrase clearly signals a personal opinion?",
      "options": [
        "Statistics show that...",
        "Research indicates that...",
        "I firmly believe that...",
        "The data demonstrates that..."
      ],
      "correctAnswer": 2,
      "explanation": "'I firmly believe that...' is clearly subjective; the others sound more neutral."
    },
    {
      "question": "If an author writes 'What a brilliant solution!' about something clearly bad, what attitude is shown?",
      "options": [
        "Positive and enthusiastic",
        "Neutral and objective",
        "Negative and sarcastic",
        "Confused and unsure"
      ],
      "correctAnswer": 2,
      "explanation": "Calling something 'brilliant' when it is problematic is sarcasm—negative attitude."
    },
    {
      "question": "What does it suggest if an author gives far more space to negatives than positives?",
      "options": [
        "Complete objectivity",
        "A negative stance or critical bias",
        "Poor understanding of the topic",
        "Neutrality"
      ],
      "correctAnswer": 1,
      "explanation": "Heavy focus on negatives versus positives often signals criticism or negative bias."
    },
    {
      "question": "Which structure suggests a more balanced presentation?",
      "options": [
        "Only supporters believe...",
        "On one hand... on the other hand...",
        "Everyone knows that...",
        "It's obvious that..."
      ],
      "correctAnswer": 1,
      "explanation": "'On one hand... on the other hand...' presents multiple sides—more balanced."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Opinion and Attitude, first ___0___ what you need to find.",
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
          "text": "Evaluative adjectives like 'excellent' or 'terrible' reveal attitude.",
          "isTrue": true,
          "explanation": "Correct. They show positive or negative judgement."
        },
        {
          "text": "An objective text never contains author opinion.",
          "isTrue": true,
          "explanation": "Incorrect. Even 'neutral' texts can hide bias in selection or emphasis."
        },
        {
          "text": "Irony and sarcasm can mean the opposite of the literal words.",
          "isTrue": true,
          "explanation": "Correct. The real meaning can reverse the surface wording."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Words like 'claim' and 'assert' are more neutral than 'prove' and 'demonstrate'.",
          "isTrue": true,
          "explanation": "Correct. 'Claim' suggests a position; 'prove' suggests settled evidence."
        },
        {
          "text": "Author attitude never changes through a text.",
          "isTrue": true,
          "explanation": "Incorrect. Stance can shift, especially in complex argument."
        },
        {
          "text": "Quotation marks can signal distance or sarcasm.",
          "isTrue": true,
          "explanation": "Correct. Quotes may show the author rejects or doubts a label."
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
      "title": "Select all effective Opinion and Attitude techniques",
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

export function buildOpinionAndAttitudeExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('opinion-and-attitude', config, level, primaryLevel);
}
