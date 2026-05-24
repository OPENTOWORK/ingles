import { buildTheoryExercises } from '@/components/theory/buildTheoryExercises';

const config = {
  "multipleChoice": [
    {
      "question": "How many people take part in a multi-speaker dialogue?",
      "options": [
        "2 participants",
        "3 or more participants",
        "Just 1 participant",
        "At most 2 participants"
      ],
      "correctAnswer": 1,
      "explanation": "Multi-speaker dialogues are defined by having three or more participants, making them denser than two-person exchanges."
    },
    {
      "question": "Which strategy matters most for multi-speaker dialogues?",
      "options": [
        "Take no notes",
        "Draw a mental map of voices right away",
        "Only listen at the end",
        "Ignore interruptions"
      ],
      "correctAnswer": 1,
      "explanation": "Mapping voices immediately helps you tell speakers apart in a repeatable way—the foundation for everything else."
    },
    {
      "question": "Which factor best helps you recognise individual speakers?",
      "options": [
        "Pitch alone",
        "Vocabulary alone",
        "A bundle of cues together",
        "Their functional role alone"
      ],
      "correctAnswer": 2,
      "explanation": "Layering pitch, wording, behaviour, and role yields the most stable speaker identification."
    },
    {
      "question": "What is the strongest tactic when interruptions multiply?",
      "options": [
        "Ignore them outright",
        "Use context to preserve meaning",
        "Listen only to the dominant voice",
        "Write down every utterance verbatim"
      ],
      "correctAnswer": 1,
      "explanation": "Context keeps the thread coherent; interruptions remain normal in natural group talk."
    },
    {
      "question": "What is usually hardest to track in multi-speaker audio?",
      "options": [
        "Vocabulary complexity",
        "Rapid shifts of speaker and perspective",
        "Raw speech rate",
        "Speaker accent"
      ],
      "correctAnswer": 1,
      "explanation": "Rapid alternating perspectives taxes working memory hardest."
    }
  ],
  "fillBlanks": [
    {
      "text": "When applying Multi-speaker Dialogues, first ___0___ what you need to find.",
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
          "text": "Multi-speaker dialogues require systematic identification of voices.",
          "isTrue": true,
          "explanation": "Correct. You need an identification system that mixes vocal and behavioural cues."
        },
        {
          "text": "You should attempt to monitor every detail simultaneously.",
          "isTrue": true,
          "explanation": "Incorrect. Prioritise task-relevant information and use synthesis to manage load."
        },
        {
          "text": "Interruptions are normal in multi-speaker dialogue.",
          "isTrue": true,
          "explanation": "Correct. Cut-ins and overlap are frequent in groups and merit specific coping tactics."
        }
      ]
    },
    {
      "statements": [
        {
          "text": "Cross-speaker synthesis is unimportant.",
          "isTrue": false,
          "explanation": "Incorrect. Combining information from multiple speakers is essential for the full scenario."
        },
        {
          "text": "Multi-speaker dialogues are always more difficult than two-person conversations.",
          "isTrue": true,
          "explanation": "Correct. Several voices and competing threads raise cognitive load consistently."
        },
        {
          "text": "You should concentrate on only one speaker.",
          "isTrue": true,
          "explanation": "Incorrect. Tracking several voices is essential for viewpoints and conclusions."
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
      "title": "Select all effective Multi-speaker Dialogues techniques",
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

export function buildMultiSpeakerDialoguesExercises(level = 'B2', primaryLevel = 'B2') {
  return buildTheoryExercises('multi-speaker-dialogues', config, level, primaryLevel);
}
